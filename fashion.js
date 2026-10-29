import {db,configured,money} from "./store-client.js";
import {addToCart} from "./shop-cart.js";
const slides=[...document.querySelectorAll(".slide")],dots=[...document.querySelectorAll(".dots button")];
let slideIndex=0;
function showSlide(index){slideIndex=(index+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle("active",i===slideIndex));dots.forEach((b,i)=>b.classList.toggle("on",i===slideIndex));}
document.querySelector(".prev")?.addEventListener("click",()=>showSlide(slideIndex-1));
document.querySelector(".next")?.addEventListener("click",()=>showSlide(slideIndex+1));
dots.forEach((b,i)=>b.addEventListener("click",()=>showSlide(i)));
setInterval(()=>{if(!document.hidden&&slides.length)showSlide(slideIndex+1)},6500);
const grid=document.getElementById("catalog"),status=document.getElementById("catalogStatus");
let products=[],tab="Todas";
function node(tag,content,cls){const e=document.createElement(tag);if(content!==undefined)e.textContent=content;if(cls)e.className=cls;return e;}
function item(p){
 const card=node("article",undefined,"item catalog-card");
 const photo=node("div",undefined,"pic");
 if(/^https:\/\//i.test(String(p.image_url||""))){const image=document.createElement("img");image.src=p.image_url;image.alt="Fotografía editorial ilustrativa de "+p.name;image.loading="lazy";image.onerror=()=>{image.style.display="none";photo.append(node("span","Imagen no disponible","image-placeholder"));};photo.append(image);}
 else photo.append(node("span","Fotografía por agregar","image-placeholder"));
 if(p.is_demo)photo.append(node("span","DEMO","demo-ribbon"));
 const info=node("div",undefined,"info");info.append(node("p",p.brand||p.category,"brand-label"),node("h3",p.name));
 info.append(node("div",money(p.price)+(p.is_demo?" · Precio de muestra":""),"price"+(p.is_demo?" product-price-reference":"")));
 const link=node("a","Ver producto ↗","catalog-detail");link.href="./producto.html?id="+encodeURIComponent(p.id);info.append(link);
 const btn=node("button",p.is_demo?"Solo demostración":p.stock>0?"Agregar al carrito":"Agotado","category-add");
 btn.disabled=Boolean(p.is_demo)||!(p.stock>0);
 btn.onclick=()=>addToCart(p);info.append(btn);card.append(photo,info);return card;
}
function render(){
 const q=(document.getElementById("homeSearch")?.value||"").trim().toLocaleLowerCase("es");
 const filtered=products.filter(p=>(tab==="Todas"||p.category===tab)&&(p.name+" "+p.category+" "+(p.brand||"")).toLocaleLowerCase("es").includes(q));
 grid.replaceChildren(...filtered.map(item));
 if(!filtered.length)grid.append(node("p","No se encontraron artículos para esta búsqueda. Cambia el término o la colección.","category-empty-message"));
 status.textContent=filtered.length+" referencias encontradas. Los artículos marcados DEMO usan fotografías y precios ilustrativos y no están a la venta.";
}
document.getElementById("homeSearch")?.addEventListener("input",render);
document.getElementById("catalogTabs")?.addEventListener("click",event=>{
 const b=event.target.closest("[data-home-filter]");if(!b)return;tab=b.dataset.homeFilter;
 document.querySelectorAll("[data-home-filter]").forEach(x=>x.classList.toggle("active",x===b));render();
});
async function load(){
 if(!configured||!db){status.textContent="Catálogo no disponible: conexión pendiente.";return;}
 const {data,error}=await db.from("products").select("id,name,brand,category,price,stock,image_url,is_demo").eq("active",true).order("created_at",{ascending:false}).limit(60);
 if(error){status.textContent="No se pudo cargar el catálogo: "+error.message;return;}
 products=data||[];render();
}
load();