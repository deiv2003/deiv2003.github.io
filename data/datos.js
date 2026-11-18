/* =====================================================================
 *  data/datos.js — "Base de datos" del proyecto guardada en un archivo
 * ---------------------------------------------------------------------
 *  Reemplaza a sql/database.sql: aquí están las categorías (con su SLA),
 *  los técnicos, los usuarios y los tickets de ejemplo.
 *
 *  • La primera vez que se abre la app, estos datos se copian al
 *    almacenamiento del navegador (localStorage) y desde ahí se trabaja.
 *  • Para publicar datos nuevos en GitHub: en la app ve a
 *    Administración → "Descargar datos.js" y reemplaza este archivo.
 *  • Si cambias "version", todos los navegadores recargan esta semilla.
 *
 *  Contraseñas de prueba (se guardan cifradas con SHA-256):
 *    Técnicos ...... Soporte2026   (ej. alan.sastre@uniminuto.edu.co)
 *    Solicitantes .. Demo2026      (ej. ana.martinez@uniminuto.edu.co)
 *
 *  Fechas: cada ticket puede usar fechas absolutas (fecha_creacion,
 *  fecha_asignacion, fecha_cierre en formato ISO) o relativas
 *  (creado_hace_horas, asignado_tras_horas, cerrado_tras_horas).
 * ===================================================================== */
window.DATOS_INICIALES = {
  "version": "semilla-2026-11-18",
  "generado": "Datos de ejemplo. Las fechas son relativas al momento en que se abre la aplicación por primera vez.",
  "categorias": [
    {
      "id": 1,
      "nombre": "Software",
      "area": "Soporte Técnico",
      "prefijo": "ST",
      "sla_horas": 8
    },
    {
      "id": 2,
      "nombre": "Hardware",
      "area": "Soporte Técnico",
      "prefijo": "ST",
      "sla_horas": 24
    },
    {
      "id": 3,
      "nombre": "Red",
      "area": "Soporte Técnico",
      "prefijo": "ST",
      "sla_horas": 4
    },
    {
      "id": 4,
      "nombre": "Préstamo de equipo",
      "area": "Logística",
      "prefijo": "LG",
      "sla_horas": 24
    },
    {
      "id": 5,
      "nombre": "Despacho / Envío",
      "area": "Logística",
      "prefijo": "LG",
      "sla_horas": 48
    },
    {
      "id": 6,
      "nombre": "Otro",
      "area": "Soporte Técnico",
      "prefijo": "ST",
      "sla_horas": 48
    }
  ],
  "tecnicos": [
    {
      "id": 1,
      "nombre": "Maria Fernanda Mateus",
      "activo": true
    },
    {
      "id": 2,
      "nombre": "Andrés Matiz",
      "activo": true
    },
    {
      "id": 3,
      "nombre": "Iván Andrés Serrato",
      "activo": true
    },
    {
      "id": 4,
      "nombre": "Fabián David Trillos",
      "activo": true
    },
    {
      "id": 5,
      "nombre": "Alan Sastre",
      "activo": true
    }
  ],
  "usuarios": [
    {
      "id": 1,
      "nombre": "Maria Fernanda Mateus",
      "correo": "maria.mateus@uniminuto.edu.co",
      "clave_hash": "d5d0e002b40e8ceecf213922f6b6adc8ec937db1356da24fafb1173ca73a5dec",
      "rol": "tecnico",
      "tecnico_id": 1,
      "creado_hace_horas": 900
    },
    {
      "id": 2,
      "nombre": "Andrés Matiz",
      "correo": "andres.matiz@uniminuto.edu.co",
      "clave_hash": "3daeb9fafae84970188c529834279308ecbb10c0b7e7ed9b71059a3f9b7ceb61",
      "rol": "tecnico",
      "tecnico_id": 2,
      "creado_hace_horas": 900
    },
    {
      "id": 3,
      "nombre": "Iván Andrés Serrato",
      "correo": "ivan.serrato@uniminuto.edu.co",
      "clave_hash": "343cdd760cf757b913b4fb635420b4d76e5007e49f974ff23b22f342c45af4de",
      "rol": "tecnico",
      "tecnico_id": 3,
      "creado_hace_horas": 900
    },
    {
      "id": 4,
      "nombre": "Fabián David Trillos",
      "correo": "fabian.trillos@uniminuto.edu.co",
      "clave_hash": "0bddbb20c6ec2304a1f55f2681dee1b7a7e6dfce475adea2c44f442c91549dec",
      "rol": "tecnico",
      "tecnico_id": 4,
      "creado_hace_horas": 900
    },
    {
      "id": 5,
      "nombre": "Alan Sastre",
      "correo": "alan.sastre@uniminuto.edu.co",
      "clave_hash": "6ba7587fbd2bfa4d952c25be4db74633de704a3b24aa130d9500439f3b2fb7e9",
      "rol": "tecnico",
      "tecnico_id": 5,
      "creado_hace_horas": 900
    },
    {
      "id": 6,
      "nombre": "Ana Martínez",
      "correo": "ana.martinez@uniminuto.edu.co",
      "clave_hash": "0116eac4c3acec8e22d44b5c731bef59c0eaed7200a3d5cddc950ff0885767d4",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 800
    },
    {
      "id": 7,
      "nombre": "Luis Torres",
      "correo": "luis.torres@uniminuto.edu.co",
      "clave_hash": "5eaaba1160efa64643afb25d94dadc2bc3388c07663f8dd1fe951c72a317a043",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 780
    },
    {
      "id": 8,
      "nombre": "Marta Rojas",
      "correo": "marta.rojas@uniminuto.edu.co",
      "clave_hash": "a4d904a3ad64fe06b6d1bb8f7a40aba7d9aee47e6455655128cc2b70c7ee97c6",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 760
    },
    {
      "id": 9,
      "nombre": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "clave_hash": "825f49bfecd7b3c0cbbe65d7a926ad01b5db4b46398b8a149523c5d73d23ad4e",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 740
    },
    {
      "id": 10,
      "nombre": "Sofía Díaz",
      "correo": "sofia.diaz@uniminuto.edu.co",
      "clave_hash": "e15a53f366758b45285af0c4fd8ffd56688f8425791e945876cbbfde5ac8a47c",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 720
    },
    {
      "id": 11,
      "nombre": "Camilo Herrera",
      "correo": "camilo.herrera@uniminuto.edu.co",
      "clave_hash": "8235be681c91e98fa185db1b62f76cfbe80838c958a22871065f096a24ff88dc",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 700
    },
    {
      "id": 12,
      "nombre": "Valentina Gómez",
      "correo": "valentina.gomez@uniminuto.edu.co",
      "clave_hash": "4ccd8e64ddbf8bbd122cc7f3a59f3f908066636af72e83c4aabd9fb2c256905f",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 680
    },
    {
      "id": 13,
      "nombre": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "clave_hash": "98ca76fe8edd3d079d10595cecf9caa2a3a5004aff036c2a16b9abbdbe5219d2",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 660
    },
    {
      "id": 14,
      "nombre": "Laura Castro",
      "correo": "laura.castro@uniminuto.edu.co",
      "clave_hash": "d9d44be65a7f6382a1d5476471f47d559248d3c2e259e0159d588a90d2e733ce",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 640
    },
    {
      "id": 15,
      "nombre": "Diego Moreno",
      "correo": "diego.moreno@uniminuto.edu.co",
      "clave_hash": "156bc7c5c7370e70f47d5e2ecc03035e36851e81863f97491a7266b1b51421d9",
      "rol": "solicitante",
      "tecnico_id": null,
      "creado_hace_horas": 620
    }
  ],
  "tickets": [
    {
      "id": 1,
      "solicitante": "Ana Martínez",
      "correo": "ana.martinez@uniminuto.edu.co",
      "categoria_id": 4,
      "prioridad": "Alta",
      "descripcion": "Préstamo de portátil para evento de bienestar",
      "estado": "Resuelta",
      "tecnico_id": 4,
      "creado_hace_horas": 455.8,
      "asignado_tras_horas": 1.5,
      "cerrado_tras_horas": 36.9,
      "archivado": true
    },
    {
      "id": 2,
      "solicitante": "Diego Moreno",
      "correo": "diego.moreno@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Media",
      "descripcion": "Instalación de AutoCAD en la sala de sistemas 3",
      "estado": "Resuelta",
      "tecnico_id": 4,
      "creado_hace_horas": 451.6,
      "asignado_tras_horas": 2.5,
      "cerrado_tras_horas": 12,
      "archivado": true
    },
    {
      "id": 3,
      "solicitante": "Marta Rojas",
      "correo": "marta.rojas@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Media",
      "descripcion": "El computador de la sala docente se reinicia solo",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 433.9,
      "asignado_tras_horas": 2.2,
      "cerrado_tras_horas": 39.5,
      "archivado": true
    },
    {
      "id": 4,
      "solicitante": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Media",
      "descripcion": "No inicia sesión en el aula virtual",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 431.9,
      "asignado_tras_horas": 1.6,
      "cerrado_tras_horas": 2.2,
      "archivado": false
    },
    {
      "id": 5,
      "solicitante": "Diego Moreno",
      "correo": "diego.moreno@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Baja",
      "descripcion": "Impresora atascada en la oficina de registro",
      "estado": "Resuelta",
      "tecnico_id": 2,
      "creado_hace_horas": 426.3,
      "asignado_tras_horas": 0.8,
      "cerrado_tras_horas": 40.4,
      "archivado": false
    },
    {
      "id": 6,
      "solicitante": "Camilo Herrera",
      "correo": "camilo.herrera@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Alta",
      "descripcion": "El monitor no enciende — aula 105, PC 07",
      "estado": "Resuelta",
      "tecnico_id": 2,
      "creado_hace_horas": 412.6,
      "asignado_tras_horas": 0.9,
      "cerrado_tras_horas": 8.2,
      "archivado": false
    },
    {
      "id": 7,
      "solicitante": "Sofía Díaz",
      "correo": "sofia.diaz@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Media",
      "descripcion": "Actualizar el navegador en los equipos del aula 204",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 402.5,
      "asignado_tras_horas": 0.4,
      "cerrado_tras_horas": 2.5,
      "archivado": false
    },
    {
      "id": 8,
      "solicitante": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "WiFi intermitente en la biblioteca",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 401.7,
      "asignado_tras_horas": 2.7,
      "cerrado_tras_horas": 5.4,
      "archivado": false
    },
    {
      "id": 9,
      "solicitante": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Alta",
      "descripcion": "No conecta a la red cableada en el aula 105",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 390.9,
      "asignado_tras_horas": 1.5,
      "cerrado_tras_horas": 3.5,
      "archivado": false
    },
    {
      "id": 10,
      "solicitante": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "WiFi intermitente en la biblioteca",
      "estado": "Resuelta",
      "tecnico_id": 3,
      "creado_hace_horas": 377.7,
      "asignado_tras_horas": 0.7,
      "cerrado_tras_horas": 3.8,
      "archivado": false
    },
    {
      "id": 11,
      "solicitante": "Diego Moreno",
      "correo": "diego.moreno@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "WiFi intermitente en la biblioteca",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 344,
      "asignado_tras_horas": 2.4,
      "cerrado_tras_horas": 2.9,
      "archivado": false
    },
    {
      "id": 12,
      "solicitante": "Laura Castro",
      "correo": "laura.castro@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Media",
      "descripcion": "Error al abrir Teams en el equipo de la coordinación",
      "estado": "Resuelta",
      "tecnico_id": 5,
      "creado_hace_horas": 328.8,
      "asignado_tras_horas": 0.9,
      "cerrado_tras_horas": 3.1,
      "archivado": false
    },
    {
      "id": 13,
      "solicitante": "Marta Rojas",
      "correo": "marta.rojas@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Alta",
      "descripcion": "Impresora atascada en la oficina de registro",
      "estado": "Resuelta",
      "tecnico_id": 3,
      "creado_hace_horas": 295,
      "asignado_tras_horas": 0.3,
      "cerrado_tras_horas": 10.6,
      "archivado": false
    },
    {
      "id": 14,
      "solicitante": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Baja",
      "descripcion": "Error al abrir Teams en el equipo de la coordinación",
      "estado": "Resuelta",
      "tecnico_id": 2,
      "creado_hace_horas": 291.3,
      "asignado_tras_horas": 1,
      "cerrado_tras_horas": 3.3,
      "archivado": false
    },
    {
      "id": 15,
      "solicitante": "Valentina Gómez",
      "correo": "valentina.gomez@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Media",
      "descripcion": "Impresora atascada en la oficina de registro",
      "estado": "Resuelta",
      "tecnico_id": 5,
      "creado_hace_horas": 288.9,
      "asignado_tras_horas": 2.3,
      "cerrado_tras_horas": 14.2,
      "archivado": false
    },
    {
      "id": 16,
      "solicitante": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Baja",
      "descripcion": "No conecta a la red cableada en el aula 105",
      "estado": "Resuelta",
      "tecnico_id": 5,
      "creado_hace_horas": 255.2,
      "asignado_tras_horas": 3,
      "cerrado_tras_horas": 3.6,
      "archivado": false
    },
    {
      "id": 17,
      "solicitante": "Valentina Gómez",
      "correo": "valentina.gomez@uniminuto.edu.co",
      "categoria_id": 4,
      "prioridad": "Alta",
      "descripcion": "Préstamo de portátil para evento de bienestar",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 244,
      "asignado_tras_horas": 0.6,
      "cerrado_tras_horas": 11.4,
      "archivado": false
    },
    {
      "id": 18,
      "solicitante": "Camilo Herrera",
      "correo": "camilo.herrera@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Baja",
      "descripcion": "Sin internet en la oficina 2",
      "estado": "Resuelta",
      "tecnico_id": 4,
      "creado_hace_horas": 227.3,
      "asignado_tras_horas": 3.1,
      "cerrado_tras_horas": 6.4,
      "archivado": false
    },
    {
      "id": 19,
      "solicitante": "Valentina Gómez",
      "correo": "valentina.gomez@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "Punto de red dañado en la sala de juntas",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 219.8,
      "asignado_tras_horas": 2.7,
      "cerrado_tras_horas": 5.4,
      "archivado": false
    },
    {
      "id": 20,
      "solicitante": "Diego Moreno",
      "correo": "diego.moreno@uniminuto.edu.co",
      "categoria_id": 5,
      "prioridad": "Baja",
      "descripcion": "Envío de documentos físicos a la sede principal",
      "estado": "Resuelta",
      "tecnico_id": 2,
      "creado_hace_horas": 213.7,
      "asignado_tras_horas": 2.7,
      "cerrado_tras_horas": 64.2,
      "archivado": false
    },
    {
      "id": 21,
      "solicitante": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Alta",
      "descripcion": "WiFi intermitente en la biblioteca",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 205.5,
      "asignado_tras_horas": 2.9,
      "cerrado_tras_horas": 3.4,
      "archivado": false
    },
    {
      "id": 22,
      "solicitante": "Marta Rojas",
      "correo": "marta.rojas@uniminuto.edu.co",
      "categoria_id": 4,
      "prioridad": "Media",
      "descripcion": "Préstamo de video beam para sustentación de grado",
      "estado": "Resuelta",
      "tecnico_id": 5,
      "creado_hace_horas": 199.4,
      "asignado_tras_horas": 1.1,
      "cerrado_tras_horas": 8.4,
      "archivado": false
    },
    {
      "id": 23,
      "solicitante": "Luis Torres",
      "correo": "luis.torres@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Media",
      "descripcion": "No inicia sesión en el aula virtual",
      "estado": "Resuelta",
      "tecnico_id": 1,
      "creado_hace_horas": 166.5,
      "asignado_tras_horas": 0.8,
      "cerrado_tras_horas": 2.7,
      "archivado": false
    },
    {
      "id": 24,
      "solicitante": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Media",
      "descripcion": "El monitor no enciende — aula 105, PC 07",
      "estado": "Resuelta",
      "tecnico_id": 5,
      "creado_hace_horas": 141.4,
      "asignado_tras_horas": 0.8,
      "cerrado_tras_horas": 22.6,
      "archivado": false
    },
    {
      "id": 25,
      "solicitante": "Laura Castro",
      "correo": "laura.castro@uniminuto.edu.co",
      "categoria_id": 1,
      "prioridad": "Baja",
      "descripcion": "Instalación de AutoCAD en la sala de sistemas 3",
      "estado": "Resuelta",
      "tecnico_id": 3,
      "creado_hace_horas": 136.6,
      "asignado_tras_horas": 0.3,
      "cerrado_tras_horas": 13.6,
      "archivado": false
    },
    {
      "id": 26,
      "solicitante": "Pedro Silva",
      "correo": "pedro.silva@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Baja",
      "descripcion": "El monitor no enciende — aula 105, PC 07",
      "estado": "En proceso",
      "tecnico_id": 4,
      "creado_hace_horas": 136.2,
      "asignado_tras_horas": 2,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 27,
      "solicitante": "Marta Rojas",
      "correo": "marta.rojas@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Alta",
      "descripcion": "Sin internet en la oficina 2",
      "estado": "En proceso",
      "tecnico_id": 5,
      "creado_hace_horas": 130.2,
      "asignado_tras_horas": 1.7,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 28,
      "solicitante": "Jorge Ramírez",
      "correo": "jorge.ramirez@uniminuto.edu.co",
      "categoria_id": 2,
      "prioridad": "Media",
      "descripcion": "El monitor no enciende — aula 105, PC 07",
      "estado": "En proceso",
      "tecnico_id": 1,
      "creado_hace_horas": 98.5,
      "asignado_tras_horas": 1.6,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 29,
      "solicitante": "Laura Castro",
      "correo": "laura.castro@uniminuto.edu.co",
      "categoria_id": 4,
      "prioridad": "Alta",
      "descripcion": "Préstamo de parlantes para el auditorio",
      "estado": "Asignada",
      "tecnico_id": 3,
      "creado_hace_horas": 45.1,
      "asignado_tras_horas": 2.2,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 30,
      "solicitante": "Ana Martínez",
      "correo": "ana.martinez@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "No conecta a la red cableada en el aula 105",
      "estado": "Asignada",
      "tecnico_id": 5,
      "creado_hace_horas": 29.7,
      "asignado_tras_horas": 0.4,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 31,
      "solicitante": "Camilo Herrera",
      "correo": "camilo.herrera@uniminuto.edu.co",
      "categoria_id": 4,
      "prioridad": "Media",
      "descripcion": "Préstamo de video beam para sustentación de grado",
      "estado": "Recibida",
      "tecnico_id": null,
      "creado_hace_horas": 25.4,
      "asignado_tras_horas": null,
      "cerrado_tras_horas": null,
      "archivado": false
    },
    {
      "id": 32,
      "solicitante": "Luis Torres",
      "correo": "luis.torres@uniminuto.edu.co",
      "categoria_id": 3,
      "prioridad": "Media",
      "descripcion": "WiFi intermitente en la biblioteca",
      "estado": "Recibida",
      "tecnico_id": null,
      "creado_hace_horas": 13.2,
      "asignado_tras_horas": null,
      "cerrado_tras_horas": null,
      "archivado": false
    }
  ]
};
