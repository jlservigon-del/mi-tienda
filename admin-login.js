import {db,configured,currentUser,errorText} from './store-client.js';
const form=document.getElementById('adminLoginForm');
const status=document.getElementById('adminLoginStatus');
const submit=document.getElementById('adminLoginBtn');
const forgot=document.getElementById('adminForgot');
function msg(text){status.textContent=text;}
async function isAdmin(user){
 if(!user||!db)return false;
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(error)throw error;
 return Boolean(data);
}
async function initialCheck(){
 if(!configured||!db){msg('No se pudo establecer conexión segura con Miami Store.');submit.disabled=true;return;}
 try{
 const user=await currentUser();
 if(user&&await isAdmin(user)){location.replace('./admin.html');return;}
 msg(user?'Esta sesión no tiene autorización administrativa. Ingresa con una cuenta administradora.':'Acceso exclusivo del personal autorizado.');
 }catch(e){msg('No pudimos verificar la sesión: '+errorText(e));}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!configured||!db)return;
 const email=String(form.elements.email.value).trim();
 const password=String(form.elements.password.value);
 submit.disabled=true;msg('Validando credenciales y permisos...');
 try{
  const {data,error}=await db.auth.signInWithPassword({email,password});
  if(error)throw error;
  if(!await isAdmin(data.user)){
    await db.auth.signOut();
    msg('Esta cuenta no tiene permiso para administrar Miami Store.');
    return;
  }
  form.elements.password.value='';
  msg('Acceso autorizado. Abriendo el panel...');
  location.replace('./admin.html');
 }catch(e){msg('No fue posible iniciar sesión: '+errorText(e));}
 finally{submit.disabled=false;}
});
forgot.addEventListener('click',async()=>{
 if(!db){msg('Conexión no disponible.');return;}
 const email=String(form.elements.email.value).trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg('Introduce primero el correo del administrador.');form.elements.email.focus();return;}
 forgot.disabled=true;
 const redirectTo=new URL('./cuenta.html',location.href).href;
 const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo});
 msg(error?'No se pudo procesar la recuperación: '+errorText(error):'Si existe una cuenta asociada, recibirás un correo para cambiar la contraseña. Revisa también spam.');
 forgot.disabled=false;
});
initialCheck();