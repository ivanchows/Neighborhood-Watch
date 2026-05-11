const serverIncidents = Array.isArray(window.__mapIncidents) ? window.__mapIncidents : [];

const feedList = document.querySelector('.feed-list');
let feedLinks = Array.from(document.querySelectorAll('.feed-link'));

const mapEl = document.getElementById('incidentMap');

if (mapEl && typeof L !== 'undefined') {
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView([40.7433, -74.0324], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 0);

  function markerColor(status) {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return '#22c55e';
    if (s === 'authorities notified') return '#f4a847';
    return '#4169e1';
  }

  function normalizeIncident(incident) {
    return {
      _id: incident._id || null,
      title: incident.Title || incident.title || '',
      loc: incident.location || incident.loc || '',
      status: incident.status || 'active',
      postedDate: incident.postedDate || '',
      lat: Number.parseFloat(incident.lat),
      lng: Number.parseFloat(incident.lng)
    };
  }

  function hasCoords(incident) {
    return Number.isFinite(incident.lat) && Number.isFinite(incident.lng);
  }

  const mapData = serverIncidents.map(normalizeIncident).filter(hasCoords);

  const markers = [];

  for (let i = 0; i < mapData.length; i++) {
    let incident = mapData[i];

    let marker = L.circleMarker([incident.lat, incident.lng], {
      radius: 9,
      fillColor: markerColor(incident.status),
      color: '#0d1117',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindPopup(
      '<div class="map-popup">' +
        '<div class="map-popup-title">' + incident.title + '</div>' +
        '<div class="map-popup-location">' + incident.loc + '</div>' +
        '<a href="/incident_card/' + incident._id + '" class="map-popup-link">View more →</a>' +
      '</div>',
      { maxWidth: 240 }
    );

    markers.push(marker);
  }

  if (mapData.length > 0) {
    const bounds = L.latLngBounds(mapData.map((incident) => [incident.lat, incident.lng]));
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 15 });
  }

  feedLinks.forEach((link, index) => {
    if (markers[index]) {
      link.addEventListener('mouseenter', () => {
        markers[index].openPopup();
      });
    }
  });
}
