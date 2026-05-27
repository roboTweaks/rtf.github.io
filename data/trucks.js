// ============================================================================
// TRUCK SPECIFICATIONS
// ----------------------------------------------------------------------------
// Dimensions are EXACT internal dimensions from TOS_V4 made by Summer Intern 9.xlsx
// Usable height has 0.2ft reduced from all dimensions
// length has 30mm/40mm reduced for gate locking
// height has 0.5ft left for unloading through forklift
// floor position is count of pallet that can be laid on truck floor 
// ============================================================================

window.App = window.App || {};

App.TRUCK_CLASSES = {
  SMALL: 'small',
  MID: 'mid',
  LARGE: 'large',
};

App.TRUCKS = {
  'tata-ace': {
    name: 'Tata Ace Gold',
    bodyLength: '8 ft', tonnage: 850,
    lengthFt: 8, widthFt: 5, heightFt: 5,
    lengthMm: 2438, widthMm: 1524, heightMm: 1524,
    usableLengthMm: 2337, usableWidthMm: 1463, usableHeightMm: 1363,
    floorPositions: 2,
    class: 'small',
  },
  'pickup': {
    name: 'Pick Up',
    bodyLength: '9 ft', tonnage: 1500,
    lengthFt: 9, widthFt: 5.5, heightFt: 6.5,
    lengthMm: 2742, widthMm: 1676, heightMm: 1981,
    usableLengthMm: 2642, usableWidthMm: 1615, usableHeightMm: 1820,
    floorPositions: 2,
    class: 'small',
  },
  'tata-407': {
    name: 'Tata 407',
    bodyLength: '10 ft', tonnage: 3000,
    lengthFt: 10, widthFt: 7, heightFt: 7,
    lengthMm: 3048, widthMm: 2133, heightMm: 2133,
    usableLengthMm: 2957, usableWidthMm: 2072, usableHeightMm: 1972,
    floorPositions: 2,
    class: 'small',
  },
  '17ft': {
    name: '17ft',
    bodyLength: '17 ft', tonnage: 5000,
    lengthFt: 17, widthFt: 8, heightFt: 7,
    lengthMm: 5181, widthMm: 2438, heightMm: 2133,
    usableLengthMm: 5090, usableWidthMm: 2377, usableHeightMm: 1973,
    floorPositions: 8,
    class: 'mid',
  },
  '19ft': {
    name: '19ft',
    bodyLength: '19 ft', tonnage: 7000,
    lengthFt: 19, widthFt: 8, heightFt: 8,
    lengthMm: 5790, widthMm: 2438, heightMm: 2438,
    usableLengthMm: 5690, usableWidthMm: 2377, usableHeightMm: 2225,
    floorPositions: 8,
    class: 'mid',
  },
  '20ft': {
    name: '20ft',
    bodyLength: '20 ft', tonnage: 6500,
    lengthFt: 20, widthFt: 8, heightFt: 8,
    lengthMm: 5995, widthMm: 2377, heightMm: 2225,
    usableLengthMm: 5955, usableWidthMm: 2377, usableHeightMm: 2073,
    floorPositions: 8,
    class: 'mid',
  },
  '32ft-7T': {
    name: '32ft 7T SXL',
    bodyLength: '32 ft', tonnage: 7000,
    lengthFt: 32, widthFt: 8, heightFt: 8,
    lengthMm: 9814, widthMm: 2438, heightMm: 2438,
    usableLengthMm: 9713, usableWidthMm: 2377, usableHeightMm: 2225,
    floorPositions: 16,
    class: 'large',
  },
  '32ft-9T': {
    name: '32ft 9T SXL',
    bodyLength: '32 ft', tonnage: 9000,
    lengthFt: 32, widthFt: 8, heightFt: 8,
    lengthMm: 9814, widthMm: 2438, heightMm: 2438,
    usableLengthMm: 9713, usableWidthMm: 2377, usableHeightMm: 2225,
    floorPositions: 16,
    class: 'large',
  },
  '32ft-mxl-hq': {
    name: '32ft MXL HQ',
    bodyLength: '32 ft', tonnage: 15000,
    lengthFt: 32, widthFt: 8, heightFt: 10.5,
    lengthMm: 9753, widthMm: 2438, heightMm: 3200,
    usableLengthMm: 9652, usableWidthMm: 2377, usableHeightMm: 3039,
    floorPositions: 16,
    class: 'large',
  },
  '40ft-hq': {
    name: '40ft HQ',
    bodyLength: '40 ft', tonnage: 15000,
    lengthFt: 40, widthFt: 8, heightFt: 9,
    lengthMm: 12100, widthMm: 2438, heightMm: 2743,
    usableLengthMm: 12009, usableWidthMm: 2377, usableHeightMm: 2529,
    floorPositions: 20,
    class: 'large',
  },
};

App.TRUCK_ORDER = [
  'tata-ace', 'pickup', 'tata-407',
  '17ft', '19ft', '20ft',
  '32ft-7T', '32ft-9T', '32ft-mxl-hq', '40ft-hq',
];



