/* Miami Store: favorites stored ONLY in this browser, no personal data. */
const STORE_KEY='miami-store-favorites-v1';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function getFavoriteIds(){
 try{
  const parsed=JSON.parse(localStorage.getItem(STORE_KEY)||'[]');
  return Array.isArray(parsed)?[...new Set(parsed.filter(x=>typeof x==='string'&&UUID.test(x)))].slice(0,100):[];
 }catch{return [];}
}
export function isFavorite(id){return getFavoriteIds().includes(id);}
function save(ids){
 try{localStorage.setItem(STORE_KEY,JSON.stringify(ids));}
 catch{return false;}
 document.dispatchEvent(new CustomEvent('miami:favorites-changed',{detail:{ids}}));
 return true;
}
export function toggleFavorite(id){
 if(!UUID.test(id||''))return;
 const ids=getFavoriteIds();
 if(ids.includes(id))save(ids.filter(x=>x!==id));
 else save([...ids,id].slice(-100));
}
const heart='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 4.8a5.1 5.1 0 0 0-7.2 0L12 5.9l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2L12 20.3l8.2-8.3a5.1 5.1 0 0 0 0-7.2Z"/></svg>';
function update(){
 const ids=getFavoriteIds();
 for(const button of document.querySelectorAll('[data-favorite-toggle]')){
  const active=ids.includes(button.dataset.favoriteToggle);
  button.classList.toggle('is-favorite',active);
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'Eliminar de favoritos':'Guardar en favoritos');
  button.title=active?'Eliminar de favoritos':'Guardar en favoritos';
 }
 for(const c of document.querySelectorAll('[data-favorites-count]')){
  c.textContent=String(ids.length);c.hidden=ids.length===0;
 }
}
function attachCards(){
 const elements=[...document.querySelectorAll('.catalog-card[data-product-id],.product-image-box[data-product-id],.favorite-card[data-product-id]')];
 for(const el of elements){
  const id=el.dataset.productId;
  if(!UUID.test(id||''))continue;
  const target=el.matches('.product-image-box')?el:el.querySelector('.pic,.favorite-image');
  if(!target||target.querySelector('[data-favorite-toggle]'))continue;
  const btn=document.createElement('button');
  btn.type='button';btn.className='favorite-toggle';
  btn.dataset.favoriteToggle=id;btn.innerHTML=heart;
  btn.addEventListener('click',event=>{
    event.stopPropagation();event.preventDefault();
    toggleFavorite(id);
  });
  target.append(btn);
 }
 update();
}
function addNavigation(){
 const actions=document.querySelector('.header .head-actions');
 if(actions&&!actions.querySelector('.favorite-header-link')){
  const link=document.createElement('a');
  link.href='./favoritos.html';link.className='favorite-header-link';
  link.setAttribute('aria-label','Ver productos guardados en favoritos');
  link.innerHTML=heart+'<span class="favorite-header-label">FAVORITOS</span><span class="favorite-count" data-favorites-count hidden></span>';
  const account=actions.querySelector('.site-account-link');
  if(account)actions.insertBefore(link,account);else actions.append(link);
 }
 const menu=document.querySelector('.site-drawer-foot');
 if(menu&&!menu.querySelector('a[href="./favoritos.html"]')){
  const link=document.createElement('a');link.href='./favoritos.html';link.textContent='Mis favoritos';menu.prepend(link);
 }
 const help=document.querySelector('footer .footer-inner');
 if(help&&!help.querySelector('a[href="./favoritos.html"]')){
  const columns=[...help.children];
  const target=columns.find(c=>c.textContent.includes('AYUDA Y COMPRAS'))||columns[columns.length-1];
  if(target){const a=document.createElement('a');a.href='./favoritos.html';a.textContent='Mis favoritos';target.append(a);}
 }
}
let pending=false;
function schedule(){
 if(pending)return;pending=true;
 requestAnimationFrame(()=>{pending=false;attachCards();});
}
addNavigation();
attachCards();
const targets=['#catalog','#categoryProducts','.product-layout','#favoritesGrid'];
for(const selector of targets){
 const root=document.querySelector(selector);
 if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:false});
}
document.addEventListener('miami:product-ready',schedule);
document.addEventListener('miami:favorites-changed',update);
window.addEventListener('storage',e=>{if(e.key===STORE_KEY)update();});
