const photos=[['IMG_2894.webp','The Four20 store — original photograph'],['IMG_2888.webp','Pink pool tables — original photograph'],['IMG_2889.webp','The Four20 pool room — original photograph'],['IMG_2890.webp','Colourful forest artwork — original photograph'],['IMG_2891.webp','Four20 neon signage — original photograph'],['IMG_2892.webp','Venue details — original photograph'],['IMG_2893.webp','Four20 pool-room brand artwork'],['IMG_2895.webp','Supplied Four20 opening-hours artwork']];
let current=0;
const image=document.querySelector('#gallery-image'),lightbox=document.querySelector('#lightbox');
function selectPhoto(index){current=(index+photos.length)%photos.length;image.src=photos[current][0];image.alt=photos[current][1];document.querySelector('#gallery-count').textContent=`${String(current+1).padStart(2,'0')} / 08`;document.querySelector('#photo-caption').textContent=photos[current][1];}
function openPhoto(index){selectPhoto(index);lightbox.showModal();}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>openPhoto(Number(button.dataset.photo))));
document.querySelector('#browse-gallery').addEventListener('click',()=>openPhoto(0));
document.querySelector('#gallery-prev').addEventListener('click',()=>selectPhoto(current-1));
document.querySelector('#gallery-next').addEventListener('click',()=>selectPhoto(current+1));
document.querySelector('#lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');menu.textContent='Menu';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.textContent=open?'Close':'Menu';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-paused',document.hidden));
if('IntersectionObserver' in window){
  document.documentElement.classList.add('js');
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.culture-visual,.culture-copy,.journal-heading,.photo-card,.community-copy,.community-photo,.membership-card,.visit-intro,.branch-card').forEach(el=>{el.classList.add('reveal');reveal.observe(el);});
  const activeNav=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{const active=a.getAttribute('href')===`#${entry.target.id}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-15% 0px -40% 0px'});
  document.querySelectorAll('#atmosphere,#details,#tournaments,#membership,#visit').forEach(el=>activeNav.observe(el));
}

const membershipForm = document.querySelector('#membership-checklist');
const membershipResult = document.querySelector('#membership-result');
const membershipInstructions = document.querySelector('#membership-instructions');

membershipForm.hidden = false;

membershipForm.addEventListener('submit', event => {
  event.preventDefault();
  const selectedDocument = membershipForm.querySelector('input[name="identity-document"]:checked');
  if (!selectedDocument) return;

  membershipInstructions.textContent = `Bring your original ${selectedDocument.value} to your preferred Four20 branch and ask the team about membership. Your membership has not been created yet.`;
  membershipForm.hidden = true;
  membershipResult.hidden = false;
  membershipResult.focus();
});

document.querySelector('#membership-reset').addEventListener('click', () => {
  membershipResult.hidden = true;
  membershipForm.hidden = false;
  membershipForm.querySelector('input[name="identity-document"]:checked')?.focus();
});

(() => {
  const toggle = document.querySelector('#motion-toggle');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  try { preference = localStorage.getItem('four20-motion'); } catch {}
  const motionIsOff = () => media.matches || preference === 'off';
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  const scenes = [...document.querySelectorAll('.atmospheric-smoke')].map(canvas => ({
    canvas,
    context:canvas.getContext('2d'),
    visible:true,
    width:0,
    height:0
  })).filter(scene => scene.context);

  const smoothstep = (low, high, x) => {
    const t = Math.max(0, Math.min(1, (x-low)/(high-low)));
    return t*t*(3-2*t);
  };
  function randomGrid(seed) {
    return Array.from({length:32*32}, () => {
      seed = (Math.imul(1664525,seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    });
  }
  function noise(grid,x,y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const u = smoothstep(0,1,x-ix), v = smoothstep(0,1,y-iy);
    const at = (dx,dy) => grid[((iy+dy)&31)*32+((ix+dx)&31)];
    const top = at(0,0)*(1-u)+at(1,0)*u;
    const bottom = at(0,1)*(1-u)+at(1,1)*u;
    return top*(1-v)+bottom*v;
  }
  function smokeTexture(color,seed) {
    const sprite = document.createElement('canvas'), size = 192;
    sprite.width = sprite.height = size;
    const ctx = sprite.getContext('2d');
    const pixels = ctx.createImageData(size,size);
    const grid = randomGrid(seed);
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      const u=x/(size-1), v=y/(size-1);
      const warp=noise(grid,4*u+2,4*v+9)-.5;
      const cloud=.61*noise(grid,5*u+5,5*v+15)+.25*noise(grid,11*u+2,11*v+2)+.14*noise(grid,21*u+13,21*v+3);
      const ridge=.43 + .20*Math.sin(u*6.3+seed) + warp*.34;
      const plume=Math.exp(-Math.pow((v-ridge)/.24,2));
      const fade=Math.pow(Math.sin(Math.PI*u)*Math.sin(Math.PI*v),.82);
      const i=(y*size+x)*4;
      pixels.data.set([color[0],color[1],color[2],Math.round(184*plume*fade*smoothstep(.31,.69,cloud))],i);
    }
    ctx.putImageData(pixels,0,0);
    return sprite;
  }
  const textures = scenes.length ? [
    smokeTexture([179,107,244],77),
    smokeTexture([137,88,221],131),
    smokeTexture([221,181,249],197),
    smokeTexture([171,215,94],233)
  ] : [];
  const strands = [
    {x:.06,y:.68,w:.70,h:.52,alpha:.84,angle:-.17},
    {x:.39,y:.67,w:.78,h:.44,alpha:.95,angle:.14},
    {x:.76,y:.34,w:.62,h:.49,alpha:.66,angle:-.44},
    {x:.92,y:.82,w:.72,h:.40,alpha:.49,angle:-.14},
    {x:.40,y:.24,w:.64,h:.43,alpha:.40,angle:.32},
    {x:.18,y:.87,w:.72,h:.34,alpha:.53,angle:-.21},
    {x:.68,y:.78,w:.83,h:.29,alpha:.54,angle:-.08}
  ];
  function fit(scene) {
    scene.width = scene.canvas.clientWidth;
    scene.height = scene.canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.35);
    scene.canvas.width = Math.max(1,Math.round(scene.width*scale));
    scene.canvas.height = Math.max(1,Math.round(scene.height*scale));
    scene.context.setTransform(scale,0,0,scale,0,0);
  }
  function paint(scene,time) {
    const {context:ctx,width,height}=scene;
    ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation = 'screen';
    const offset = scene.canvas.dataset.scene === 'interlude' ? 2.2 : 0;
    strands.forEach((strand,i)=>{
      const phase = i*1.77+offset+time*(.24+.035*i);
      const x = width*(strand.x + .105*Math.sin(phase));
      const y = height*(strand.y + .11*Math.cos(phase*.76));
      const w = width*strand.w, h = height*strand.h;
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(strand.angle+.20*Math.sin(phase*.94));
      ctx.globalAlpha = strand.alpha * (.78 + .22*Math.sin(phase*.81));
      ctx.drawImage(textures[i%textures.length],-w/2,-h/2,w,h);
      ctx.restore();
    });
  }
  function tick(time) {
    frame = 0;
    if(lastTime) elapsed += Math.min(time-lastTime,50)/1000;
    lastTime = time;
    scenes.filter(scene=>scene.visible).forEach(scene=>paint(scene,elapsed));
    requestFrame();
  }
  function requestFrame() {
    if(!frame && !motionIsOff() && !document.hidden && scenes.some(scene=>scene.visible)) frame=requestAnimationFrame(tick);
  }
  function syncMotion() {
    const off = motionIsOff();
    document.documentElement.classList.toggle('four20-motion-off',off);
    toggle.textContent = off ? 'Motion off' : 'Pause effects';
    toggle.setAttribute('aria-pressed',String(off));
    toggle.disabled = media.matches;
    toggle.title = media.matches ? 'Your device is set to reduce motion' : 'Toggle decorative motion';
    if(frame){cancelAnimationFrame(frame);frame=0;}
    lastTime=0;
    scenes.forEach(scene=>paint(scene,off?0:elapsed));
    requestFrame();
  }
  toggle.addEventListener('click',()=>{
    preference=motionIsOff()?'on':'off';
    try { localStorage.setItem('four20-motion',preference); } catch {}
    syncMotion();
  });
  media.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncMotion);
  scenes.forEach(fit);
  if('ResizeObserver' in window){
    const sizes=new ResizeObserver(()=>scenes.forEach(scene=>{fit(scene);paint(scene,elapsed);}));
    scenes.forEach(scene=>sizes.observe(scene.canvas));
  }
  if('IntersectionObserver' in window){
    const visibility=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const scene=scenes.find(item=>item.canvas===entry.target);
        scene.visible=entry.isIntersecting;
      });
      if(!scenes.some(scene=>scene.visible))lastTime=0;
      requestFrame();
    });
    scenes.forEach(scene=>visibility.observe(scene.canvas));
  }
  syncMotion();
})();

