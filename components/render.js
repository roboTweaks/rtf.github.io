// ============================================================================

var TRUCK_IMAGES = {
  'Tata Ace': './assets/images/tata_ace.png',
  'Tata 407': './assets/images/tata_407.png',
  'Container' : './assets/images/trucka.png'
};

App.fmtINR = function (n) {
  return n == null ? '—' : '₹' + n.toLocaleString('en-IN');
};

App.escapeHtml = function (str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// ----------------------------------------------------------------------------
// Truck silhouette — picks variant based on truck name
// ----------------------------------------------------------------------------
App.renderTruckSilhouette = function (truck) {
  var name = truck.name.toLowerCase();

  var imagePath = './assets/images/trucka.png'

  if (name.indexOf('ace') >= 0 || name.indexOf('pickup') >= 0) {
    imagePath = './assets/images/tata_ace.png';
  }
  else if (name.indexOf('407') >= 0 || name.indexOf('pick') >= 0) {
    imagePath = './assets/images/tata_407.png'
  }

  return (
    '<img class="truck-image" src="' + imagePath + '" alt="' +
    App.escapeHtml(truck.name) + '">'
  );
};
// ----------------------------------------------------------------------------
// Pallet diagram — top-down SVG of truck bed + pallets
// ----------------------------------------------------------------------------
App.renderPalletDiagram = function (truck, orientation, fillCount) {
  var cap = orientation.capacity;
  var rows = cap.rows, cols = cap.cols, base = cap.base, extra = cap.extra;
  var visualCapacity = base + extra;
  var fill = (fillCount == null) ? visualCapacity : fillCount;
  var baseFill = Math.min(fill, base);
  var extraFill = Math.max(0, Math.min(fill - base, extra));

  var padding = 14;
  var aspect = truck.lengthFt / truck.widthFt;
  var svgW = 460;
  var svgH = svgW / aspect;
  var innerW = svgW - padding * 2;
  var innerH = svgH - padding * 2;
  var pW = innerW / rows;
  var pH = innerH / cols;
  var pad = 2.5;

  var svg = '';
  svg += '<rect x="2" y="2" width="' + (svgW - 4) + '" height="' + (svgH - 4) + '" rx="4" fill="none" stroke="var(--ink-30)" stroke-width="1.2" stroke-dasharray="4 4"/>';
  svg += '<rect x="0" y="' + (svgH / 2 - 10) + '" width="5" height="20" fill="var(--ink-30)"/>';

  var idx = 0;
  for (var c = 0; c < cols; c++) {
    for (var r = 0; r < rows; r++) {
      var x = padding + r * pW + pad;
      var y = padding + c * pH + pad;
      var w = pW - pad * 2;
      var h = pH - pad * 2;
      var filled = idx < baseFill;
      var delay = (idx * 0.015).toFixed(3);
      svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" ' +
        'fill="' + (filled ? 'var(--accent)' : 'var(--ink-10)') + '" ' +
        'stroke="' + (filled ? 'var(--accent-dark)' : 'var(--ink-20)') + '" stroke-width="0.8" ' +
        'style="opacity:0; animation: fadeInPallet 0.35s ease-out ' + delay + 's forwards;"/>';
      idx++;
    }
  }

  if (extra > 0) {
    var stripH = 8;
    var stripY = svgH - padding - stripH - 2;
    var eW = innerW / Math.max(extra, 1);
    svg += '<text x="' + padding + '" y="' + (svgH - padding - 16) + '" font-size="8" fill="var(--ink-60)" font-family="var(--font-mono)" letter-spacing="0.5">+ EXTRA SLOTS (' + extra + ')</text>';
    for (var i = 0; i < extra; i++) {
      var ex = padding + i * eW + 1;
      var efilled = i < extraFill;
      var edelay = ((idx * 0.015) + i * 0.02).toFixed(3);
      svg += '<rect x="' + ex.toFixed(1) + '" y="' + stripY.toFixed(1) + '" width="' + (eW - 2).toFixed(1) + '" height="' + stripH + '" rx="1" ' +
        'fill="' + (efilled ? 'var(--accent-2)' : 'var(--ink-10)') + '" ' +
        'stroke="' + (efilled ? 'var(--accent-2-dark)' : 'var(--ink-20)') + '" stroke-width="0.6" ' +
        'style="opacity:0; animation: fadeInPallet 0.35s ease-out ' + edelay + 's forwards;"/>';
    }
  }

  svg += '<text x="' + (svgW - padding - 42) + '" y="' + (padding + 10) + '" font-size="7" fill="var(--ink-60)" font-family="var(--font-mono)" letter-spacing="1" opacity="0.5">LOAD →</text>';

  return '<svg viewBox="0 0 ' + svgW + ' ' + svgH.toFixed(0) + '" class="pallet-diagram-svg">' + svg + '</svg>';
};


















//======================================================

// / ----------------------------------------------------------------------------
// // Truck silhouette SVG — picks variant based on truck name
// // ----------------------------------------------------------------------------
// App.renderTruckSilhouette = function (truck) {
//   var name = truck.name.toLowerCase();
//   var isContainer = name.indexOf('container') >= 0 || truck.name.indexOf('32') >= 0 || truck.name.indexOf('40') >= 0;
//   var isPickup = name.indexOf('pick') >= 0 || truck.name.indexOf('Ace') >= 0;

//   var content;
//   if (isPickup) {
//     content =
//       '<path d="M 10 50 L 10 30 L 50 30 L 60 18 L 90 18 L 90 50 Z" opacity="0.92"/>' +
//       '<rect x="90" y="22" width="80" height="28" opacity="0.72"/>' +
//       '<circle cx="35" cy="58" r="8"/><circle cx="140" cy="58" r="8"/>' +
//       '<circle cx="35" cy="58" r="3" fill="white" opacity="0.8"/>' +
//       '<circle cx="140" cy="58" r="3" fill="white" opacity="0.8"/>';
//   } else if (isContainer) {
//     content =
//       '<path d="M 5 55 L 5 35 L 25 35 L 35 25 L 55 25 L 55 55 Z" opacity="0.92"/>' +
//       '<rect x="55" y="15" width="135" height="40" opacity="0.72"/>' +
//       '<line x1="80" y1="15" x2="80" y2="55" stroke="white" stroke-width="1" opacity="0.5"/>' +
//       '<line x1="105" y1="15" x2="105" y2="55" stroke="white" stroke-width="1" opacity="0.5"/>' +
//       '<line x1="130" y1="15" x2="130" y2="55" stroke="white" stroke-width="1" opacity="0.5"/>' +
//       '<line x1="155" y1="15" x2="155" y2="55" stroke="white" stroke-width="1" opacity="0.5"/>' +
//       '<circle cx="25" cy="62" r="7"/><circle cx="100" cy="62" r="7"/>' +
//       '<circle cx="125" cy="62" r="7"/><circle cx="170" cy="62" r="7"/>' +
//       '<circle cx="25" cy="62" r="2.5" fill="white" opacity="0.8"/>' +
//       '<circle cx="100" cy="62" r="2.5" fill="white" opacity="0.8"/>' +
//       '<circle cx="125" cy="62" r="2.5" fill="white" opacity="0.8"/>' +
//       '<circle cx="170" cy="62" r="2.5" fill="white" opacity="0.8"/>';
//   } else {
//     content =
//       '<path d="M 8 52 L 8 32 L 35 32 L 45 22 L 70 22 L 70 52 Z" opacity="0.92"/>' +
//       '<rect x="70" y="18" width="115" height="34" opacity="0.72"/>' +
//       '<circle cx="30" cy="60" r="7"/><circle cx="155" cy="60" r="7"/><circle cx="175" cy="60" r="7"/>' +
//       '<circle cx="30" cy="60" r="2.5" fill="white" opacity="0.8"/>' +
//       '<circle cx="155" cy="60" r="2.5" fill="white" opacity="0.8"/>' +
//       '<circle cx="175" cy="60" r="2.5" fill="white" opacity="0.8"/>';
//   }

//   return '<svg viewBox="0 0 200 80" width="130" height="52"><g fill="currentColor">' + content + '</g></svg>';
// };

// // ----------------------------------------------------------------------------
// // Pallet diagram — top-down SVG of truck bed + pallets
// // ----------------------------------------------------------------------------
// App.renderPalletDiagram = function (truck, orientation, fillCount) {
//   var cap = orientation.capacity;
//   var rows = cap.rows, cols = cap.cols, base = cap.base, extra = cap.extra;
//   var visualCapacity = base + extra;
//   var fill = (fillCount == null) ? visualCapacity : fillCount;
//   var baseFill = Math.min(fill, base);
//   var extraFill = Math.max(0, Math.min(fill - base, extra));

//   var padding = 14;
//   var aspect = truck.lengthFt / truck.widthFt;
//   var svgW = 460;
//   var svgH = svgW / aspect;
//   var innerW = svgW - padding * 2;
//   var innerH = svgH - padding * 2;
//   var pW = innerW / rows;
//   var pH = innerH / cols;
//   var pad = 2.5;

//   var svg = '';
//   svg += '<rect x="2" y="2" width="' + (svgW - 4) + '" height="' + (svgH - 4) + '" rx="4" fill="none" stroke="var(--ink-30)" stroke-width="1.2" stroke-dasharray="4 4"/>';
//   svg += '<rect x="0" y="' + (svgH / 2 - 10) + '" width="5" height="20" fill="var(--ink-30)"/>';

//   var idx = 0;
//   for (var c = 0; c < cols; c++) {
//     for (var r = 0; r < rows; r++) {
//       var x = padding + r * pW + pad;
//       var y = padding + c * pH + pad;
//       var w = pW - pad * 2;
//       var h = pH - pad * 2;
//       var filled = idx < baseFill;
//       var delay = (idx * 0.015).toFixed(3);
//       svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" ' +
//         'fill="' + (filled ? 'var(--accent)' : 'var(--ink-10)') + '" ' +
//         'stroke="' + (filled ? 'var(--accent-dark)' : 'var(--ink-20)') + '" stroke-width="0.8" ' +
//         'style="opacity:0; animation: fadeInPallet 0.35s ease-out ' + delay + 's forwards;"/>';
//       idx++;
//     }
//   }

//   if (extra > 0) {
//     var stripH = 8;
//     var stripY = svgH - padding - stripH - 2;
//     var eW = innerW / Math.max(extra, 1);
//     svg += '<text x="' + padding + '" y="' + (svgH - padding - 16) + '" font-size="8" fill="var(--ink-60)" font-family="var(--font-mono)" letter-spacing="0.5">+ EXTRA SLOTS (' + extra + ')</text>';
//     for (var i = 0; i < extra; i++) {
//       var ex = padding + i * eW + 1;
//       var efilled = i < extraFill;
//       var edelay = ((idx * 0.015) + i * 0.02).toFixed(3);
//       svg += '<rect x="' + ex.toFixed(1) + '" y="' + stripY.toFixed(1) + '" width="' + (eW - 2).toFixed(1) + '" height="' + stripH + '" rx="1" ' +
//         'fill="' + (efilled ? 'var(--accent-2)' : 'var(--ink-10)') + '" ' +
//         'stroke="' + (efilled ? 'var(--accent-2-dark)' : 'var(--ink-20)') + '" stroke-width="0.6" ' +
//         'style="opacity:0; animation: fadeInPallet 0.35s ease-out ' + edelay + 's forwards;"/>';
//     }
//   }

//   svg += '<text x="' + (svgW - padding - 42) + '" y="' + (padding + 10) + '" font-size="7" fill="var(--ink-60)" font-family="var(--font-mono)" letter-spacing="1" opacity="0.5">LOAD →</text>';

//   return '<svg viewBox="0 0 ' + svgW + ' ' + svgH.toFixed(0) + '" class="pallet-diagram-svg">' + svg + '</svg>';
// };
