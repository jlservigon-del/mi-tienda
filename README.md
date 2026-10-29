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
