// Solo incluir URL y clave publicable (publishable/anon). NUNCA service_role ni secret keys.
window.STORE_CONFIG = {
  storeName: "Miami Store",
  supabaseUrl: "https://hzlkbzabtvtxldlyrjsf.supabase.co",
  supabasePublishableKey: "sb_publishable_Agi4rDyFRIKZEGbHoOj43g_zrwUAvYz",
  paymentInstructions: {
    yape: "Solicita al comercio el número de Yape antes de pagar.",
    plin: "Solicita al comercio el número de Plin antes de pagar.",
    transferencia: "Solicita al comercio los datos bancarios antes de transferir."
  }
};