# Amigazo · Inteligencia comercial

Aplicación Next.js con dos páginas: `/` analiza exportaciones de facturación de ABAKO y `/mapa` muestra un mapa de calor interactivo de Bogotá con 84 clientes ficticios, cargados mediante un botón.

## Ejecución

Node.js 20.9 o posterior.

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. Para validar: `npm test` y `npm run build`.

## Publicar en Vercel

El proyecto incluye `vercel.json`. Importa este repositorio en Vercel con el preset Next.js o ejecuta `npx vercel login` y `npx vercel --prod`. No requiere variables de entorno, base de datos ni clave de mapas. No subir archivos empresariales al repositorio.

## Archivo admitido

Excel `.xlsx` o CSV UTF-8, hasta 15 MB. Encabezados: `Factura`, `Cliente`, `Pedido`, `Forma de Pago`, `Estado`, `Asesor`, `Total`.

Factura debe contener identificador y fecha/hora: `EJ124509-2026-09-30 15:20`. Se preserva el prefijo del identificador. El parser admite importes numéricos, el texto de ABAKO `9,221,400` y formato colombiano `9.221.400,00`. Busca la primera hoja con los encabezados. Los CSV detectan separador automáticamente.

Cada carga reemplaza el archivo anterior. Los datos permanecen en memoria del navegador durante la navegación interna y se borran al recargar o cerrar. No existe endpoint de subida ni persistencia de información comercial. El archivo real del usuario no forma parte del proyecto ni de la demostración.

Se excluyen filas inválidas con un informe visible, se omiten duplicados exactos y se rechazan identificadores repetidos con contenido diferente. El filtro inicial incluye únicamente `APROBADO`. Los nombres se normalizan para agrupación; se requiere código de cliente para una integración futura robusta.

## Interpretación

- La moneda COP es un supuesto explícito. Total es el importe exportado; no equivale a ventas netas sin revisar impuestos y notas crédito.
- Los días sin registros no confirman ausencia de ventas. Los límites de número de factura y permisos de ABAKO pueden restringir la exportación.
- Recomendaciones descriptivas calculadas localmente; no se utiliza un modelo externo ni se afirma causalidad.
- La forma de pago no demuestra cobro. Los rankings no controlan por cartera o jornadas.
- El mapa utiliza datos completamente ficticios y no geocodifica nombres del Excel. Base cartográfica OpenStreetMap; necesita internet. Si falla el mapa base, la lista sigue disponible. Para un despliegue de alto tráfico debe configurarse un proveedor acorde a su política de uso.
- Los datos y mapas de prueba no representan rutas reales. Para esa fase hacen falta visitas/GPS con fecha y hora, códigos de cliente y coordenadas.

## Librerías

Next.js App Router, React, TypeScript, Recharts, ExcelJS, Papa Parse, Leaflet y Leaflet.heat. Diseño adaptable a escritorio y móvil.
