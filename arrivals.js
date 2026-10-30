import {db,configured,money} from './store-client.js';
const wrap=document.getElementById('arrivalsCards');
const items=['TH-BOL-001','TH-BOL-002','TH-BOL-003','MK-BOL-001','MK-BOL-002'];
async function init(){
 if(!wrap||!db||!configured)return;
 const {data,error}=await db.from('products')
   .select('id,sku,name,brand,color,image_url,price,stock,is_demo')
   .in('sku',items).eq('active',true).order('name');
 if(error){const p=document.createElement('p');p.textContent='No se pudo cargar la selección.';wrap.replaceChildren(p);return;}
 const available=(data||[]).filter(p=>!p.is_demo).sort((a,b)=>items.indexOf(a.sku)-items.indexOf(b.sku));
 if(!available.length){document.getElementById('novedades').hidden=true;return;}
 wrap.replaceChildren();
 for(const p of available){
  const card=document.createElement('a');card.className='arrivals-card';card.href='./producto.html?id='+encodeURIComponent(p.id);
  const photo=document.createElement('div');photo.className='arrivals-image';
  const image=document.createElement('img');image.src=p.image_url;image.alt='Bolso '+p.brand+' '+p.color;image.loading='lazy';image.decoding='async';
  photo.append(image);
  const details=document.createElement('div');
  const brand=document.createElement('p');brand.textContent=p.brand;
  const title=document.createElement('h3');title.textContent=p.name;
  const stock=document.createElement('small');stock.textContent=p.stock>0?'Disponible · '+p.stock+' unidades':'Sin stock';
  const price=document.createElement('strong');price.textContent=money(p.price);
  const cta=document.createElement('span');cta.textContent='Ver producto';
  details.append(brand,title,stock,price,cta);card.append(photo,details);wrap.append(card);
 }
 const previous=document.getElementById('arrivalsPrev'),next=document.getElementById('arrivalsNext');
 const scroll=(direction)=>{const first=wrap.firstElementChild;if(!first)return;const delta=first.getBoundingClientRect().width+20;wrap.scrollBy({left:direction*delta,behavior:'smooth'});};
 previous?.addEventListener('click',()=>scroll(-1));next?.addEventListener('click',()=>scroll(1));
}
init();