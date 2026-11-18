/* =====================================================================
 *  js/db.js — Capa de datos sin servidor (reemplaza MySQL + PHP)
 *  - Semilla: window.DATOS_INICIALES (data/datos.js)
 *  - Persistencia: localStorage del navegador
 *  - Reglas: el mismo flujo de estados que actualizar_ticket.php
 * ===================================================================== */
(function () {
  'use strict';

  const CLAVE_DB = 'soporteUniminuto.db.v1';
  const CLAVE_SESION = 'soporteUniminuto.sesion.v1';
  const HORA = 3600 * 1000;

  // ---------- SHA-256 en JS puro (funciona también abriendo el archivo con doble clic) ----------
  function sha256(texto) {
    const ascii = unescape(encodeURIComponent(texto));
    const rot = (v, n) => (v >>> n) | (v << (32 - n));
    const maxWord = Math.pow(2, 32);
    const k = [], hash0 = [], compuesto = {};
    for (let c = 2, p = 0; p < 64; c++) {
      if (!compuesto[c]) {
        for (let i = 0; i < 313; i += c) compuesto[i] = c;
        hash0[p] = (Math.pow(c, 0.5) * maxWord) | 0;
        k[p++] = (Math.pow(c, 1 / 3) * maxWord) | 0;
      }
    }
    let hash = hash0.slice(0, 8);
    let msg = ascii + '\x80';
    while ((msg.length % 64) - 56) msg += '\x00';
    const words = [];
    for (let i = 0; i < msg.length; i++) words[i >> 2] |= msg.charCodeAt(i) << (((3 - i) % 4) * 8);
    const bits = ascii.length * 8;
    words[words.length] = (bits / maxWord) | 0;
    words[words.length] = bits;
    for (let j = 0; j < words.length;) {
      const w = words.slice(j, (j += 16));
      const old = hash;
      hash = hash.slice(0, 8);
      for (let i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        const t1 = hash[7] + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (w[i - 16] + (rot(w15, 7) ^ rot(w15, 18) ^ (w15 >>> 3)) + w[i - 7] +
            (rot(w2, 17) ^ rot(w2, 19) ^ (w2 >>> 10))) | 0);
        const t2 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (let i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    let out = '';
    for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      out += (b < 16 ? '0' : '') + b.toString(16);
    }
    return out;
  }
  const hashClave = (correo, clave) => sha256(String(correo).trim().toLowerCase() + ':' + clave);

  // ---------- Almacenamiento seguro ----------
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const borrar = (k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } };

  const iso = (ms) => new Date(ms).toISOString();
  const ahora = () => new Date().toISOString();

  // Convierte la semilla (fechas relativas o absolutas) en una BD lista para usar
  function hidratar(semilla) {
    const base = Date.now();
    const s = JSON.parse(JSON.stringify(semilla));
    const tecNombre = (id) => (s.tecnicos.find((t) => t.id === id) || {}).nombre || '—';

    s.usuarios = s.usuarios.map((u) => {
      const fecha = u.fecha_registro || iso(base - (u.creado_hace_horas || 0) * HORA);
      const { creado_hace_horas, ...resto } = u;
      return { ...resto, fecha_registro: fecha };
    });

    s.tickets = s.tickets.map((t) => {
      let fc = t.fecha_creacion, fa = t.fecha_asignacion || null, fx = t.fecha_cierre || null;
      if (!fc) {
        const c = base - (t.creado_hace_horas || 0) * HORA;
        fc = iso(c);
        if (t.asignado_tras_horas != null) fa = iso(c + t.asignado_tras_horas * HORA);
        if (t.cerrado_tras_horas != null) fx = iso(c + t.cerrado_tras_horas * HORA);
      }
      const { creado_hace_horas, asignado_tras_horas, cerrado_tras_horas, ...resto } = t;
      const ticket = { prioridad: 'Media', archivado: false, ...resto, fecha_creacion: fc, fecha_asignacion: fa, fecha_cierre: fx };
      if (!Array.isArray(ticket.historial)) {
        // Historial reconstruido a partir de las fechas
        const h = [{ fecha: fc, accion: 'Recibida', detalle: 'Solicitud registrada', usuario: ticket.solicitante }];
        if (fa) h.push({ fecha: fa, accion: 'Asignada', detalle: 'Asignada a ' + tecNombre(ticket.tecnico_id), usuario: tecNombre(ticket.tecnico_id) });
        if (['En proceso', 'Resuelta'].includes(ticket.estado) && fa) {
          const inicio = new Date(fa).getTime() + 0.25 * HORA;
          const fin = fx ? new Date(fx).getTime() : Date.now();
          h.push({ fecha: iso(Math.min(inicio, fin)), accion: 'En proceso', detalle: 'Inicio de la atención', usuario: tecNombre(ticket.tecnico_id) });
        }
        if (fx) h.push({ fecha: fx, accion: 'Resuelta', detalle: 'Solicitud resuelta', usuario: tecNombre(ticket.tecnico_id) });
        if (ticket.archivado) h.push({ fecha: fx || fc, accion: 'Archivada', detalle: 'Oculta del panel', usuario: tecNombre(ticket.tecnico_id) });
        ticket.historial = h;
      }
      return ticket;
    });
    s.semilla_version = semilla.version;
    delete s.generado;
    return s;
  }

  let db = null;
  let avisoSemilla = '';

  function guardar() { escribir(CLAVE_DB, JSON.stringify(db)); }

  function cargar() {
    const semilla = window.DATOS_INICIALES;
    if (!semilla) throw new Error('No se encontró data/datos.js');
    const raw = leer(CLAVE_DB);
    if (raw) {
      try {
        const guardada = JSON.parse(raw);
        if (guardada && guardada.semilla_version === semilla.version) { db = guardada; return; }
        avisoSemilla = 'Se publicaron datos nuevos en data/datos.js y se cargaron.';
      } catch (e) { /* datos dañados: se recarga la semilla */ }
    }
    db = hidratar(semilla);
    guardar();
  }

  // ---------- Utilidades de consulta ----------
  const sigId = (lista) => lista.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const categoria = (id) => db.categorias.find((c) => c.id === Number(id));
  const tecnico = (id) => db.tecnicos.find((t) => t.id === Number(id));
  const codigo = (t) => { const c = categoria(t.categoria_id); return (c ? c.prefijo : 'XX') + '-' + String(t.id).padStart(3, '0'); };
  const horasEntre = (a, b) => (a && b ? Math.round(((new Date(b) - new Date(a)) / HORA) * 100) / 100 : null);

  // Equivalente a la vista SQL "vista_indicadores"
  function fila(t) {
    const c = categoria(t.categoria_id) || {};
    const te = tecnico(t.tecnico_id);
    const hRes = horasEntre(t.fecha_creacion, t.fecha_cierre);
    let estadoSla = 'Abierto';
    if (t.fecha_cierre) estadoSla = hRes <= c.sla_horas ? 'Cumple' : 'No cumple';
    return {
      id: t.id, codigo: codigo(t), solicitante: t.solicitante, correo: t.correo, area: c.area, categoria: c.nombre,
      prioridad: t.prioridad, descripcion: t.descripcion, estado: t.estado,
      responsable: te ? te.nombre : 'Sin asignar', tecnico_id: t.tecnico_id,
      fecha_creacion: t.fecha_creacion, fecha_asignacion: t.fecha_asignacion, fecha_cierre: t.fecha_cierre,
      sla_horas: c.sla_horas, horas_respuesta: horasEntre(t.fecha_creacion, t.fecha_asignacion),
      horas_resolucion: hRes, estado_sla: estadoSla, archivado: !!t.archivado,
      vence: new Date(new Date(t.fecha_creacion).getTime() + (c.sla_horas || 0) * HORA).toISOString(),
      historial: t.historial || [],
    };
  }

  // ---------- Sesión ----------
  function usuarioActual() {
    const id = Number(leer(CLAVE_SESION));
    const u = id && db.usuarios.find((x) => x.id === id);
    return u ? { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, tecnico_id: u.tecnico_id } : null;
  }
  const esTecnico = () => (usuarioActual() || {}).rol === 'tecnico';

  function iniciarSesion(correo, clave) {
    const c = String(correo).trim().toLowerCase();
    const u = db.usuarios.find((x) => x.correo.toLowerCase() === c);
    if (!u || u.clave_hash !== hashClave(c, clave)) throw new Error('Correo o contraseña incorrectos.');
    escribir(CLAVE_SESION, String(u.id));
    return usuarioActual();
  }
  const cerrarSesion = () => borrar(CLAVE_SESION);

  function registrar({ nombre, correo, clave, clave2 }) {
    nombre = String(nombre || '').trim();
    correo = String(correo || '').trim().toLowerCase();
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error('Escribe tu nombre y un correo válido.');
    if (String(clave).length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    if (clave !== clave2) throw new Error('Las contraseñas no coinciden.');
    if (db.usuarios.some((u) => u.correo.toLowerCase() === correo)) throw new Error('Ya existe una cuenta con ese correo.');
    const u = { id: sigId(db.usuarios), nombre, correo, clave_hash: hashClave(correo, clave), rol: 'solicitante', tecnico_id: null, fecha_registro: ahora() };
    db.usuarios.push(u);
    guardar();
    escribir(CLAVE_SESION, String(u.id));
    return usuarioActual();
  }

  // ---------- Tickets ----------
  function crearTicket({ solicitante, correo, categoria_id, prioridad, descripcion }) {
    solicitante = String(solicitante || '').trim();
    correo = String(correo || '').trim();
    descripcion = String(descripcion || '').trim();
    if (!solicitante || !descripcion || !categoria(categoria_id) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new Error('Revisa los datos: hay campos vacíos o inválidos.');
    }
    const t = {
      id: sigId(db.tickets), solicitante, correo, categoria_id: Number(categoria_id),
      prioridad: ['Baja', 'Media', 'Alta'].includes(prioridad) ? prioridad : 'Media',
      descripcion, estado: 'Recibida', tecnico_id: null, archivado: false,
      fecha_creacion: ahora(), fecha_asignacion: null, fecha_cierre: null,
      historial: [{ fecha: ahora(), accion: 'Recibida', detalle: 'Solicitud registrada', usuario: solicitante }],
    };
    db.tickets.push(t);
    guardar();
    return fila(t);
  }

  // Flujo: Recibida -> Asignada -> En proceso -> Resuelta (y Archivar / Restaurar)
  function actualizarTicket(id, accion, extra) {
    if (!esTecnico()) throw new Error('No tienes permiso para esta acción.');
    const t = db.tickets.find((x) => x.id === Number(id));
    if (!t) throw new Error('El ticket no existe.');
    const quien = usuarioActual().nombre;
    const reg = (accionH, detalle) => t.historial.push({ fecha: ahora(), accion: accionH, detalle, usuario: quien });
    const nota = String((extra && extra.nota) || '').trim();

    switch (accion) {
      case 'asignar': {
        const te = tecnico(extra && extra.tecnico_id);
        if (t.estado !== 'Recibida' || !te) throw new Error('Selecciona un responsable válido.');
        Object.assign(t, { estado: 'Asignada', tecnico_id: te.id, fecha_asignacion: ahora() });
        reg('Asignada', 'Asignada a ' + te.nombre);
        break;
      }
      case 'reasignar': {
        const te = tecnico(extra && extra.tecnico_id);
        if (!['Asignada', 'En proceso'].includes(t.estado) || !te || te.id === t.tecnico_id) throw new Error('No se pudo reasignar.');
        t.tecnico_id = te.id;
        reg('Reasignada', 'Nuevo responsable: ' + te.nombre);
        break;
      }
      case 'iniciar':
        if (t.estado !== 'Asignada') throw new Error('El ticket debe estar Asignado.');
        t.estado = 'En proceso';
        reg('En proceso', 'Inicio de la atención');
        break;
      case 'resolver':
        if (t.estado !== 'En proceso') throw new Error('El ticket debe estar En proceso.');
        Object.assign(t, { estado: 'Resuelta', fecha_cierre: ahora() });
        reg('Resuelta', nota || 'Solicitud resuelta');
        break;
      case 'archivar':
        if (t.estado !== 'Resuelta' || t.archivado) throw new Error('Solo se archivan tickets resueltos.');
        t.archivado = true;
        reg('Archivada', 'Oculta del panel (sigue contando en indicadores)');
        break;
      case 'restaurar':
        if (!t.archivado) throw new Error('El ticket no está archivado.');
        t.archivado = false;
        reg('Restaurada', 'Visible de nuevo en el panel');
        break;
      case 'comentar':
        if (!nota) throw new Error('Escribe un comentario.');
        reg('Comentario', nota);
        break;
      default:
        throw new Error('Acción inválida.');
    }
    guardar();
    return fila(t);
  }

  const vista = () => db.tickets.map(fila);
  const ticket = (id) => { const t = db.tickets.find((x) => x.id === Number(id)); return t ? fila(t) : null; };

  // ---------- Administración ----------
  function cambiarRol(usuarioId, rol) {
    if (!esTecnico()) throw new Error('No tienes permiso.');
    const u = db.usuarios.find((x) => x.id === Number(usuarioId));
    if (!u) throw new Error('Usuario no encontrado.');
    if (u.id === usuarioActual().id) throw new Error('No puedes cambiar tu propio rol.');
    if (rol === 'tecnico') {
      let te = db.tecnicos.find((t) => t.id === u.tecnico_id) || db.tecnicos.find((t) => t.nombre.toLowerCase() === u.nombre.toLowerCase());
      if (!te) { te = { id: sigId(db.tecnicos), nombre: u.nombre, activo: true }; db.tecnicos.push(te); }
      te.activo = true;
      u.tecnico_id = te.id;
      u.rol = 'tecnico';
    } else {
      const te = tecnico(u.tecnico_id);
      if (te) te.activo = false;
      u.rol = 'solicitante';
    }
    guardar();
  }

  function guardarCategoria(id, sla) {
    if (!esTecnico()) throw new Error('No tienes permiso.');
    const c = categoria(id);
    const n = Number(sla);
    if (!c || !(n > 0 && n <= 720)) throw new Error('El SLA debe estar entre 1 y 720 horas.');
    c.sla_horas = Math.round(n);
    guardar();
  }

  function exportarCSV() {
    const cols = ['id', 'codigo', 'solicitante', 'area', 'categoria', 'prioridad', 'estado', 'responsable', 'fecha_creacion',
      'fecha_asignacion', 'fecha_cierre', 'sla_horas', 'horas_respuesta', 'horas_resolucion', 'estado_sla', 'archivado'];
    const fmt = (v) => {
      if (v == null) return '';
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v), p = (n) => String(n).padStart(2, '0');
        v = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      }
      if (typeof v === 'boolean') v = v ? 1 : 0;
      v = String(v);
      return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    const filas = vista().sort((a, b) => a.id - b.id).map((r) => cols.map((c) => fmt(r[c])).join(','));
    return '﻿' + [cols.join(',')].concat(filas).join('\r\n');
  }

  function exportarJSON() { return JSON.stringify(db, null, 2); }

  // Genera un data/datos.js con el estado actual (para subirlo a GitHub)
  function exportarDatosJS() {
    const copia = JSON.parse(JSON.stringify(db));
    copia.version = 'datos-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    delete copia.semilla_version;
    return '/* data/datos.js — exportado desde la aplicación el ' + new Date().toLocaleString('es-CO') +
      '\n * Contraseñas cifradas con SHA-256(correo:clave). Reemplaza el archivo data/datos.js del proyecto. */\n' +
      'window.DATOS_INICIALES = ' + JSON.stringify(copia, null, 2) + ';\n';
  }

  function importarJSON(texto) {
    let d;
    try { d = JSON.parse(texto); } catch (e) { throw new Error('El archivo no es un JSON válido.'); }
    if (!d || !Array.isArray(d.tickets) || !Array.isArray(d.usuarios) || !Array.isArray(d.categorias) || !Array.isArray(d.tecnicos)) {
      throw new Error('El archivo no tiene la estructura esperada (categorias, tecnicos, usuarios, tickets).');
    }
    d.semilla_version = window.DATOS_INICIALES.version;
    db = hidratar(Object.assign({}, d, { version: d.semilla_version }));
    guardar();
  }

  function restablecer() {
    db = hidratar(window.DATOS_INICIALES);
    guardar();
    cerrarSesion();
  }

  cargar();

  window.DB = {
    get categorias() { return db.categorias.slice(); },
    get tecnicos() { return db.tecnicos.slice(); },
    get usuarios() { return db.usuarios.map(({ clave_hash, ...u }) => u); },
    tomarAvisoSemilla() { const a = avisoSemilla; avisoSemilla = ''; return a; },
    sha256, usuarioActual, esTecnico, iniciarSesion, cerrarSesion, registrar,
    crearTicket, actualizarTicket, vista, ticket, cambiarRol, guardarCategoria,
    exportarCSV, exportarJSON, exportarDatosJS, importarJSON, restablecer,
  };
})();
