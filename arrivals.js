import {db,configured} from './store-client.js';
const wrap=document.getElementById('arrivalsCards');
async function init(){
 if(!configured||!db)return;
 const {data,error}=await db.from('products').select('id,name,color,image_url,is_demo,price').eq('variant_group','mk-crossbody-duotone').eq('active',true).order('color');
 if(error||!data?.length){document.getElementById('novedades').hidden=true;return;}
 wrap.replaceChildren();
 for(const p of data){const card=document.createElement('a');card.href='./producto.html?id='+encodeURIComponent(p.id);card.className='arrivals-card';
 const image=document.createElement('img');image.src=p.image_url;image.alt='Fotografía proporcionada por el cliente: bolso color '+p.color;image.loading='lazy';
 const desc=document.createElement('div');const brand=document.createElement('p');brand.textContent='MICHAEL KORS · MARCA VISIBLE, POR VALIDAR';const title=document.createElement('h3');title.textContent='Bolso crossbody · '+p.color;const note=document.createElement('span');note.textContent='Ver detalles · Precio por confirmar';desc.append(brand,title,note);card.append(image,desc);wrap.append(card);}
}
init();