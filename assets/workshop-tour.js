(() => {
  const launchers = [...document.querySelectorAll('[data-open-workshop]')];
  const dialog = document.getElementById('workshopTour');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const stations = [
    {name:'The repair bench', short:'Repair', number:'01', copy:'A laptop, a phone, and a problem to solve. Start with diagnostics, repairs, upgrades and device setup.', detail:'COMPUTERS / PHONES / TABLETS', action:'Find a repair service', href:'#services', service:'Computer & laptop repair'},
    {name:'Your business, connected', short:'Business IT', number:'02', copy:'The desk is only the beginning. Connect workstations, Wi-Fi, printers, email and backups into a system that works together.', detail:'WORKSTATIONS / NETWORKS / SUPPORT', action:'Explore business IT', href:'#services', service:'Small-business IT'},
    {name:'Ideas become working systems', short:'Projects', number:'03', copy:'Fur the Love Website and Operations, Secure Watch, and CodeCredit. Four builds shaped around real business needs.', detail:'WEBSITES / SOFTWARE / AUTOMATION', action:'See the four projects', href:'#work', service:'Websites & online systems'},
    {name:'Behind the everyday', short:'Servers', number:'04', copy:'Local servers, organized connections and practical remote access. Build the infrastructure around the way you work.', detail:'SERVERS / NETWORKING / REMOTE ACCESS', action:'Explore systems services', href:'#services', service:'Servers & security technology'},
    {name:'A more connected view', short:'Security', number:'05', copy:'Cameras, sensors and monitoring software come together at the security bench. Start with your space and what you need to see.', detail:'CAMERAS / SENSORS / SECURE WATCH', action:'View Secure Watch', href:'#project-secure-watch', service:'Servers & security technology'}
  ];
  const title = dialog.querySelector('#tourTitle'), copy = dialog.querySelector('#tourCopy');
  const number = dialog.querySelector('#tourNumber'), detail = dialog.querySelector('#tourDetail');
  const primary = dialog.querySelector('#tourPrimary'), request = dialog.querySelector('#tourRequest');
  const choices = dialog.querySelector('#tourStations'), stage = dialog.querySelector('#tourStage');
  let selected = 0, opener, drag = null, savedScroll = 0, pendingDestination = null;
  const buttons = stations.map((station, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = `${station.number} ${station.short}`;
    button.addEventListener('click', () => select(index));
    choices.append(button); return button;
  });
  function positionScene() {
    if (!dialog.open) return;
    const rect = stage.getBoundingClientRect();
    window.workshopScene?.frameAt(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.height);
  }
  function select(index) {
    selected = (index + stations.length) % stations.length;
    const station = stations[selected];
    title.textContent = station.name; copy.textContent = station.copy;
    number.textContent = `${station.number} / 05`; detail.textContent = station.detail;
    primary.textContent = station.action + ' ↗'; primary.href = station.href;
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
    window.workshopScene?.station(selected); positionScene();
  }
  function enable() { launchers.forEach(button => button.hidden = !window.workshopScene?.available()); }
  launchers.forEach(button => button.addEventListener('click', () => {
    if (!window.workshopScene?.available()) return;
    opener = button; savedScroll = scrollY; pendingDestination = null;
    document.body.style.top = `-${savedScroll}px`;
    document.body.classList.add('is-exploring');
    dialog.showModal(); window.workshopScene.enter(); select(0);
    dialog.querySelector('#tourClose').focus();
  }));
  dialog.querySelector('#tourClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href]')];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('close', () => {
    drag = null; window.workshopScene?.exit();
    document.body.classList.remove('is-exploring'); document.body.style.top = '';
    window.scrollTo({top:savedScroll, behavior:'instant'});
    if (pendingDestination) {
      const destination = pendingDestination; pendingDestination = null;
      requestAnimationFrame(() => {
        const target = document.querySelector(destination);
        if (!target) return;
        target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true});
        target.scrollIntoView({behavior:'instant',block:'start'}); history.replaceState(null, '', destination);
      });
    } else opener?.focus({preventScroll:true});
  });
  dialog.querySelector('#tourPrevious').addEventListener('click', () => select(selected - 1));
  dialog.querySelector('#tourNext').addEventListener('click', () => select(selected + 1));
  dialog.querySelector('#tourLeft').addEventListener('click', () => window.workshopScene?.orbit(-.22));
  dialog.querySelector('#tourRight').addEventListener('click', () => window.workshopScene?.orbit(.22));
  dialog.querySelector('#tourReset').addEventListener('click', () => window.workshopScene?.reset());
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = event.clientX; stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (drag === null) return;
    window.workshopScene?.orbit((event.clientX - drag) * -.004); drag = event.clientX;
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => stage.addEventListener(type, () => { drag = null; }));
  function follow(event, requestService) {
    event.preventDefault(); const destination = requestService ? '#contact' : stations[selected].href;
    if (requestService) {
      const service = document.getElementById('serviceType');
      service.value = stations[selected].service; service.dispatchEvent(new Event('change', {bubbles:true}));
    }
    if (!requestService && destination === '#services') window.workshopServices?.select(['repair','business',null,'systems'][selected]);
    pendingDestination = destination;
    dialog.close();
  }
  primary.addEventListener('click', event => follow(event, false));
  request.addEventListener('click', event => follow(event, true));
  new ResizeObserver(positionScene).observe(stage);
  dialog.addEventListener('scroll', positionScene, {passive:true});
  addEventListener('resize', positionScene);
  addEventListener('workshopavailability', () => { enable(); if (dialog.open && !window.workshopScene?.available()) dialog.close(); });
  enable();
})();
