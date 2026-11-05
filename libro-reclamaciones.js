import {db,configured} from './store-client.js';
import {getVerifiedProvider,fillProviderFields} from './legal-provider.js';
const form=document.getElementById('complaintForm');
const notice=document.getElementById('complaintSetupNotice');
const receipt=document.getElementById('complaintReceipt');
const status=document.getElementById('complaintStatus');
const minor=document.getElementById('consumerMinor');
const guardian=document.getElementById('guardianFields');
let receiptCode='';
const provider=await getVerifiedProvider();
fillProviderFields(provider);
if(provider&&configured&&db){
 form.hidden=false;notice.hidden=true;
}else{
 form.hidden=true;
 notice.hidden=false;
 notice.textContent='Libro en preparación: la razón social, RUC, domicilio y contacto del proveedor aún deben ser verificados y publicados por el administrador. No ingreses datos personales hasta que el servicio esté habilitado. Consulta la guía oficial de Indecopi enlazada al final.';
}
minor.addEventListener('change',()=>{
 guardian.hidden=!minor.checked;
 guardian.querySelectorAll('input').forEach(x=>{x.required=minor.checked;if(!minor.checked)x.value='';});
});
const displayNames=[
 ['Código de hoja','reference'],['Fecha de registro','created_at'],['Proveedor','provider'],
 ['RUC del proveedor','ruc'],['Domicilio del proveedor','provider_address'],
 ['Tipo','complaint_type'],['Consumidor','consumer_full_name'],['Tipo de documento','consumer_document_type'],
 ['Documento','consumer_document_number'],['Domicilio','consumer_address'],['Teléfono','consumer_phone'],
 ['Correo','consumer_email'],['Menor de edad','consumer_is_minor'],['Representante','guardian_full_name'],
 ['Documento del representante','guardian_document'],['Bien o servicio','product_kind'],['Descripción','product_description'],
 ['Monto','amount'],['Detalle de la reclamación','complaint_details'],['Pedido del consumidor','consumer_request']
];
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!provider||!db){status.textContent='El Libro todavía no está habilitado. No se recibió información.';return;}
 const fields=Object.fromEntries(new FormData(form).entries());
 fields.consumer_is_minor=minor.checked;
 fields.accept_privacy=Boolean(form.elements.accept_privacy.checked);
 if(fields.honeypot){status.textContent='No se pudo validar la solicitud.';return;}
 if(minor.checked&&(!fields.guardian_full_name||!fields.guardian_document)){
  status.textContent='Completa los datos del representante del consumidor menor de edad.';return;
 }
 const btn=form.querySelector('button[type=submit]');btn.disabled=true;
 status.textContent='Registrando la hoja de reclamación de forma segura...';
 const {data,error}=await db.rpc('submit_miami_complaint',{p:fields});
 if(error){
  status.textContent='No se pudo registrar la reclamación: '+error.message;
  btn.disabled=false;
  return;
 }
 receiptCode=data?.reference||'';
 if(!receiptCode){status.textContent='El servidor no devolvió la constancia. Contacta con el proveedor.';btn.disabled=false;return;}
 const printable={
   ...fields,reference:receiptCode,
   created_at:new Date(data.created_at).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'long',timeStyle:'short'}),
   provider:provider.legal_name,ruc:provider.ruc,provider_address:provider.fiscal_address,
   amount:'S/ '+Number(fields.amount||0).toFixed(2),
   consumer_is_minor:minor.checked?'Sí':'No',
   complaint_type:fields.complaint_type==='reclamo'?'RECLAMO':'QUEJA',
   product_kind:fields.product_kind==='producto'?'Producto':'Servicio'
 };
 const root=document.getElementById('receiptBody');root.replaceChildren();
 const dl=document.createElement('dl');
 for(const [label,key] of displayNames){
  if(!printable[key])continue;
  const dt=document.createElement('dt'),dd=document.createElement('dd');
  dt.textContent=label;dd.textContent=String(printable[key]);
  dl.append(dt,dd);
 }
 root.append(dl);
 form.hidden=true;receipt.hidden=false;status.textContent='';
 receipt.scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('printComplaint')?.addEventListener('click',()=>window.print());
document.getElementById('copyComplaintCode')?.addEventListener('click',async()=>{
 const btn=document.getElementById('copyComplaintCode');if(!receiptCode)return;
 try{await navigator.clipboard.writeText(receiptCode);btn.textContent='CÓDIGO COPIADO';}
 catch{btn.textContent='TU CÓDIGO: '+receiptCode;}
});
