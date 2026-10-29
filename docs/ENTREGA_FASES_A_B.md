# Miami Store · Entrega de fases A + B
29 de octubre de 2026 · J&M Business

## Fase A: imagen premium y pagos manuales
- Identidad de marca pulida con colores sobrios, tipografía editorial, menú móvil y carrito con icono vectorial en lugar de emoji.
- Carrito accesible desde la cabecera y desde `carrito.html`.
- Checkout independiente `checkout.html`.
- Tres opciones previstas: Yape, Plin y transferencia. **Todas están desactivadas** mientras falten los datos verificados del comercio.
- Configuración únicamente desde la cuenta administradora de Supabase en `admin.html`: sección *Pagos manuales*. El administrador puede ingresar titular, teléfono o banco/cuenta/CCI y activar cada método tras confirmar sus datos.
- El checkout lee el estado de los medios de pago desde la tabla `payment_methods`. No se aceptan pedidos si ninguno está habilitado. La función de Postgres `place_order` también comprueba esto en el servidor.
- Cuando un pedido real se registre, el comprador podrá adjuntar una imagen de comprobante. Se almacena en el bucket **privado** `miami-payment-proofs` y se relaciona en `payment_proofs`. Solo propietario y administrador pueden consultarla mediante permisos de Supabase.
- El administrador puede abrir la prueba del pago desde la lista de pedidos y marcar un pago como verificado después de comprobar el abono por medios externos.
- No se realizan cobros automáticos; tampoco se han incluido credenciales bancarias o llaves de tarjetas.
- **Limitación operativa**: en esta versión, el pedido descuenta stock al crearse aunque su pago esté pendiente; cancelaciones y reposición requieren gestión del administrador. Antes de lanzar ventas, implementar expiración de reservas y restitución de stock.

## Fase B: fotografías aportadas y variantes
Se incorporaron dos fotografías recibidas del cliente como archivos WebP comprimidos en:
- `assets/products/mk-camel.webp`
- `assets/products/mk-rosa.webp`

Son fotografías de producto aportadas por el cliente, pero no constituyen prueba de originalidad o autorización de uso de marca.

Ambas figuran bajo el mismo grupo `mk-crossbody-duotone`, con una variante por color. Se crearon dos registros en Supabase:
- **Beige/Camel**
- **Rosa**

Se muestran en la sección *New Arrivals*, en Accesorios y en sus fichas de producto. El usuario puede cambiar el color navegando entre variantes.
**Precio=0, stock=0, is_demo=true:** los precios, existencia, modelo comercial y autenticidad deben ser confirmados antes de permitir compras. La función de pedidos bloquea cualquier producto marcado DEMO.

El material cargado está optimizado para vista previa (320 px de ancho). Solicitar al cliente fotografías originales en mayor resolución, autorización de publicación, precio, referencia/modelo, SKU, política de garantía y stock real antes del lanzamiento.

## Datos que debe confirmar el propietario
1. Titular y número de Yape/Plin o cuenta bancaria comercial (solo en panel administrativo, no compartir contraseñas).
2. Precios reales de los dos bolsos y cantidad disponible por color.
3. Modelo comercial correcto, autenticidad y documentación de procedencia.
4. Políticas de envío, devoluciones y privacidad.
5. Fotografías finales de calidad e información de contacto comercial.

## Guion para mostrar al cliente
1. Abrir `index.html` y explicar el nuevo estilo premium y la sección New Arrivals.
2. Seleccionar el bolso beige y alternar a rosa en su ficha.
3. Mostrar que dice **Precio por confirmar** y que aún no acepta compras.
4. Abrir `carrito.html` y `checkout.html` para explicar el proceso Yape/Plin/transferencia.
5. Ingresar a `admin.html` con la cuenta autorizada para mostrar variantes, stock, pedidos y pagos configurables.
6. Dejar claro que la demo está lista para presentación pero aún no para procesar ventas reales.

## Seguridad
- El bucket para comprobantes es privado.
- No se almacenan contraseñas bancarias ni secretos en GitHub.
- Se mantienen las políticas RLS para clientes y administradores.
- El sistema impide que clientes compren productos DEMO o usen métodos de pago no habilitados.
- Pendientes antes de producción: pruebas autenticadas de extremo a extremo, protección de contraseñas filtradas en Supabase, revisión de las advertencias del asesor de seguridad, reserva/cancelación de inventario e información legal.
