const staticIncidents = [
  { status: 'ACTIVE',   statusClass: 'badge-active',   title: 'Suspicious vehicle parked overnight',  loc: 'Washington St & 7th St, Hoboken' },
  { status: 'NOTIFIED', statusClass: 'badge-notified', title: 'Loose dog reported near Pier A',        loc: 'Pier A Park, NW corner, Hoboken' },
  { status: 'ACTIVE',   statusClass: 'badge-active',   title: 'Power outage on block',                 loc: 'Hudson St between 4th and 5th, Hoboken' },
  { status: 'RESOLVED', statusClass: 'badge-resolved', title: 'Minor traffic incident, fender bender', loc: 'Observer Hwy & Newark St, Hoboken' },
  { status: 'RESOLVED', statusClass: 'badge-resolved', title: 'Package theft — suspect identified', loc: 'Garden St residential block, Hoboken' }
];

const feedList = document.querySelector('.feed-list');
let feedLinks = Array.from(document.querySelectorAll('.feed-link'));

// If the DB returned no incidents, populate the panel with static demo data
if (feedLinks.length === 0 && feedList) {
  feedList.innerHTML = '';
  staticIncidents.forEach(inc => {
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
  if (countEl) countEl.textContent = staticIncidents.length + ' reports';
  feedLinks = Array.from(document.querySelectorAll('.feed-link'));
}

// Map pins link to the matching feed item (real DB incident or static fallback)
document.querySelectorAll('[data-incident]').forEach((pin, idx) => {
  const link = feedLinks[idx];
  pin.style.cursor = 'pointer';
  pin.addEventListener('click', () => {
    window.location.href = link ? link.href : '/incidents';
  });
});
