import {db,configured,currentUser,money} from './store-client.js';
import {initShopHeader} from './shop-cart.js';
initShopHeader();
const $=id=>document.getElementById(id);
const config=window.STORE_CONFIG||{};
const KEY='miami_cart_v1';
let cart={};try{cart=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
let user=null,products=[],selected=null,orderId=null;
const options=[['yape','Yape'],['plin','Plin'],['transferencia','Transferencia bancaria']];
function msg(s){$('checkoutStatus').textContent=s;}
function configuredMethods(){return options.filter(([key])=>config.paymentAccounts?.[key]?.enabled===true);}
function renderPayments(){
 const root=$('paymentChoices');root.replaceChildren();
 for(const [key,label] of options){const enabled=Boolean(config.paymentAccounts?.[key]?.enabled);const wrap=document.createElement('label');wrap.className='payment-option'+(enabled?'':' off');const radio=document.createElement('input');radio.type='radio';radio.name='pay';radio.value=key;radio.disabled=!enabled;radio.checked=selected===key;radio.onchange=()=>{selected=key;renderDetails();updateSubmit();};const name=document.createElement('strong');name.textContent=label;const status=document.createElement('small');status.textContent=enabled?'Disponible':'Próximamente';wrap.append(radio,name,status);root.append(wrap);}
 if(!selected&&configuredMethods().length){selected=configuredMethods()[0][0];renderPayments();return;}
 renderDetails();updateSubmit();
}
function renderDetails(){
 const root=$('paymentDetails');root.replaceChildren();if(!selected)return;
 const info=config.paymentAccounts?.[selected];if(!info?.enabled)return;
 const fields=selected==='transferencia'?[['Titular',info.holder],['Banco',info.bank],['Cuenta',info.account],['CCI',info.cci]]:[['Titular',info.holder],['Número',info.phone]];
 for(const [label,value] of fields){if(!value)continue;const p=document.createElement('p');p.textContent=label+': '+value;root.append(p);}
 if(info.qrImage&&/^https:\/\//.test(info.qrImage)){const img=document.createElement('img');img.src=info.qrImage;img.alt='QR de pago de Miami Store';root.append(img);}
}
function updateSubmit(){const hasItems=products.length>0;const pay=config.paymentAccounts?.[selected];const detailComplete=pay?.enabled&&(selected==='transferencia'?!!(pay.holder&&pay.account&&pay.bank):!!(pay.holder&&pay.phone));$('submitOrder').disabled=!user||!hasItems||!detailComplete||!!orderId;}
async function init(){
 if(!configured||!db){msg('Servicio de compra no configurado.');return;}
 user=await currentUser();
 if(!user){$('checkoutSession').textContent='Debes iniciar sesión para registrar un pedido. Visita Mi cuenta.';msg('Identifícate desde la opción Mi cuenta.');}
 else {$('checkoutSession').textContent='Sesión iniciada. Comprobaremos que tu perfil de entrega esté completo.';const {data}=await db.from('customer_profiles').select('full_name,phone,address,dni').eq('user_id',user.id).maybeSingle();if(!data?.full_name||!data.phone||!data.address){msg('Completa primero tus datos personales y dirección en Mi cuenta.');user=null;}else{$('checkoutSession').textContent='Cliente: '+data.full_name;}}
 const ids=Object.keys(cart).filter(x=>/^[0-9a-f-]{36}$/i.test(x));
 if(!ids.length){$('summaryLines').textContent='Tu carrito está vacío.';renderPayments();return;}
 const {data,error}=await db.from('products').select('id,name,price,stock,active,is_demo').in('id',ids);
 if(error){msg('No se pudo validar el carrito: '+error.message);return;}
 products=(data||[]).filter(p=>p.active&&!p.is_demo&&p.stock>0&&cart[p.id]?.quantity>0);
 let total=0;const root=$('summaryLines');root.replaceChildren();
 for(const p of products){const qty=Math.min(cart[p.id].quantity,p.stock);p.quantity=qty;total+=p.price*qty;const line=document.createElement('div');line.className='checkout-line';const title=document.createElement('span');title.textContent=p.name+' × '+qty;const price=document.createElement('strong');price.textContent=money(p.price*qty);line.append(title,price);root.append(line);}
 $('checkoutTotal').textContent=money(total);
 if(products.length!==ids.length)msg('Algunos artículos del carrito ya no están disponibles. Regresa al carrito para revisar.');
 if(!configuredMethods().length)msg('Yape, Plin y transferencia están preparados, pero aún faltan los datos comerciales del titular. No se reciben pagos hasta configurarlos.');
 renderPayments();
}
$('submitOrder').onclick=async()=>{if(!user||!selected||orderId)return;const pay=config.paymentAccounts?.[selected];if(!pay?.enabled){msg('Medio de pago aún no disponible.');return;}const btn=$('submitOrder');btn.disabled=true;msg('Registrando pedido...');const {data,error}=await db.rpc('place_order',{p_items:products.map(p=>({id:p.id,quantity:p.quantity})),p_method:selected});if(error){msg('No se pudo registrar: '+error.message);btn.disabled=false;return;}orderId=data;localStorage.removeItem(KEY);window.dispatchEvent(new Event('storage'));msg('Pedido registrado. Realiza el pago únicamente con los datos confirmados y adjunta tu comprobante.');$('orderIdText').textContent='Número de pedido: '+data;$('proofBox').hidden=false;updateSubmit();};
$('uploadProof').onclick=async()=>{if(!orderId||!user)return;const file=$('proofFile').files?.[0];if(!file){$('proofStatus').textContent='Selecciona una imagen.';return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){$('proofStatus').textContent='Solo JPG, PNG o WEBP hasta 5 MB.';return;}const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];const path=user.id+'/'+orderId+'/'+crypto.randomUUID()+'.'+ext;const btn=$('uploadProof');btn.disabled=true;$('proofStatus').textContent='Subiendo comprobante...';const up=await db.storage.from('miami-payment-proofs').upload(path,file,{contentType:file.type,upsert:false});if(up.error){$('proofStatus').textContent=up.error.message;btn.disabled=false;return;}const {error}=await db.from('payment_proofs').insert({order_id:orderId,customer_id:user.id,storage_path:path});$('proofStatus').textContent=error?'Archivo recibido, pero el registro del comprobante requiere revisión: '+error.message:'Comprobante enviado. El administrador debe verificar el abono; tu pago sigue pendiente hasta entonces.';btn.disabled=false;};
init();