# Miami Store — cumplimiento normativo peruano: plan de activación
**J&M Business — 4 de noviembre de 2026**

## Alcance y estado real
Se implementaron una sección de Libro de Reclamaciones, páginas legales y una consola privada de administración. No se debe presentar el proyecto como totalmente regularizado ni como tienda con ventas habilitadas: todavía faltan la identificación oficial del proveedor, configuración operativa, comprobantes de pago, validación de políticas comerciales y evaluación jurídica.

### Requisitos y estado
| Elemento | Estado | Qué falta |
|---|---|---|
| Enlace permanente a Libro de Reclamaciones | Implementado | Validar aviso gráfico oficial (Anexo III) |
| Formulario virtual de reclamo / queja | Preparado, inactivo | Publicar datos reales de proveedor y verificar prueba de registro |
| Identificación legal (razón social, RUC, domicilio, email, teléfono) | Configurable en Administración | Confirmar RUC en SUNAT y completar datos reales |
| Hoja numerada y constancia imprimible | Código correlativo y vista imprimible implementados | Prueba integral con datos empresariales verificados |
| Reclamo de menor de edad y representante | Campos implementados | Revisión de criterio legal y de privacidad |
| Administración privada y evidencia de respuesta | Implementado | Designar responsable real y registrar cada envío |
| Plazo máximo de respuesta | Señalado: 15 días hábiles no prorrogables | Controlar feriados y plazo real; responder por correo o escrito |
| Conservación de las hojas | Tabla restringida sin permiso de borrado desde el panel | Política y respaldos durante periodo legal mínimo aplicable |
| Política de Privacidad / derechos ARCO | Borrador publicado | Completar titular, encargados, transferencias y correo ARCO |
| Términos de venta, envíos, cambios, garantías | Borrador publicado | Aprobar tarifas, políticas concretas y documento final |
| Facturación/comprobantes SUNAT e impuestos | No implementado | Definir régimen, comprobantes, IGV y tratamiento comercial |
| Medios de pago, cobros y devoluciones | Desactivados | Activación posterior con datos verificados del comercio |
| Cookies, publicidad y marketing | Sin píxeles de marketing activados | Revisar tecnologías adicionales y consentimiento si corresponde |
| Protección nativa contra contraseñas filtradas | Aviso pendiente por plan Supabase Free | Habilitar si se contrata plan con esa capacidad |

## Operación del Libro
1. Acceder a `admin.html` con la cuenta administradora.
2. En **Identificación empresarial y Libro de Reclamaciones**, registrar nombre comercial, razón social EXACTA, RUC de 11 dígitos, domicilio, correo y teléfono, y correo para ejercer derechos de datos personales.
3. Verificar todo contra los registros reales de SUNAT y marcar autorización de publicación. El formulario de `libro-reclamaciones.html` se habilita al publicarse.
4. Probar de extremo a extremo una reclamación controlada, verificar que el cliente pueda imprimir/guardar la constancia numerada y que aparezca en la consola sin exponer datos públicamente.
5. Designar una persona responsable de revisar reclamaciones **todos los días hábiles**. El plazo máximo es de **15 días hábiles no prorrogables**, no de 15 días calendario.
6. Responder por escrito, guardar evidencia del correo/carta entregada y registrar la constancia desde Administración. El botón «Registrar respuesta ya enviada» NO envía correos.
7. Asegurar respaldo operativo para fallas del servicio y archivo de reclamaciones y respuestas conforme a los plazos legales. Verificar con Indecopi el aviso gráfico oficial en el portal.
8. Si la empresa alcanza los umbrales vigentes para SIREC/Controla tus Reclamos, cumplir la obligación adicional de reporte aplicable.

## Normas y referencias oficiales
- Código de Protección y Defensa del Consumidor, Ley N.º 29571 y Ley N.º 32495 (libro visible en plataformas de comercio electrónico): https://busquedas.elperuano.pe/dispositivo/NL/2457203-1
- Indecopi, Libro de Reclamaciones (formato del Anexo I, aviso y plazo): https://consumidor.gob.pe/libro-de-reclamaciones/
- Indecopi, herramienta gratuita de generación del formato y aviso: https://consumidor.indecopi.gob.pe/tulibro/#/
- Ley N.º 29733 y Reglamento D. S. N.º 016-2024-JUS: https://www.gob.pe/institucion/anpd/normas-legales/6554453-n-016-2024-jus
- Orientación de derechos ARCO: https://www.gob.pe/9270

## Seguridad técnica aplicada
- `public.legal_provider_settings`: datos públicos solo cuando `published=true`; borradores editables únicamente por administrador con RLS.
- `public.consumer_complaints`: ningún usuario anónimo tiene permisos de lectura ni modificación; inserción condicionada a identidad del proveedor publicada; administradores pueden consultar y responder.
- `public.submit_miami_complaint`: función de usuario invocador, sin privilegios elevados, que genera folio y registra únicamente datos de la hoja.
- Disparador interno `miami_internal.guard_complaint_record`: impide alterar la hoja original, completa la identidad del proveedor, impone una limitación básica de frecuencia y separa campos de respuesta.
- No se usan números de cuenta ni RUC ficticios y no se envían reclamaciones reales en la prueba antes de verificar al proveedor.

## Limitaciones por cerrar
- La prueba inicial de la ruta de envío anónimo identificó un conflicto de permisos al evaluar una política de acceso a la identidad empresarial. Se corrigió separando políticas públicas y administrativas, pero la **prueba anónima de extremo a extremo sigue pendiente** hasta tener datos legítimos del titular. No considerar el libro operativo antes de verificarla.
- No existe proveedor de correo transaccional conectado; la copia al consumidor se ofrece para imprimir/guardar desde el navegador. La respuesta escrita al consumidor se gestiona manualmente con registro posterior de evidencia.
- La validación legal final debe realizarla un profesional peruano y el titular del comercio antes de ventas reales.
