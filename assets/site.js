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
    const nextPosition = active + travel*travel*(3-2*travel);
    if (nextPosition !== sectionPosition) {
      sectionPosition = nextPosition;
      window.dispatchEvent(new Event('workshopjourneychange'));
    }
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
  const area=document.getElementById('requestArea'), timing=document.getElementById('requestTiming');
  const prompt=document.getElementById('requestPrompt');
  const status=document.getElementById('requestStatus'), fallback=document.getElementById('requestFallback');
  let requestRevision=0, requestId=crypto.randomUUID(), submitting=false;
  const name=document.getElementById('requestName'), email=document.getElementById('requestEmail'), phone=document.getElementById('requestPhone');
  const servicePrompts={
    'Computer & laptop repair':'Add the brand and model, what is happening, and whether it powers on.',
    'Phone & tablet repair':'Add the device model, what is damaged or not working, and whether it still turns on.',
    'Small-business IT':'Share the business type, how many people or devices are affected, and what stopped working.',
    'Websites & online systems':'Describe the business or idea, what you want customers to do, and any tools the site should connect to.',
    'Custom software & AI':'Describe the work you want the software to do, who will use it, and the steps you want to make easier.',
    'Servers & security technology':'Share the space or business type, the equipment you already have, and what you want to monitor or connect.',
    'Networking & Wi-Fi':'Describe the space, where the signal drops, and which devices or rooms need a better connection.',
    'Mechanic work':'Add the vehicle year, make and model, the repair needed, and any sounds, warning lights or symptoms.',
    'Handyman work':'Describe the room or outdoor area, the task, and any materials or measurements you already know.',
    'Plumbing work':'Describe the fixture, where the leak or clog is, when it started, and whether water is shut off.',
    'Not sure yet':'Describe what is happening and where you are. Ronald can help choose the right service.'
  };
  function updateRequestPrompt(){
    const message=servicePrompts[service.value]||'Choose a service for a few details that help Ronald prepare.';
    prompt.textContent=message;
    details.placeholder=message;
  }
  [name,email,phone,area].forEach(el=>el.addEventListener('input',()=>{email.setCustomValidity('');clearPreparedRequest();}));
  function clearPreparedRequest(){requestRevision++;requestId=crypto.randomUUID();status.textContent='';fallback.hidden=true;fallback.value='';}
  document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{
    service.value=a.dataset.service;updateRequestPrompt();clearPreparedRequest();
    // Preserve a visitor's existing message when they explore another project.
    if(a.dataset.project && !details.value.trim()){
      details.value=`I'd like to discuss ${a.dataset.project}.\n\nWhat I need: `;
      details.setCustomValidity('');
    }
  }));
  function inquiryDetails(){
    const context=[];
    if(area.value.trim())context.push(`Service area: ${area.value.trim()}`);
    if(timing.value)context.push(`Preferred timing: ${timing.value}`);
    return [context.join('\n'),details.value.trim()].filter(Boolean).join('\n\n');
  }
  function requestText(){return `Hi Ronald,\n\nService: ${service.value || 'Not sure yet'}\nPreferred support: ${mode.value}\n\n${inquiryDetails()}\n\nName: ${name.value.trim()}\nEmail: ${email.value.trim()}\nPhone: ${phone.value.trim()}\n`;}
  function valid(){email.setCustomValidity(email.value.trim()||phone.value.trim()?'':'Enter an email address or phone number.');if(!details.value.trim())details.setCustomValidity('Please describe what you need help with.');else details.setCustomValidity('');return form.reportValidity();}
  details.addEventListener('input',()=>{details.setCustomValidity('');clearPreparedRequest();});
  service.addEventListener('change',()=>{updateRequestPrompt();clearPreparedRequest();});
  mode.addEventListener('change',clearPreparedRequest);
  timing.addEventListener('change',clearPreparedRequest);
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(submitting||!valid())return;
    submitting=true;const revision=requestRevision;
    const fields=[...form.querySelectorAll('input,select,textarea,button')];fields.forEach(el=>el.disabled=true);
    status.textContent='Sending your request…';
    try {
      const response=await fetch(form.dataset.endpoint||'https://admin.buildwithronald.com/api/public/inquiries',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId,name:name.value.trim(),email:email.value.trim(),phone:phone.value.trim(),service:service.value||'Not sure yet',mode:mode.value,details:inquiryDetails(),website:document.getElementById('requestWebsite').value}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not send your request.');
      if(revision===requestRevision){form.reset();updateRequestPrompt();requestId=crypto.randomUUID();fallback.hidden=true;fallback.value='';status.textContent=`Request #${result.id} received. Ronald will reply using the contact details you provided.`;}
    } catch(error) {status.textContent=`${error.name==='TimeoutError'?'Confirmation timed out. You can retry safely.':error.message} Your details are still here. Try again, or use Copy request and email Ronald directly.`;}
    finally {submitting=false;fields.forEach(el=>el.disabled=false);}
  });
  document.getElementById('copyRequest').addEventListener('click',async()=>{
    if(!valid())return;
    clearPreparedRequest();
    const revision=requestRevision;
    const text=`To: buildwithronald@gmail.com\n\n${requestText()}`;
    try{await navigator.clipboard.writeText(text);if(revision!==requestRevision)return;status.textContent='Request copied. Paste it into an email to buildwithronald@gmail.com.';}
    catch{if(revision!==requestRevision)return;fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Select and copy the prepared request below, then paste it into your email.';}
  });
})();
