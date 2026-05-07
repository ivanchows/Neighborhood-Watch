const incidents = [
    {
      status: 'ACTIVE', statusClass: 'badge-active',
      time: '2 min ago · 0.3 mi',
      title: 'Suspicious vehicle parked overnight',
      loc: 'Washington St & 7th St, Hoboken',
      desc: 'Black sedan with no plates parked across two spaces since around 11pm. Multiple residents have noted it doesn\u2019t belong to anyone on the block. Police have been notified for a wellness check.',
      verify: 12, comments: 5, distance: '0.3 mi'
    },
    {
      status: 'NOTIFIED', statusClass: 'badge-notified',
      time: '14 min ago · 0.5 mi',
      title: 'Loose dog reported near Pier A',
      loc: 'Pier A Park, NW corner, Hoboken',
      desc: 'Medium-sized brown dog, no visible collar, friendly but disoriented. Last seen heading toward Sinatra Drive. Animal control contacted; volunteer attempting to corral.',
      verify: 8, comments: 11, distance: '0.5 mi'
    },
    {
      status: 'ACTIVE', statusClass: 'badge-active',
      time: '22 min ago · 0.8 mi',
      title: 'Power outage on block',
      loc: 'Hudson St between 4th and 5th, Hoboken',
      desc: 'Power has been out for the entire 400 block since 9:42 PM. PSE&G has been notified, ETA unknown. Streetlights and traffic signal at intersection are also affected \u2014 drive carefully.',
      verify: 24, comments: 9, distance: '0.8 mi'
    },
    {
      status: 'RESOLVED', statusClass: 'badge-resolved',
      time: '1 hr ago · 1.2 mi',
      title: 'Minor traffic incident, fender bender',
      loc: 'Observer Hwy & Newark St, Hoboken',
      desc: 'Two-car collision at the intersection. No injuries reported. Hoboken PD on scene, both vehicles moved to the shoulder, traffic now flowing again.',
      verify: 6, comments: 2, distance: '1.2 mi'
    },
    {
      status: 'RESOLVED', statusClass: 'badge-resolved',
      time: '3 hr ago · 0.7 mi',
      title: 'Package theft \u2014 suspect identified',
      loc: 'Garden St residential block, Hoboken',
      desc: 'Doorbell camera caught the suspect on the 800 block. Footage shared with HPD and posted to the building\u2019s thread. Most packages were recovered from a nearby alley by neighbors within the hour.',
      verify: 31, comments: 18, distance: '0.7 mi'
    }
  ];

  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('modalClose');

  function openIncident(idx) {
    const i = incidents[idx];
    if (!i) return;
    const badge = document.getElementById('modalBadge');
    badge.textContent = i.status;
    badge.className = 'badge ' + i.statusClass;
    document.getElementById('modalTime').textContent = i.time;
    document.getElementById('modalTitle').textContent = i.title;
    document.getElementById('modalLoc').textContent = i.loc;
    document.getElementById('modalDesc').textContent = i.desc;
    document.getElementById('modalVerify').textContent = i.verify;
    document.getElementById('modalComments').textContent = i.comments;
    document.getElementById('modalDistance').textContent = i.distance;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-incident]').forEach(el => {
    el.addEventListener('click', () => openIncident(parseInt(el.dataset.incident, 10)));
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
