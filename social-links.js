// Redes compartidas por el propietario. No se consultan estadísticas ni se realizan publicaciones.
const channels=[{
 name:'Instagram',url:'https://www.instagram.com/miami.store.peru_/',
 svg:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.6 6.5h.01"/>'
},{
 name:'Facebook',url:'https://www.facebook.com/share/19LYhWzg1d/?mibextid=wwXIfr',
 svg:'<path d="M14.2 21v-8h3l.5-4h-3.5V7c0-1.2.4-2 2-2h1.8V1.5A22 22 0 0 0 15.5 1C12 1 10 3.1 10 6.8V9H7v4h3v8"/>'
}];
const target=document.querySelector('footer .footer-inner')||document.querySelector('footer');
if(target&&!target.querySelector('.social-official')){
 const section=document.createElement('div');section.className='social-official';
 const title=document.createElement('b');title.textContent='Síguenos';section.append(title);
 const links=document.createElement('div');links.className='social-official-links';
 for(const c of channels){const a=document.createElement('a');a.href=c.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Abrir '+c.name+' de Miami Store');a.title=c.name;
 const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.6');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');icon.innerHTML=c.svg;
 const span=document.createElement('span');span.textContent=c.name;a.append(icon,span);links.append(a);}
 section.append(links);target.append(section);
}
