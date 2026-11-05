(() => {
 const page=location.pathname.split('/').pop().toLowerCase();
 if(!document.querySelector('link[href*="legal-pages.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./legal-pages.css?v=2';document.head.append(css);}
 if(page==='admin.html'||page==='admin-acceso.html')return;
 if(!document.querySelector('link[href*="wishlist.css"]')){
  const style=document.createElement('link');style.rel='stylesheet';style.href='./wishlist.css?v=2';document.head.append(style);
 }

 const links=[
  ['libro-reclamaciones.html','Libro de Reclamaciones'],
  ['politica-privacidad.html','Política de Privacidad'],
  ['terminos-condiciones.html','Términos y condiciones'],
  ['envios.html','Envíos y entregas']
 ];
 const footer=document.querySelector('footer .footer-inner');
 if(footer&&!footer.querySelector('.legal-footer-col')){
  const col=document.createElement('div');col.className='legal-footer-col';
  const title=document.createElement('b');title.textContent='PROTECCIÓN AL CONSUMIDOR';col.append(title);
  for(const [path,label] of links){
   const a=document.createElement('a');a.href='./'+path;a.textContent=label;if(path==='libro-reclamaciones.html')a.className='legal-book-footer-link';col.append(a);
  }
  const p=document.createElement('p');p.className='legal-footer-identity';
  p.textContent='Identificación empresarial por verificar antes de vender.';col.append(p);
  import('./legal-provider.js').then(m=>m.getVerifiedProvider()).then(provider=>{
    if(!provider)return;
    p.textContent=provider.legal_name+' · RUC '+provider.ruc+' · '+provider.fiscal_address+' · '+provider.service_email;
  }).catch(()=>{});

  footer.append(col);
 }

 // Favorite products: integrated directly to avoid delayed module-loading problems.
 const FKEY='miami-store-favorites-v1', UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const heartSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 4.8a5.1 5.1 0 0 0-7.2 0L12 5.9l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2L12 20.3l8.2-8.3a5.1 5.1 0 0 0 0-7.2Z"/></svg>';
 function savedIds(){
  try{const a=JSON.parse(localStorage.getItem(FKEY)||'[]');return Array.isArray(a)?[...new Set(a.filter(x=>typeof x==='string'&&UUID.test(x)))].slice(0,100):[];}catch{return [];}
 }
 function syncFavorites(){
  const list=savedIds();
  for(const b of document.querySelectorAll('[data-favorite-toggle]')){
   const on=list.includes(b.dataset.favoriteToggle);
   b.classList.toggle('is-favorite',on);
   b.setAttribute('aria-pressed',String(on));
   b.setAttribute('aria-label',on?'Eliminar de favoritos':'Guardar en favoritos');
   b.title=on?'Eliminar de favoritos':'Guardar en favoritos';
  }
  for(const b of document.querySelectorAll('.favorite-inline[data-favorite-id]')){
   const active=list.includes(b.dataset.favoriteId);
   b.classList.toggle('is-favorite',active);
   b.setAttribute('aria-pressed',String(active));
   const label=b.querySelector('span');if(label)label.textContent=active?'Guardado':'Guardar';
  }
  for(const n of document.querySelectorAll('[data-favorites-count]')){n.textContent=String(list.length);n.hidden=list.length===0;}
 }
 function toggleFavorite(id){
  const a=savedIds(),next=a.includes(id)?a.filter(x=>x!==id):[...a,id].slice(-100);
  try{localStorage.setItem(FKEY,JSON.stringify(next));}catch{return;}
  syncFavorites();
  document.dispatchEvent(new CustomEvent('miami:favorites-changed',{detail:{ids:next}}));
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button.favorite-inline[data-favorite-id]');
  if(!button)return;
  event.preventDefault();event.stopPropagation();
  toggleFavorite(button.dataset.favoriteId);
 });
 const actions=document.querySelector('.header .head-actions');
 if(actions&&!actions.querySelector('.favorite-header-link')){
  const link=document.createElement('a');link.className='favorite-header-link';link.href='./favoritos.html';
  link.setAttribute('aria-label','Mis favoritos');link.innerHTML=heartSvg+'<span class="favorite-header-label">FAVORITOS</span><span class="favorite-count" data-favorites-count hidden></span>';
  actions.insertBefore(link,actions.querySelector('.site-account-link')||actions.firstChild);
 }
 const menu=document.querySelector('.site-drawer-foot');
 if(menu&&!menu.querySelector('a[href="./favoritos.html"]')){
  const link=document.createElement('a');link.href='./favoritos.html';link.textContent='Mis favoritos';menu.prepend(link);
 }
 const footerHelp=[...document.querySelectorAll('footer .footer-inner>div')].find(e=>e.textContent.includes('AYUDA Y COMPRAS'));
 if(footerHelp&&!footerHelp.querySelector('a[href="./favoritos.html"]')){
  const a=document.createElement('a');a.href='./favoritos.html';a.textContent='Mis favoritos';footerHelp.append(a);
 }
 function attachFavorites(){
  for(const card of document.querySelectorAll('.product-image-box[data-product-id]')){
   const id=card.dataset.productId;
   if(!UUID.test(id||''))continue;
   const picture=card.matches('.product-image-box')?card:card.querySelector('.pic,.favorite-image');
   if(!picture||picture.querySelector('[data-favorite-toggle]'))continue;
   const button=document.createElement('button');button.type='button';button.className='favorite-toggle';
   button.dataset.favoriteToggle=id;button.innerHTML=heartSvg;
   button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();toggleFavorite(id);});
   picture.append(button);
  }
  syncFavorites();
 }
 attachFavorites();
 let queued=false;
 const requestScan=()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;attachFavorites();});
 };
 for(const selector of ['#catalog','#categoryProducts','.product-layout','#favoritesGrid']){
  const root=document.querySelector(selector);
  if(root)new MutationObserver(requestScan).observe(root,{childList:true,subtree:true});
 }
 document.addEventListener('miami:product-ready',requestScan);
 window.addEventListener('storage',event=>{if(event.key===FKEY)syncFavorites();});
 document.addEventListener('miami:favorites-changed',syncFavorites);

})();
