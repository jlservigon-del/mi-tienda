# Miami Store · Mejoras posteriores a la aceptación de Fase 1
**J&M Business · 5 de noviembre de 2026**

## Referencias y oportunidades
Se revisaron tres tiendas peruanas del sector, exclusivamente para estudiar patrones de UX del catálogo, sin copiar imágenes, marcas, textos ni material protegido de terceros:

- [Amphora — Carteras](https://amphora.pe/collections/carteras): filtros por tipo, color, precio y disponibilidad; tarjetas de producto limpias.
- [Renzo Costa — Carteras](https://www.renzocosta.com/mujer/carteras): navegación por silueta/tipo (minibags, hombro, totes) y variantes por color.
- [Parfois Perú — Carteras](https://parfois.pe/collections/carteras): filtros de color/precio, ordenamiento y acceso a colecciones.

## Implementado en Miami Store
- **Libro de Reclamaciones:** retirado el botón flotante fijo; enlace de texto en pie de página, sección "PROTECCIÓN AL CONSUMIDOR". No se modifica el formulario ni sus permisos. El registro continúa cerrado mientras no haya identidad empresarial verificada.
- **Filtro real por color:** todas las categorías (Hombre, Mujer, Accesorios, Belleza, Marcas y SALE) muestran selector de colores disponibles basado en Supabase. Se combina con marca, talla, rango de precios, disponibilidad y ordenamiento. Las tarjetas muestran el color cuando existe.
- **Mis favoritos:** icono de corazón en tarjetas de catálogo y fichas de producto; acceso desde cabecera, menú y pie de página; pantalla `favoritos.html` conectada al catálogo real. Los favoritos se guardan **solo en localStorage del navegador** (IDs), sin credenciales ni datos personales y sin modificar inventario ni reservar stock.
- **Responsivo:** controles adaptados a móviles, sin añadir cuadros que llenen la portada.
- **Comercio seguro:** los artículos DEMO continúan fuera de venta, sin promesas comerciales inventadas. Los precios, fotos de inventario y cantidades permanecen en Supabase.

## Archivos
- `legal-navigation.js`, `legal-pages.css`: Libro de Reclamaciones exclusivamente como texto en el footer.
- `category.js` y `hombre.html`, `mujer.html`, `accesorios.html`, `belleza.html`, `marca.html`, `sale.html`: selector por color y filtro de catálogo.
- `legal-navigation.js`, `wishlist.css`: navegación, botones visibles Guardar/Guardado, contador y gestión de favoritos locales.
- `favoritos.html`, `favorites-page.js`: vista de favoritos y acción de quitar productos.
- `fashion.js`, `product-page.js`: integración del botón de corazón en catálogo y fichas.

## Antes del lanzamiento comercial
- Verificar RUC, razón social y datos del proveedor para activar el Libro de Reclamaciones real.
- Revisar borradores legales con asesoría y confirmar vías de atención al consumidor.
- Probar el registro y la respuesta al reclamo completo, así como la compra autenticada, pagos y despachos antes de apertura.
- Mantener las ofertas SALE desactivadas hasta autorizar descuentos y precios anteriores verificables.
- Validar de forma periódica la experiencia en dispositivos móviles y la accesibilidad.

## QA final verificado en navegador (sin credenciales)
- Accesorios: filtro de color **Rosa** deja solo el bolso Michael Kors rosa de S/349; al limpiar vuelve a mostrar las cinco referencias reales.
- Accesorios: botón **Guardar** visible junto a la ficha del bolso Tommy Hilfiger marrón S/249; al pulsarlo cambia a **Guardado** y el contador de la cabecera muestra 1.
- Favoritos: el mismo bolso aparece correctamente con su precio; **Quitar de favoritos** actualiza la lista a cero y muestra el estado vacío.
- Libro de Reclamaciones: no existe botón flotante ni fijo; enlace de texto en **PROTECCIÓN AL CONSUMIDOR** en el footer y ruta correcta.
- No se generaron pedidos, cuentas o reclamaciones; no se modificaron precios, stock, promociones ni métodos de pago.
