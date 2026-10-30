import {db,configured,currentUser,money,el,errorText} from './store-client.js';
const $=id=>document.getElementById(id);let editing=null;
function msg(t){$('message').textContent=t;}
async function access(){
 if(!configured||!db){msg('No pudimos conectar con la base de datos.');return false;}
 const user=await currentUser();
 if(!user){location.replace('./admin-acceso.html');return false;}
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(error||!data){msg('Acceso restringido: esta cuenta no puede administrar Miami Store. Usa la cuenta autorizada.');return false;}
 $('panel').hidden=false;
 $('adminIdentity').textContent=user.email;
 $('adminIdentity').hidden=false;
 $('adminLogout').hidden=false;
 msg('Sesión de administrador activa. Puedes gestionar la información comercial.');
 return true;
}
$('adminLogout').addEventListener('click',async()=>{
 $('adminLogout').disabled=true;
 const {error}=await db.auth.signOut();
 if(error){msg('No se pudo cerrar sesión: '+errorText(error));$('adminLogout').disabled=false;return;}
 location.replace('./admin-acceso.html');
});
async function products(){const {data,error}=await db.from('products').select('*').order('created_at',{ascending:false});if(error){msg(errorText(error));return;}$('statsProducts').textContent=data.length;$('statsDemo').textContent=data.filter(p=>p.is_demo).length;$('statsStock').textContent=data.filter(p=>!p.is_demo).reduce((a,p)=>a+p.stock,0);$('productRows').replaceChildren();for(const p of data){const tr=el('tr');for(const v of [p.sku||'—',p.name,p.brand||'—',p.category,p.is_demo?'DEMO':'Real',money(p.price),String(p.stock),p.active?'Publicado':'Oculto'])tr.append(el('td',v));const td=el('td'),button=el('button','Editar');button.type='button';button.onclick=()=>{editing=p.id;for(const k of ['sku','name','category','brand','description','image_url','price','stock','color','variant_group'])$(k).value=p[k]??'';$('sizes').value=(p.sizes||[]).join(', ');$('active').checked=p.active;$('is_demo').checked=!!p.is_demo;$('save').textContent='Guardar cambios';window.scrollTo({top:0,behavior:'smooth'});};td.append(button);tr.append(td);$('productRows').append(tr);}}
$('productForm').addEventListener('submit',async e=>{e.preventDefault();if(!$('panel').hidden){const sku=$('sku').value.trim().toUpperCase();if(sku&&!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(sku)){msg('SKU inválido: utiliza letras mayúsculas, números, guiones o guiones bajos.');return;}if(!editing&&!sku){msg('Debes asignar un SKU al producto nuevo para controlar su inventario.');return;}const payload={...(sku?{sku}:{}),name:$('name').value.trim(),category:$('category').value.trim(),brand:$('brand').value.trim(),color:$('color').value.trim(),variant_group:$('variant_group').value.trim(),sizes:$('sizes').value.split(',').map(x=>x.trim()).filter(Boolean),description:$('description').value.trim(),image_url:$('image_url').value.trim(),price:Number($('price').value),stock:Number($('stock').value),active:$('active').checked,is_demo:$('is_demo').checked};if(payload.is_demo)payload.stock=0;if(payload.image_url&&!/^https:\/\//i.test(payload.image_url)){msg('La imagen debe tener URL HTTPS.');return;}const op=editing?db.from('products').update(payload).eq('id',editing):db.from('products').insert(payload);const {error}=await op;if(error){msg(errorText(error));return;}msg(editing?'Producto actualizado.':'Producto creado.');reset();await products();}});
function reset(){editing=null;$('productForm').reset();$('save').textContent='Crear producto';}
$('reset').onclick=reset;
async function orders(){const {data,error}=await db.from('orders').select('id,amount,payment_method,payment_status,order_status,created_at,customer_id').order('created_at',{ascending:false}).limit(100);if(error){msg(errorText(error));return;}$('statsOrders').textContent=data.length;$('orders').replaceChildren();const {data:proofRows}=data.length?await db.from('payment_proofs').select('order_id,storage_path').in('order_id',data.map(o=>o.id)):{data:[]};const proofs=new Map((proofRows||[]).map(p=>[p.order_id,p.storage_path]));for(const o of data){const tr=el('tr');for(const s of [o.id.slice(0,8),new Date(o.created_at).toLocaleDateString('es-PE'),money(o.amount),o.payment_method,o.payment_status,o.order_status])tr.append(el('td',s));const td=el('td'),select=el('select');for(const s of ['recibido','preparando','enviado','entregado','cancelado']){const opt=el('option',s);opt.value=s;select.append(opt);}select.value=o.order_status;select.onchange=async()=>{const {error}=await db.from('orders').update({order_status:select.value}).eq('id',o.id);msg(error?errorText(error):'Estado actualizado');};td.append(select);const paid=el('button','Confirmar pago');paid.disabled=o.payment_status==='verificado';paid.onclick=async()=>{if(!confirm('¿Verificaste el pago fuera de la aplicación?'))return;const {error}=await db.from('orders').update({payment_status:'verificado'}).eq('id',o.id);msg(error?errorText(error):'Pago marcado como verificado');if(!error)orders();};td.append(paid);if(proofs.has(o.id)){const view=el('button','Ver comprobante');view.type='button';view.className='proof-btn';view.onclick=async()=>{const {data:signed,error}=await db.storage.from('miami-payment-proofs').createSignedUrl(proofs.get(o.id),120);if(error){msg(error.message);return;}window.open(signed.signedUrl,'_blank','noopener,noreferrer');};td.append(view);}tr.append(td);$('orders').append(tr);}}
if(await access()){await products();await orders();}
