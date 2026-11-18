# Mesa de Ayuda UNIMINUTO — Soporte Técnico y Logística

Sistema de tickets con tablero de indicadores (SLA, tiempos de respuesta y resolución).
**Funciona sin servidor ni base de datos MySQL**: es HTML + CSS + JavaScript y los datos viven en un archivo del propio proyecto (`data/datos.js`).

## Cómo abrirlo

- **En tu computador:** doble clic en `index.html`.
- **En GitHub Pages:** sube el proyecto a un repositorio → *Settings* → *Pages* → *Deploy from a branch* → rama `main`, carpeta `/ (root)`. Queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

> Necesita internet solo para la tipografía, los íconos y la librería de gráficos (Chart.js). Sin conexión todo funciona, pero los gráficos no se dibujan.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Técnico | `alan.sastre@uniminuto.edu.co` (también `fabian.trillos@`, `maria.mateus@`, `andres.matiz@`, `ivan.serrato@`) | `Soporte2026` |
| Solicitante | `ana.martinez@uniminuto.edu.co` (y otros 9 de ejemplo) | `Demo2026` |

En la pantalla de inicio hay dos botones de **"Accesos de prueba"** que entran directamente.
Las cuentas nuevas creadas con *Registrarse* quedan como **solicitante**; un técnico puede darles el rol desde **Administración**.

## Funcionalidades

**Solicitante**
- Registrar solicitud: categoría (con su SLA visible), prioridad (Baja/Media/Alta) y descripción. Recibe un código tipo `ST-033` / `LG-012`.
- *Mis solicitudes*: estado, barra de progreso, tiempo restante del SLA e historial de cada ticket.

**Técnico**
- *Panel técnico*: filtros por estado, área, prioridad y buscador; flujo **Recibida → Asignada → En proceso → Resuelta**; archivar / restaurar; reasignar; comentarios y nota de solución; alerta de tickets vencidos.
- *Indicadores*: total, abiertas, resueltas, % de cumplimiento de SLA, promedio de respuesta y resolución; gráficos por estado, categoría, SLA y por día (14 días); carga por responsable. Filtro por área.
- *Administración*: dar o quitar el rol de técnico, editar el SLA de cada categoría, exportar CSV, respaldo JSON (exportar/importar), descargar `datos.js` y restablecer los datos de ejemplo.

## ¿Dónde se guardan los datos?

```
data/datos.js   ← la "base de datos" del proyecto (categorías, técnicos, usuarios, tickets)
```

1. La primera vez que alguien abre la app, se copia `data/datos.js` al almacenamiento del navegador (`localStorage`).
2. Todo lo que se haga (tickets nuevos, cambios de estado…) se guarda en ese navegador y sobrevive al cerrar la página.
3. Para que los cambios queden **en el repositorio** (y los vea cualquiera): *Administración → Descargar datos.js*, reemplaza `data/datos.js` y haz commit. Como el archivo trae una `version` nueva, todos los navegadores cargarán automáticamente los datos actualizados.

> GitHub Pages solo sirve archivos estáticos: una página web no puede escribir en el repositorio por sí sola. Por eso los cambios se guardan en el navegador y se "publican" reemplazando `datos.js`.

Las contraseñas se guardan cifradas con SHA-256 (`correo:clave`). Al ser un prototipo sin servidor, **no uses contraseñas reales**.

## Estructura

```
index.html          ← única página (la app usa rutas #/panel, #/indicadores, etc.)
css/estilos.css     ← diseño (colores institucionales, responsive)
js/db.js            ← capa de datos: reemplaza MySQL + PHP (reglas del flujo, SLA, exportaciones)
js/app.js           ← pantallas y eventos
data/datos.js       ← datos (semilla)
assets/             ← (opcional) pon aquí logo-uniminuto.png y aparecerá en el menú
version-php/        ← versión anterior en PHP + MySQL, conservada como referencia
```

## Cómo se calculan los indicadores

Igual que la vista SQL `vista_indicadores` de la versión anterior (ver `js/db.js`, función `fila`):

| Indicador | Cálculo |
|---|---|
| Tiempo de respuesta | `horas_respuesta` = creación → asignación |
| Tiempo de resolución | `horas_resolucion` = creación → cierre |
| Cumplimiento de SLA | `estado_sla`: *Cumple* / *No cumple* / *Abierto*, según `sla_horas` de la categoría |
| % Cumplimiento | resueltas que cumplen ÷ total resueltas |

SLA de ejemplo: Red 4 h · Software 8 h · Hardware 24 h · Préstamo de equipo 24 h · Despacho/Envío 48 h · Otro 48 h (se cambian en *Administración*).

## Power BI / Looker Studio

Usa **Exportar CSV** (panel, indicadores o administración). Genera `indicadores_tickets.csv` con las mismas columnas que la antigua vista SQL.

- **Power BI:** *Obtener datos → Texto/CSV* → `indicadores_tickets.csv`. Medidas sugeridas:
  ```
  Total Solicitudes = COUNTROWS(indicadores_tickets)
  % Cumplimiento SLA = DIVIDE(
      CALCULATE([Total Solicitudes], indicadores_tickets[estado_sla] = "Cumple"),
      CALCULATE([Total Solicitudes], indicadores_tickets[estado] = "Resuelta"))
  Promedio Horas Resolución = AVERAGE(indicadores_tickets[horas_resolucion])
  ```
- **Looker Studio:** sube el CSV a Google Sheets y conéctalo como fuente de datos.
