import {db,configured,currentUser} from './store-client.js';
const form=document.getElementById('whatsappConfigForm');
const msg=document.getElementById('whatsappConfigStatus');
if(form&&msg)init();
async function init(){
 if(!db||!configured){msg.textContent='Base de datos no conectada.';return;}
 const user=await currentUser();if(!user){msg.textContent='Acceso exclusivo para administrador.';return;}
 const {data:admin,error:aError}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(aError||!admin){form.hidden=true;msg.textContent='No tienes permisos para configurar WhatsApp.';return;}
 form.hidden=false;
 const {data,error}=await db.from('store_contact_channels').select('*').eq('channel','whatsapp').maybeSingle();
 if(error){msg.textContent='No se puede cargar la configuración: '+error.message;return;}
 const phone=form.elements.phone_e164,hello=form.elements.greeting,enabled=form.elements.enabled;
 phone.value=data?.phone_e164||'';hello.value=data?.greeting||'Hola, vi Miami Store y quiero consultar por un producto.';enabled.checked=!!(data?.enabled&&data?.owner_verified);
 form.addEventListener('submit',async e=>{
   e.preventDefault();
   const raw=phone.value.replace(/[\s()+-]/g,'');
   if(!/^[1-9][0-9]{7,14}$/.test(raw)){msg.textContent='Ingresa número completo con código de país. Para Perú: 51 y 9 dígitos. Ejemplo de formato: 519XXXXXXXX.';return;}
   const greeting=hello.value.trim();
   if(greeting.length<12||greeting.length>400){msg.textContent='El mensaje debe tener entre 12 y 400 caracteres.';return;}
   const save=form.querySelector('button[type=submit]');save.disabled=true;msg.textContent='Guardando configuración...';
   const payload={phone_e164:raw,greeting,enabled:enabled.checked,owner_verified:enabled.checked,updated_at:new Date().toISOString()};
   const {error}=await db.from('store_contact_channels').update(payload).eq('channel','whatsapp');
   msg.textContent=error?'No se pudo guardar: '+error.message:enabled.checked?'WhatsApp habilitado. El botón ya puede dirigir a este número al actualizar la tienda.':'Configuración guardada. WhatsApp aún desactivado.';
   save.disabled=false;
 });
}
