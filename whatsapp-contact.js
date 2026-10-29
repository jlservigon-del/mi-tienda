import {db,configured} from './store-client.js';
const path=location.pathname.split('/').pop().toLowerCase();
const isShop=['','index.html','hombre.html','mujer.html','accesorios.html','belleza.html','marca.html','producto.html','cuenta.html','checkout.html','carrito.html'].includes(path);
if(isShop){
 const wrap=document.createElement('div');wrap.className='whatsapp-contact';wrap.setAttribute('aria-label','Atención a clientes');
 const link=document.createElement('a');link.className='whatsapp-contact-link';link.setAttribute('aria-label','Escribir a ventas por WhatsApp');
 link.target='_blank';link.rel='noopener noreferrer';
 const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
 icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
 icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.65');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
 icon.innerHTML='<path d="M20 11.7a8 8 0 0 1-11.9 7L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z"/><path d="M9.1 8.2c-.5.3-1 1-.9 1.9.1 1.3 1.5 3.1 3.3 4.1 1.7.9 3 .9 3.9.1l-.1-1.2-1.9-.8-.8.8c-.9-.4-1.8-1.2-2.3-2.1l.7-.8-.8-1.8Z"/>';
 const title=document.createElement('span');title.textContent='Habla con ventas';
 link.append(icon,title);
 const disabled=document.createElement('span');disabled.className='whatsapp-contact-disabled';disabled.textContent='WhatsApp: atención por habilitar';
 wrap.append(link,disabled);document.body.append(wrap);
 const footer=document.querySelector('footer .footer-inner');
 const footerLink=document.createElement('a');footerLink.textContent='WhatsApp de ventas';footerLink.target='_blank';footerLink.rel='noopener noreferrer';footerLink.className='footer-whatsapp';footerLink.hidden=true;
 if(footer){const block=document.createElement('div');block.className='footer-whatsapp-wrap';block.append(footerLink);footer.append(block);}
 let phone='',greeting='';
 const isProduct=path==='producto.html';
 function buildText(){
   let phrase=greeting||'Hola, vi Miami Store y quiero información sobre sus productos.';
   if(isProduct){const name=document.getElementById('productTitle')?.textContent?.trim();
     if(name&&!/^(Cargando|Producto no)/i.test(name))phrase+=' Me interesa: '+name+'.';}
   phrase+=' Página: '+location.origin+location.pathname+(isProduct?location.search:'');
   return phrase;
 }
 function setLink(){if(!phone)return;const url='https://wa.me/'+phone+'?text='+encodeURIComponent(buildText());link.href=url;footerLink.href=url;}
 link.addEventListener('click',setLink);
 footerLink.addEventListener('click',setLink);
 async function init(){
   if(!db||!configured)return;
   const {data,error}=await db.from('store_contact_channels').select('phone_e164,greeting').eq('channel','whatsapp').eq('enabled',true).eq('owner_verified',true).maybeSingle();
   if(error||!data||!/^[1-9][0-9]{7,14}$/.test(data.phone_e164||''))return;
   phone=data.phone_e164;greeting=data.greeting||'';
   link.hidden=false;disabled.hidden=true;footerLink.hidden=false;wrap.classList.add('enabled');
   setLink();
 }
 link.hidden=true;
 init();
}
