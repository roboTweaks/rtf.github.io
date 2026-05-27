// ============================================================================
// TRUCK CARD RENDERING
// ============================================================================

App.classPill = function (truckClass, isPreferred) {
  var labels = { small: 'SMALL', mid: 'MID', large: 'LARGE' };
  var cls = isPreferred ? 'class-pill class-pill--preferred' : 'class-pill';
  return '<span class="' + cls + '">' + labels[truckClass] + '</span>';
};

App.renderSingleCard = function (option, rank) {
  var truck = option.truck;
  var orientation = option.orientation;
  var utilPct = Math.round(option.utilization * 100);
  var baseCount = orientation.capacity.base;
  var extraCount = orientation.capacity.extra;

  var diagramFill = null;
  if (option.trucksNeeded === 1 && option.palletsInLastTruck < (baseCount + extraCount)) {
    diagramFill = option.palletsInLastTruck;
  }

  var rankBadge = rank === 0
    ? '<div class="rank-badge rank-badge--best">BEST MATCH</div>'
    : '<div class="rank-badge">OPTION ' + (rank + 1) + '</div>';

  var altBadge = !option.isPreferredClass
    ? '<div class="alt-badge">ALT CLASS</div>'
    : '';

  var multiTruckNote = '';
  if (option.trucksNeeded > 1) {
    multiTruckNote =
      '<div class="multi-truck-note">' +
        '<span class="info-icon">ⓘ</span> ' +
        (option.trucksNeeded - 1) + ' ' + (option.trucksNeeded - 1 === 1 ? 'truck' : 'trucks') +
        ' fully loaded (' + option.capacityPerTruck + ' pallets each), last truck carries ' + option.palletsInLastTruck + ' pallets.' +
      '</div>';
  }

  var pricingBlock = '';
  if (option.pricing) {
    pricingBlock =
      '<div class="pricing-breakdown">' +
        '<div class="pricing-label">PRICING BREAKDOWN</div>' +
        '<div class="pricing-row"><span>CATEGORY</span><span>' + option.pricing.category + ' · slab ' + option.pricing.slab + '</span></div>' +
        '<div class="pricing-row"><span>RATE</span><span>₹' + option.pricing.ratePerKm + '/km × ' + option.distanceKm + 'km</span></div>' +
        '<div class="pricing-row"><span>PER TRUCK</span><span>' + App.fmtINR(option.pricing.perTruck) + '</span></div>' +
        (option.trucksNeeded > 1
          ? '<div class="pricing-row"><span>× ' + option.trucksNeeded + ' TRUCKS</span><span>' + App.fmtINR(option.totalCost) + '</span></div>'
          : '') +
      '</div>';
  }

  return '' +
    '<div class="truck-card truck-card--single">' +
      //'<div class="card-badges">' + rankBadge + altBadge + '</div>' +
      '<div class="card-body">' +
        '<div class="card-grid">' +
          '<div class="card-truck">' +
            '<div class="silhouette-wrap">' + App.renderTruckSilhouette(truck) + '</div>' +
            '<h3 class="truck-name">' + App.escapeHtml(truck.name) + '</h3>' +
            '<div class="truck-meta">' +
              App.classPill(truck.class, option.isPreferredClass) +
              '<span class="truck-spec">' + truck.bodyLength.toUpperCase() + ' · ' + truck.tonnage.toLocaleString() + 'KG</span>' +
            '</div>' +
          '</div>' +
          //'<div class="card-diagram">' +
          //  '<div class="diagram-label">TOP-DOWN LOADING PATTERN</div>' +
          //  App.renderPalletDiagram(truck, orientation, diagramFill) +
          //  '<div class="diagram-orientation">' + orientation.label.toLowerCase() + '</div>' +
          //'</div>' +
          '<div class="card-metrics">' +
            '<div class="metric-grid">' +
              '<div class="metric"><div class="metric-label">TRUCKS</div><div class="metric-value metric-value--large">' + option.trucksNeeded + '</div></div>' +
              '<div class="metric"><div class="metric-label">PER TRUCK</div><div class="metric-value">' + option.capacityPerTruck + '</div></div>' +
              '<div class="metric"><div class="metric-label">TOTAL COST</div><div class="metric-value metric-value--accent">' + App.fmtINR(option.totalCost) + '</div></div>' +
              '<div class="metric"><div class="metric-label">₹/PALLET</div><div class="metric-value metric-value--accent2">' + App.fmtINR(option.costPerPallet) + '</div></div>' +
            '</div>' +
            '<div class="util-block">' +
              '<div class="util-row">' +
                '<span class="metric-label">UTILIZATION</span>' +
                '<span class="util-value">' + utilPct + '%</span>' +
              '</div>' +
              '<div class="util-bar"><div class="util-bar-fill" style="width:' + utilPct + '%"></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' + pricingBlock + multiTruckNote + '</div>' +
      '</div>' +
    '</div>';
};

App.renderComboCard = function (option, rank) {
  var primary = option.primary;
  var secondary = option.secondary;
  var utilPct = Math.round(option.utilization * 100);

  var primaryPricing = primary.pricing
    ? '<div class="combo-truck-price"><span>' + primary.pricing.category + ' · ₹' + primary.pricing.ratePerKm + '/km</span><span class="combo-price-amount">' + App.fmtINR(primary.pricing.cost) + '</span></div>'
    : '';
  var secondaryPricing = secondary.pricing
    ? '<div class="combo-truck-price"><span>' + secondary.pricing.category + ' · ₹' + secondary.pricing.ratePerKm + '/km</span><span class="combo-price-amount">' + App.fmtINR(secondary.pricing.cost) + '</span></div>'
    : '';

  return '' +
    '<div class="truck-card truck-card--combo">' +
      //'<div class="card-badges"><div class="rank-badge rank-badge--combo">SMART COMBO · OPTION ' + (rank + 1) + '</div></div>' +
      '<div class="card-body">' +
        //'<div class="combo-intro">COMBINING TWO TRUCK SIZES → MAXIMUM UTILIZATION</div>' +
        '<div class="combo-grid">' +
          '<div class="combo-truck-box">' +
            '<div class="combo-truck-head">' +
              '<div>' +
                '<div class="combo-role-label">PRIMARY · FULLY LOADED</div>' +
                '<h4 class="combo-truck-name">' + App.escapeHtml(primary.truck.name) + '</h4>' +
                '<div class="combo-pill-wrap">' + App.classPill(primary.truck.class, true) + '</div>' +
              '</div>' +
              '<div class="silhouette-wrap">' + App.renderTruckSilhouette(primary.truck) + '</div>' +
            '</div>' +
            App.renderPalletDiagram(primary.truck, primary.orientation) +
            '<div class="combo-truck-footer"><span class="metric-label">CARRIES</span><span class="combo-load-value">' + primary.load + '</span></div>' +
            primaryPricing +
          '</div>' +
          //'<div class="combo-plus">+</div>' +
          '<div class="combo-truck-box">' +
            '<div class="combo-truck-head">' +
              '<div>' +
                '<div class="combo-role-label">TOP-UP TRUCK</div>' +
                '<h4 class="combo-truck-name">' + App.escapeHtml(secondary.truck.name) + '</h4>' +
                '<div class="combo-pill-wrap">' + App.classPill(secondary.truck.class, false) + '</div>' +
              '</div>' +
              '<div class="silhouette-wrap">' + App.renderTruckSilhouette(secondary.truck) + '</div>' +
            '</div>' +
            App.renderPalletDiagram(secondary.truck, secondary.orientation, secondary.load) +
            '<div class="combo-truck-footer"><span class="metric-label">CARRIES</span><span class="combo-load-value">' + secondary.load + '</span></div>' +
            secondaryPricing +
          '</div>' +
        '</div>' +
        '<div class="combo-summary">' +
          '<div class="metric"><div class="metric-label">TOTAL TRUCKS</div><div class="metric-value metric-value--large">2</div></div>' +
          '<div class="metric"><div class="metric-label">TOTAL COST</div><div class="metric-value metric-value--large metric-value--accent">' + App.fmtINR(option.totalCost) + '</div></div>' +
          '<div class="metric"><div class="metric-label">₹/PALLET</div><div class="metric-value metric-value--accent2">' + App.fmtINR(option.costPerPallet) + '</div></div>' +
          '<div class="metric">' +
            '<div class="metric-label">UTILIZATION</div>' +
            '<div class="metric-value">' + utilPct + '%</div>' +
            '<div class="util-bar"><div class="util-bar-fill" style="width:' + utilPct + '%"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
};

App.renderTruckCard = function (option, rank) {
  return option.type === 'combo'
    ? App.renderComboCard(option, rank)
    : App.renderSingleCard(option, rank);
};
