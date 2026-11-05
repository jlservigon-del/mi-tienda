import {db,configured} from './store-client.js';

const path=location.pathname.split('/').pop().toLowerCase();
const shopPages=['','index.html','hombre.html','mujer.html','accesorios.html','belleza.html','marca.html','sale.html','producto.html','cuenta.html','checkout.html','carrito.html','envios.html','preguntas-frecuentes.html'];
if(shopPages.includes(path)){
  const wrap=document.createElement('div');
  wrap.className='whatsapp-contact';wrap.setAttribute('aria-label','Canal de consultas Miami Store');
  const link=document.createElement('a');link.className='whatsapp-contact-link';
  link.href='#whatsapp-demo';link.setAttribute('aria-label','Probar contacto de WhatsApp');
  link.setAttribute('title','WhatsApp de consulta');
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
  icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.7');
  icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
  icon.innerHTML='<path d="M20.2 11.8a8.2 8.2 0 0 1-12.2 7.1l-4.2 1.3 1.4-4.2a8.2 8.2 0 1 1 15-4.2Z"/><path d="M9 8.1c-.6.3-1 1-.9 2 0 1.2 1.6 3.2 3.4 4.2 1.7.9 3 .8 3.7 0l-.2-1.1-1.8-.8-.9.7c-.9-.3-1.9-1.2-2.3-2.1l.7-.9-.8-2Z"/>';
  const caption=document.createElement('span');caption.className='whatsapp-caption';caption.textContent='WHATSAPP';
  link.append(icon,caption);
  const state=document.createElement('span');state.className='whatsapp-demo-caption';state.textContent='DEMO';
  wrap.append(link,state);document.body.append(wrap);

  const modal=document.createElement('div');modal.className='whatsapp-demo-overlay';modal.hidden=true;
  modal.innerHTML='<section class="whatsapp-demo-panel" role="dialog" aria-modal="true" aria-labelledby="whatsappDemoTitle"><button class="whatsapp-demo-close" aria-label="Cerrar consulta" type="button">×</button><div class="whatsapp-demo-eyebrow">MIAMI STORE / CANAL DE ATENCIÓN</div><h2 id="whatsappDemoTitle">Previsualizar consulta</h2><p>Este es un ejemplo del mensaje que se enviaría a nuestros vendedores. <strong>Modo demostración: no envía mensajes ni conecta con un número de teléfono.</strong></p><label for="whatsappDemoText">MENSAJE PREPARADO</label><textarea id="whatsappDemoText" rows="5" readonly></textarea><button type="button" class="whatsapp-demo-copy">Copiar mensaje</button><p class="whatsapp-demo-status" role="status"></p><p class="whatsapp-demo-footnote">El chat real se habilitará al validar el número empresarial desde Administración.</p></section>';
  document.body.append(modal);
  const close=()=>{modal.hidden=true;document.body.classList.remove('wa-demo-open');link.focus();};
  const open=()=>{
    modal.querySelector('textarea').value=buildMessage();
    modal.querySelector('.whatsapp-demo-status').textContent='';
    modal.hidden=false;document.body.classList.add('wa-demo-open');
    modal.querySelector('.whatsapp-demo-close').focus();
  };
  modal.querySelector('.whatsapp-demo-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
  modal.querySelector('.whatsapp-demo-copy').addEventListener('click',async()=>{
    const ta=modal.querySelector('textarea');
    try{await navigator.clipboard.writeText(ta.value);modal.querySelector('.whatsapp-demo-status').textContent='Mensaje copiado al portapapeles.';}
    catch{ta.focus();ta.select();modal.querySelector('.whatsapp-demo-status').textContent='Selecciona el texto para copiarlo.';}
  });
  let phone='',greeting='';
  function buildMessage(){
    let msg=greeting||'Hola, quiero consultar por un producto de Miami Store.';
    if(path==='producto.html'){
      const name=document.getElementById('productTitle')?.textContent?.trim();
      if(name&&!/^(Cargando|Producto no)/i.test(name))msg+=' Me interesa: '+name+'.';
    }
    return msg+' Enlace: '+location.origin+location.pathname+(path==='producto.html'?location.search:'');
  }
  link.addEventListener('click',e=>{
    if(!phone){e.preventDefault();open();return;}
    link.href='https://wa.me/'+phone+'?text='+encodeURIComponent(buildMessage());
  });
  async function init(){
    if(!configured||!db)return;
    const {data,error}=await db.from('store_contact_channels')
      .select('phone_e164,greeting').eq('channel','whatsapp').eq('enabled',true).eq('owner_verified',true).maybeSingle();
    if(error||!data||!/^[1-9][0-9]{7,14}$/.test(data.phone_e164||''))return;
    phone=data.phone_e164;greeting=data.greeting||'';
    state.hidden=true;link.title='Chatear con ventas';link.setAttribute('aria-label','Chatear con ventas por WhatsApp');
    link.target='_blank';link.rel='noopener noreferrer';
    link.href='https://wa.me/'+phone+'?text='+encodeURIComponent(buildMessage());
  }
  init();
}