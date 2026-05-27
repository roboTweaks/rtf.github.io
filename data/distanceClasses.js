// ============================================================================
// DISTANCE RULES FOR TRUCKS
// ============================================================================

App.DISTANCE_RULES = [
  {
    label: 'Short haul',
    sublabel: 'Intracity / local',
    minKm: 0, maxKm: 150,
    preferredClasses: ['small'],
    allowedClasses:   ['small', 'mid'],
  },
  {
    label: 'Mid haul',
    sublabel: 'Regional',
    minKm: 150, maxKm: 600,
    preferredClasses: ['mid'],
    allowedClasses:   ['small', 'mid', 'large'],
  },
  {
    label: 'Long haul',
    sublabel: 'Intercity / cross-state',
    minKm: 600, maxKm: Infinity,
    preferredClasses: ['large'],
    allowedClasses:   ['mid', 'large'],
  },
];

App.getDistanceRule = function (km) {
  return App.DISTANCE_RULES.find(function (r) {
    return km >= r.minKm && km < r.maxKm;
  }) || App.DISTANCE_RULES[App.DISTANCE_RULES.length - 1];
};
