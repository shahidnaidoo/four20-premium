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
  document.querySelectorAll('.culture-visual,.culture-copy,.journal-heading,.photo-card,.visit>div').forEach(el=>{el.classList.add('reveal');reveal.observe(el);});
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

  membershipInstructions.textContent = `Bring your original ${selectedDocument.value} to 16 Garcia Street, East London, and ask the team about membership. Your membership has not been created yet.`;
  membershipForm.hidden = true;
  membershipResult.hidden = false;
  membershipResult.focus();
});

document.querySelector('#membership-reset').addEventListener('click', () => {
  membershipResult.hidden = true;
  membershipForm.hidden = false;
  membershipForm.querySelector('input[name="identity-document"]:checked')?.focus();
});
