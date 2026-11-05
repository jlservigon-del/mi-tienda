# Rediseño editorial Miami Store — noviembre 2026
**Referencia visual:** https://www.prune.com.pe/

## Principios
- Inspiración en patrones generales de e-commerce de moda (fotografía protagonista, blanco/negro, nav sencilla, tipografía editorial).
- Identidad propia de **Miami Store**; no se copiaron logos, banners, fotos, textos ni promociones de Prüne.
- Precios y stock siguen obteniéndose de Supabase; no se alteraron inventarios, políticas, roles ni pagos.
- Sin ofertas ficticias ni promesas de envío gratis.

## Cambios implementados
- Header blanco sticky, logotipo editorial centrado, menú lateral y navegación compacta.
- Slider de tres campañas con imágenes de bolsos proporcionadas por el propietario (Tommy marrón, Michael Kors camel, Tommy negro).
- New Arrivals con los productos reales más recientes y enlaces a ficha.
- Shop by Category con bloques visuales de Carteras, Mujer y Fragancias.
- Catálogo de cuatro columnas desktop / dos móvil. La selección destacada prioriza productos reales; las DEMO se pueden explorar en sus secciones.
- Carrusel de marcas en una sola fila, con controles SVG y soporte táctil.
- Bloques Beauty y SALE sin afirmar ofertas inexistentes.
- Misma estructura visual aplicada a páginas de categorías, fichas, Mi cuenta, carrito y checkout.
- Filtros desplegables en móviles para reducir la longitud de las páginas.
- WhatsApp solo se muestra cuando la empresa configure y verifique su teléfono comercial.

## Archivos relevantes
- `index.html` — portada rediseñada
- `editorial-miami.css` — diseño completo de la portada y cabecera pública
- `editorial-miami.js` — menú lateral y acceso rápido a búsqueda
- `editorial-inner.css` — coherencia visual en páginas interiores
- `listing-enhancements.js` — filtros plegables móviles
- `fashion.js` / `arrivals.js` — catálogo y novedades desde Supabase

## Verificación
Se realizó prueba pública de navegación en GitHub Pages con navegador. Confirmó:
- Nueva portada publicada.
- Menú hamburguesa abre y cierra.
- Hero con foto de bolso real.
- New Arrivals con referencias y precios.
- Categorías y ficha de bolso con stock y datos de Supabase.
- Catálogo y carrusel de marcas.
No se verificó exhaustivamente el diseño en un dispositivo móvil físico, ni una compra real autenticada.

## Limitaciones comerciales pendientes
- Activación de Yape/Plin/transferencia con datos autorizados.
- Número de WhatsApp empresarial verificado.
- Prueba integral de registro, compras, comprobantes y admin desde sesión real.
- Autorización de uso de fotografías, documentación de procedencia de artículos de marca y condiciones comerciales.
