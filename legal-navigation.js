(() => {
 const page=location.pathname.split('/').pop().toLowerCase();
 if(!document.querySelector('link[href*="legal-pages.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./legal-pages.css?v=2';document.head.append(css);}
 if(page==='admin.html'||page==='admin-acceso.html')return;
 if(!document.querySelector('link[href*="wishlist.css"]')){
  const style=document.createElement('link');style.rel='stylesheet';style.href='./wishlist.css?v=1';document.head.append(style);
 }
 import('./wishlist.js').catch(()=>{});
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

})();
