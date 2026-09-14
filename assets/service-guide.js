(() => {
  const grid = document.querySelector('#services .service-grid');
  if (!grid || document.getElementById('serviceGuide')) return;

  const categories = [
    { id: 'all', label: 'All services', intro: 'Start with what needs to work. Choose a service below, or describe the problem in your request.' },
    { id: 'repair', label: 'Device repair', intro: 'A slow computer, damaged screen or a device that will not cooperate? Start with the device you need help with.' },
    { id: 'business', label: 'Business IT', intro: 'Keep the tools around your business connected: workstations, email, printers, networks and Wi-Fi.' },
    { id: 'software', label: 'Websites & software', intro: 'Give customers a clear way to reach you, or connect the bookings, tasks and information behind your business.' },
    { id: 'systems', label: 'Servers & security', intro: 'Bring cameras, local servers and connected devices into a plan that fits your space and the way you use it.' }
  ];
  const categoryByTitle = new Map([
    ['Computer & laptop repair', 'repair'],
    ['Phone & tablet repair', 'repair'],
    ['Small-business IT', 'business'],
    ['Networking & Wi-Fi', 'business'],
    ['Websites & online systems', 'software'],
    ['Custom software & AI', 'software'],
    ['Servers & security technology', 'systems']
  ]);
  const cards = [...grid.querySelectorAll('.service')].map(card => ({
    element: card,
    category: categoryByTitle.get(card.querySelector('h3')?.textContent.trim())
  }));
  if (!cards.length) return;

  if (!grid.id) grid.id = 'serviceGrid';
  const guide = document.createElement('div');
  guide.id = 'serviceGuide';
  guide.className = 'service-guide';

  const title = document.createElement('p');
  title.className = 'service-guide-title';
  title.textContent = 'Find your starting point';

  const controls = document.createElement('div');
  controls.className = 'service-guide-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Filter services');

  const intro = document.createElement('p');
  intro.className = 'service-guide-intro';
  const status = document.createElement('p');
  status.className = 'service-guide-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  const buttons = categories.map(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category.label;
    button.setAttribute('aria-controls', grid.id);
    button.addEventListener('click', () => selectCategory(category));
    controls.append(button);
    return button;
  });

  function selectCategory(category) {
    let visible = 0;
    cards.forEach(card => {
      const show = category.id === 'all' || card.category === category.id;
      card.element.hidden = !show;
      if (show) visible++;
    });
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(categories[index].id === category.id));
    });
    intro.textContent = category.intro;
    status.textContent = `${visible} ${visible === 1 ? 'service' : 'services'} · ${category.label}`;
  }

  guide.append(title, controls, intro, status);
  grid.before(guide);
  selectCategory(categories[0]);
  window.workshopServices = {
    select(id) {
      const category = categories.find(item => item.id === id);
      if (category) selectCategory(category);
    }
  };
})();
