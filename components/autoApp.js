// ============================================================================
// AUTO APP (v4) — category → SKU picker, quantity, distance, cost.
// Flow: pick a CATEGORY, then a SKU within it, set quantity (+ lid choice for
// crates), add to shipment. Enter distance. Calculate => cheapest truck + plan.
// ============================================================================

App.autoState = {
  activeCategory: 'LC Crate',
  activeSku: null,
  draftQty: '',
  draftWithLid: false,
  selected: {},          // code -> { qty, withLid, category }
  distance: '',
  submitted: false,
  policy: 'min_floor',
};

App.escapeHtml = App.escapeHtml || function (s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};
App.autoFmtINR = function (n) {
  return n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN');
};

// ----------------------------------------------------------------------------
// Look up a SKU object (crate / container / lid) by code
// ----------------------------------------------------------------------------
App.autoSkuByCode = function (code) {
  return App.AUTO_CRATES[code] || App.AUTO_CONTAINERS[code] || App.AUTO_LIDS[code] || null;
};
App.autoIsCrate = function (code) { return !!App.AUTO_CRATES[code]; };

// ----------------------------------------------------------------------------
// CATEGORY TABS
// ----------------------------------------------------------------------------
App.renderCategoryTabs = function () {
  var html = '<div class="cat-tabs">';
  App.AUTO_CATEGORIES.forEach(function (c) {
    var active = App.autoState.activeCategory === c.key;
    html += '<button class="cat-tab ' + (active ? 'cat-tab--active' : '') + '" data-cat="' + c.key + '">' +
      App.escapeHtml(c.label) + '</button>';
  });
  html += '</div>';
  return html;
};

// ----------------------------------------------------------------------------
// SKU LIST for active category (+ image space + qty entry for active sku)
// ----------------------------------------------------------------------------
App.renderSkuList = function () {
  var cat = App.autoState.activeCategory;
  var codes = App.AUTO_ORDER[cat] || [];
  var html = '<div class="sku-list">';

  codes.forEach(function (code) {
    var sku = App.autoSkuByCode(code);
    if (!sku) return;
    var active = App.autoState.activeSku === code;
    var inCart = !!App.autoState.selected[code];

    html += '<div class="sku-item ' + (active ? 'sku-item--active' : '') + (inCart ? ' sku-item--incart' : '') + '" data-sku="' + code + '">';

    // image placeholder
    html += '<div class="sku-img"><img src="./assets/images/auto_placeholder.svg" alt="part"></div>';

    // info
    html += '<div class="sku-item-info">';
    html += '<div class="sku-item-name">' + App.escapeHtml(sku.name) + '</div>';
    html += '<div class="sku-item-code">' + code + '</div>';
    var meta = [];
    if (sku.perPallet) meta.push(sku.perPallet + '/pallet');
    if (sku.weight) meta.push(sku.weight + 'kg');
    if (sku.acrossWidthMm) meta.push('needs ' + sku.acrossWidthMm + 'mm width');
    html += '<div class="sku-item-meta">' + meta.join(' · ') + '</div>';
    html += '</div>';

    // cart badge
    if (inCart) {
      html += '<div class="sku-cart-badge">×' + (App.autoState.selected[code].qty || 0) + '</div>';
    } else {
      html += '<div class="sku-add-hint">' + (active ? '▾' : '+') + '</div>';
    }
    html += '</div>'; // sku-item

    // Expanded qty entry when active
    if (active) {
      var isCrate = App.autoIsCrate(code);
      var lidReq = sku.lidRequired;
      html += '<div class="sku-entry">';
      html += '<div class="sku-qty-wrap">';
      html += '<input type="number" id="draft-qty" class="sku-qty" min="1" placeholder="quantity" value="' + (App.autoState.draftQty || '') + '" />';
      html += '<span class="sku-qty-unit">units</span>';
      html += '</div>';

      // Lid choice — only for crates whose lid is optional (lidReq=No).
      // Containers (lidReq=Yes) always ship with lid; lids themselves: none.
      if (isCrate) {
        if (lidReq) {
          html += '<div class="lid-note">Lid ships with this item</div>';
        } else {
          html += '<div class="lid-choice">';
          html += '<button class="lid-btn ' + (App.autoState.draftWithLid ? 'lid-btn--active' : '') + '" data-lid="1">+ Matching Lid</button>';
          html += '<button class="lid-btn ' + (!App.autoState.draftWithLid ? 'lid-btn--active' : '') + '" data-lid="0">Crate Only</button>';
          html += '</div>';
        }
      } else if (App.AUTO_CONTAINERS[code]) {
        html += '<div class="lid-note">Lid palletised separately (required)</div>';
      }

      html += '<button class="add-btn" id="add-sku-btn">' + (inCart ? 'Update' : 'Add') + '</button>';
      html += '</div>';
    }
  });

  html += '</div>';
  return html;
};

// ----------------------------------------------------------------------------
// SHIPMENT SUMMARY (chips)
// ----------------------------------------------------------------------------
App.renderShipmentSummary = function () {
  var codes = Object.keys(App.autoState.selected);
  if (!codes.length) return '<div class="sel-summary sel-summary--empty">No items added yet</div>';
  var html = '<div class="sel-summary">';
  var total = 0;
  codes.forEach(function (code) {
    var sel = App.autoState.selected[code];
    var sku = App.autoSkuByCode(code);
    var q = Number(sel.qty) || 0; total += q;
    html += '<span class="sel-chip">' + App.escapeHtml(sku ? sku.name : code) +
      ' <b>×' + q + '</b>' + (sel.withLid ? ' <i>+lid</i>' : '') +
      '<span class="sel-chip-x" data-remove="' + code + '">✕</span></span>';
  });
  html += '<span class="sel-total">' + codes.length + ' items · ' + total + ' units</span></div>';
  return html;
};

App.renderAutoDistanceHint = function () {
  var km = Number(App.autoState.distance);
  if (!km || km <= 0) return '';
  var rule = App.getDistanceRule(km);
  return '<div class="distance-hint"><span class="dot"></span>' +
    rule.label.toUpperCase() + ' · ' + rule.sublabel.toUpperCase() + '</div>';
};

// ----------------------------------------------------------------------------
// RESULTS
// ----------------------------------------------------------------------------
App.renderAutoResults = function () {
  var st = App.autoState;
  if (!st.submitted) {
    return '<section class="empty-state"><span>▦</span> ADD ITEMS, ENTER DISTANCE, THEN CALCULATE</section>';
  }
  var shipment = [];
  Object.keys(st.selected).forEach(function (code) {
    var sel = st.selected[code];
    var q = Number(sel.qty) || 0;
    if (q > 0) shipment.push({ code: code, qty: q, withLid: !!sel.withLid });
  });
  if (!shipment.length) return '<section class="empty-state">Add a quantity to at least one item.</section>';

  App.Auto._distanceKm = Number(st.distance) || 0;
  var r = App.Auto.findBestTruck(shipment, st.policy);

  var html = '<section class="results">';
  html += '<div class="results-head"><div>';
  html += '<div class="results-eyebrow"><span class="sparkle">✦</span> CHEAPEST TRUCK · BIN-PACKED</div>';
  html += '<h2 class="results-title">Packing <em>' + shipment.length + ' item' + (shipment.length>1?'s':'') +
          '</em> · ' + st.distance + ' km</h2>';
  html += '</div>';
  html += '<div class="policy-toggle"><div class="sort-label">PALLET BUILD</div><div class="policy-options">';
  html += '<button class="policy-btn ' + (st.policy==='min_floor'?'policy-btn--active':'') + '" data-policy="min_floor"><div class="policy-btn-label">Tightest</div><div class="policy-btn-sub">FEWEST POSITIONS</div></button>';
  html += '<button class="policy-btn ' + (st.policy==='natural'?'policy-btn--active':'') + '" data-policy="natural"><div class="policy-btn-label">Natural</div><div class="policy-btn-sub">FULL PALLETS</div></button>';
  html += '</div></div></div>';

  if (!r.best) {
    html += '<div class="no-fit-card"><div class="no-fit-title">No single truck fits this shipment</div>' +
      '<div class="no-fit-sub">The load exceeds every truck on floor space, length, or weight. Split it across multiple trucks.</div></div>';
  } else {
    html += App.renderAutoBestCard(r.best, shipment);
  }
  html += App.renderAutoTruckTable(r.fittingSorted, r.results);
  html += '</section>';
  return html;
};

App.renderAutoBestCard = function (best, shipment) {
  var truck = best.truck;
  var html = '<div class="truck-card truck-card--single">';
  html += '<div class="card-badges"><div class="rank-badge rank-badge--best">CHEAPEST FIT</div></div>';
  html += '<div class="card-body">';

  // head
  html += '<div class="auto-card-head"><div>';
  html += '<div class="metric-label">RECOMMENDED TRUCK</div>';
  html += '<h3 class="truck-name">' + App.escapeHtml(truck.name) + '</h3>';
  html += '<div class="sku-item-meta">' + truck.bodyLength.toUpperCase() + ' · ' +
          truck.tonnage.toLocaleString() + 'KG · usable H ' + truck.usableHeightMm + 'mm</div>';
  html += '</div><div class="auto-metrics">';
  html += '<div class="metric"><div class="metric-label">TOTAL COST</div><div class="metric-value metric-value--large metric-value--accent">' + App.autoFmtINR(best.cost) + '</div></div>';
  if (best.costPerUnit != null)
    html += '<div class="metric"><div class="metric-label">PER UNIT</div><div class="metric-value">' + App.autoFmtINR(best.costPerUnit) + '</div></div>';
  html += '<div class="metric"><div class="metric-label">FLOOR</div><div class="metric-value">' + best.totalFloorUsed + '/' + best.floorAvail + '</div></div>';
  html += '<div class="metric"><div class="metric-label">WEIGHT</div><div class="metric-value">' + Math.round(best.totalWeight) + '<span class="unit">kg</span></div></div>';
  html += '</div></div>';

  // volume row
  html += '<div class="vol-row">';
  html += '<div class="vol-item"><div class="vol-label">TRUCK VOLUME</div><div class="vol-value">' + best.truckVolM3 + ' m³</div></div>';
  html += '<div class="vol-item"><div class="vol-label">OCCUPIED</div><div class="vol-value">' + best.volumeOccupiedM3 + ' m³</div></div>';
  html += '<div class="vol-item"><div class="vol-label">REMAINING</div><div class="vol-value vol-value--accent">' + best.volumeLeftM3 + ' m³</div></div>';
  html += '<div class="vol-item"><div class="vol-label">REMAINING IN TEU</div><div class="vol-value vol-value--accent">' + best.teuRemaining + ' TEU</div></div>';
  html += '</div>';

  // pricing breakdown
  if (best.pricing) {
    html += '<div class="pricing-line">Slab ' + App.escapeHtml(best.pricing.slab) +
      ' · ₹' + best.pricing.ratePerKm + '/km × ' + best.pricing.distanceKm + 'km = ' +
      App.autoFmtINR(best.cost) + '</div>';
  }

  // containers (each tied block = 2 floor positions, stacked folded units)
  if (best.containerUnits && best.containerUnits.length) {
    html += '<div class="columns-label">CONTAINERS (each tied stack = 2 floor positions)</div>';
    html += '<div class="container-lane">';
    best.containerUnits.forEach(function (cu) {
      html += '<div class="cont-block" title="' + App.escapeHtml(cu.name) + '">' +
        '<div class="cont-block-name">' + App.escapeHtml(cu.name) + '</div>' +
        '<div class="cont-block-qty">×' + cu.qty + '</div>' +
        '<div class="cont-block-len">' + cu.blocks + ' stack' + (cu.blocks > 1 ? 's' : '') +
        ' · ' + (cu.blocks * cu.floorPerBlock) + ' floor pos</div></div>';
    });
    html += '</div>';
    html += '<div class="lane-meter">' + best.containerFloorUsed + ' of ' + best.floorAvail +
            ' floor positions used by containers (folded stacks, 1960mm tall)</div>';
  }

  // column viz (crate/lid pallets)
  if (best.columns && best.columns.length) {
    html += '<div class="columns-label">PALLET COLUMNS (each = one floor position)</div>';
    html += '<div class="columns-viz">';
    best.columns.forEach(function (col, i) {
      var totalH = col.reduce(function (s, p) {
        var ph = p.height + (p.lidsOnTop ? p.lidsOnTop.reduce(function(ss,l){return ss+l.height;},0) : 0);
        return s + ph;
      }, 0);
      var gap = truck.usableHeightMm - totalH;
      html += '<div class="col-stack"><div class="col-stack-bars">';
      // top-down: reverse
      col.slice().reverse().forEach(function (p) {
        // lids on top of this crate first (they're physically above)
        if (p.lidsOnTop && p.lidsOnTop.length) {
          p.lidsOnTop.slice().reverse().forEach(function (l) {
            var pct = Math.max(5, (l.height / truck.usableHeightMm) * 100);
            html += '<div class="bar bar--lid" style="height:' + pct + '%" title="lid ' + l.code + ' ×' + l.items + ' (on crate top)"><span class="bar-label">' + l.items + '</span></div>';
          });
        }
        var bpct = Math.max(6, (p.height / truck.usableHeightMm) * 100);
        var cls = p.kind === 'lid' ? 'bar bar--lid' : 'bar bar--crate';
        html += '<div class="' + cls + '" style="height:' + bpct + '%" title="' + p.code + ' ×' + p.items + ' (' + p.height + 'mm)"><span class="bar-label">' + p.items + '</span></div>';
      });
      if (gap > 20) html += '<div class="bar bar--gap" style="height:' + ((gap/truck.usableHeightMm)*100) + '%"></div>';
      html += '</div><div class="col-stack-foot">Pos ' + (i+1) + '<br>' + totalH + 'mm</div></div>';
    });
    html += '</div>';

    // detail rows
    html += '<div class="col-details">';
    best.columns.forEach(function (col, i) {
      var parts = col.map(function (p) {
        var s = p.code + ' [' + p.items + (p.kind==='lid'?' lids':' crates') + ', ' + p.height + 'mm]';
        if (p.lidsOnTop && p.lidsOnTop.length) {
          s += ' + on-top: ' + p.lidsOnTop.map(function(l){return l.code+'×'+l.items;}).join(', ');
        }
        return s;
      }).join('  +  ');
      html += '<div class="col-detail-row"><b>Pos ' + (i+1) + ':</b> ' + parts + '</div>';
    });
    html += '</div>';
  }

  html += '</div></div>';
  return html;
};

App.renderAutoTruckTable = function (fittingSorted, allResults) {
  var html = '<div class="auto-truck-table"><div class="att-head">ALL TRUCKS · CHEAPEST FIRST</div>';
  html += '<table><thead><tr><th>Truck</th><th>Cost</th><th>Floor</th><th>Weight</th><th>Vol Left</th><th>TEU Left</th><th>Result</th></tr></thead><tbody>';
  var shown = {};
  fittingSorted.forEach(function (r) {
    shown[r.truckKey] = true;
    html += '<tr class="att-fit"><td>' + App.escapeHtml(r.truck.name) + '</td>' +
      '<td>' + App.autoFmtINR(r.cost) + '</td>' +
      '<td>' + r.totalFloorUsed + '/' + r.floorAvail + '</td>' +
      '<td>' + Math.round(r.totalWeight) + '/' + r.tonnage + '</td>' +
      '<td>' + r.volumeLeftM3 + 'm³</td>' +
      '<td>' + r.teuRemaining + '</td>' +
      '<td>FITS</td></tr>';
  });
  allResults.forEach(function (r) {
    if (shown[r.truckKey]) return;
    html += '<tr class="att-no"><td>' + App.escapeHtml(r.truck.name) + '</td>' +
      '<td>—</td><td>' + (r.totalFloorUsed!=null?(r.totalFloorUsed+'/'+r.floorAvail):'—') + '</td>' +
      '<td>' + (r.totalWeight!=null?Math.round(r.totalWeight):'—') + '</td>' +
      '<td>—</td><td>—</td>' +
      '<td>' + (r.reason||'no') + '</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
};

// ----------------------------------------------------------------------------
// RENDER + EVENTS
// ----------------------------------------------------------------------------
App.renderAuto = function () {
  document.getElementById('cat-tabs').innerHTML = App.renderCategoryTabs();
  document.getElementById('sku-list').innerHTML = App.renderSkuList();
  document.getElementById('shipment-summary').innerHTML = App.renderShipmentSummary();
  document.getElementById('distance-hint').innerHTML = App.renderAutoDistanceHint();

  var hasSel = Object.keys(App.autoState.selected).some(function (c) {
    return Number(App.autoState.selected[c].qty) > 0;
  });
  var canCalc = hasSel && App.autoState.distance && Number(App.autoState.distance) >= 1;
  var btn = document.getElementById('calc-btn');
  if (canCalc) btn.removeAttribute('disabled'); else btn.setAttribute('disabled','disabled');
  document.getElementById('reset-btn').style.display = App.autoState.submitted ? 'inline-flex' : 'none';

  document.getElementById('results').innerHTML = App.renderAutoResults();

  App.attachAutoDynamic();
};

App.attachAutoDynamic = function () {
  document.querySelectorAll('[data-policy]').forEach(function (b) {
    b.addEventListener('click', function () { App.autoState.policy = b.getAttribute('data-policy'); App.renderAuto(); });
  });
  document.querySelectorAll('[data-remove]').forEach(function (x) {
    x.addEventListener('click', function () {
      delete App.autoState.selected[x.getAttribute('data-remove')];
      App.autoState.submitted = false; App.renderAuto();
    });
  });
};

App.attachAutoHandlers = function () {
  // category tabs (delegation on a stable parent)
  document.getElementById('cat-tabs').addEventListener('click', function (e) {
    var t = e.target.closest('[data-cat]');
    if (!t) return;
    App.autoState.activeCategory = t.getAttribute('data-cat');
    App.autoState.activeSku = null;
    App.autoState.draftQty = '';
    App.autoState.draftWithLid = false;
    App.renderAuto();
  });

  var list = document.getElementById('sku-list');

  list.addEventListener('click', function (e) {
    // expand a SKU
    var item = e.target.closest('.sku-item');
    if (item && !e.target.closest('.sku-entry')) {
      var code = item.getAttribute('data-sku');
      if (App.autoState.activeSku === code) {
        App.autoState.activeSku = null;
      } else {
        App.autoState.activeSku = code;
        var existing = App.autoState.selected[code];
        App.autoState.draftQty = existing ? existing.qty : '';
        var sku = App.autoSkuByCode(code);
        App.autoState.draftWithLid = existing ? existing.withLid : false;
      }
      App.renderAuto();
      return;
    }
    // lid choice
    var lidBtn = e.target.closest('.lid-btn');
    if (lidBtn) {
      App.autoState.draftWithLid = lidBtn.getAttribute('data-lid') === '1';
      App.renderAuto();
      return;
    }
    // add/update
    var addBtn = e.target.closest('#add-sku-btn');
    if (addBtn) {
      var code = App.autoState.activeSku;
      var q = Number(App.autoState.draftQty);
      if (code && q > 0) {
        var isCrate = App.autoIsCrate(code);
        var sku = App.autoSkuByCode(code);
        var withLid = isCrate ? (sku.lidRequired ? true : App.autoState.draftWithLid) : false;
        App.autoState.selected[code] = { qty: q, withLid: withLid, category: App.autoState.activeCategory };
        App.autoState.activeSku = null;
        App.autoState.draftQty = '';
        App.autoState.draftWithLid = false;
        App.autoState.submitted = false;
        App.renderAuto();
      }
      return;
    }
  });

  list.addEventListener('input', function (e) {
    if (e.target.id === 'draft-qty') {
      App.autoState.draftQty = e.target.value;
    }
  });

  document.getElementById('distance-input').addEventListener('input', function (e) {
    App.autoState.distance = e.target.value;
    App.autoState.submitted = false;
    document.getElementById('distance-hint').innerHTML = App.renderAutoDistanceHint();
    var hasSel = Object.keys(App.autoState.selected).some(function (c) { return Number(App.autoState.selected[c].qty) > 0; });
    var can = hasSel && App.autoState.distance && Number(App.autoState.distance) >= 1;
    var b = document.getElementById('calc-btn');
    if (can) b.removeAttribute('disabled'); else b.setAttribute('disabled','disabled');
  });

  document.getElementById('calc-btn').addEventListener('click', function () {
    App.autoState.submitted = true; App.renderAuto();
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    App.autoState.selected = {}; App.autoState.distance = ''; App.autoState.submitted = false;
    App.autoState.activeSku = null; App.autoState.draftQty = ''; App.autoState.draftWithLid = false;
    document.getElementById('distance-input').value = '';
    App.renderAuto();
  });
  document.getElementById('distance-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('calc-btn').click();
  });
};

App.initAuto = function () {
  App.attachAutoHandlers();
  App.renderAuto();
};
document.addEventListener('DOMContentLoaded', App.initAuto);
