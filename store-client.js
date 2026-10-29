import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm';
const c=window.STORE_CONFIG||{};
export const configured=Boolean(/^https:\/\/.+\.supabase\.co$/.test(c.supabaseUrl||'')&&c.supabasePublishableKey);
export const db=configured?createClient(c.supabaseUrl,c.supabasePublishableKey):null;
export const money=n=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(Number(n));
export const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
export async function currentUser(){if(!db)return null;const {data,error}=await db.auth.getUser();if(error)return null;return data.user;}
export function errorText(err){return err?.message||'No se pudo completar la operación';}