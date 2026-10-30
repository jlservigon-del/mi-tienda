# Miami Store — instalación y administración

Sitio HTML/CSS/JavaScript desplegable en GitHub Pages. Contiene tienda, carrito, registro obligatorio con Supabase Auth, perfil del comprador, pedidos persistentes, pagos manuales Yape/Plin/transferencia y panel administrativo de productos, precios, imágenes (URL HTTPS), stock, pedidos y estados.

## Estado actual

**La base de datos NO está conectada.** La tienda mostrará "en preparación" y bloqueará pedidos hasta la configuración. El contenido anterior era de demostración y permanece oculto. No se han creado clientes reales, productos reales ni pagos. Nunca uses claves privadas en GitHub.

## Configuración necesaria

1. Crea tu proyecto en https://supabase.com/dashboard y registra su URL y **publishable key**, no secret key ni service_role. No existe todavía un proyecto conectado.
2. En Supabase → SQL Editor ejecuta el archivo `supabase/schema.sql` completo. Si hay errores, no habilites pedidos antes de resolverlos. Revisa las políticas de RLS.
3. En Supabase → Authentication → URL Configuration añade `https://jlservigon-del.github.io/mi-tienda/` como Site URL y `https://jlservigon-del.github.io/mi-tienda/cuenta.html` entre las Redirect URLs. Habilita el proveedor de correo con confirmación de email. Configura correctamente el servicio de emails para uso real.
4. Modifica `store-config.js` con la URL de tu proyecto y la publishable key. Ambas son públicas por diseño; **no agregues** contraseña de base de datos, service_role, clave secreta, claves bancarias ni tokens.
5. Abre `cuenta.html`, registra tu correo de administrador, confirma el email e inicia sesión. En SQL Editor, ejecuta el comando final comentado en el archivo SQL reemplazando por TU correo real para asignarte `admin_users`. Nunca autorices administradores por metadatos del navegador.
6. Ingresa a `admin.html`, crea productos con stock, precio y URL HTTPS de fotografía. El catálogo público leerá estos productos.
7. Configura los datos **reales** de Yape, Plin y transferencia en `store-config.js` después de verificar personalmente la titularidad. No hay pasarela de pago; todos los pedidos quedan pendientes de comprobación manual.
8. Haz un pedido de prueba con una segunda cuenta; comprueba stock, RLS, visualización por cliente y cambio de estados por admin. Revisa antes de vender en producción.

## Acceso

- `index.html`: catálogo, carrito y pedido con cuenta obligatoria.
- `cuenta.html`: correo, contraseña, nombre, celular y dirección.
- `admin.html`: acceso exclusivo de un usuario en `admin_users`.

## Seguridad y límites actuales

- Base de datos protege permisos mediante RLS, y la función transaccional `place_order` calcula importes con precios del servidor y descuenta stock bajo bloqueo.
- Nunca se puede confiar en precio o total enviados desde el navegador.
- Los pedidos no verifican transferencias automáticamente; requieren comprobación fuera del sistema. Marcar un pedido cancelado **no repone stock automáticamente** en esta primera versión: corregir inventario desde el panel y auditar antes de operar a escala.
- No hay subida de archivos: imágenes mediante URL HTTPS. Puedes usar tu propia carpeta de fotos pública o configurar Supabase Storage después.
- El panel permite hasta 100 pedidos recientes y no incluye reportes ni exportación.
- No existe cálculo de costo de envío, facturación electrónica, integración de courier ni comprobantes tributarios.
- Para operar con clientes reales debes preparar políticas de privacidad, consentimiento de tratamiento de datos, condiciones de venta y cumplimiento de normas aplicables en Perú.
- La versión de Supabase JS está fijada en `store-client.js`; revisa actualizaciones y dependencias antes de producción.

## Comprobaciones mínimas

Sin proyecto Supabase, todas las operaciones reales quedan inactivas. Una vez conectado: comprobar que un cliente no edita productos, ni visualiza pedidos ajenos; admin sí edita catálogo; cantidades no pueden volverse negativas; no puede ordenar más unidades que stock disponible. Deben ejecutarse pruebas RLS del lado de Supabase antes de recibir pedidos reales.


## Presentación comercial — sábado 31 de octubre de 2026

La página muestra una galería **DEMOSTRATIVA** con artículos y precios de referencia cuando el catálogo real está vacío. No representa inventario, pagos ni ventas reales. Cuando se publiquen productos reales desde el panel, la tienda cambiará al catálogo dinámico. El acceso al panel depende de iniciar sesión con la cuenta autorizada, no de conocer una contraseña compartida en mensajes.

**Checklist de presentación:** comprobar versión publicada en GitHub Pages, iniciar sesión administrador, crear un producto de prueba claramente identificado (y eliminarlo después), verificar pantalla móvil, registrar un cliente de prueba, revisar consentimiento y políticas antes de usar datos de clientes reales. No realizar transferencias reales durante la demo.

**Seguridad:** ante cualquier contraseña expuesta en una conversación, cambiarla en Supabase Auth y habilitar protección contra contraseñas filtradas si el plan lo permite. No compartir contraseñas por chat.

## Catálogo demostrativo J&M Business — octubre 2026

Se añadieron 13 productos de muestra en Supabase y el campo `products.is_demo` (true para artículos ficticios). Marcas de referencia: Tommy Hilfiger, Lacoste, Calvin Klein, Ralph Lauren, Guess, Victoria's Secret y Bath & Body Works.

**IMPORTANTE:** todas las fichas de muestra tienen `stock = 0`, precios ilustrativos y fotografías editoriales genéricas de Unsplash. No son fotografías verificadas de productos físicos ni prueban representación oficial o autenticidad. La tienda muestra DEMO en las tarjetas; no permite agregarlas al carrito; `place_order` rechaza pedidos que contengan muestras aun cuando un cliente altere el HTML.

### Páginas de demostración
- `/` — portada con campañas, carrusel, búsqueda y colecciones.
- `/hombre.html`, `/mujer.html`, `/accesorios.html`, `/belleza.html` — categorías con filtros.
- `/marca.html?marca=Bath%20%26%20Body%20Works` — colecciones por marca.
- `/marca.html?marca=Victoria%27s%20Secret` — sección Victoria's Secret.
- `/producto.html?id=UUID` — ficha individual con talla, presentación y cantidad.
- `/admin.html` — listado, edición de productos, marcas, tallas, distintivo DEMO y stock; métricas básicas.

### Para poner un producto a la venta
1. Obtener permiso de uso para la fotografía de producto, o tomar foto real del artículo.
2. Confirmar con el propietario marca, modelo, autenticidad, tallas y stock físico.
3. Actualizar precio real y descripción.
4. Desmarcar `DEMO` únicamente después de la validación comercial; registrar stock real.
5. Probar pedido con un cliente de pruebas, pago manual y descuento de inventario antes de operar en producción.

### Mejoras futuras
- Imágenes alojadas en Supabase Storage con permisos y estructura por producto.
- Inventario por SKU/talla/color (hoy el stock se contabiliza por producto general).
- Integración de pagos por pasarela autorizada y validación del pago con webhooks firmados en backend.
- WhatsApp Business Platform para tomar pedidos y avisar al dueño sobre ventas pendientes y stock bajo.
- Políticas comerciales, privacidad, devoluciones, envío y comprobantes según normativa de Perú.
- Analítica de GA4/Meta con configuración de consentimiento cuando corresponda.
- Ver `marketing/PLAN_CM_MIAMI_STORE.md` para el plan de Community Management de J&M Business.

### Seguridad
La interfaz, la clave publicable de Supabase y las fotografías de muestra son públicas. **Nunca subir** service_role, contraseñas, claves de pagos ni datos de clientes a GitHub. Revisar los avisos de seguridad en Supabase antes de activar cobros.

## Actualización — navegación, redes y pedidos (29/10/2026)

- Facebook compartido por J&M Business: https://www.facebook.com/share/19LYhWzg1d/?mibextid=wwXIfr
- Instagram compartido: https://www.instagram.com/miami.store.peru_/
- Los accesos se muestran en el pie de las páginas públicas mediante `social-links.js` / `social-links.css`; **no se ha realizado ninguna publicación** ni se han verificado estadísticas de los perfiles.
- Enlace de administración oculto del encabezado público; se muestra al iniciar sesión exclusivamente si el usuario pertenece a `admin_users`.
- `cuenta.html` incorpora **Mis pedidos**: historial de pedidos, estados de pago y entrega, y opción para adjuntar comprobante a un pedido pendiente desde almacenamiento privado (`my-orders.js`).
- Cancelar un pedido **no pagado** desde administración repone automáticamente el stock mediante trigger `miami_order_state_guard_trigger`. Los pedidos cancelados no pueden reabrirse y los pedidos en preparación/despachados exigen pago verificado.
- **Prueba SQL controlada:** se validó la restitución de unidades y la prohibición de reabrir un pedido cancelado dentro de una transacción con `ROLLBACK`. Ningún artículo ni pedido de prueba quedó persistido.

### Limitaciones que se mantienen

1. El checkout no procesa pagos: Yape/Plin/transferencia siguen sin activarse hasta la configuración aprobada por el propietario.
2. Los dos bolsos aportados usan fotografías reales de la referencia, pero carecen de precio, stock, modelo verificado y documentación comercial para venta.
3. Falta prueba autenticada de extremo a extremo con cliente y administrador, además de ajustes legales y de seguridad previos al lanzamiento.
4. No existe todavía automatización de WhatsApp ni de alertas al dueño.
5. En pedidos pagados, la cancelación y el reembolso deben gestionarse manualmente fuera del flujo automático actual.

Consulta `marketing/REDES_SOCIALES_MIAMI_STORE.md` para la hoja de ruta de Facebook e Instagram.

## WhatsApp de vendedores y apertura de la web (29 de octubre de 2026)

- La navegación de las páginas públicas y el panel incorpora `page-top.js`, que desactiva la restauración de posición y muestra la parte superior al entrar o recargar. Los enlaces con # conservan la navegación interna al hacer clic.
- Se retiraron las flechas de texto y los símbolos de verificación decorativos en páginas y productos dinámicos. Los controles anterior/siguiente del carrusel usan SVG.
- Se creó la tabla `store_contact_channels` con RLS; **solo administradores** pueden configurar el teléfono comercial de ventas.
- En `admin.html`, sección **WhatsApp de atención y ventas**, introducir teléfono con prefijo (por ejemplo, en Perú código 51 y 9 dígitos), un mensaje comercial de saludo y marcar autorización del propietario.
- Si el número no está verificado, la web muestra “WhatsApp: atención por habilitar” y no envía a un destino ficticio.
- Al activar un teléfono validado, `whatsapp-contact.js` genera el enlace seguro `https://wa.me/<numero>?text=<mensaje-codificado>`; el visitante abre WhatsApp y **debe pulsar Enviar**. Desde una ficha de producto el texto incluye el nombre de la referencia y el enlace a su página.
- **No es un chatbot** ni responde automáticamente: el envío de mensajes y las respuestas de vendedores ocurren dentro de WhatsApp. La integración WhatsApp Business Platform/Cloud API para agentes, alertas y pedidos será una fase posterior.
- Nunca solicitar o subir credenciales de WhatsApp ni números privados de trabajadores sin autorización.

## Inventario por Excel + fotografías (octubre 2026)
- Plantilla Excel entregada en la conversación: `Plantilla_Miami_Store_Productos_Stock.xlsx`; hojas `CATALOGO`, `INSTRUCCIONES`, `CONTROL`.
- Modelo CSV descargable desde administración: `plantilla-productos.csv`.
- `admin.html` incorpora el importador de CSV UTF-8 y fotografías; módulo `admin-bulk.js`.
- Una fila = un SKU único (variante de color o talla con existencia independiente); precio en PEN, stock total actual.
- El importador hace vista previa y confirma explícitamente ANTES de modificar productos; hasta 100 SKU por archivo.
- Si el SKU existe, actualiza ese registro; si no existe, crea una nueva referencia. No asigna stock ficticio a productos DEMO.
- Fotografías: nombres `SKU.jpg`, `SKU_2.jpg`, `SKU_3.jpg`; se suben a un bucket público `miami-product-images` para servir fotos de catálogo, pero la carga está restringida por RLS a administradores.
- Tamaño máximo por archivo de foto: 5 MB. No subir imágenes privadas ni de clientes a este bucket.
- Para actualizar por lote desde Excel, exportar únicamente la hoja CATALOGO como CSV UTF-8 (también compatible con delimitador punto y coma de Excel regional).
- Los primeros dos SKU `MK-BOL-001` y `MK-BOL-002` se asignaron a las variantes de bolsos Beige/Camel y Rosa; mantienen precio 0, stock 0, DEMO.
- **Limitación:** el proceso reemplaza el stock total almacenado por el número del Excel, no suma entradas de mercadería. Antes de operación real con pedidos concurrentes, añadir libro de movimientos, auditoría e importación con control de concurrencia por SKU.
- Pendiente de verificar: importación real en sesión autenticada; prueba web sin login confirma que el importador está protegido.

## Actualización comercial — cinco accesorios con inventario confirmado

- Se publicaron tres fotografías editadas (fondo blanco) de los bolsos Tommy Hilfiger en `assets/products/tommy-marron.webp`, `tommy-azul.webp` y `tommy-negro.webp`.
- El propietario informó los precios y existencias: `TH-BOL-001` marrón S/249 (3), `TH-BOL-002` azul S/229 (3), `TH-BOL-003` negro S/229 (3), `MK-BOL-001` beige S/349 (3), `MK-BOL-002` rosa S/349 (3).
- Total registrado: **15 unidades**, todas como productos activos no DEMO, cada color/modelo con SKU individual. Los demás 13 productos editoriales anteriores permanecen como DEMO sin stock.
- La portada ahora tiene carrusel horizontal de **8 marcas** con controles SVG y navegación táctil, incluyendo Michael Kors, y una galería horizontal de cinco accesorios en New Arrivals.
- Los pagos Yape/Plin/transferencia siguen desactivados hasta que el administrador introduzca y confirme sus datos. Registrar existencia real no habilita procesar dinero.
- Las fotografías generadas son versiones editadas a partir de las imágenes proporcionadas. Verificar con el comercio la exactitud del modelo y de las etiquetas antes de utilizarlas en publicidad definitiva.

## Navegación compacta: marcas, New Arrivals y SALE
- `index.html` usa un carrusel de marcas de UNA fila con desplazamiento horizontal, snap, botones SVG anterior/siguiente y soporte táctil. El CSS de corrección `storefront-refresh.css` se carga al final y se añade estilo base de fila como contingencia.
- `New Arrivals` aparece inmediatamente encima de *Explorar productos* y se carga automáticamente con artículos reales recientes de Supabase (no una lista fija por SKU). La portada incorpora el filtro `New Arrivals`.
- `SALE` aparece en el menú de navegación, menú móvil, filtros de la portada y `sale.html`.
- Tabla `public.products`: nuevos campos `is_sale boolean default false` y `compare_at_price numeric(12,2)`. La base prohíbe marcar SALE en un producto DEMO o sin precio anterior superior al de venta.
- Administración: marcar **SALE** y proporcionar el **precio anterior verificable** para publicar una liquidación real. Se muestran precio normal tachado, precio nuevo, descuento calculado y etiqueta SALE.
- La importación CSV admite opcionalmente columnas `sale` (SI/NO) y `precio_anterior_soles`, preservando el estado existente cuando faltan.
- Sin ofertas aprobadas, la página SALE permanece con un estado vacío. No se generan descuentos ficticios ni se modifican los precios de los cinco bolsos ya cargados.

**Validación:** Se comprobó la estructura de la base y se guardaron los cambios en GitHub. La última prueba de navegador capturó aún el HTML previo en la portada (posible retraso de despliegue o caché), por lo que es necesario recargar cuando GitHub Pages termine de publicar para confirmar visualmente el nuevo diseño. La página `sale.html` respondió sin error durante la prueba.
