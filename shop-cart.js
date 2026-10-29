import {db,currentUser,money} from './store-client.js';
const KEY='miami_cart_v1';let items={};try{items=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
const shell=document.createElement('div');shell.innerHTML='<div id="miniOverlay" class="mini-overlay" hidden></div><aside id="miniCart" class="mini-cart" aria-label="Carrito de compras" aria-hidden="true"><div class="mini-top"><h2>Mi carrito</h2><button id="miniClose" aria-label="Cerrar carrito">×</button></div><div id="miniLines" class="mini-lines"></div><div class="mini-bottom"><strong id="miniTotal">S/ 0.00</strong><p>Podrás elegir Yape, Plin o transferencia en el siguiente paso, cuando estén disponibles.</p><button id="miniOrder" class="mini-action">Continuar al pago</button><p id="miniStatus" role="status"></p></div></aside>';document.body.append(...shell.children);
const $=id=>document.getElementById(id);function save(){localStorage.setItem(KEY,JSON.stringify(items));render();}
function open(){ $('miniCart').classList.add('open');$('miniCart').setAttribute('aria-hidden','false');$('miniOverlay').hidden=false;}
function close(){ $('miniCart').classList.remove('open');$('miniCart').setAttribute('aria-hidden','true');$('miniOverlay').hidden=true;}
$('miniClose').onclick=close;$('miniOverlay').onclick=close;
function render(){const count=Object.values(items).reduce((s,p)=>s+p.quantity,0);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=String(count));const lines=$('miniLines');lines.replaceChildren();let total=0;for(const p of Object.values(items)){total+=p.price*p.quantity;const row=document.createElement('div');row.className='mini-line';const text=document.createElement('span');text.textContent=p.name+' × '+p.quantity+' · '+money(p.price*p.quantity);const remove=document.createElement('button');remove.textContent='Quitar';remove.onclick=()=>{delete items[p.id];save()};row.append(text,remove);lines.append(row);}$('miniTotal').textContent='Total: '+money(total);if(!count)lines.textContent='Aún no tienes productos en el carrito.';$('miniOrder').disabled=count===0;}
export function addToCart(p){if(!p?.id||p.is_demo||!(Number(p.stock)>0))return;const old=items[p.id]?.quantity||0;items[p.id]={id:p.id,name:p.name,price:Number(p.price),quantity:Math.min(old+1,Number(p.stock))};save();open();}
export async function initShopHeader(){
 const actions=document.querySelector('.head-actions');
 if(actions){
   const priorAdmin=actions.querySelector('a[href="./admin.html"]');priorAdmin?.remove();
   let link=actions.querySelector('a[href="./cuenta.html"]');
   if(!link){link=document.createElement('a');link.href='./cuenta.html';actions.prepend(link);}
   link.dataset.accountLabel='';link.textContent='Mi cuenta';
   let button=actions.querySelector('.cart-header-button');
   if(!button){button=document.createElement('button');button.className='cart-header-button';button.type='button';
     button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1.3 12H5.3L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg> Carrito <b data-cart-count>0</b>';
     button.onclick=open;actions.append(button);}
   const u=await currentUser();
   if(u&&db){
     const [profile,admin]=await Promise.all([
       db.from('customer_profiles').select('first_name,full_name').eq('user_id',u.id).maybeSingle(),
       db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle()
     ]);
     link.textContent='Hola, '+(profile.data?.first_name||profile.data?.full_name?.split(' ')[0]||u.email.split('@')[0]);
     link.title='Mi cuenta · Editar mis datos';
     if(admin.data){const a=document.createElement('a');a.href='./admin.html';a.className='admin-link';a.textContent='Administrar';actions.insertBefore(a,button);}
   }
 }
 if(!document.querySelector('.mobile-category-nav')){
   const header=document.querySelector('.header');
   if(header){const nav=document.createElement('nav');nav.className='mobile-category-nav';nav.setAttribute('aria-label','Colecciones');
     for(const [label,href] of [['Inicio','./index.html'],['Hombre','./hombre.html'],['Mujer','./mujer.html'],['Accesorios','./accesorios.html'],['Belleza','./belleza.html']]){
       const a=document.createElement('a');a.textContent=label;a.href=href;nav.append(a);
     }
     header.after(nav);
   }
 }
 render();
}
$('miniOrder').onclick=()=>{if(!Object.keys(items).length)return;location.href='./checkout.html';};
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});render();