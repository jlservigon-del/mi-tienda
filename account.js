import {db,configured,currentUser,errorText} from './store-client.js';
const $=id=>document.getElementById(id);const form=$('authForm');const mode=form.elements.mode;
function changeMode(){const registering=mode.value==='register';$('registerFields').hidden=!registering;for(const id of ['regFirst','regLast','regDni','regPhone','regAddress','regDistrict','privacyConsent'])$(id).required=registering;form.elements.password.autocomplete=registering?'new-password':'current-password';}
mode.addEventListener('change',changeMode);changeMode();
function profileFromRegister(){const first=$('regFirst').value.trim(),last=$('regLast').value.trim(),dni=$('regDni').value.trim(),phone=$('regPhone').value.trim(),address=$('regAddress').value.trim(),district=$('regDistrict').value.trim(),reference=$('regReference').value.trim();if(!/^[0-9]{8}$/.test(dni))throw Error('El DNI debe tener 8 dígitos.');if(!first||!last||!phone||!address||!district)throw Error('Completa todos los datos obligatorios.');return {first_name:first,last_name:last,full_name:first+' '+last,dni,phone,address,district,reference};}
async function saveProfile(user,payload){return db.from('customer_profiles').upsert({user_id:user.id,...payload},{onConflict:'user_id'});}
async function isStoreAdministrator(user){
 if(!user||!db)return false;
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(error)throw error;
 return Boolean(data);
}
async function refresh(){
 const user=await currentUser();
 $('session').textContent=user?'Sesión iniciada: '+user.email:'No has iniciado sesión';
 $('logout').hidden=!user;
 $('profileForm').hidden=!user;
 form.hidden=!!user;
 const rolePanel=$('adminRolePanel');
 const grid=$('customerAccountGrid');
 const orders=$('ordersSection');
 let administrator=false;
 if(user){
   try{administrator=await isStoreAdministrator(user);}
   catch(err){$('status').textContent='No pudimos comprobar tus permisos: '+errorText(err)+'. Puedes intentar desde Acceso administrativo.';}
 }
 rolePanel.hidden=!administrator;
 grid.hidden=administrator;
 orders.hidden=administrator;
 if(administrator){
   $('session').textContent='Administrador verificado: '+user.email;
   $('status').textContent='Cuenta administradora identificada correctamente.';
   return;
 }
 if(user){
   const {data,error}=await db.from('customer_profiles').select('*').eq('user_id',user.id).maybeSingle();
   if(error){$('status').textContent=errorText(error);return;}
   if(data){
      $('fullName').value=data.full_name||'';
      $('phone').value=data.phone||'';
      $('address').value=data.address||'';
      $('dni').value=data.dni||'';
      $('district').value=data.district||'';
      $('reference').value=data.reference||'';
   }else $('status').textContent='Completa tus datos para poder realizar pedidos.';
 }
}
$('status').textContent=configured?'Inicia sesión o registra tus datos para crear una cuenta.':'Falta configurar la conexión con Supabase.';
form.addEventListener('submit',async e=>{e.preventDefault();if(!db)return;const email=String(form.elements.email.value).trim(),password=String(form.elements.password.value);const register=mode.value==='register';let payload;try{if(register)payload=profileFromRegister();}catch(err){$('status').textContent=err.message;return;}const button=form.querySelector('button[type=submit]');button.disabled=true;$('status').textContent='Procesando solicitud...';try{const {data,error}=register?await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}):await db.auth.signInWithPassword({email,password});if(error)throw error;if(register){if(data.session&&data.user){const res=await saveProfile(data.user,payload);if(res.error)throw res.error;}else{sessionStorage.setItem('miamiPendingProfile',JSON.stringify({email,payload}));}$('status').textContent='Revisa tu correo y confirma la cuenta. Luego inicia sesión para finalizar el registro.';}else{if(data.user&&await isStoreAdministrator(data.user)){form.elements.password.value='';location.replace('./admin.html');return;}$('status').textContent='Sesión iniciada.';const raw=sessionStorage.getItem('miamiPendingProfile');if(raw){try{const pending=JSON.parse(raw);if(pending.email.toLowerCase()===email.toLowerCase()&&data.user){const res=await saveProfile(data.user,pending.payload);if(res.error)throw res.error;sessionStorage.removeItem('miamiPendingProfile');}}catch(err){$('status').textContent='Sesión iniciada. Completa o revisa tus datos de entrega.';}}}await refresh();}catch(err){$('status').textContent=errorText(err);}finally{button.disabled=false;}});
$('profileForm').addEventListener('submit',async e=>{e.preventDefault();const user=await currentUser();if(!user)return;const name=$('fullName').value.trim(),dni=$('dni').value.trim();if(dni&&!/^[0-9]{8}$/.test(dni)){$('status').textContent='DNI inválido: ingresa 8 dígitos.';return;}const parts=name.split(/\s+/);const payload={full_name:name,first_name:parts[0]||'',last_name:parts.slice(1).join(' '),dni:dni||null,phone:$('phone').value.trim(),address:$('address').value.trim(),district:$('district').value.trim(),reference:$('reference').value.trim()};const {error}=await saveProfile(user,payload);$('status').textContent=error?errorText(error):'Datos del cliente actualizados.';});
$('logout').addEventListener('click',async()=>{await db.auth.signOut();await refresh();});refresh();
$('adminRoleLogout').addEventListener('click',async()=>{const {error}=await db.auth.signOut();if(error){$('status').textContent=errorText(error);return;}location.replace('./admin-acceso.html');});
