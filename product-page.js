import {db,configured,money} from "./store-client.js";
import {initShopHeader,addToCart} from "./shop-cart.js";
initShopHeader();
const $=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get("id");
const categoryPages={Hombre:"hombre.html",Mujer:"mujer.html",Accesorios:"accesorios.html",Belleza:"belleza.html"};
async function load(){
 if(!configured||!db||!/^[a-f0-9-]{36}$/i.test(id||"")){$("productTitle").textContent="Producto no encontrado";return;}
 const {data:p,error}=await db.from("products").select("*").eq("id",id).eq("active",true).maybeSingle();
 if(error||!p){$("productTitle").textContent="Producto no disponible";return;}
 document.title=p.name+" | Miami Store";
 $("productBrand").textContent=p.brand||"Miami Store";$("productTitle").textContent=p.name;
 $("productDescription").textContent=p.is_demo?"Ficha de demostración con datos ilustrativos, sin stock real.":p.description||"Descubre nuestra selección.";
 $("productPrice").textContent=Number(p.price)>0?money(p.price)+(p.is_demo?" · Referencial":""):"Precio por confirmar";
 $("productStock").textContent=p.is_demo?(p.variant_group?"Pendiente de confirmar inventario":"Solo exposición · No disponible para compra"):p.stock>0?p.stock+" unidades en inventario":"Sin stock";
 $("productBadge").hidden=!p.is_demo;$("productBadge").textContent=p.variant_group?"FOTO REAL · DATOS POR CONFIRMAR":"ARTÍCULO DE MUESTRA";
 const img=$("productPhoto");if(/^https:\/\//.test(p.image_url||""))img.src=p.image_url;else img.style.display="none";img.alt="Fotografía del producto "+p.name;
 const page=categoryPages[p.category]||"belleza.html";$("backCategory").href="./"+page;$("backCategory").textContent=p.category;
 const size=$("productSize");for(const value of p.sizes||[]){const option=document.createElement("option");option.textContent=value;option.value=value;size.append(option);}if(!size.options.length){const option=document.createElement("option");option.textContent="Estándar";size.append(option);}
 $("productQty").max=String(Math.max(1,p.stock));
 if(p.variant_group){const {data:variants}=await db.from("products").select("id,color,image_url,is_demo,price,stock").eq("variant_group",p.variant_group).eq("active",true).order("color");const container=$("variantChoices");container.replaceChildren();for(const v of variants||[]){const a=document.createElement("a");a.className="variant-option"+(v.id===p.id?" selected":"");a.href="./producto.html?id="+encodeURIComponent(v.id);const thumbnail=document.createElement("img");thumbnail.src=v.image_url;thumbnail.alt="Color "+v.color;const caption=document.createElement("span");caption.textContent=v.color;a.append(thumbnail,caption);container.append(a);}$("variantBlock").hidden=!variants||variants.length<2;}
 const allowed=!p.is_demo&&p.stock>0;const add=$("productAdd");add.disabled=!allowed;add.textContent=p.is_demo?(p.variant_group?"Consultar disponibilidad":"Artículo de muestra — no comprar"):allowed?"Agregar al carrito":"Agotado";
 add.onclick=()=>{const qty=Math.max(1,Math.min(p.stock,Number($("productQty").value)||1));for(let i=0;i<qty;i++)addToCart(p);$("productNote").textContent="Agregado al carrito."};
 $("productNote").textContent=p.is_demo?"Producto de referencia visual no disponible para compra.":"El precio y la disponibilidad se confirmarán al registrar el pedido. Selecciona cantidad y agrega el producto al carrito.";
}
load();