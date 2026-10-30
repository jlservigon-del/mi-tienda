import {db,configured,currentUser,errorText} from './store-client.js';
const imageInput=document.getElementById('imageFile');
const uploadButton=document.getElementById('imageUpload');
const imageUrl=document.getElementById('image_url');
const preview=document.getElementById('imagePreview');
const status=document.getElementById('imageStatus');
const form=document.getElementById('productForm');
async function allowed(){
 if(!db||!configured)return false;
 const u=await currentUser();if(!u)return false;
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();
 return !error&&Boolean(data);
}
function showPreview(url){if(!url||!url.startsWith('https://')){preview.hidden=true;preview.removeAttribute('src');return;}preview.src=url;preview.hidden=false;}
imageUrl.addEventListener('change',()=>showPreview(imageUrl.value.trim()));
uploadButton.addEventListener('click',async()=>{
 const file=imageInput.files?.[0];
 if(!file){status.textContent='Selecciona una fotografía primero.';return;}
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){
  status.textContent='Solo se admiten JPG, PNG o WEBP de hasta 5 MB.';return;
 }
 if(!await allowed()){status.textContent='Necesitas iniciar sesión con una cuenta administradora.';return;}
 uploadButton.disabled=true;status.textContent='Subiendo fotografía de producto...';
 try{
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
  const sku=document.getElementById('sku').value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'')||'pendiente';
  const path='catalogo/'+sku+'/'+crypto.randomUUID()+'.'+ext;
  const {error}=await db.storage.from('miami-product-images').upload(path,file,{contentType:file.type,upsert:false});
  if(error)throw error;
  const {data}=db.storage.from('miami-product-images').getPublicUrl(path);
  imageUrl.value=data.publicUrl;showPreview(data.publicUrl);
  status.textContent='Fotografía subida. Pulsa Guardar cambios o Crear producto para vincularla definitivamente.';
 }catch(e){status.textContent='No se pudo subir la fotografía: '+errorText(e);}
 finally{uploadButton.disabled=false;}
});
form.addEventListener('reset',()=>{preview.hidden=true;preview.removeAttribute('src');imageInput.value='';});
