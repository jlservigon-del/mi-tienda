import {db,configured,money} from './store-client.js';
function getFavoriteIds(){
 try{
  const ids=JSON.parse(localStorage.getItem('miami-store-favorites-v1')||'[]');
  return Array.isArray(ids)?[...new Set(ids.filter(id=>typeof id==='string'&&/^[0-9a-f-]{36}$/i.test(id)))].slice(0,100):[];
 }catch{return [];}
}
const grid=document.getElementById('favoritesGrid');
const empty=document.getElementById('favoritesEmpty');
const status=document.getElementById('favoritesStatus');
function el(tag,text,css){
 const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(css)e.className=css;return e;
}
function card(p){
 const c=el('article',undefined,'favorite-card');
 c.dataset.productId=p.id;
 const figure=el('div',undefined,'favorite-image');
 if(/^https:\/\//i.test(p.image_url||'')){
  const img=document.createElement('img');img.loading='lazy';img.src=p.image_url;
  img.alt=(p.is_demo?'Imagen ilustrativa de ':'Fotografía de ')+p.name;
  figure.append(img);
 }else figure.append(el('span','Fotografía próximamente'));
 if(p.is_demo)figure.append(el('span','IMAGEN REFERENCIAL','favorite-demo-sticker'));
 c.append(figure);
 c.append(el('p',p.brand||p.category,'favorite-brand'));
 c.append(el('h2',p.name));
 c.append(el('p',p.is_demo?'Precio referencial: '+money(p.price):money(p.price),'favorite-price'));
 if(p.is_demo)c.append(el('p','Artículo de muestra, no disponible para compra','favorite-demo'));
 else if(p.stock<=0)c.append(el('p','Sin stock','favorite-demo'));
 const remove=el('button','Quitar de favoritos','favorite-remove');remove.type='button';
 remove.addEventListener('click',()=>{
  const remaining=getFavoriteIds().filter(id=>id!==p.id);
  try{localStorage.setItem('miami-store-favorites-v1',JSON.stringify(remaining));}catch{return;}
  document.dispatchEvent(new CustomEvent('miami:favorites-changed',{detail:{ids:remaining}}));
 });
 c.append(remove);
 const a=el('a','VER PRODUCTO','favorite-view');a.href='./producto.html?id='+encodeURIComponent(p.id);c.append(a);
 return c;
}
let renderVersion=0;
async function render(){
 const version=++renderVersion;
 const ids=getFavoriteIds();
 grid.replaceChildren();empty.hidden=true;
 if(!ids.length){status.textContent='0 productos guardados';empty.hidden=false;return;}
 if(!configured||!db){status.textContent='No es posible cargar tus favoritos ahora. Conservaremos tu lista en este navegador.';return;}
 status.textContent='Cargando favoritos...';
 const {data,error}=await db.from('products')
  .select('id,name,brand,category,image_url,price,stock,active,is_demo')
  .in('id',ids).eq('active',true);
 if(version!==renderVersion)return;
 if(error){status.textContent='No fue posible cargar los productos: '+error.message;return;}
 const byId=new Map((data||[]).map(p=>[p.id,p]));
 const products=ids.map(id=>byId.get(id)).filter(Boolean);
 grid.replaceChildren(...products.map(card));
 status.textContent=products.length+' productos guardados en este navegador.';
 empty.hidden=products.length!==0;
}
document.addEventListener('miami:favorites-changed',render);
window.addEventListener('storage',e=>{if(e.key==='miami-store-favorites-v1')render();});
render();
