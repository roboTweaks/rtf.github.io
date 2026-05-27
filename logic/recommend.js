// ============================================================================
// RECOMMENDATION ENGINE
// Pure functions. Takes pallet/quantity/distance and returns ranked options.
// ============================================================================

App.bestOrientationFor = function (palletTypeKey, truckId) {
  var entry = App.LOAD_MATRIX[palletTypeKey];
  if (!entry) return null;
  var cap = entry.trucks[truckId];
  if (!cap) return null;
  var labels = (App.ORIENTATION_LABELS && App.ORIENTATION_LABELS[cap.orientation]) || {};
  return {
    orientationKey: cap.orientation,
    label: labels.label || cap.orientation,
    sublabel: labels.sublabel || '',
    capacity: cap,
  };
};

App.buildSingleTypeOption = function (palletTypeKey, truckId, quantity, capacityKey) {
  capacityKey = capacityKey || 'currentlyLoaded';
  var orientation = App.bestOrientationFor(palletTypeKey, truckId);
  if (!orientation) return null;
  var perTruck = orientation.capacity[capacityKey];
  if (!perTruck) return null;
  var trucksNeeded = Math.ceil(quantity / perTruck);
  var totalCapacity = perTruck * trucksNeeded;
  var utilization = quantity / totalCapacity;
  var palletsInLastTruck = quantity - perTruck * (trucksNeeded - 1);
  return {
    type: 'single',
    truckId: truckId,
    truck: App.TRUCKS[truckId],
    orientation: orientation,
    capacityPerTruck: perTruck,
    trucksNeeded: trucksNeeded,
    totalCapacity: totalCapacity,
    utilization: utilization,
    palletsInLastTruck: palletsInLastTruck,
    quantity: quantity,
  };
};

App.buildComboOption = function (palletTypeKey, primaryId, secondaryId, quantity, capacityKey) {
  capacityKey = capacityKey || 'currentlyLoaded';
  var primary = App.bestOrientationFor(palletTypeKey, primaryId);
  var secondary = App.bestOrientationFor(palletTypeKey, secondaryId);
  if (!primary || !secondary) return null;
  var primaryCap = primary.capacity[capacityKey];
  var secondaryCap = secondary.capacity[capacityKey];
  if (!primaryCap || !secondaryCap) return null;
  if (quantity <= primaryCap) return null;
  var remainder = quantity - primaryCap;
  if (remainder > secondaryCap) return null;
  if (secondaryCap >= primaryCap) return null;
  var totalCapacity = primaryCap + secondaryCap;
  return {
    type: 'combo',
    primary: {
      truckId: primaryId,
      truck: App.TRUCKS[primaryId],
      orientation: primary,
      capacity: primaryCap,
      load: primaryCap,
    },
    secondary: {
      truckId: secondaryId,
      truck: App.TRUCKS[secondaryId],
      orientation: secondary,
      capacity: secondaryCap,
      load: remainder,
    },
    trucksNeeded: 2,
    totalCapacity: totalCapacity,
    utilization: quantity / totalCapacity,
    quantity: quantity,
  };
};

App.SORTERS = {
  utilization: function (a, b) {
    var sa = (a.isPreferredClass ? 1000 : 0) - a.trucksNeeded * 10 + a.utilization * 5;
    var sb = (b.isPreferredClass ? 1000 : 0) - b.trucksNeeded * 10 + b.utilization * 5;
    return sb - sa;
  },
  cost: function (a, b) {
    if (a.totalCost == null && b.totalCost == null) return 0;
    if (a.totalCost == null) return 1;
    if (b.totalCost == null) return -1;
    return a.totalCost - b.totalCost;
  },
  'pallet-cost': function (a, b) {
    if (a.costPerPallet == null && b.costPerPallet == null) return 0;
    if (a.costPerPallet == null) return 1;
    if (b.costPerPallet == null) return -1;
    return a.costPerPallet - b.costPerPallet;
  },
  fewest: function (a, b) {
    if (a.trucksNeeded !== b.trucksNeeded) return a.trucksNeeded - b.trucksNeeded;
    return b.utilization - a.utilization;
  },
};

App.recommendTrucks = function (input) {
  var palletTypeKey = input.palletTypeKey;
  var quantity = input.quantity;
  var distanceKm = input.distanceKm;
  var sortBy = input.sortBy || 'utilization';
  var capacityKey = input.maxEfficiency ? 'total' : 'currentlyLoaded';

  var distanceRule = App.getDistanceRule(distanceKm);
  var allowedClasses = distanceRule.allowedClasses;
  var preferredClasses = distanceRule.preferredClasses;

  var singleOptions = [];
  App.TRUCK_ORDER.forEach(function (truckId) {
    var truck = App.TRUCKS[truckId];
    if (allowedClasses.indexOf(truck.class) < 0) return;
    var opt = App.buildSingleTypeOption(palletTypeKey, truckId, quantity, capacityKey);
    if (!opt || opt.trucksNeeded > 30) return;
    opt.isPreferredClass = preferredClasses.indexOf(truck.class) >= 0;
    App.attachCostToOption(opt, distanceKm);
    opt.distanceKm = distanceKm;
    singleOptions.push(opt);
  });

  var allCombos = [];
  App.TRUCK_ORDER.forEach(function (primaryId) {
    var primary = App.TRUCKS[primaryId];
    if (allowedClasses.indexOf(primary.class) < 0) return;
    var primaryBest = App.bestOrientationFor(palletTypeKey, primaryId);
    if (!primaryBest) return;
    var primaryCap = primaryBest.capacity[capacityKey];
    if (!primaryCap || primaryCap >= quantity) return;
    App.TRUCK_ORDER.forEach(function (secondaryId) {
      if (secondaryId === primaryId) return;
      var secondary = App.TRUCKS[secondaryId];
      if (allowedClasses.indexOf(secondary.class) < 0) return;
      var combo = App.buildComboOption(palletTypeKey, primaryId, secondaryId, quantity, capacityKey);
      if (!combo) return;
      combo.isPreferredClass =
        preferredClasses.indexOf(primary.class) >= 0 ||
        preferredClasses.indexOf(secondary.class) >= 0;
      App.attachCostToOption(combo, distanceKm);
      combo.distanceKm = distanceKm;
      allCombos.push(combo);
    });
  });

  // Keep best combo per primary truck
  var bestComboPerPrimary = {};
  allCombos.forEach(function (c) {
    var k = c.primary.truckId;
    if (!bestComboPerPrimary[k] || c.utilization > bestComboPerPrimary[k].utilization) {
      bestComboPerPrimary[k] = c;
    }
  });
  var dedupedCombos = Object.keys(bestComboPerPrimary).map(function (k) {
    return bestComboPerPrimary[k];
  });

  var sorter = App.SORTERS[sortBy] || App.SORTERS.utilization;
  singleOptions.sort(sorter);
  dedupedCombos.sort(sorter);

  var merged = [];
  if (sortBy === 'cost' || sortBy === 'pallet-cost') {
    var all = singleOptions.concat(dedupedCombos);
    all.sort(sorter);
    merged = all.slice(0, 5);
  } else {
    var top = [singleOptions[0], dedupedCombos[0], singleOptions[1], dedupedCombos[1], singleOptions[2]];
    top.forEach(function (o) { if (o) merged.push(o); });
  }

  return {
    distanceRule: distanceRule,
    options: merged,
    quantity: quantity,
    distanceKm: distanceKm,
    sortBy: sortBy,
  };
};
