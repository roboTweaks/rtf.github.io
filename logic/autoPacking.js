// ============================================================================
// AUTO BIN-PACKING LOGIC  (v4)
// ----------------------------------------------------------------------------
// Pure functions, no DOM. Attaches to window.App.Auto.
//
// PRODUCT TYPES
//   - Crate (LC / FPC): palletised on an E-Pallet, ALWAYS capped with the
//     13185 lid (+80mm). The capped crate pallet is STACKABLE (cap bears load).
//     A crate pallet footprint = 1200x1000 = one floor position.
//   - Lid: may ride in the LEFTOVER HEIGHT on top of a capped crate (no pallet
//     of its own), OR — when there is no crate-top room left — be palletised on
//     its own E-Pallet (no cap). Lids are TERMINAL (nothing stacks on a lid).
//   - Container (FLC/FSC): the 1970/2140 side runs ACROSS the truck width, one
//     pallet centred underneath, folded walls tied on top. Lids ship SEPARATELY
//     palletised. Footprint is special: needs truck width >= acrossWidthMm and
//     consumes `alongLengthMm` of truck length (not a 1200x1000 slot).
//
// STACKING RULE (canStackOn): only forbidden move is a crate on top of a lid.
//
// TRUCK FIT: every column height <= usableHeightMm; floor usage <= capacity;
// total weight <= tonnage. Floor usage is measured in two pools:
//   - pallet floor positions (crates + lid pallets), capped by truck.floorPositions
//   - container length consumed along the truck floor (for FLC/FSC), capped by
//     truck.usableLengthMm. Containers and pallets are kept in separate lanes
//     for simplicity (a mixed crate+container load uses both pools).
// ============================================================================

App.Auto = App.Auto || {};

// ----------------------------------------------------------------------------
// Build capped crate pallets for a crate SKU + quantity.
// policy: 'min_floor' (reduce layers to pack tight) | 'natural' (full pallets).
// Each pallet: { kind:'crate', code, items, height, weight, topGap }
//   topGap = usableHeight - height  (computed later, per truck) -> we store
//            the pallet height; leftover is computed during packing.
// ----------------------------------------------------------------------------
App.Auto.buildCratePallets = function (crate, qty, layersPerPallet, policy) {
  var perLayer = crate.perLayer;
  if (perLayer <= 0) return [];
  if (policy === 'natural') layersPerPallet = crate.layersFolded;
  if (!layersPerPallet || layersPerPallet <= 0) layersPerPallet = crate.layersFolded;
  layersPerPallet = Math.min(layersPerPallet, crate.layersFolded);

  var itemsPerPallet = layersPerPallet * perLayer;
  var pallets = [];
  var remaining = qty;

  while (remaining > 0) {
    var itemsHere = Math.min(itemsPerPallet, remaining);
    var layersHere = Math.ceil(itemsHere / perLayer);
    var crateStack = layersHere * crate.foldedH;
    // pallet base + crate stack + cap lid (always)
    var height = App.AUTO_PALLET_BASE + crateStack + App.AUTO_CAP_LID_H;
    var weight = itemsHere * crate.weight + App.AUTO_CAP_LID_H * 0; // cap weight tiny; ignore
    pallets.push({
      kind: 'crate', code: crate.code, name: crate.name,
      items: itemsHere, layers: layersHere,
      height: Math.round(height), weight: weight, capped: true,
    });
    remaining -= itemsHere;
  }
  return pallets;
};

// ----------------------------------------------------------------------------
// Build standalone lid pallets (no cap). Used for leftover lids that can't ride
// on a crate top.
// ----------------------------------------------------------------------------
App.Auto.buildLidPallets = function (lid, qty) {
  if (!lid || lid.perPallet <= 0) return [];
  var pallets = [];
  var remaining = qty;
  while (remaining > 0) {
    var itemsHere = Math.min(lid.perPallet, remaining);
    var frac = itemsHere / lid.perPallet;
    var layers = Math.max(1, Math.ceil((lid.layersFolded || 1) * frac));
    var height = App.AUTO_PALLET_BASE + layers * lid.foldedH;
    var weight = itemsHere * lid.weight;
    pallets.push({
      kind: 'lid', code: lid.code, name: lid.name,
      items: itemsHere, height: Math.round(height), weight: weight,
    });
    remaining -= itemsHere;
  }
  return pallets;
};

// How many lids (by item count) can ride in `gapMm` of leftover height on a
// crate top, given the lid's per-layer count and folded height?
App.Auto.lidsThatFitInGap = function (lid, gapMm) {
  if (!lid || lid.foldedH <= 0) return 0;
  var layers = Math.floor(gapMm / lid.foldedH);
  if (layers <= 0) return 0;
  return layers * lid.perLayer;
};

// ----------------------------------------------------------------------------
App.Auto.canStackOn = function (topPallet, newPallet) {
  if (topPallet.kind === 'lid' && newPallet.kind !== 'lid') return false;
  return true;
};

// ----------------------------------------------------------------------------
// Candidate layer counts to try for a crate in a given truck (densest first).
// ----------------------------------------------------------------------------
App.Auto.candidateLayers = function (crate, usableHeight) {
  var maxL = crate.layersFolded;
  if (maxL <= 0) return [];
  var cands = {};
  cands[maxL] = true;
  for (var L = maxL; L >= 1; L--) {
    var h = App.AUTO_PALLET_BASE + L * crate.foldedH + App.AUTO_CAP_LID_H;
    if (h <= usableHeight) { cands[L] = true; break; }
  }
  [0.75, 0.5, 0.25].forEach(function (f) {
    cands[Math.max(1, Math.floor(maxL * f))] = true;
  });
  return Object.keys(cands).map(Number).sort(function (a, b) { return b - a; });
};

// ----------------------------------------------------------------------------
// Pack pallets (crates + lid pallets) into vertical columns within a truck.
// Crates placed first (form bases), lids fill/stack afterward (FFD by height).
// Returns columns array, or null if a pallet is too tall.
// ----------------------------------------------------------------------------
App.Auto.packIntoColumns = function (pallets, usableHeight) {
  var crates = pallets.filter(function (p) { return p.kind === 'crate'; })
                      .sort(function (a, b) { return b.height - a.height; });
  var lids = pallets.filter(function (p) { return p.kind === 'lid'; })
                    .sort(function (a, b) { return b.height - a.height; });
  var ordered = crates.concat(lids);

  var columns = [];
  for (var i = 0; i < ordered.length; i++) {
    var p = ordered[i];
    var placed = false;
    for (var j = 0; j < columns.length; j++) {
      var col = columns[j];
      var used = col.reduce(function (s, x) { return s + x.height; }, 0);
      var top = col[col.length - 1];
      if (App.Auto.canStackOn(top, p) && used + p.height <= usableHeight) {
        col.push(p); placed = true; break;
      }
    }
    if (!placed) {
      if (p.height <= usableHeight) columns.push([p]);
      else return null;
    }
  }
  return columns;
};

// ----------------------------------------------------------------------------
// MAIN SOLVER
// shipment: array of { code, qty, withLid }  (withLid only meaningful for crates)
// policy: 'min_floor' | 'natural'
// Returns { best, results, policy } sorted by COST (cheapest first), with
// fit info, column layout, container lane info, and pricing.
// ----------------------------------------------------------------------------
App.Auto.findBestTruck = function (shipment, policy) {
  policy = policy || 'min_floor';

  // Evaluate every truck; later sort fitting ones by cost.
  var results = [];

  App.TRUCK_ORDER.forEach(function (tk) {
    var truck = App.TRUCKS[tk];
    var usableH = truck.usableHeightMm;
    var feasible = true;
    var reason = '';

    // --- Separate shipment into crates, containers, explicit lid orders ---
    var cratePallets = [];
    var lidPallets = [];
    var containerUnits = [];   // {code, qty, alongLengthMm, ...}
    var loose = {};            // leftover lid items to palletise: code -> qty

    // First pass: crates (build capped pallets) and collect their lids
    shipment.forEach(function (line) {
      if (!feasible) return;
      var crate = App.AUTO_CRATES[line.code];
      if (crate) {
        var cands = App.Auto.candidateLayers(crate, usableH);
        var chosen = null;
        for (var i = 0; i < cands.length; i++) {
          var h = App.AUTO_PALLET_BASE + cands[i] * crate.foldedH + App.AUTO_CAP_LID_H;
          if (h <= usableH) { chosen = cands[i]; break; }
        }
        if (chosen === null) { feasible = false; reason = crate.name + ' too tall for truck'; return; }
        var ps = App.Auto.buildCratePallets(crate, line.qty, chosen, policy);
        cratePallets = cratePallets.concat(ps);

        // If the user wants this crate's matching lid shipped too:
        if (line.withLid && crate.lidCode && App.AUTO_LIDS[crate.lidCode]) {
          loose[crate.lidCode] = (loose[crate.lidCode] || 0) + line.qty;
        }
        return;
      }

      var cont = App.AUTO_CONTAINERS[line.code];
      if (cont) {
        // A folded-FLC tied stack = `perPallet` folded units, finalH tall (1960mm),
        // sitting on ONE centred pallet but occupying a 2x1 BLOCK (2 floor positions).
        // The stack height must clear the ceiling.
        if (cont.finalH > usableH) { feasible = false; reason = cont.name + ' stack taller than truck'; return; }
        // Each block needs 2 floor positions; a truck needs >= 2 to take any.
        if (truck.floorPositions < 2) { feasible = false; reason = truck.name + ' too small for ' + cont.name; return; }

        var blocks = Math.ceil(line.qty / cont.perPallet); // tied stacks needed
        containerUnits.push({
          code: cont.code, name: cont.name, qty: line.qty,
          perPallet: cont.perPallet, blocks: blocks,
          floorPerBlock: 2, finalH: cont.finalH,
          weight: line.qty * cont.weight, lidCode: cont.lidCode,
        });
        // containers' lids always ship separately palletised
        if (cont.lidCode && App.AUTO_LIDS[cont.lidCode]) {
          loose[cont.lidCode] = (loose[cont.lidCode] || 0) + line.qty;
        }
        return;
      }

      var lid = App.AUTO_LIDS[line.code];
      if (lid) {
        // explicitly ordered lids -> treat as loose lid items
        loose[line.code] = (loose[line.code] || 0) + line.qty;
        return;
      }
    });

    if (!feasible) { results.push({ truckKey: tk, truck: truck, fits: false, reason: reason }); return; }

    // --- Fill leftover height on crate tops with loose lids first ---
    // For each crate pallet, compute gap; greedily assign loose lids.
    cratePallets.forEach(function (cp) {
      cp.lidsOnTop = [];
      var gap = usableH - cp.height;
      Object.keys(loose).forEach(function (lc) {
        if (loose[lc] <= 0 || gap <= 0) return;
        var lid = App.AUTO_LIDS[lc];
        var capacityItems = App.Auto.lidsThatFitInGap(lid, gap);
        if (capacityItems <= 0) return;
        var take = Math.min(capacityItems, loose[lc]);
        if (take <= 0) return;
        var layersUsed = Math.ceil(take / lid.perLayer);
        var hUsed = layersUsed * lid.foldedH;
        cp.lidsOnTop.push({ code: lc, items: take, height: Math.round(hUsed), weight: take * lid.weight });
        cp.height += Math.round(hUsed);
        cp.weight += take * lid.weight;
        gap -= hUsed;
        loose[lc] -= take;
      });
    });

    // --- Remaining loose lids -> own pallets ---
    Object.keys(loose).forEach(function (lc) {
      if (loose[lc] > 0) {
        var lid = App.AUTO_LIDS[lc];
        lidPallets = lidPallets.concat(App.Auto.buildLidPallets(lid, loose[lc]));
      }
    });

    // --- Pack crate + lid pallets into columns (pallet lane) ---
    var palletPallets = cratePallets.concat(lidPallets);
    var columns = App.Auto.packIntoColumns(palletPallets, usableH);
    if (columns === null) { results.push({ truckKey: tk, truck: truck, fits: false, reason: 'a pallet exceeds ceiling' }); return; }

    var palletFloorUsed = columns.length;

    // --- Containers consume floor positions (2 per tied block) ---
    var containerBlocks = 0;
    var containerFloorUsed = 0;
    var containerWeight = 0;
    containerUnits.forEach(function (cu) {
      containerBlocks += cu.blocks;
      containerFloorUsed += cu.blocks * cu.floorPerBlock;  // 2 positions each
      containerWeight += cu.weight;
    });

    // --- Weight + floor checks (pallets + containers share the floor pool) ---
    var palletWeight = palletPallets.reduce(function (s, p) { return s + p.weight; }, 0);
    var totalWeight = palletWeight + containerWeight;
    var totalFloorUsed = palletFloorUsed + containerFloorUsed;

    var fitsFloor = totalFloorUsed <= truck.floorPositions;
    var fitsWeight = totalWeight <= truck.tonnage;
    var fits = fitsFloor && fitsWeight;

    // --- Cost ---
    var cost = null, costPerUnit = null, pricing = null;
    if (typeof App.calculateTruckCost === 'function') {
      // distance is attached on the shipment object by caller; fall back if absent
      var dist = App.Auto._distanceKm || 0;
      var c = App.calculateTruckCost(tk, dist);
      if (c) {
        cost = c.cost;
        pricing = c;
        var totalUnits = shipment.reduce(function (s, l) { return s + (Number(l.qty) || 0); }, 0);
        costPerUnit = totalUnits > 0 ? Math.round(cost / totalUnits) : null;
      }
    }

    // --- Volume calculations ---
    // Truck internal volume (m³)
    var truckVolM3 = (truck.usableLengthMm / 1000) * (truck.usableWidthMm / 1000) * (truck.usableHeightMm / 1000);
    // Volume occupied by pallets: each column footprint 1.2×1.0m × column height
    var palletVolM3 = 0;
    if (columns) {
      columns.forEach(function (col) {
        var colH = col.reduce(function (s, p) { return s + p.height; }, 0);
        palletVolM3 += 1.2 * 1.0 * (colH / 1000);
      });
    }
    // Volume occupied by containers: each block footprint ~ 2 pallet positions × finalH
    var containerVolM3 = 0;
    containerUnits.forEach(function (cu) {
      containerVolM3 += cu.blocks * (2 * 1.2 * 1.0) * (cu.finalH / 1000);
    });
    var volumeOccupiedM3 = palletVolM3 + containerVolM3;
    var volumeLeftM3 = Math.max(0, truckVolM3 - volumeOccupiedM3);
    // TEU remaining = volume left / (1.2 * 1.0 * 0.16) = volume left / 0.192
    var teuRemaining = volumeLeftM3 / 0.192;

    results.push({
      truckKey: tk, truck: truck, fits: fits,
      palletFloorUsed: palletFloorUsed,
      containerFloorUsed: containerFloorUsed,
      containerBlocks: containerBlocks,
      totalFloorUsed: totalFloorUsed, floorAvail: truck.floorPositions,
      containerUnits: containerUnits,
      totalWeight: totalWeight, tonnage: truck.tonnage,
      columns: columns,
      cost: cost, costPerUnit: costPerUnit, pricing: pricing,
      truckVolM3: Math.round(truckVolM3 * 100) / 100,
      volumeOccupiedM3: Math.round(volumeOccupiedM3 * 100) / 100,
      volumeLeftM3: Math.round(volumeLeftM3 * 100) / 100,
      teuRemaining: Math.round(teuRemaining * 10) / 10,
      reason: fits ? '' : (!fitsFloor ? 'not enough floor positions' : 'over weight'),
    });
  });

  // Sort fitting trucks by COST (cheapest first); null cost sinks to bottom.
  var fitting = results.filter(function (r) { return r.fits; });
  fitting.sort(function (a, b) {
    if (a.cost == null && b.cost == null) return a.truck.tonnage - b.truck.tonnage;
    if (a.cost == null) return 1;
    if (b.cost == null) return -1;
    return a.cost - b.cost;
  });
  var best = fitting.length ? fitting[0] : null;

  return { best: best, results: results, fittingSorted: fitting, policy: policy };
};
