# El Amigaso · Decisiones comerciales STP

Aplicación local Next.js con cinco páginas. Ejecuta npm ci y npm run dev; abre http://127.0.0.1:3000.

- **S · Qué se encontró:** señales y próximos pasos. **Mapa y gráficas** muestra concentración geográfica y compras por fecha, categoría, asesor y zona.
- **T · A quién priorizar:** selección humana por compra actual, potencial informado y viabilidad, limitada por capacidad.
- **P · Qué ofrecer:** beneficio, atención y medición por segmento; exporta el plan CSV.
- **Subir datos:** carga archivos y abre el tutorial con capturas de la consulta comprobada en ABAKO. Criterios y fichas comerciales quedan desplegables.
- **Guía de ABAKO:** última página, con los pasos completos para obtener datos actualizados o de otro periodo. El aviso del ejemplo enlaza directamente a esta guía.

Cada página muestra una explicación corta y un ejemplo ilustrativo desplegable. En T, los grupos de prioridad y los perfiles de S se distinguen explícitamente. La tabla muestra seis filas por página, con el rango y el total del grupo, botones Anterior/Siguiente y un contador independiente de plazas elegidas. Pulsar un grupo abre su lista; la capacidad limita la selección, no el número de clientes del grupo. En la simulación de regresión, Desarrollar (presentado como Aumentar compras) reúne 24 clientes: 6 En desarrollo, 12 Por recuperar y 6 Por captar; 21 son elegibles. Las cuatro páginas de la tabla conservan los 24, sin omitir registros.

En T, Potencial por estimar identifica los clientes sin esa estimación. El aviso distingue cuántos necesitan potencial mensual y cuántos viabilidad de atención; esos conteos pueden corresponder a las mismas tiendas. El Excel aporta compras realizadas, no estos dos juicios comerciales. Cada fila muestra todos los campos que faltan y enlaza a su ficha, que se abre con el cliente seleccionado. Un mes de ventas no sustituye la validación del asesor. La marca en textos es El Amigaso; el logo original se conserva.

Al abrir se carga automáticamente el Excel real **Facturación-2026-10-16T05_26_17.926Z.xlsx**, ubicado en **C:\Users\andre\Downloads**, con datos del **1 al 7 de septiembre de 2026**, descargado el **16 de octubre de 2026**. El aviso distingue el periodo de los datos y la fecha de descarga, e indica su ruta en ABAKO y su ruta local. **Usar Excel de ejemplo** permite volver a cargarlo después de probar otro archivo.

El servidor local lee el Excel de su ruta original mediante /api/ejemplo. No se copia el contenido a public ni al repositorio. El ejemplo se sirve únicamente desde localhost y no se habilita en Vercel. Si se mueve o elimina el archivo, la app permite cargar otro Excel y muestra el motivo. Las funciones de simulación permanecen únicamente como datos de prueba internos.

## Obtener el Excel detallado en ABAKO

1. Portal Transaccional → Reportes → Ventas → Facturación.
2. Filtrar: Fecha Inicial y Fecha Final. Deja vacíos cliente, producto y asesor para consultar toda la base autorizada. Si el mes es pesado, descarga semanas.
3. Campos: selecciona y **arrastra a Filas** Código Cliente, Cliente, Documento, Fecha, Código Artículo, Descripción Artículo, Categoría, Asesor, Latitud y Longitud. Marcar una casilla no basta. Añade Canal y Zona para comparar negocios; opcionales: Código Asesor, Segmento Cliente, Fecha Creación Cliente y Sector Productivo.
4. En Datos conserva Unidades, Subtotal, Costo, IVA, Otros Impuestos y Descuento. Marca Expandir en cada campo de Filas. Buscar; comprueba rango e ítems.
5. **Exportar → Excel - Todos los Registros.** Excel exporta el resumen; en esta prueba CSV generó un XLSX con estructura de resumen. Evita esas dos opciones.
6. En Subir datos selecciona juntos los Excel del periodo. Para patrones, reúne idealmente seis meses y confirma cobertura. Un día permite concentración y surtido, no patrones de meses.

Se verificó la exportación del 1 al 7 de septiembre de 2026 contra sus 10.916 filas. Los archivos empresariales permanecen en Descargas y no se distribuyen con el código.

## Importación y métricas

XLSX y CSV real con encabezados planos; hasta 36 archivos y 64 MB por archivo. Cada carga reemplaza la anterior. El lector detecta ZIP/XLSX aunque tenga extensión CSV, pero rechaza resúmenes sin campos requeridos. Omite grupos exactos repetidos y rechaza grupos contradictorios entre archivos.

Código de cliente + fecha + documento agrupa productos en una compra. NOMBRE [código] separa homónimos. Canal aporta tipo de negocio; categorías se cuentan desde las compras del periodo. Con al menos cuatro días de compra distintos, el ciclo inicial es la mediana entre fechas y requiere revisión comercial.

El detalle no incluye estado: se usa **subtotal reportado** de documentos con subtotal positivo, sin afirmar aprobación. No se descuenta Descuento otra vez. Subtotal y Costo se muestran separados; falta conciliar descuentos, devoluciones, notas crédito y costes operativos antes de calcular utilidad neta.

La bandeja anterior de 7 columnas sigue admitida: Factura, Cliente, Pedido, Forma de Pago, Estado, Asesor y Total. Usa APROBADO positivo; no alimenta mapa/productos. No se mezcla con el detalle. Resumen por asesor y recorrido GPS no sustituyen compras por cliente.

## Mapa y gráficas

Usa la última coordenada utilizable de cada cliente en el periodo, sin invertir latitud/longitud. Excluye vacías, cero y fuera del rango de Colombia (-5 a 14 de latitud; -82 a -66 de longitud). La intensidad depende del subtotal relativo, concentración y zoom. Es ubicación registrada, no recorrido ni ruta optimizada.

Muestra clientes ubicados / compradores y subtotal situado / total. Las ventas sin ubicación siguen en gráficas. Zonas vacías no demuestran ausencia de ventas. Asesor, segmento y zona filtran todas las vistas. Las tablas incluyen todos los grupos; las barras comparativas presentan los ocho mayores y la evolución conserva fechas observadas.

## Reglas y decisiones STP

Calcula importes, frecuencia, ticket, última compra y variación entre meses; aplica reglas visibles. No aprende, predice causas ni demuestra impacto. La caída del 30% es un corte de trabajo: exige dos meses completos, cobertura confirmada y al menos dos compras previas. La simulación incluye una caída del 50% para probarla.

Consolidados exige frecuencia, meses activos y compra mensual alta frente a la mediana del mismo tipo de negocio (al menos tres compradores) o un corte manual. Por recuperar exige cobertura confirmada y superar ciclos definidos. Por captar requiere prospecto declarado: la ausencia de registros no demuestra inactividad.

La agenda propone revisar recuperación, caídas, desarrollo, reposición y segunda compra. No estima ventas adicionales, habilidad del asesor ni rutas óptimas. T requiere potencial y viabilidad Alta o Media informados. P define propuestas y metas que deben validarse con clientes. Medir mejora requiere gestiones, compras posteriores y comparación adecuada.

La evaluación operativa usa meses calendario completos y cobertura confirmada en Subir datos. Los datos reales con cobertura pendiente solo habilitan revisión mediante gráficas; señales, selección y plan se habilitan después de confirmar los meses. El ejemplo parcial permanece como demostración, claramente identificado, sin equivaler a ventas de un mes completo. La frecuencia vuelve a expresarse en documentos y meses activos; no se extrapolan los importes parciales. La consolidación permite un mes activo como mínimo, mantiene el corte ajustable de seis documentos y se presenta como perfil preliminar. Para proponer revisar reposición se conservan compras en al menos dos fechas distintas; varios documentos del mismo día requieren confirmación y no prueban recompra.

La ficha opcional usa Cliente, TipoNegocio, Zona, PotencialMensual, CicloDias, Viabilidad, Prospecto, CategoriasCompradas y CategoriasObjetivo. Conserva NOMBRE [código] al cargar fichas del detalle. Categorías observadas salen del detalle; potencial, objetivo de surtido y viabilidad se validan con el equipo.

## Operación y verificación

Datos en memoria: navegar los conserva; recargar los borra. No hay endpoint de subida ni IA externa. El mapa usa cartografía OpenStreetMap; los registros se procesan en el navegador. No añadas archivos empresariales ni credenciales a Git.

npm test verifica importación, identidades, duplicados, fechas, cobertura, filtros, conciliación, STP, selección y CSV. npm run build compila para producción. Compatible con Vercel mediante preset Next.js; esta entrega sigue local.
