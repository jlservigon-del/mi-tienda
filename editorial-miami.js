(() => {
  const openButton=document.getElementById('siteMenuOpen');
  const closeButton=document.getElementById('siteMenuClose');
  const drawer=document.getElementById('siteMenuDrawer');
  const overlay=document.getElementById('siteDrawerOverlay');
  if(!drawer||!openButton||!overlay)return;
  function openMenu(){
    drawer.hidden=false;overlay.hidden=false;
    document.body.classList.add('site-menu-open');
    openButton.setAttribute('aria-expanded','true');
    closeButton?.focus();
  }
  function closeMenu(){
    drawer.hidden=true;overlay.hidden=true;
    document.body.classList.remove('site-menu-open');
    openButton.setAttribute('aria-expanded','false');
    openButton.focus();
  }
  openButton.addEventListener('click',openMenu);
  closeButton?.addEventListener('click',closeMenu);
  overlay.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!drawer.hidden)closeMenu();
    if(e.key==='Tab'&&!drawer.hidden){
      const focusable=[...drawer.querySelectorAll('a,button')].filter(el=>!el.disabled);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    drawer.hidden=true;overlay.hidden=true;
    document.body.classList.remove('site-menu-open');
    openButton.setAttribute('aria-expanded','false');
  }));
  const search=document.querySelector('.site-search-link');
  search?.addEventListener('click',()=>{
    const input=document.getElementById('homeSearch');
    if(input)setTimeout(()=>input.focus({preventScroll:true}),260);
  });
})();