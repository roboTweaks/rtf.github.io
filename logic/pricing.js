// ============================================================================
// PRICING LOGIC
// Pure functions for calculating truck costs from per-truck slab data.
// A slab with rate_per_km === Number.MAX_SAFE_INTEGER means no published
// rate — we return null cost so the truck sorts to the bottom for cost/
// pallet-cost (handled by existing null-aware sorters in recommend.js).
// ============================================================================

App.categoryForTruck = function (truckId) {
  var truck = App.TRUCKS[truckId];
  if (!truck) return null;
  return App.TRUCK_CLASS_TO_CATEGORY[truck.class] || null;
};

App.getSlabForDistance = function (truckId, distanceKm) {
  var slabs = App.SLAB_RATES[truckId];
  if (!slabs) return null;
  for (var i = 0; i < slabs.length; i++) {
    var s = slabs[i];
    var max = (s.max_km == null) ? Infinity : s.max_km;
    if (distanceKm >= s.min_km && distanceKm < max) return s;
  }
  return null;
};

App.calculateTruckCost = function (truckId, distanceKm) {
  var slab = App.getSlabForDistance(truckId, distanceKm);
  if (!slab) return null;
  if (slab.rate_per_km == null || slab.rate_per_km === Number.MAX_SAFE_INTEGER) return null;
  return {
    category: App.categoryForTruck(truckId),
    slab: slab.label,
    ratePerKm: slab.rate_per_km,
    distanceKm: distanceKm,
    cost: Math.round(distanceKm * slab.rate_per_km),
  };
};

App.attachCostToOption = function (option, distanceKm) {
  if (option.type === 'single') {
    var perTruck = App.calculateTruckCost(option.truckId, distanceKm);
    if (!perTruck) {
      option.pricing = null;
      option.totalCost = null;
      option.costPerPallet = null;
      return option;
    }
    var totalCost = perTruck.cost * option.trucksNeeded;
    option.pricing = {
      perTruck: perTruck.cost,
      ratePerKm: perTruck.ratePerKm,
      slab: perTruck.slab,
      category: perTruck.category,
    };
    option.totalCost = totalCost;
    option.costPerPallet = Math.round(totalCost / option.quantity);
    return option;
  }

  if (option.type === 'combo') {
    var primaryCost = App.calculateTruckCost(option.primary.truckId, distanceKm);
    var secondaryCost = App.calculateTruckCost(option.secondary.truckId, distanceKm);
    if (!primaryCost || !secondaryCost) {
      option.pricing = null;
      option.totalCost = null;
      option.costPerPallet = null;
      return option;
    }
    var totalCost = primaryCost.cost + secondaryCost.cost;
    option.primary.pricing = {
      cost: primaryCost.cost, ratePerKm: primaryCost.ratePerKm,
      slab: primaryCost.slab, category: primaryCost.category,
    };
    option.secondary.pricing = {
      cost: secondaryCost.cost, ratePerKm: secondaryCost.ratePerKm,
      slab: secondaryCost.slab, category: secondaryCost.category,
    };
    option.totalCost = totalCost;
    option.costPerPallet = Math.round(totalCost / option.quantity);
    return option;
  }

  return option;
};
