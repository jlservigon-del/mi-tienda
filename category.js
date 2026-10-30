import {db,configured,money} from './store-client.js';
import {addToCart} from './shop-cart.js';
const $=id=>document.getElementById(id);
const path=location.pathname.split('/').pop().toLowerCase();
const brandNames=["Michael Kors","Tommy Hilfiger","Lacoste","Calvin Klein","Ralph Lauren","Guess","Victoria's Secret","Bath & Body Works"];
const groups={"hombre.html":{label:"Hombre",terms:["hombre","masculino","men"]},"mujer.html":{label:"Mujer",terms:["mujer","femenino","women"]},"accesorios.html":{label:"Accesorios",terms:["accesorios","accesorio","complementos"]},"belleza.html":{label:"Belleza y fragancias",terms:["belleza","fragancias","cuidado corporal","cuidado personal","hogar & aromas"]}};
const brandQuery=new URLSearchParams(location.search).get('marca')||'';
const brandMode=path==="marca.html";
const chosenBrand=brandNames.find(b=>b.toLocaleLowerCase('es')===brandQuery.toLocaleLowerCase('es'))||null;
const group=groups[path]||groups["hombre.html"];
const label=brandMode?(chosenBrand||"Marca"):group.label;
document.title=label+" | Miami Store";
$("categoryTitle").textContent=label;
$("breadcrumbCurrent").textContent=label;
$("resultsTitle").textContent=brandMode?"Selección "+label:"Explorar "+label;
$("categoryDescription").textContent=brandMode?"Explora la selección de "+label+", filtra por precio y disponibilidad. Los artículos DEMO son únicamente ilustrativos.":"Explora, compara marcas y filtra por talla, precio y disponibilidad.";
let items=[];
const controlIds=["search","brand","size","minPrice","maxPrice","available","sort"];
const brandOf=p=>String(p.brand||"Sin marca especificada");
const sizesOf=p=>Array.isArray(p.sizes)?p.sizes.map(String):[];
const safeImg=url=>/^https:\/\//i.test(String(url||""));
const text=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e;};
function fillOptions(id,values){const select=$(id),first=select.firstElementChild;select.replaceChildren(first);for(const val of [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"))){const option=text("option",val);option.value=val;select.append(option);}}
function card(p){
 const article=document.createElement("article");article.className="item catalog-card";
 const photo=document.createElement("div");photo.className="pic";
 if(safeImg(p.image_url)){const img=document.createElement("img");img.src=p.image_url;img.alt="Fotografía del producto "+p.name;img.loading="lazy";img.decoding="async";photo.append(img);}
 else photo.append(text("span","Fotografía próximamente","image-placeholder"));
 if(p.is_demo)photo.append(text("span",p.variant_group?"FOTO REAL · PENDIENTE":"MUESTRA / DEMO","demo-ribbon"));
 const info=document.createElement("div");info.className="info";
 info.append(text("p",brandOf(p),"brand-label"),text("h3",p.name));
 const price=text("div",Number(p.price)>0?money(p.price)+(p.is_demo?" · referencial":""):"Precio por confirmar","price");
 info.append(price);
 const detail=document.createElement("a");detail.href="./producto.html?id="+encodeURIComponent(p.id);detail.className="catalog-detail";detail.textContent="Ver detalles";info.append(detail);
 const add=document.createElement("button");add.className="category-add";
 add.disabled=Boolean(p.is_demo)||!(p.stock>0);
 add.textContent=p.is_demo?(p.variant_group?"Consultar disponibilidad":"Solo demostración"):p.stock>0?"Agregar al carrito":"Agotado";
 add.onclick=()=>addToCart(p);info.append(add);article.append(photo,info);return article;
}
function render(){
 const q=$("search").value.toLocaleLowerCase("es").trim(),brand=$("brand").value,size=$("size").value;
 const min=$("minPrice").value===""?0:Number($("minPrice").value),max=$("maxPrice").value===""?Infinity:Number($("maxPrice").value);
 const available=$("available").checked;
 let list=items.filter(p=>(p.name+" "+p.description+" "+brandOf(p)).toLocaleLowerCase("es").includes(q)&&(!brand||brandOf(p)===brand)&&(!size||sizesOf(p).includes(size))&&Number(p.price)>=min&&Number(p.price)<=max&&(!available||(p.stock>0&&!p.is_demo)));
 const sort=$("sort").value;
 if(sort==="priceAsc")list.sort((a,b)=>a.price-b.price);
 if(sort==="priceDesc")list.sort((a,b)=>b.price-a.price);
 if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"es"));
 const grid=$("categoryProducts");grid.replaceChildren(...list.map(card));
 $("resultsCount").textContent=list.length+" productos encontrados";
 $("empty").hidden=list.length!==0;
 const chips=$("filterChips");chips.replaceChildren();
 for(const label of [q,brand,size,min?("Desde S/ "+min):"",max!==Infinity?("Hasta S/ "+max):"",available?"Con stock":""]){if(label)chips.append(text("span",label));}
}
function reset(){for(const id of controlIds){const input=$(id);if(input.type==="checkbox")input.checked=false;else if(id==="sort")input.value="recent";else input.value="";}render();}
$("resetFilters").onclick=reset;$("emptyReset").onclick=reset;
for(const id of controlIds)$(id).addEventListener(["search","minPrice","maxPrice"].includes(id)?"input":"change",render);
async function init(){
 if(!configured||!db){$("dataStatus").textContent="No se pudo conectar con la base de datos.";render();return;}
 const {data,error}=await db.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 if(error){$("dataStatus").textContent="Error al cargar catálogo: "+error.message;render();return;}
 items=(data||[]).filter(p=>brandMode?Boolean(chosenBrand)&&brandOf(p)===chosenBrand:group.terms.includes(String(p.category||"").trim().toLocaleLowerCase("es")));
 fillOptions("brand",items.map(brandOf));fillOptions("size",items.flatMap(sizesOf));
 if(brandMode&&chosenBrand){$("brand").value=chosenBrand;}
 $("dataStatus").textContent=items.some(p=>p.is_demo)?"Los productos marcados DEMO son muestras editoriales, con fotografías y precios referenciales. No están disponibles para compra.":"Catálogo conectado a Miami Store en Supabase.";
 render();
}
init();