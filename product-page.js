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
 $("productDescription").textContent=p.is_demo?"Esta ficha es una simulación comercial de J&M Business; imagen, artículo y precio son referenciales.":p.description||"Descubre nuestra selección.";
 $("productPrice").textContent=money(p.price)+(p.is_demo?" · Precio ilustrativo":"");
 $("productStock").textContent=p.is_demo?"Solo exposición · No disponible para compra":p.stock>0?p.stock+" unidades en inventario":"Sin stock";
 $("productBadge").hidden=!p.is_demo;
 const img=$("productPhoto");if(/^https:\/\//.test(p.image_url||""))img.src=p.image_url;else img.style.display="none";img.alt="Fotografía de referencia de "+p.name;
 const page=categoryPages[p.category]||"belleza.html";$("backCategory").href="./"+page;$("backCategory").textContent=p.category;
 const size=$("productSize");for(const value of p.sizes||[]){const option=document.createElement("option");option.textContent=value;option.value=value;size.append(option);}if(!size.options.length){const option=document.createElement("option");option.textContent="Estándar";size.append(option);}
 $("productQty").max=String(Math.max(1,p.stock));
 const allowed=!p.is_demo&&p.stock>0;const add=$("productAdd");add.disabled=!allowed;add.textContent=p.is_demo?"Artículo de muestra — no comprar":allowed?"Agregar al carrito":"Agotado";
 add.onclick=()=>{const qty=Math.max(1,Math.min(p.stock,Number($("productQty").value)||1));for(let i=0;i<qty;i++)addToCart(p);$("productNote").textContent="Agregado al carrito."};
 $("productNote").textContent=p.is_demo?"Este artículo muestra cómo se presentará una ficha comercial. No forma parte del inventario disponible.":"Selecciona cantidad y agrégalo al carrito.";
}
load();