(() => {
  const grid = document.querySelector('#work .focused-projects');
  if (!grid || document.getElementById('projectGuide')) return;

  const groups = [
    { id: 'all', label: 'All four', intro: 'Explore the customer experience, the work behind it, and the software taking shape in the lab.' },
    { id: 'fur-love', label: 'Fur the Love', intro: 'Two connected builds for one pet-care business: the public website and the private operations workspace.' },
    { id: 'secure-watch', label: 'Secure Watch', intro: 'Explore the connected-security product vision, from cameras and alerts to the customer experience.' },
    { id: 'codecredit', label: 'CodeCredit', intro: 'Inside the MVP: an AI development workspace for projects, teams and usage tracking.' }
  ];
  const groupByProject = new Map([
    ['project-fur-love', 'fur-love'],
    ['project-fur-love-operations', 'fur-love'],
    ['project-secure-watch', 'secure-watch'],
    ['project-codecredit', 'codecredit']
  ]);
  const cards = [...grid.querySelectorAll('.project')];
  if (!cards.length) return;

  if (!grid.id) grid.id = 'projectGrid';
  const guide = document.createElement('div');
  guide.id = 'projectGuide';
  guide.className = 'project-guide';

  const title = document.createElement('p');
  title.className = 'project-guide-title';
  title.textContent = 'Choose a build to explore';

  const controls = document.createElement('div');
  controls.className = 'project-guide-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Filter selected projects');

  const intro = document.createElement('p');
  intro.className = 'project-guide-intro';
  const status = document.createElement('p');
  status.className = 'project-guide-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  const relationship = document.createElement('div');
  relationship.className = 'project-relationship';
  const relationshipTitle = document.createElement('strong');
  relationshipTitle.textContent = 'Website ↔ Operations';
  const relationshipCopy = document.createElement('p');
  relationshipCopy.textContent = 'Customers discover care and book through the website. The private operations workspace brings bookings, payment status and boarding records together for staff.';
  relationship.append(relationshipTitle, relationshipCopy);

  const buttons = groups.map(group => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = group.label;
    button.setAttribute('aria-controls', grid.id);
    button.addEventListener('click', () => selectGroup(group));
    controls.append(button);
    return button;
  });

  function selectGroup(group) {
    let visible = 0;
    cards.forEach(card => {
      const show = group.id === 'all' || groupByProject.get(card.id) === group.id;
      card.hidden = !show;
      if (show) visible++;
    });
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(groups[index].id === group.id));
    });
    grid.setAttribute('data-project-view', group.id);
    intro.textContent = group.intro;
    status.textContent = `${visible} of ${cards.length} builds · ${group.label}`;
    relationship.hidden = group.id !== 'fur-love';
  }

  guide.append(title, controls, intro, status, relationship);
  grid.before(guide);
  selectGroup(groups[0]);

  function showProject(id) {
    const groupId = id === 'all' ? 'all' : groupByProject.get(id);
    const group = groups.find(item => item.id === groupId);
    if (!group) return false;
    selectGroup(group);
    return true;
  }

  function syncProjectHash() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return; }
    const target = cards.find(card => card.id === id);
    if (!target || !groupByProject.has(id)) return;
    const wasHidden = target.hidden;
    showProject(id);
    // Native fragment navigation cannot position a card while it is hidden.
    if (wasHidden) target.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  window.workshopProjects = { show: showProject };
  window.addEventListener('hashchange', syncProjectHash);
  syncProjectHash();
})();
