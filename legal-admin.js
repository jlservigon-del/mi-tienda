import {db,configured,currentUser,errorText} from './store-client.js';
const $=id=>document.getElementById(id);
const form=$('legalSettingsForm');
const status=$('legalSettingsStatus');
const list=$('complaintsAdminList');
let records=[];
function element(tag,text,cls){
 const e=document.createElement(tag);if(text!==undefined)e.textContent=text;
 if(cls)e.className=cls;return e;
}
async function isAuthorized(){
 if(!configured||!db)return false;
 const u=await currentUser();if(!u)return false;
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();
 return !error&&!!data;
}
async function init(){
 if(!await isAuthorized()){
  status.textContent='Inicia sesión con una cuenta administradora para configurar datos legales.';
  return;
 }
 form.hidden=false;
 const {data,error}=await db.from('legal_provider_settings').select('*').eq('id',1).maybeSingle();
 if(error){status.textContent='Error al cargar identificación: '+errorText(error);return;}
 if(data){
  for(const field of ['commercial_name','legal_name','ruc','fiscal_address','service_email','service_phone','privacy_email'])
    form.elements[field].value=data[field]||'';
  form.elements.published.checked=Boolean(data.published);
 }
 status.textContent=data?.published?'Identificación comercial publicada. Verifica los datos ante SUNAT regularmente.':'La identificación legal todavía NO se publica. El registro de reclamos está cerrado hasta su verificación.';
 await refreshComplaints();
}
form?.addEventListener('submit',async e=>{
 e.preventDefault();if(!await isAuthorized())return;
 const fields={};
 for(const key of ['commercial_name','legal_name','ruc','fiscal_address','service_email','service_phone','privacy_email'])
  fields[key]=String(form.elements[key].value||'').trim();
 fields.published=Boolean(form.elements.published.checked);
 if(fields.published&&(!/^\d{11}$/.test(fields.ruc)||!fields.legal_name||!fields.fiscal_address||!fields.service_email||!fields.service_phone||!fields.privacy_email)){
   status.textContent='Falta validar RUC (11 cifras), razón social, domicilio, correo, teléfono o privacidad.';
   return;
 }
 const button=form.querySelector('button[type=submit]');button.disabled=true;
 status.textContent='Guardando configuración legal...';
 const {error}=await db.from('legal_provider_settings').update({...fields,updated_at:new Date().toISOString()}).eq('id',1);
 status.textContent=error?'No se pudo guardar: '+errorText(error):fields.published?'Identificación publicada. El Libro de Reclamaciones ahora puede registrar hojas. Mantén un responsable que las atienda.':'Configuración guardada SIN publicación; el libro continúa desactivado.';
 button.disabled=false;
});
function fieldRow(label,value){
 const p=element('p');
 p.append(element('strong',label));
 p.append(element('span',String(value??'—')));
 return p;
}
async function refreshComplaints(){
 const {data,error}=await db.from('consumer_complaints').select('*').order('created_at',{ascending:false}).limit(100);
 if(error){$('complaintsAdminStatus').textContent='No se pudieron consultar reclamaciones: '+errorText(error);return;}
 records=data||[];
 $('complaintsAdminStatus').textContent=records.filter(x=>x.status!=='respondido').length+
 ' reclamaciones pendientes o en gestión entre las últimas '+records.length+
 '. El plazo legal de respuesta es de 15 días hábiles no prorrogables. Revisa feriados, fecha de recepción y constancias de envío.';
 list.replaceChildren();
 if(!records.length){list.append(element('p','Todavía no hay reclamaciones registradas.'));return;}
 for(const claim of records){
  const card=element('article',undefined,'complaint-admin-card');
  const header=element('header');
  header.append(element('strong',claim.reference_code+' · '+claim.complaint_type.toUpperCase()));
  header.append(element('span',new Date(claim.created_at).toLocaleString('es-PE',{timeZone:'America/Lima'})+' · '+claim.status));
  card.append(header);
  const details=element('details');
  details.append(element('summary','Ver información y gestionar la respuesta'));
  const fields=element('div',undefined,'complaint-admin-fields');
  for(const [label,key] of [
   ['Nombre', 'consumer_full_name'],['Documento','consumer_document_number'],['Correo','consumer_email'],
   ['Teléfono','consumer_phone'],['Domicilio','consumer_address'],['Representante','guardian_full_name'],
   ['Producto o servicio','product_description'],['Monto (S/)','amount'],
   ['Detalle','complaint_details'],['Pedido','consumer_request']]){
   if(claim[key])fields.append(fieldRow(label,claim[key]));
  }
  details.append(fields);
  const actions=element('div',undefined,'complaint-admin-response');
  const info=element('p','La respuesta debe enviarse por escrito al consumidor, a su correo o domicilio según corresponda. Registrar una respuesta aquí NO envía correos. Conserva el mensaje enviado y su constancia de entrega.');
  actions.append(info);
  const textLabel=element('label','Texto de respuesta');
  const answer=element('textarea');answer.rows=5;answer.maxLength=4000;answer.value=claim.response_text||'';
  textLabel.append(answer);actions.append(textLabel);
  const evidenceLabel=element('label','Constancia o referencia de envío de respuesta (fecha, medio, archivo interno)');
  const evidence=element('input');evidence.type='text';evidence.maxLength=400;evidence.value=claim.response_evidence||'';
  evidenceLabel.append(evidence);actions.append(evidenceLabel);
  const email=element('button','Preparar correo para responder');email.type='button';
  email.addEventListener('click',()=>{
    const subject='Respuesta a '+claim.reference_code+' · Miami Store';
    const body='En atención a su '+claim.complaint_type+' '+claim.reference_code+':\n\n'+answer.value.trim()+'\n\nAtentamente,\nAtención al consumidor · Miami Store';
    const a=document.createElement('a');a.href='mailto:'+encodeURIComponent(claim.consumer_email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    a.click();
  });
  actions.append(email);
  if(claim.status!=='respondido'){
   const done=element('button','Registrar respuesta ya enviada');done.type='button';
   done.addEventListener('click',async()=>{
    if(answer.value.trim().length<10||evidence.value.trim().length<5){
      alert('Redacta la respuesta completa y registra evidencia del envío al consumidor.');return;
    }
    if(!confirm('Confirma que YA enviaste la respuesta al consumidor por un medio comprobable. Este botón NO envía mensajes.'))return;
    done.disabled=true;
    const {error}=await db.from('consumer_complaints').update({status:'respondido',response_text:answer.value.trim(),response_evidence:evidence.value.trim(),response_at:new Date().toISOString()}).eq('folio_number',claim.folio_number);
    if(error){alert('No se pudo guardar: '+errorText(error));done.disabled=false;return;}
    await refreshComplaints();
   });
   actions.append(done);
   const progress=element('button','Marcar en gestión');progress.type='button';
   progress.addEventListener('click',async()=>{
    const {error}=await db.from('consumer_complaints').update({status:'en_gestion'}).eq('folio_number',claim.folio_number);
    if(error){alert(errorText(error));return;}await refreshComplaints();
   });
   actions.append(progress);
  }
  details.append(actions);card.append(details);list.append(card);
 }
}
$('refreshComplaints')?.addEventListener('click',refreshComplaints);
$('exportComplaints')?.addEventListener('click',()=>{
 if(!records.length)return;
 const keys=['reference_code','created_at','complaint_type','consumer_full_name','consumer_document_type',
 'consumer_document_number','consumer_phone','consumer_email','consumer_address','product_kind',
 'product_description','amount','complaint_details','consumer_request','status','response_text','response_at','response_evidence'];
 const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
 const csv='\ufeff'+keys.map(quote).join(';')+'\r\n'+records.map(row=>keys.map(k=>quote(row[k])).join(';')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const href=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=href;a.download='miami-libro-reclamaciones-confidencial.csv';a.click();
 URL.revokeObjectURL(href);
 $('complaintsAdminStatus').textContent='Archivo confidencial exportado. Restringe su acceso y almacenamiento; contiene datos personales.';
});
init();
