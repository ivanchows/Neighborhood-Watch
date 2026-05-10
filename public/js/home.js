const serverIncidents = window.__mapIncidents || [];

// Static fallback coordinates keyed by title (used when DB incidents lack lat/lng)
const staticCoords = {
  'Suspicious vehicle parked overnight':  { lat: 40.7459, lng: -74.0285 },
  'Loose dog reported near Pier A':       { lat: 40.7365, lng: -74.0276 },
  'Power outage on block':                { lat: 40.7409, lng: -74.0298 },
  'Minor traffic incident, fender bender':{ lat: 40.7374, lng: -74.0418 },
  'Package theft — suspect identified':   { lat: 40.7479, lng: -74.0328 }
};

// Static fallback data for the feed panel when DB is empty
const staticFeed = [
  { status: 'active',               statusClass: 'badge-active',    title: 'Suspicious vehicle parked overnight',   loc: 'Washington St & 7th St, Hoboken' },
  { status: 'authorities notified', statusClass: 'badge-notified',  title: 'Loose dog reported near Pier A',        loc: 'Pier A Park, NW corner, Hoboken' },
  { status: 'active',               statusClass: 'badge-active',    title: 'Power outage on block',                 loc: 'Hudson St between 4th and 5th, Hoboken' },
  { status: 'resolved',             statusClass: 'badge-resolved',  title: 'Minor traffic incident, fender bender', loc: 'Observer Hwy & Newark St, Hoboken' },
  { status: 'resolved',             statusClass: 'badge-resolved',  title: 'Package theft — suspect identified',    loc: 'Garden St residential block, Hoboken' }
];

// Feed fallback when DB has no incidents
const feedList = document.querySelector('.feed-list');
let feedLinks = Array.from(document.querySelectorAll('.feed-link'));
if (feedLinks.length === 0 && feedList) {
  feedList.innerHTML = '';
  staticFeed.forEach(inc => {
    const a = document.createElement('a');
    a.href = '/incidents';
    a.className = 'feed-link';
    a.innerHTML =
      '<div class="feed-item">' +
        '<div class="feed-meta"><span class="badge ' + inc.statusClass + '">' + inc.status + '</span></div>' +
        '<div class="feed-title">' + inc.title + '</div>' +
        '<div class="feed-loc">' + inc.loc + '</div>' +
      '</div>';
    feedList.appendChild(a);
  });
  const countEl = document.querySelector('.panel.feed .panel-header span:last-child');
  if (countEl) countEl.textContent = staticFeed.length + ' reports';
  feedLinks = Array.from(document.querySelectorAll('.feed-link'));
}

// Leaflet map
const mapEl = document.getElementById('incidentMap');
if (mapEl && typeof L !== 'undefined') {
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView([40.7433, -74.0324], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
  }).addTo(map);

  function markerColor(status) {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return '#22c55e';
    if (s === 'authorities notified') return '#f4a847';
    return '#4169e1';
  }

  // Build map pins from server incidents (with lat/lng) or static coords fallback
  const mapData = serverIncidents.length > 0
    ? serverIncidents
    : staticFeed.map(s => ({ ...s, _id: null, ...staticCoords[s.title] }));

  const markers = mapData.map(inc => {
    if (!inc.lat || !inc.lng) return null;

    const marker = L.circleMarker([inc.lat, inc.lng], {
      radius: 9,
      fillColor: markerColor(inc.status),
      color: '#0d1117',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    const link = inc._id
      ? '/incident_card/' + inc._id
      : '/incidents';

    marker.bindPopup(
      '<div style="min-width:190px; font-family: sans-serif;">' +
        '<div style="font-size:13px; font-weight:600; margin-bottom:4px;">' + inc.title + '</div>' +
        '<div style="font-size:11px; color:#888; margin-bottom:10px;">' + inc.loc + '</div>' +
        '<a href="' + link + '" style="font-size:12px; color:#4169e1; font-weight:600; text-decoration:none;">View more →</a>' +
      '</div>',
      { maxWidth: 240 }
    );

    return marker;
  }).filter(Boolean);

  if (mapData.some(i => i.lat && i.lng)) {
    const bounds = L.latLngBounds(mapData.filter(i => i.lat && i.lng).map(i => [i.lat, i.lng]));
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 15 });
  }

  // Hover feed item → open that marker's popup
  feedLinks.forEach((link, idx) => {
    if (markers[idx]) link.addEventListener('mouseenter', () => markers[idx].openPopup());
  });
}
