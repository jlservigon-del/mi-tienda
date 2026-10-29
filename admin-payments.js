import {db,configured,currentUser} from './store-client.js';
const root=document.getElementById('paymentSettings');
const status=document.getElementById('paymentSettingsStatus');
const names={yape:'Yape',plin:'Plin',transferencia:'Transferencia bancaria'};
const create=(tag,t)=>{const e=document.createElement(tag);if(t!=null)e.textContent=t;return e;};
function field(form,label,value,id){const wrap=create('label',label),input=create('input');input.type='text';input.name=id;input.value=value||'';input.autocomplete='off';wrap.append(input);form.append(wrap);return input;}
async function init(){
 if(!configured||!db)return;
 const u=await currentUser();if(!u)return;
 const {data:admin,error:adError}=await db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();
 if(adError||!admin)return;
 const {data,error}=await db.from('payment_methods').select('*').order('method');
 if(error){status.textContent=error.message;return;}
 root.replaceChildren();
 for(const method of data){const form=create('form');const title=create('h3',names[method.method]);form.append(title);
 const holder=field(form,'Nombre del titular',method.holder,'holder');
 let phone,bank,account,cci;
 if(method.method==='transferencia'){bank=field(form,'Banco',method.bank,'bank');account=field(form,'Número de cuenta',method.account,'account');cci=field(form,'CCI (opcional)',method.cci,'cci');}
 else phone=field(form,'Número de pago',method.phone,'phone');
 const qr=method.method==='transferencia'?null:field(form,'URL de QR (opcional, HTTPS)',method.qr_url,'qr_url');
 const verify=create('label');verify.className='verify';const check=create('input');check.type='checkbox';check.checked=method.enabled&&method.verified_by_owner;verify.append(check,create('span','He verificado estos datos con el titular y autorizo mostrarlos a los clientes.'));form.append(verify);
 const button=create('button','Guardar configuración');button.type='submit';form.append(button);
 form.onsubmit=async e=>{e.preventDefault();button.disabled=true;status.textContent='Guardando '+names[method.method]+'...';
 const update={holder:holder.value.trim(),phone:phone?.value.trim()||'',bank:bank?.value.trim()||'',account:account?.value.trim()||'',cci:cci?.value.trim()||'',qr_url:qr?.value.trim()||'',enabled:check.checked,verified_by_owner:check.checked,updated_at:new Date().toISOString()};
 if(update.qr_url&&!/^https:\/\//.test(update.qr_url)){status.textContent='El QR debe ser una URL HTTPS.';button.disabled=false;return;}
 const {error}=await db.from('payment_methods').update(update).eq('method',method.method);
 status.textContent=error?'No se pudo guardar: '+error.message:'Configuración de '+names[method.method]+' actualizada.';button.disabled=false;};
 root.append(form);
 }
}
init();