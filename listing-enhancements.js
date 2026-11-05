(() => {
  const layout=document.querySelector('.category-layout');
  const filters=document.querySelector('.filters-panel');
  if(!layout||!filters)return;
  const toolbar=document.createElement('div');
  toolbar.className='mobile-filter-toolbar';
  const button=document.createElement('button');
  button.type='button';button.className='mobile-filter-button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','categoryFilterPanel');
  button.textContent='FILTRAR PRODUCTOS';
  filters.id='categoryFilterPanel';
  toolbar.append(button);
  layout.parentNode.insertBefore(toolbar,layout);
  button.addEventListener('click',()=>{
    const open=layout.classList.toggle('filters-open');
    button.setAttribute('aria-expanded',String(open));
    button.textContent=open?'OCULTAR FILTROS':'FILTRAR PRODUCTOS';
    if(open)filters.scrollIntoView({behavior:'smooth',block:'start'});
  });
  document.getElementById('resetFilters')?.addEventListener('click',()=>{
    if(window.matchMedia('(max-width:720px)').matches){layout.classList.remove('filters-open');button.setAttribute('aria-expanded','false');button.textContent='FILTRAR PRODUCTOS';}
  });
})();