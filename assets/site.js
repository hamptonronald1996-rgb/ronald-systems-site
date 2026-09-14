(() => {
  const chapters = [...document.querySelectorAll('.chapter')];
  const links = [...document.querySelectorAll('.nav a, .chapter-index a')];
  const menu = document.getElementById('mobilePanel');
  const menuButton = document.getElementById('menuBtn');
  function closeMenu(returnFocus = false) {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(true); });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });
  // Section offsets, rather than total page height, keep long service/project chapters at their station.
  let anchors = [];
  let sectionPosition = 0;
  function measure() { anchors = chapters.map(s => s.offsetTop); update(); }
  function update() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const y = scrollY;
    let active = 0;
    for (let i=1;i<anchors.length;i++) if (y >= Math.min(anchors[i],max) - 2) active=i;
    const next=anchors[active+1];
    const fraction = next ? Math.min(1,Math.max(0,(y-anchors[active])/(next-anchors[active]))) : 0;
    // Hold on the equipment, then ease into the next station in the final part of each chapter.
    const travel = Math.max(0,(fraction-.64)/.36);
    sectionPosition = active + travel*travel*(3-2*travel);
    chapters.forEach((s,i)=>s.classList.toggle('active',i===active));
    links.forEach(a=>{const current=a.hash==='#'+chapters[active].id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    document.getElementById('hudText').textContent=chapters[active].dataset.label;
    document.getElementById('progress').style.width=`${Math.min(100,y/max*100)}%`;
  }
  let scheduled=false;
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{update();scheduled=false;});}},{passive:true});
  addEventListener('resize',()=>{measure();if(innerWidth>900)closeMenu();});
  new ResizeObserver(measure).observe(document.querySelector('main'));
  window.workshopUI = {journey:()=>sectionPosition};
  measure();
  const form=document.getElementById('requestForm'), service=document.getElementById('serviceType');
  const details=document.getElementById('requestDetails'), mode=document.getElementById('serviceMode');
  const status=document.getElementById('requestStatus'), fallback=document.getElementById('requestFallback');
  document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{
    service.value=a.dataset.service;status.textContent='';
    // Preserve a visitor's existing message when they explore another project.
    if(a.dataset.project && !details.value.trim()){
      details.value=`I'd like to discuss ${a.dataset.project}.\n\nWhat I need: `;
      details.setCustomValidity('');
    }
  }));
  function requestText(){return `Hi Ronald,\n\nService: ${service.value || 'Not sure yet'}\nPreferred support: ${mode.value}\n\n${details.value.trim()}\n\nMy name / best way to reach me:\n`;}
  function valid(){if(!details.value.trim())details.setCustomValidity('Please describe what you need help with.');else details.setCustomValidity('');return form.reportValidity();}
  details.addEventListener('input',()=>{details.setCustomValidity('');status.textContent='';fallback.hidden=true;});
  form.addEventListener('submit',e=>{e.preventDefault();if(!valid())return;const subject=`Build With Ronald — ${service.value || 'Service request'}`;const href=`mailto:hampton.ronald1996@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText())}`;status.textContent='Your draft is ready for your email app. If it doesn’t open, use Copy request and email Ronald directly.';location.href=href;});
  document.getElementById('copyRequest').addEventListener('click',async()=>{
    if(!valid())return;
    const text=`To: hampton.ronald1996@gmail.com\n\n${requestText()}`;
    try{await navigator.clipboard.writeText(text);status.textContent='Request copied. Paste it into an email to hampton.ronald1996@gmail.com.';}
    catch{fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Select and copy the prepared request below, then paste it into your email.';}
  });
})();
