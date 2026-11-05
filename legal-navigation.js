(() => {
 const page=location.pathname.split('/').pop().toLowerCase();
 if(!document.querySelector('link[href*="legal-pages.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./legal-pages.css?v=2';document.head.append(css);}
 if(page==='admin.html'||page==='admin-acceso.html')return;
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
   const a=document.createElement('a');a.href='./'+path;a.textContent=label;col.append(a);
  }
  const p=document.createElement('p');p.className='legal-footer-identity';
  p.textContent='Identificación empresarial por verificar antes de vender.';col.append(p);
  import('./legal-provider.js').then(m=>m.getVerifiedProvider()).then(provider=>{
    if(!provider)return;
    p.textContent=provider.legal_name+' · RUC '+provider.ruc+' · '+provider.fiscal_address+' · '+provider.service_email;
  }).catch(()=>{});

  footer.append(col);
 }
 const subnav=document.querySelector('.site-subnav');
 if(subnav&&!subnav.querySelector('a[href="./libro-reclamaciones.html"]')){
  const a=document.createElement('a');a.href='./libro-reclamaciones.html';a.className='legal-nav-complaints';a.textContent='LIBRO DE RECLAMACIONES';subnav.append(a);
 }
 const drawer=document.querySelector('.site-drawer');
 if(drawer&&!drawer.querySelector('a[href="./libro-reclamaciones.html"]')){
  const a=document.createElement('a');a.href='./libro-reclamaciones.html';a.textContent='Libro de Reclamaciones';drawer.append(a);
 }
 if(!document.querySelector('.legal-book-fixed')){
  const a=document.createElement('a');a.className='legal-book-fixed';a.href='./libro-reclamaciones.html';
  a.setAttribute('aria-label','Abrir Libro de Reclamaciones');
  a.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15"/></svg><span>LIBRO DE RECLAMACIONES</span>';
  document.body.append(a);
 }
})();
