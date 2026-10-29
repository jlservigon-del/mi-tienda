import {db,configured,currentUser,errorText} from './store-client.js';

const $=id=>document.getElementById(id);
const form=$('bulkImportForm');
const preview=$('bulkPreview');
const message=$('bulkStatus');
const photosForm=$('bulkPhotosForm');
const photosMsg=$('bulkPhotosStatus');
let ready=false;
let parsed=[];
let uploaded=new Map();
let existing=new Map();

function parseCSV(input){
 const text=input.replace(/^\uFEFF/,'');
 const head=text.split(/\r?\n/)[0]||'';
 const delimiter=(head.match(/;/g)||[]).length>(head.match(/,/g)||[]).length?';':',';
 let rows=[],row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){cell+='"';i++;}
   else quoted=!quoted;
  }else if(!quoted&&c===delimiter){row.push(cell);cell='';}
  else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('Hay comillas sin cerrar en el archivo CSV.');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(!rows.length)throw Error('El archivo CSV está vacío.');
 const headers=rows.shift().map(x=>x.trim().toLowerCase());
 const required=['sku','nombre','marca','categoria','color','talla','grupo_variantes','precio_soles','stock','foto_principal','foto_2','foto_3','descripcion','publicar','es_demo'];
 if(required.some(h=>!headers.includes(h)))throw Error('Los encabezados no coinciden con la plantilla. Exporta la hoja CATALOGO completa como CSV UTF-8.');
 if(new Set(headers).size!==headers.length)throw Error('Hay encabezados repetidos.');
 return rows.map((cells,i)=>{
  const out={};for(const [index,h] of headers.entries())out[h]=(cells[index]||'').trim();
  out.__row=i+2;return out;
 });
}
function yn(v,field,line){const val=String(v||'').trim().toUpperCase();if(!['SI','NO'].includes(val))throw Error('Fila '+line+': '+field+' debe ser SI o NO.');return val==='SI';}
function price(v,line){const num=Number(String(v||'').replace(/\s/g,'').replace(',','.'));if(!Number.isFinite(num)||num<0||num>10000000)throw Error('Fila '+line+': precio inválido.');return Math.round(num*100)/100;}
function textURL(url,line){
 const v=String(url||'').trim();
 if(v&&!/^https:\/\//i.test(v))throw Error('Fila '+line+': usa URL HTTPS para fotografías.');
 return v;
}
function fileDetails(name){const clean=name.trim().toUpperCase().replace(/\.(JPEG|JPG|PNG|WEBP)$/i,'');const m=clean.match(/^(.+?)(?:_([23]))?$/);
 if(!m||!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(m[1]))return null;
 return {sku:m[1],position:Number(m[2]||1)};
}
function fromCSV(row){
 const i=row.__row,sku=row.sku.toUpperCase();
 if(!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(sku))throw Error('Fila '+i+': SKU inválido (usa letras mayúsculas, números y guiones).');
 if(!row.nombre||row.nombre.length>120)throw Error('Fila '+i+': el nombre es obligatorio y no debe superar 120 caracteres.');
 if(!row.marca)throw Error('Fila '+i+': falta la marca.');
 if(!['Hombre','Mujer','Accesorios','Belleza'].includes(row.categoria))throw Error('Fila '+i+': categoría inválida.');
 const published=yn(row.publicar,'publicar',i),demo=yn(row.es_demo,'es_demo',i);
 const amount=price(row.precio_soles,i);
 const units=Number(row.stock);
 if(!Number.isSafeInteger(units)||units<0||units>1000000)throw Error('Fila '+i+': el stock debe ser un entero positivo o cero.');
 if(published&&!demo&&amount<=0)throw Error('Fila '+i+': un artículo real publicado debe tener precio mayor que cero.');
 let photo=textURL(row.foto_principal,i),second=textURL(row.foto_2,i),third=textURL(row.foto_3,i);
 const p=uploaded.get(sku)||{};
 photo=p[1]||photo;second=p[2]||second;third=p[3]||third;
 const old=existing.get(sku);
 photo=photo||old?.image_url||'';
 const gallery=[photo,second,third].filter(Boolean);
 if(published&&!photo)throw Error('Fila '+i+': antes de publicar, añade una fotografía principal.');
 return {sku,name:row.nombre,brand:row.marca,category:row.categoria,color:row.color||'',sizes:row.talla?[row.talla]:[],variant_group:row.grupo_variantes||'',price:amount,stock:demo?0:units,
   image_url:photo,gallery_urls:gallery.length?gallery:old?.gallery_urls||[],
   description:row.descripcion||'',active:published,is_demo:demo};
}
async function authorized(){
 if(!configured||!db){message.textContent='No hay conexión con Supabase.';return false;}
 const u=await currentUser();if(!u){message.textContent='Inicia sesión como administrador.';return false;}
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();
 if(error||!data){message.textContent='Tu cuenta no tiene acceso al importador.';return false;}
 return true;
}
async function setup(){
 ready=await authorized();if(!ready){form.hidden=true;photosForm.hidden=true;return;}
 form.hidden=false;photosForm.hidden=false;
}
setup();

form?.addEventListener('submit',async e=>{
 e.preventDefault();if(!ready)return;
 message.textContent='Analizando plantilla...';preview.replaceChildren();parsed=[];
 const file=$('bulkCsv').files?.[0];if(!file)return;
 if(file.size>1024*1024){message.textContent='Archivo demasiado grande (máximo 1 MB por lote).';return;}
 try{
  const rows=parseCSV(await file.text());
  if(rows.length>100)throw Error('Por seguridad, importa un máximo de 100 SKUs por lote.');
  const unique=rows.map(r=>r.sku.toUpperCase());
  if(new Set(unique).size!==unique.length)throw Error('Hay SKU duplicados dentro del Excel.');
  const {data,error}=await db.from('products').select('sku,image_url,gallery_urls').in('sku',unique);
  if(error)throw error;
  existing=new Map((data||[]).map(p=>[p.sku,p]));
  parsed=rows.map(fromCSV);
  const created=parsed.filter(p=>!existing.has(p.sku)).length;
  const updated=parsed.length-created;
  const demo=parsed.filter(p=>p.is_demo).length;
  const h=document.createElement('p');h.textContent=parsed.length+' SKU analizados · '+created+' nuevos · '+updated+' por actualizar · '+demo+' de demostración.';
  preview.append(h);
  const tbl=document.createElement('table');
  const head=document.createElement('tr');for(const label of ['SKU','Nombre','Precio S/','Stock','Acción']){const th=document.createElement('th');th.textContent=label;head.append(th);}tbl.append(head);
  for(const p of parsed.slice(0,20)){const tr=document.createElement('tr');for(const v of [p.sku,p.name,p.price.toFixed(2),String(p.stock),existing.has(p.sku)?'Actualizar':'Crear']){const td=document.createElement('td');td.textContent=v;tr.append(td);}tbl.append(tr);}
  preview.append(tbl);
  if(parsed.length>20){const more=document.createElement('p');more.textContent='Se muestran los primeros 20 de '+parsed.length+' registros.';preview.append(more);}
  $('bulkSubmit').disabled=false;
  message.textContent='Vista previa lista. Comprueba especialmente precio, foto, demostración y stock.';
 }catch(err){message.textContent=errorText(err);parsed=[];$('bulkSubmit').disabled=true;}
});
$('bulkSubmit')?.addEventListener('click',async()=>{
 if(!ready||!parsed.length)return;
 if(!confirm('Este proceso CREARÁ productos nuevos y REEMPLAZARÁ precios, stock y datos de los SKU existentes. ¿Confirmas que la plantilla está correcta?'))return;
 const btn=$('bulkSubmit');btn.disabled=true;message.textContent='Guardando '+parsed.length+' productos en Supabase...';
 // Una sola transacción de PostgREST por lote, máximo 100 filas.
 const {error}=await db.from('products').upsert(parsed,{onConflict:'sku'});
 if(error){message.textContent='No se completó la importación: '+errorText(error);btn.disabled=false;return;}
 message.textContent='Importación completada: '+parsed.length+' SKU registrados/actualizados. Actualiza Administración para ver el inventario.';
 parsed=[];preview.replaceChildren();$('bulkCsv').value='';
});

photosForm?.addEventListener('submit',async e=>{
 e.preventDefault();if(!ready)return;
 const files=[...($('bulkPhotos').files||[])];
 if(!files.length)return;
 if(files.length>40){photosMsg.textContent='Sube hasta 40 imágenes por lote.';return;}
 const btn=photosForm.querySelector('button[type=submit]');btn.disabled=true;photosMsg.textContent='Subiendo fotos...';
 let ok=0,errors=[];
 for(const file of files){
  const info=fileDetails(file.name);
  if(!info){errors.push(file.name+': nombre sin SKU válido');continue;}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){errors.push(file.name+': solo JPG, PNG o WEBP hasta 5 MB');continue;}
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
  const path='catalogo/'+info.sku+'/'+crypto.randomUUID()+'.'+ext;
  const {error}=await db.storage.from('miami-product-images').upload(path,file,{contentType:file.type,upsert:false});
  if(error){errors.push(file.name+': '+error.message);continue;}
  const {data}=db.storage.from('miami-product-images').getPublicUrl(path);
  const slot=uploaded.get(info.sku)||{};
  slot[info.position]=data.publicUrl;uploaded.set(info.sku,slot);
  ok++;
 }
 photosMsg.textContent=ok+' imagen(es) subidas correctamente. '+(errors.length?errors.slice(0,5).join(' | '):'Ahora selecciona el CSV y revisa la vista previa.');
 btn.disabled=false;
});