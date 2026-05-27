// ============================================================================
// LOAD MATRIX
// For each pallet type and truck, the entry describes how the pallets are laid
// out (orientation, rows, cols, stack) and the operational pallet count
// (`currentlyLoaded`) the company actually loads per truck.
// ============================================================================

window.App = window.App || {};

App.LOAD_MATRIX = {
  'nested-e-pallet': {
    trucks: {
      'tata-ace':       { orientation: "l-along-w", base: 26,  extra: 4,  total: 30,  currentlyLoaded: 30,  rows: 2,  cols: 1, stack: 6  },
      'pickup':         { orientation: "l-along-w", base: 38,  extra: 12, total: 50,  currentlyLoaded: 40,  rows: 2,  cols: 1, stack: 9  },
      'tata-407':       { orientation: "l-along-w", base: 42,  extra: 28, total: 70,  currentlyLoaded: 80,  rows: 2,  cols: 1, stack: 8  },
      '17ft':           { orientation: "w-along-w", base: 168, extra: 4,  total: 172, currentlyLoaded: 130, rows: 4,  cols: 1, stack: 10 },
      '19ft':           { orientation: "w-along-w", base: 184, extra: 16, total: 200, currentlyLoaded: 180, rows: 4,  cols: 2, stack: 11 },
      '20ft':           { orientation: "w-along-w", base: 184, extra: 24, total: 208, currentlyLoaded: 200, rows: 4,  cols: 2, stack: 11 },
      '32ft-7T':        { orientation: "w-along-w", base: 304, extra: 0,  total: 304, currentlyLoaded: 300, rows: 8,  cols: 2, stack: 9  },
      '32ft-9T':        { orientation: "w-along-w", base: 368, extra: 0,  total: 368, currentlyLoaded: 350, rows: 8,  cols: 2, stack: 12 },
      '32ft-mxl-hq':    { orientation: "w-along-w", base: 528, extra: 0,  total: 544, currentlyLoaded: 500, rows: 8,  cols: 2, stack: 16 },
      '40ft-hq':        { orientation: "w-along-w", base: 540, extra: 0,  total: 540, currentlyLoaded: 500, rows: 10, cols: 2, stack: 13 },
    },
  },
  'pl-pallet': {
    trucks: {
      'tata-ace':       { orientation: "l-along-w", base: 16,  extra: 4,  total: 20,  currentlyLoaded: 20,  rows: 2,  cols: 1, stack: 8  },
      'pickup':         { orientation: "l-along-w", base: 22,  extra: 8,  total: 30,  currentlyLoaded: 30,  rows: 2,  cols: 1, stack: 11 },
      'tata-407':       { orientation: "w-along-w", base: 48,  extra: 6,  total: 54,  currentlyLoaded: 50,  rows: 2,  cols: 2, stack: 12 },
      '17ft':           { orientation: "w-along-w", base: 96,  extra: 10, total: 106, currentlyLoaded: 100, rows: 4,  cols: 2, stack: 12 },
      '19ft':           { orientation: "w-along-w", base: 104, extra: 18, total: 122, currentlyLoaded: 120, rows: 4,  cols: 2, stack: 13 },
      '20ft':           { orientation: "w-along-w", base: 104, extra: 22, total: 126, currentlyLoaded: 120, rows: 4,  cols: 2, stack: 13 },
      '32ft-7T':        { orientation: "w-along-w", base: 208, extra: 16, total: 224, currentlyLoaded: 270, rows: 8,  cols: 2, stack: 13 },
      '32ft-9T':        { orientation: "w-along-w", base: 208, extra: 16, total: 224, currentlyLoaded: 300, rows: 8,  cols: 2, stack: 13 },
      '32ft-mxl-hq':    { orientation: "w-along-w", base: 304, extra: 16, total: 320, currentlyLoaded: 312, rows: 8,  cols: 2, stack: 19 },
      '40ft-hq':        { orientation: "w-along-w", base: 300, extra: 20, total: 320, currentlyLoaded: 312, rows: 10, cols: 2, stack: 15 },
    },
  },
};

App.ORIENTATION_LABELS = {
  'w-along-w': { label: 'Width along Width', sublabel: 'Pallet width parallel to truck width' },
  'l-along-w': { label: 'Length along Width', sublabel: 'Pallet length parallel to truck width' },
};
