import {db,configured,currentUser,money} from './store-client.js';
const $=id=>document.getElementById(id);
const host=$('customerOrders');
const status=$('customerOrdersStatus');
if(host&&status) init();
function el(tag,content,cls){const n=document.createElement(tag);if(content!==undefined)n.textContent=content;if(cls)n.className=cls;return n;}
const paymentText={pendiente:'Pendiente de verificar',verificado:'Pago verificado',rechazado:'Rechazado'};
const orderText={recibido:'Pedido recibido',preparando:'En preparación',enviado:'Enviado',entregado:'Entregado',cancelado:'Cancelado'};
async function init(){
 if(!db||!configured){status.textContent='La sección de pedidos requiere conectar la tienda.';return;}
 const user=await currentUser();
 if(!user){status.textContent='Inicia sesión para consultar tus pedidos.';host.hidden=true;return;}
 host.hidden=false;
 const {data:orders,error}=await db.from('orders').select('id,created_at,amount,payment_method,payment_status,order_status').order('created_at',{ascending:false}).limit(50);
 if(error){status.textContent='No pudimos cargar los pedidos: '+error.message;return;}
 if(!orders?.length){status.textContent='Aún no tienes pedidos registrados.';return;}
 status.textContent=orders.length+' pedido(s) encontrado(s).';
 const ids=orders.map(o=>o.id);
 const [lines,proofs]=await Promise.all([
  db.from('order_items').select('order_id,name,quantity,unit_price').in('order_id',ids),
  db.from('payment_proofs').select('order_id,storage_path').in('order_id',ids)
 ]);
 const byOrder=new Map(),byProof=new Set((proofs.data||[]).map(p=>p.order_id));
 for(const item of lines.data||[]){const list=byOrder.get(item.order_id)||[];list.push(item);byOrder.set(item.order_id,list);}
 host.replaceChildren();
 for(const o of orders){
  const card=el('article',undefined,'customer-order');
  const head=el('div',undefined,'customer-order-head');
  const id=el('h3','Pedido '+o.id.slice(0,8).toUpperCase());
  const date=el('span',new Date(o.created_at).toLocaleDateString('es-PE',{year:'numeric',month:'short',day:'numeric'}));
  head.append(id,date);
  const statuses=el('p',undefined,'customer-order-status');
  statuses.append(el('span',orderText[o.order_status]||o.order_status),el('span',paymentText[o.payment_status]||o.payment_status));
  const list=el('ul');
  for(const item of byOrder.get(o.id)||[])list.append(el('li',item.name+' × '+item.quantity));
  const summary=el('div',undefined,'customer-order-total');
  summary.append(el('span','Total: '+money(o.amount)),el('span','Pago: '+o.payment_method.toUpperCase()));
  card.append(head,statuses,list,summary);
  if(o.payment_status==='pendiente'&&o.order_status!=='cancelado'){
    if(byProof.has(o.id)){
      card.append(el('p','Comprobante recibido; en espera de revisión manual.','customer-order-note'));
    }else{
      const upload=el('div',undefined,'customer-proof');
      const label=el('label','Adjuntar comprobante para este pedido (máx. 5 MB)');
      const input=el('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';label.append(input);
      const btn=el('button','Enviar comprobante');btn.type='button';
      const msg=el('p','');msg.setAttribute('role','status');
      btn.onclick=async()=>{
       const file=input.files?.[0];if(!file){msg.textContent='Selecciona una imagen.';return;}
       if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){msg.textContent='Aceptamos JPG, PNG o WEBP de hasta 5 MB.';return;}
       btn.disabled=true;msg.textContent='Subiendo archivo...';
       const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
       const path=user.id+'/'+o.id+'/'+crypto.randomUUID()+'.'+ext;
       const uploaded=await db.storage.from('miami-payment-proofs').upload(path,file,{contentType:file.type,upsert:false});
       if(uploaded.error){msg.textContent='No se pudo adjuntar: '+uploaded.error.message;btn.disabled=false;return;}
       const inserted=await db.from('payment_proofs').insert({order_id:o.id,customer_id:user.id,storage_path:path});
       if(inserted.error){msg.textContent='El archivo se cargó, pero su registro requiere revisión. Comunícate con la tienda.';btn.disabled=false;return;}
       upload.replaceChildren(el('p','Comprobante recibido; la tienda debe validar el abono.','customer-order-note'));
      };
      upload.append(label,btn,msg);card.append(upload);
    }
  }
  host.append(card);
 }
}