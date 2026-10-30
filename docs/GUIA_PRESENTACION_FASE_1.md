# Miami Store · Demostración comercial — Fase 1
**J&M Business · 29 de octubre de 2026**

## Objetivo de la reunión
Presentar una tienda multimarca con diseño premium, catálogo real, navegación por marcas y categorías, fichas, carrito y administración centralizada con Supabase. Se trata de una **primera fase demostrativa**, no un sitio habilitado para cobrar en producción.

## Accesos para demostración
- **Portada:** https://jlservigon-del.github.io/mi-tienda/
- **Hombre:** https://jlservigon-del.github.io/mi-tienda/hombre.html
- **Mujer:** https://jlservigon-del.github.io/mi-tienda/mujer.html
- **Accesorios:** https://jlservigon-del.github.io/mi-tienda/accesorios.html
- **Belleza:** https://jlservigon-del.github.io/mi-tienda/belleza.html
- **SALE:** https://jlservigon-del.github.io/mi-tienda/sale.html
- **Mi cuenta:** https://jlservigon-del.github.io/mi-tienda/cuenta.html
- **Acceso administrativo:** https://jlservigon-del.github.io/mi-tienda/admin-acceso.html
- **Checkout:** https://jlservigon-del.github.io/mi-tienda/checkout.html

## Guion de presentación (8–12 minutos)
1. **Identidad visual (1 min).** Abrir la portada desde arriba: cabecera, estética y propuesta multimarca.
2. **Marcas y novedades (2 min).** Desplazar las marcas horizontalmente; abrir New Arrivals con cinco bolsos fotografiados.
3. **Catálogo y ficha (2 min).** Seleccionar Accesorios; filtrar por marca; abrir un producto, revisar precio, stock y fotografía.
4. **Carrito (2 min).** Agregar una unidad, comprobar el importe y abrir la pantalla de checkout **sin confirmar pedido**.
5. **Gestión (2 min).** Mostrar la pantalla de acceso al panel; explicar cómo crear productos, subir imágenes, importar Excel/CSV, modificar precios y stock. Iniciar sesión solamente si el propietario lo decide, sin mostrar la contraseña a asistentes.
6. **Fase 2 (1–3 min).** Activación comercial de Yape/Plin, WhatsApp de ventas, pruebas de compra completa, políticas legales y automatización.

## Inventario de referencia comercial verificado en Supabase
| Producto | Precio | Stock |
|---|---:|---:|
| Tommy Hilfiger · Marrón | S/249 | 3 |
| Tommy Hilfiger · Azul marino | S/229 | 3 |
| Tommy Hilfiger · Negro | S/229 | 3 |
| Michael Kors · Beige/Camel | S/349 | 3 |
| Michael Kors · Rosa | S/349 | 3 |
| **Total** | | **15 unidades** |

El sistema contiene otros 13 artículos ilustrativos, señalados como DEMO, sin posibilidad de compra. El catálogo muestra **cero productos SALE** porque no hay rebajas verificadas publicadas.

## Hallazgos de QA pública
- Cargan correctamente las páginas Hombre, Mujer, Accesorios y Belleza, con filtros desde Supabase.
- Cargan el portal administrativo y su formulario de acceso; sin credenciales no se permite editar inventario.
- La página SALE carga sin 404 y no inventa descuentos.
- Portada: New Arrivals con 5 bolsos; tarjetas con imágenes y precios; carrusel de marcas.
- [Por finalizar en revisión final] comportamiento completo del carrito y del checkout desde navegador anónimo.
- El inicio de sesión y el panel **con la cuenta administradora real** aún deben probarse por el titular, ya que no se ha usado su contraseña.
- La importación de Excel/CSV y fotografía requiere una prueba autenticada antes de operar con inventario de mayor volumen.

## Límites y mensajes importantes
- **Yape, Plin y transferencias están preparados pero desactivados:** faltan datos comerciales verificados. Nunca mostrar números inventados.
- **WhatsApp está preparado, no activado:** falta el número comercial autorizado.
- **No se ha validado un pago real ni un pedido end-to-end autenticado.**
- **Los productos de muestra no se venden.** Las referencias reales requieren validación comercial de procedencia/autenticidad y políticas de entrega para apertura de ventas.
- Evitar prometer entregas gratuitas, certificados, autenticidad, descuentos o atención inmediata sin respaldo.
- No mostrar contraseñas, datos personales de clientes ni comprobantes a espectadores.

## Preguntas frecuentes del cliente
**¿Podré administrar mis productos?** Sí, desde el panel de administración con acceso autorizado a Supabase.
**¿Cómo actualizo el inventario?** Editando un SKU o importando un archivo CSV desde la plantilla Excel, con vista previa y confirmación.
**¿Qué sucede si un cliente agrega al carrito?** Puede revisar cantidades y subtotal; el cobro manual todavía no está activado.
**¿Cómo se activarán los pagos?** El titular verifica los datos comerciales de Yape/Plin/transferencia en Administración y se hacen pruebas seguras.
**¿Podré vender desde Facebook e Instagram?** Los perfiles están enlazados. El plan de mejora de redes pertenece a la siguiente etapa.

## Criterio de aceptación de Fase 1
Se considera **presentable como demostración funcional** si la portada, categorías, fichas, carrito, SALE y el acceso al panel cargan correctamente y no se induce a un cobro real.
Se considera **lista para ventas reales** solamente después de la configuración de cobros, validación de usuario administrador, pruebas end-to-end, operación de envío, políticas comerciales y revisión de seguridad.
