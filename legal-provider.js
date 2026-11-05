import {db,configured} from './store-client.js';
export async function getVerifiedProvider(){
 if(!configured||!db)return null;
 const {data,error}=await db.from('legal_provider_settings')
   .select('commercial_name,legal_name,ruc,fiscal_address,service_email,service_phone,privacy_email,published')
   .eq('id',1).eq('published',true).maybeSingle();
 return error?null:data;
}
export function fillProviderFields(provider){
 for(const e of document.querySelectorAll('[data-provider]')){
  const field=e.getAttribute('data-provider');
  e.textContent=provider?.[field]||'Pendiente de verificación';
 }
}
const provider=await getVerifiedProvider();
fillProviderFields(provider);
document.dispatchEvent(new CustomEvent('miami-legal-provider',{detail:{verified:!!provider}}));
