// ============================================================================
// AUTO SKU DATA — auto-generated from auto_updated.xlsx
// ============================================================================
// Categories: LC Crate, FPC Crate, Container (FLC/FSC), Lid, Base Pallet
//
// HEIGHT MODEL (mm):
//   Crate finalH = loadH + 160 (E-Pallet) + 80 (13185 cap lid, always on top)
//   Crate pallets are STACKABLE (cap lid bears load).
//   Lid pallet height = loadH + 160 (no cap). Lids are TERMINAL (nothing on top).
//   Lids may also ride in leftover space ON TOP of a capped crate (no pallet).
//   Container (FLC/FSC): 1970/2140 side runs ACROSS truck width, pallet centred,
//     ~foldW/foldL deep along truck length; lids ship separately palletised.
//
// To ADD A NEW SKU: add a block under the right category map and put its code
// in the matching *_ORDER array. If it introduces a new lid, add to AUTO_LIDS.
// ============================================================================

window.App = window.App || {};

App.AUTO_PALLET_BASE = 160;
App.AUTO_CAP_LID = '13185';   // universal cap on every crate pallet (+80mm)
App.AUTO_CAP_LID_H = 80;

// Category display order + labels for the two-step picker
App.AUTO_CATEGORIES = [
  { key: 'LC Crate',  label: 'LC Crates' },
  { key: 'FPC Crate', label: 'FPC Crates' },
  { key: 'Container', label: 'FLC / FSC Containers' },
  { key: 'Lid',       label: 'Lids' },
];

App.AUTO_LIDS = {
  '13185': { name: 'Multi Lid', finalH: 1160, perPallet: 20, weight: 7.3, foldedH: 50, layersFolded: 20, perLayer: 1, loadWeight: 146.0 },
  '13052': { name: 'Crate Lid', finalH: 460, perPallet: 200, weight: 2.0, foldedH: 15, layersFolded: 20, perLayer: 10, loadWeight: 400.0 },
  '13054': { name: 'Crate Lid', finalH: 460, perPallet: 100, weight: 2.0, foldedH: 15, layersFolded: 20, perLayer: 5, loadWeight: 200.0 },
  '13048': { name: 'Crate Lid', finalH: 1060, perPallet: 20, weight: 2.0, foldedH: 45, layersFolded: 20, perLayer: 1, loadWeight: 40.0 },
  '13049': { name: 'Crate Lid', finalH: 460, perPallet: 400, weight: 2.0, foldedH: 15, layersFolded: 20, perLayer: 20, loadWeight: 800.0 },
  'A040000001': { name: 'FLC  Lid', finalH: 1000, perPallet: 20, weight: 4.5, foldedH: 42, layersFolded: 20, perLayer: 1, loadWeight: 90.0 },
  'A040000018': { name: 'FLC Lid', finalH: 940, perPallet: 20, weight: 4.5, foldedH: 39, layersFolded: 20, perLayer: 1, loadWeight: 90.0 },
  'A040000010': { name: 'FLC Lid', finalH: 940, perPallet: 20, weight: 4.5, foldedH: 39, layersFolded: 20, perLayer: 1, loadWeight: 90.0 },
  'A040000015': { name: 'FLC Lid', finalH: 1460, perPallet: 20, weight: 4.5, foldedH: 65, layersFolded: 20, perLayer: 1, loadWeight: 90.0 },
  'A040000012': { name: 'Crate Lid', finalH: 185, perPallet: 50, weight: 2.0, foldedH: 5, layersFolded: 5, perLayer: 10, loadWeight: 100.0 },
  'A040000011': { name: 'Crate Lid', finalH: 185, perPallet: 25, weight: 2.0, foldedH: 5, layersFolded: 5, perLayer: 5, loadWeight: 50.0 },
};

App.AUTO_CRATES = {
  'A070000001': {
    name: 'LC Crate 4301', code: 'A070000001', category: 'LC Crate',
    perLayer: 10, layersFolded: 20, perPallet: 200,
    foldedH: 47, loadH: 940, weight: 1.172, loadWeight: 234.39999999999998,
    cappedH: 1180, uncappedH: 1100, capLidH: 80,
    lidCode: 'A040000012', lidRequired: false,
  },
  'A070000010': {
    name: 'LC Crate 4304', code: 'A070000010', category: 'LC Crate',
    perLayer: 10, layersFolded: 20, perPallet: 200,
    foldedH: 60, loadH: 1200, weight: 1.8, loadWeight: 360.0,
    cappedH: 1440, uncappedH: 1360, capLidH: 80,
    lidCode: 'A040000012', lidRequired: false,
  },
  'A070000003': {
    name: 'LC Crate 6401', code: 'A070000003', category: 'LC Crate',
    perLayer: 5, layersFolded: 20, perPallet: 100,
    foldedH: 47, loadH: 940, weight: 1.9, loadWeight: 190.0,
    cappedH: 1180, uncappedH: 1100, capLidH: 80,
    lidCode: 'A040000011', lidRequired: false,
  },
  'A070000004': {
    name: 'LC Crate 6402', code: 'A070000004', category: 'LC Crate',
    perLayer: 5, layersFolded: 20, perPallet: 100,
    foldedH: 47, loadH: 940, weight: 2.3, loadWeight: 229.99999999999997,
    cappedH: 1180, uncappedH: 1100, capLidH: 80,
    lidCode: 'A040000011', lidRequired: false,
  },
  'A070000011': {
    name: 'LC Crate 6404', code: 'A070000011', category: 'LC Crate',
    perLayer: 5, layersFolded: 20, perPallet: 100,
    foldedH: 74, loadH: 1480, weight: 2.8, loadWeight: 280.0,
    cappedH: 1720, uncappedH: 1640, capLidH: 80,
    lidCode: 'A040000011', lidRequired: false,
  },
  'A070000006': {
    name: 'LC Crate 6405', code: 'A070000006', category: 'LC Crate',
    perLayer: 5, layersFolded: 20, perPallet: 100,
    foldedH: 74, loadH: 1480, weight: 3.6, loadWeight: 360.0,
    cappedH: 1720, uncappedH: 1640, capLidH: 80,
    lidCode: 'A040000011', lidRequired: false,
  },
  '14400': {
    name: 'FPC Crate', code: '14400', category: 'FPC Crate',
    perLayer: 20, layersFolded: 50, perPallet: 1000,
    foldedH: 33, loadH: 1650, weight: 0.75, loadWeight: 750.0,
    cappedH: 1890, uncappedH: 1810, capLidH: 80,
    lidCode: '13049', lidRequired: false,
  },
  '14401': {
    name: 'FPC Crate', code: '14401', category: 'FPC Crate',
    perLayer: 10, layersFolded: 50, perPallet: 500,
    foldedH: 33, loadH: 1650, weight: 1.18, loadWeight: 590.0,
    cappedH: 1890, uncappedH: 1810, capLidH: 80,
    lidCode: '13052', lidRequired: false,
  },
  '14402': {
    name: 'FPC Crate', code: '14402', category: 'FPC Crate',
    perLayer: 5, layersFolded: 50, perPallet: 250,
    foldedH: 33, loadH: 1650, weight: 1.87, loadWeight: 467.5,
    cappedH: 1890, uncappedH: 1810, capLidH: 80,
    lidCode: '13054', lidRequired: false,
  },
  '14403': {
    name: 'FPC Crate', code: '14403', category: 'FPC Crate',
    perLayer: 5, layersFolded: 40, perPallet: 200,
    foldedH: 46, loadH: 1840, weight: 2.82, loadWeight: 564.0,
    cappedH: 2080, uncappedH: 2000, capLidH: 80,
    lidCode: '13054', lidRequired: false,
  },
  '14405': {
    name: 'FPC Crate', code: '14405', category: 'FPC Crate',
    perLayer: 10, layersFolded: 30, perPallet: 300,
    foldedH: 61, loadH: 1830, weight: 1.65, loadWeight: 495.0,
    cappedH: 2070, uncappedH: 1990, capLidH: 80,
    lidCode: '13052', lidRequired: false,
  },
  '14406': {
    name: 'FPC Crate', code: '14406', category: 'FPC Crate',
    perLayer: 5, layersFolded: 50, perPallet: 250,
    foldedH: 35, loadH: 1750, weight: 2.02, loadWeight: 505.0,
    cappedH: 1990, uncappedH: 1910, capLidH: 80,
    lidCode: '13054', lidRequired: false,
  },
  '14408': {
    name: 'FPC Crate', code: '14408', category: 'FPC Crate',
    perLayer: 5, layersFolded: 30, perPallet: 150,
    foldedH: 61, loadH: 1830, weight: 2.99, loadWeight: 448.50000000000006,
    cappedH: 2070, uncappedH: 1990, capLidH: 80,
    lidCode: '13054', lidRequired: false,
  },
  '14409': {
    name: 'FPC Crate', code: '14409', category: 'FPC Crate',
    perLayer: 2, layersFolded: 50, perPallet: 100,
    foldedH: 35, loadH: 1750, weight: 4.17, loadWeight: 417.0,
    cappedH: 1990, uncappedH: 1910, capLidH: 80,
    lidCode: '13185', lidRequired: false,
  },
};

App.AUTO_CONTAINERS = {
  'FSC12x8': {
    name: 'FSC 1200 x 800', code: 'FSC12x8', category: 'Container',
    acrossWidthMm: 1970, alongLengthMm: 520, finalH: 1960,
    perPallet: 60, weight: 7.6, loadWeight: 456.0,
    palletCode: 'A020000001', lidCode: 'A040000001', lidRequired: true,
  },
  'FLC12x8': {
    name: 'FLC 1200 x 800', code: 'FLC12x8', category: 'Container',
    acrossWidthMm: 1970, alongLengthMm: 820, finalH: 1960,
    perPallet: 60, weight: 11.5, loadWeight: 690.0,
    palletCode: 'A020000001', lidCode: 'A040000001', lidRequired: true,
  },
  'FLC12x10': {
    name: 'FLC 1200 x 1000', code: 'FLC12x10', category: 'Container',
    acrossWidthMm: 2140, alongLengthMm: 875, finalH: 1960,
    perPallet: 60, weight: 15.0, loadWeight: 900.0,
    palletCode: 'A020000019', lidCode: 'A040000018', lidRequired: true,
  },
};

App.AUTO_ORDER = {
  'LC Crate': ['A070000001', 'A070000010', 'A070000003', 'A070000004', 'A070000011', 'A070000006'],
  'FPC Crate': ['14400', '14401', '14402', '14403', '14405', '14406', '14408', '14409'],
  'Container': ['FSC12x8', 'FLC12x8', 'FLC12x10'],
  'Lid': ['13185', '13052', '13054', '13048', '13049', 'A040000001', 'A040000018', 'A040000010', 'A040000015', 'A040000012', 'A040000011'],
};

// Convenience: every selectable SKU -> its category
App.AUTO_SKU_CATEGORY = {};
['LC Crate','FPC Crate','Container','Lid'].forEach(function(cat){
  (App.AUTO_ORDER[cat]||[]).forEach(function(code){ App.AUTO_SKU_CATEGORY[code]=cat; });
});
