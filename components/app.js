// ============================================================================
// MAIN APP — state and event handling
// Renders into elements that already exist in index.html.
// ============================================================================

App.state = {
  palletTypeKey: 'nested-e-pallet',
  quantity: '',
  distance: '',
  submitted: false,
  sortBy: 'pallet-cost',
  maxEfficiency: false,
};

// ----------------------------------------------------------------------------
// Pallet picker
// ----------------------------------------------------------------------------
App.renderPalletPicker = function () {
  var html = '';
  App.PALLET_ORDER.forEach(function (key) {
    var p = App.PALLET_TYPES[key];
    var active = App.state.palletTypeKey === key;
    //var iconKey = key === 'nested-e-pallet' ? '◆◆' : '◆';
    html += '' +
      '<button class="pallet-btn ' + (active ? 'pallet-btn--active' : '') + '" data-pallet-key="' + key + '">' +
        '<div class="pallet-btn-inner">' +
          '<div class="pallet-icon">' + '<img src="./assets/images/pallet.png" alt="Pallet">' + '</div>' +
          '<div>' +
            '<div class="pallet-name">' + App.escapeHtml(p.name) + '</div>' +
            '<div class="pallet-dim">' + p.dimensions.length + '×' + p.dimensions.width + '×' + p.dimensions.height + 'MM</div>' +
          '</div>' +
        '</div>' +
        '<span class="pallet-arrow">→</span>' +
      '</button>';
  });
  return html;
};

// ----------------------------------------------------------------------------
// Distance hint
// ----------------------------------------------------------------------------
App.renderDistanceHint = function () {
  var km = Number(App.state.distance);
  if (!km || km <= 0) return '';
  var rule = App.getDistanceRule(km);
  return '<div class="distance-hint"><span class="dot"></span>' + rule.label.toUpperCase() + ' · ' + rule.sublabel.toUpperCase() + '</div>';
};

// ----------------------------------------------------------------------------
// Section label 
// ----------------------------------------------------------------------------
App.renderSortToggle = function () {
  return '<div class="sort-toggle"><div class="sort-label">COST EFFICIENT TRUCKS</div></div>';
};

// ----------------------------------------------------------------------------
// Results section
// ----------------------------------------------------------------------------
App.renderResults = function () {
  if (!App.state.submitted || !App.state.quantity || !App.state.distance) {
    return '<section class="empty-state">ENTER YOUR LOAD DETAILS TO SEE RECOMMENDATIONS</section>';
  }

  var result = App.recommendTrucks({
    palletTypeKey: App.state.palletTypeKey,
    quantity: Number(App.state.quantity),
    distanceKm: Number(App.state.distance),
    sortBy: App.state.sortBy,
    maxEfficiency: App.state.maxEfficiency,
  });

  if (!result.options.length) {
    return '<section class="empty-state">No truck options found for this load.</section>';
  }

  var palletName = App.PALLET_TYPES[App.state.palletTypeKey].name.toLowerCase();

  var html = '<section class="results">';
  html += '<div class="results-head">';
  html += '<div>';
  //html += '<div class="results-eyebrow"><span class="sparkle">✦</span> RECOMMENDATIONS · ' + result.distanceRule.label.toUpperCase() + '</div>';
  html += '<h2 class="results-title">' + result.options.length + ' '+ (result.options.length === 1 ? 'option' : 'options') + ' for <em>' + App.state.quantity + ' ' + palletName + 's | Distance - ' + App.state.distance + 'km</em></h2>';
  html += '</div>';
  html += App.renderSortToggle();
  html += '</div>';

  html += '<div class="cards-stack">';
  result.options.forEach(function (opt, i) {
    html += '<div class="card-wrap" style="animation: slideUp 0.5s ease-out ' + (i * 0.08).toFixed(2) + 's backwards;">' +
      App.renderTruckCard(opt, i) +
    '</div>';
  });
  html += '</div>';

  //html += '<div class="legend">';
  //html += '<span class="legend-label">LEGEND</span>';
  //html += '<div class="legend-item"><div class="legend-swatch swatch-base"></div>Base pallets</div>';
  //html += '<div class="legend-item"><div class="legend-swatch swatch-extra"></div>Extra pallets (leftover space)</div>';
  //html += '<div class="legend-item"><div class="legend-swatch swatch-outline"></div>Truck bed (top view)</div>';
  //html += '</div>';

  html += '</section>';
  return html;
};

// ----------------------------------------------------------------------------
// Main render — updates only the parts that change
// ----------------------------------------------------------------------------
App.render = function () {
  // Pallet picker
  document.getElementById('pallet-picker').innerHTML = App.renderPalletPicker();

  // Distance hint
  document.getElementById('distance-hint').innerHTML = App.renderDistanceHint();

  // Calculate button enabled state
  var canCalc = App.state.quantity && Number(App.state.quantity) >= 1
             && App.state.distance && Number(App.state.distance) >= 1;
  var btn = document.getElementById('calc-btn');
  if (canCalc) btn.removeAttribute('disabled');
  else btn.setAttribute('disabled', 'disabled');

  // Reset button visibility
  document.getElementById('reset-btn').style.display = App.state.submitted ? 'inline-flex' : 'none';

  // Results
  document.getElementById('results').innerHTML = App.renderResults();
};

// ----------------------------------------------------------------------------
// Event handlers
// ----------------------------------------------------------------------------
App.attachInputHandlers = function () {
  // Pallet picker uses event delegation since it's re-rendered
  document.getElementById('pallet-picker').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pallet-key]');
    if (!btn) return;
    App.state.palletTypeKey = btn.getAttribute('data-pallet-key');
    App.state.submitted = false;
    App.render();
  });

  // Quantity & distance inputs
  document.getElementById('quantity-input').addEventListener('input', function (e) {
    App.state.quantity = e.target.value;
    App.state.submitted = false;
    App.render();
  });

  document.getElementById('distance-input').addEventListener('input', function (e) {
    App.state.distance = e.target.value;
    App.state.submitted = false;
    App.render();
  });

  // Max. Efficiency toggle — switches per-truck capacity from currentlyLoaded → total
  document.getElementById('max-efficiency-toggle').addEventListener('change', function (e) {
    App.state.maxEfficiency = e.target.checked;
    App.render();
  });

  // Calculate button
  document.getElementById('calc-btn').addEventListener('click', function () {
    if (!App.state.quantity || Number(App.state.quantity) < 1) return;
    if (!App.state.distance || Number(App.state.distance) < 1) return;
    App.state.submitted = true;
    App.render();
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', function () {
    App.state.submitted = false;
    App.state.quantity = '';
    App.state.distance = '';
    document.getElementById('quantity-input').value = '';
    document.getElementById('distance-input').value = '';
    App.render();
  });

  // Enter key triggers calculate
  ['quantity-input', 'distance-input'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('calc-btn').click();
    });
  });
};

// ----------------------------------------------------------------------------
// Boot
// ----------------------------------------------------------------------------
App.init = function () {
  App.attachInputHandlers();
  App.render();
};

document.addEventListener('DOMContentLoaded', App.init);
