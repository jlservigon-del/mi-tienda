# Miami Store — cierre de advertencias de seguridad
**J&M Business | 29 de octubre de 2026**

## Estado verificado
**1. Función de pedidos privilegiada: RESUELTO (aviso retirado del Security Advisor).**
Anteriormente `public.place_order(jsonb,text)` era `SECURITY DEFINER` ejecutable por toda cuenta autenticada. La nueva implementación mantiene el mismo contrato con el checkout, pero la función pública es `SECURITY INVOKER` y se limita a insertar una solicitud de compra protegida por RLS en `public.order_checkout_requests`.

Un disparador de base de datos invoca `miami_internal.fulfill_order_checkout_request()`, que usa privilegios elevados exclusivamente para validar el perfil del comprador, el método de pago habilitado, los productos activos/no DEMO, el precio y el stock, y para crear el pedido con descuento de stock en una única transacción.

La función interna está fuera de los esquemas expuestos y no concede `EXECUTE` a `PUBLIC`, `anon` ni `authenticated`. Se verificó que el usuario autenticado puede invocar la función pública, pero no la interna; el anónimo no puede ejecutar ninguna.

### Pruebas realizadas
- **Compra autorizada temporal:** se creó en una transacción reversible un producto de prueba, perfil de prueba y método de pago temporal, se registró un pedido mediante el RPC como usuario autenticado y se confirmó que se crearon los ítems y se descontó el stock.
- **Reversión total:** después de `ROLLBACK` el producto, pedido y solicitudes temporales no persistieron; los métodos de pago regresaron a inactivos.
- **Método desactivado:** se comprobó que `place_order` sigue rechazando Yape cuando no está autorizado.
- **Security Advisor:** desapareció el aviso `authenticated_security_definer_function_executable`.

## 2. Protección contra contraseñas filtradas: PENDIENTE POR PLAN
La organización **J&M Business** usa el plan **Free** de Supabase. La protección nativa contra contraseñas comprometidas (HaveIBeenPwned) solamente se ofrece desde **Pro** según la documentación oficial.

No se actualizó el plan ni se generó ningún cargo. El aviso `auth_leaked_password_protection` permanece en el Security Advisor.

### Medidas de reducción de riesgo en la fase actual
- El formulario de **nuevos clientes** ahora exige un mínimo de **12 caracteres** desde el navegador, recomendando contraseñas únicas creadas por un gestor. Las cuentas ya existentes mantienen la posibilidad de iniciar sesión.
- El formulario de recuperación exige también una contraseña nueva de al menos 12 caracteres.
- La cuenta administradora se gestiona con Supabase Auth; las contraseñas no se publican en GitHub ni se almacenan en la base de datos comercial.

**Limitación:** estas validaciones de la interfaz **no sustituyen una regla de seguridad aplicada desde Supabase Auth**; los clientes de API pueden evitar la validación del navegador. Antes de lanzar al público, el propietario deberá configurar los requisitos de longitud y complejidad de contraseñas en **Supabase Dashboard > Authentication > Sign In / Providers > Email**, y recomendar MFA para administradores.

Para resolver el aviso remanente, el titular debe autorizar el paso a **Pro** y activar la opción de bloqueo de contraseñas filtradas desde ese panel. No se debe cambiar de plan sin autorización comercial expresa.

Referencias oficiales:
- https://supabase.com/docs/guides/auth/password-security
- https://supabase.com/docs/guides/observability/advisors?lint=0029_authenticated_security_definer_function_executable

## Pendiente para puesta en producción
- Prueba extremo a extremo autenticada desde la web con una cuenta de pruebas y pagos realmente autorizados.
- Configuración de contraseña robusta de lado servidor y MFA para el administrador.
- Revisión de la protección contra automatización, límites de compras y expiración de reservas de inventario.
- Políticas legales, comprobantes de pago, devolución y despacho.
