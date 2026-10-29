# Tienda Nova Studio — instalación y administración

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
