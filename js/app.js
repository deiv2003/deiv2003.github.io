/* =====================================================================
 *  js/app.js — Interfaz (rutas con #, vistas y eventos)
 *  Rutas: #/login  #/registro  #/nueva  #/mis-solicitudes
 *         #/panel  #/indicadores  #/administracion   (las 3 últimas: técnicos)
 * ===================================================================== */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal');
  const ESTADOS = ['Recibida', 'Asignada', 'En proceso', 'Resuelta'];
  const COLOR_ESTADO = { 'Recibida': '#64748b', 'Asignada': '#2563eb', 'En proceso': '#d97706', 'Resuelta': '#15803d' };
  const LOGO = 'assets/logo-uniminuto.png'; // opcional: si existe, se muestra
  const ui = { estado: '', archivados: false, buscar: '', area: '', prioridad: '', areaInd: '', ultimo: null };
  let graficos = [];

  // ---------- Utilidades ----------
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clase = (v) => String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const iniciales = (n) => String(n).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const fmtFecha = (f) => (f ? new Date(f).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
  const fmtHoras = (h) => (h == null || isNaN(h) ? '—' : h < 1 ? Math.round(h * 60) + ' min' : (Math.round(h * 10) / 10).toLocaleString('es-CO') + ' h');
  const promedio = (arr) => { const v = arr.filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  function hace(f) {
    const min = Math.round((Date.now() - new Date(f)) / 60000);
    if (min < 1) return 'hace un momento';
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'hace 1 día' : `hace ${d} días`;
  }
  const insEstado = (e) => `<span class="insignia e-${clase(e)}">${esc(e)}</span>`;
  const insPrioridad = (p) => `<span class="insignia sin-punto p-${clase(p)}"><i class="bi bi-flag-fill"></i>${esc(p)}</span>`;

  function sla(r) {
    if (r.estado_sla === 'Cumple') return `<span class="sla sla-ok"><i class="bi bi-check-circle-fill"></i>Cumple SLA</span>`;
    if (r.estado_sla === 'No cumple') return `<span class="sla sla-mal"><i class="bi bi-x-circle-fill"></i>No cumple</span>`;
    const resta = (new Date(r.vence) - Date.now()) / 3600000;
    if (resta < 0) return `<span class="sla sla-mal"><i class="bi bi-alarm-fill"></i>Vencido ${fmtHoras(-resta)}</span>`;
    const riesgo = resta < r.sla_horas * 0.25;
    return `<span class="sla ${riesgo ? 'sla-riesgo' : 'sla-neutro'}"><i class="bi bi-hourglass-split"></i>Quedan ${fmtHoras(resta)}</span>`;
  }

  function progreso(estado) {
    const i = ESTADOS.indexOf(estado);
    return `<div class="progreso" aria-label="Progreso: ${esc(estado)}">${ESTADOS.map((e, j) =>
      `<div class="paso ${j < i || (j === i && estado === 'Resuelta') ? 'hecho' : j === i ? 'actual' : ''}">${esc(e)}</div>`).join('')}</div>`;
  }

  function aviso(msg, tipo) {
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo || 'ok');
    t.innerHTML = `<i class="bi ${tipo === 'error' ? 'bi-exclamation-octagon-fill' : 'bi-check-circle-fill'}"></i><span>${esc(msg)}</span>`;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => { t.classList.add('saliendo'); setTimeout(() => t.remove(), 300); }, 3600);
  }

  function descargar(nombre, contenido, tipo) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const marca = () => `
    <div class="marca">
      <div class="marca-logo"><img src="${LOGO}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'bi bi-ticket-perforated-fill'}))"></div>
      <div>UNIMINUTO<small>Mesa de Ayuda · Soporte y Logística</small></div>
    </div>`;

  // ---------- Rutas ----------
  const RUTAS = {
    'login': { publica: true, vista: vistaLogin },
    'registro': { publica: true, vista: vistaRegistro },
    'nueva': { vista: vistaNueva, titulo: 'Nueva solicitud' },
    'mis-solicitudes': { vista: vistaMis, titulo: 'Mis solicitudes' },
    'panel': { tecnico: true, vista: vistaPanel, titulo: 'Panel técnico' },
    'indicadores': { tecnico: true, vista: vistaIndicadores, titulo: 'Indicadores' },
    'administracion': { tecnico: true, vista: vistaAdmin, titulo: 'Administración' },
  };
  const ir = (r) => { if (location.hash === '#/' + r) render(); else location.hash = '#/' + r; };

  function render() {
    graficos.forEach((g) => g.destroy()); graficos = [];
    if ($modal.open) $modal.close();
    const u = DB.usuarioActual();
    let ruta = (location.hash.replace(/^#\/?/, '').split('?')[0]) || '';
    if (!RUTAS[ruta]) ruta = u ? (u.rol === 'tecnico' ? 'panel' : 'nueva') : 'login';
    const def = RUTAS[ruta];
    if (!def.publica && !u) return ir('login');
    if (def.publica && u) return ir(u.rol === 'tecnico' ? 'panel' : 'nueva');
    if (def.tecnico && u.rol !== 'tecnico') { aviso('No tienes permiso para entrar a esa sección.', 'error'); return ir('nueva'); }

    document.title = (def.titulo ? def.titulo + ' · ' : '') + 'Mesa de Ayuda UNIMINUTO';
    document.body.classList.remove('menu-abierto');
    if (def.publica) { $app.innerHTML = def.vista(); }
    else { $app.innerHTML = shell(ruta, u, def.vista(u)); }
    if (def.despues) def.despues();
    const enfoque = $app.querySelector('[autofocus]');
    if (enfoque) enfoque.focus();
    window.scrollTo(0, 0);
    const a = DB.tomarAvisoSemilla(); if (a) aviso(a);
  }

  function shell(ruta, u, contenido) {
    const abiertos = DB.vista().filter((r) => !r.archivado && r.estado === 'Recibida').length;
    const link = (r, icono, texto, extra) => `<a href="#/${r}" class="${ruta === r ? 'activo' : ''}"><i class="bi ${icono}"></i>${texto}${extra || ''}</a>`;
    return `
      <div class="barra-movil">${marca()}<button type="button" data-accion="menu" aria-label="Abrir menú"><i class="bi bi-list"></i></button></div>
      <div class="velo" data-accion="menu"></div>
      <div class="shell">
        <aside class="menu" aria-label="Menú principal">
          ${marca()}
          <nav class="nav">
            <div class="nav-titulo">Solicitudes</div>
            ${link('nueva', 'bi-plus-circle', 'Nueva solicitud')}
            ${link('mis-solicitudes', 'bi-card-list', 'Mis solicitudes')}
            ${u.rol === 'tecnico' ? `
              <div class="nav-titulo">Gestión</div>
              ${link('panel', 'bi-kanban', 'Panel técnico', abiertos ? `<span class="contador" title="Sin asignar">${abiertos}</span>` : '')}
              ${link('indicadores', 'bi-bar-chart-line', 'Indicadores')}
              ${link('administracion', 'bi-sliders', 'Administración')}` : ''}
          </nav>
          <div class="menu-usuario">
            <div class="avatar">${esc(iniciales(u.nombre))}</div>
            <div class="datos"><b title="${esc(u.nombre)}">${esc(u.nombre)}</b><span>${u.rol === 'tecnico' ? 'Técnico' : 'Solicitante'}</span></div>
            <button type="button" data-accion="salir" title="Cerrar sesión" aria-label="Cerrar sesión"><i class="bi bi-box-arrow-right"></i></button>
          </div>
        </aside>
        <main class="contenido">${contenido}</main>
      </div>`;
  }

  // =====================================================================
  //  Acceso
  // =====================================================================
  function panelMarca() {
    const v = DB.vista();
    const res = v.filter((r) => r.estado === 'Resuelta');
    const pct = res.length ? Math.round(res.filter((r) => r.estado_sla === 'Cumple').length / res.length * 100) : 0;
    return `
      <section class="acceso-marca">
        ${marca()}
        <div>
          <h1>Tus solicitudes de soporte, <span>resueltas a tiempo.</span></h1>
          <p class="lead">Registra incidentes de Soporte Técnico y solicitudes de Logística, sigue su estado y mide el cumplimiento de los acuerdos de servicio.</p>
          <ul class="ventajas">
            <li><i class="bi bi-send"></i><div><b>Registra en un minuto</b><span>Categoría, prioridad, aula y equipo.</span></div></li>
            <li><i class="bi bi-signpost-split"></i><div><b>Sigue cada paso</b><span>Recibida → Asignada → En proceso → Resuelta.</span></div></li>
            <li><i class="bi bi-speedometer2"></i><div><b>Mide el servicio</b><span>Tiempos de respuesta, resolución y SLA.</span></div></li>
          </ul>
        </div>
        <div class="acceso-cifras">
          <div><b>${v.length}</b><span>solicitudes registradas</span></div>
          <div><b>${res.length}</b><span>resueltas</span></div>
          <div><b>${pct}%</b><span>dentro del SLA</span></div>
        </div>
      </section>`;
  }

  function vistaLogin() {
    return `
      <div class="acceso">
        ${panelMarca()}
        <section class="acceso-form">
          <div class="tarjeta-acceso">
            <h2>Iniciar sesión</h2>
            <p class="sub">Ingresa con tu correo institucional.</p>
            <div id="error-acceso"></div>
            <form id="form-login" novalidate>
              <div class="grupo">
                <label class="etiqueta" for="l-correo">Correo</label>
                <div class="con-icono"><i class="bi bi-envelope"></i><input class="campo" id="l-correo" name="correo" type="email" autocomplete="username" required autofocus placeholder="nombre@uniminuto.edu.co"></div>
              </div>
              <div class="grupo">
                <label class="etiqueta" for="l-clave">Contraseña</label>
                <div class="con-icono"><i class="bi bi-lock"></i><input class="campo" id="l-clave" name="clave" type="password" autocomplete="current-password" required></div>
              </div>
              <button class="btn btn-primario btn-bloque" type="submit">Entrar <i class="bi bi-arrow-right"></i></button>
            </form>
            <p class="pie-acceso">¿No tienes cuenta? <a href="#/registro">Regístrate aquí</a></p>
            <div class="demo">
              <div class="demo-titulo"><i class="bi bi-magic"></i> Accesos de prueba</div>
              <div class="demo-botones">
                <button type="button" class="btn btn-secundario" data-accion="demo" data-rol="tecnico"><i class="bi bi-person-gear"></i><span>Técnico<small>Alan Sastre</small></span></button>
                <button type="button" class="btn btn-secundario" data-accion="demo" data-rol="solicitante"><i class="bi bi-person"></i><span>Solicitante<small>Ana Martínez</small></span></button>
              </div>
            </div>
          </div>
        </section>
      </div>`;
  }

  function vistaRegistro() {
    return `
      <div class="acceso">
        ${panelMarca()}
        <section class="acceso-form">
          <div class="tarjeta-acceso">
            <h2>Crear cuenta</h2>
            <p class="sub">Las cuentas nuevas quedan como <b>solicitante</b>. Un técnico puede darte permisos desde Administración.</p>
            <div id="error-acceso"></div>
            <form id="form-registro" novalidate>
              <div class="grupo">
                <label class="etiqueta" for="r-nombre">Nombre completo</label>
                <div class="con-icono"><i class="bi bi-person"></i><input class="campo" id="r-nombre" name="nombre" maxlength="100" autocomplete="name" required autofocus></div>
              </div>
              <div class="grupo">
                <label class="etiqueta" for="r-correo">Correo</label>
                <div class="con-icono"><i class="bi bi-envelope"></i><input class="campo" id="r-correo" name="correo" type="email" maxlength="120" autocomplete="email" required placeholder="nombre@uniminuto.edu.co"></div>
              </div>
              <div class="fila-2">
                <div class="grupo">
                  <label class="etiqueta" for="r-clave">Contraseña <small>(mín. 8)</small></label>
                  <input class="campo" id="r-clave" name="clave" type="password" minlength="8" autocomplete="new-password" required>
                </div>
                <div class="grupo">
                  <label class="etiqueta" for="r-clave2">Repítela</label>
                  <input class="campo" id="r-clave2" name="clave2" type="password" minlength="8" autocomplete="new-password" required>
                </div>
              </div>
              <button class="btn btn-primario btn-bloque" type="submit">Crear cuenta</button>
            </form>
            <p class="pie-acceso">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>
          </div>
        </section>
      </div>`;
  }

  // =====================================================================
  //  Nueva solicitud
  // =====================================================================
  function vistaNueva(u) {
    const cats = DB.categorias;
    const areas = [...new Set(cats.map((c) => c.area))];
    const exito = ui.ultimo;
    if (exito) {
      ui.ultimo = null;
      return `
        <div class="tarjeta exito" style="max-width:620px;margin:2rem auto">
          <div class="icono"><i class="bi bi-check-lg"></i></div>
          <h2>¡Solicitud registrada!</h2>
          <p>Guarda este código para hacer seguimiento. El equipo de ${esc(exito.area)} la atenderá en máximo <b>${exito.sla_horas} horas</b>.</p>
          <div class="codigo-grande">${esc(exito.codigo)}</div>
          <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">
            <a class="btn btn-primario" href="#/mis-solicitudes"><i class="bi bi-card-list"></i> Ver mis solicitudes</a>
            <a class="btn btn-secundario" href="#/nueva" data-accion="otra"><i class="bi bi-plus-lg"></i> Registrar otra</a>
          </div>
        </div>`;
    }
    return `
      <div class="cabecera">
        <div><div class="miga">Solicitudes</div><h1>Registrar solicitud de soporte</h1><p>Cuéntanos qué pasa y lo asignaremos al responsable adecuado.</p></div>
      </div>
      <div class="rejilla rejilla-form">
        <form class="tarjeta tarjeta-cuerpo" id="form-ticket" novalidate>
          <div class="fila-2">
            <div class="grupo">
              <label class="etiqueta" for="t-nombre">Nombre completo</label>
              <input class="campo" id="t-nombre" name="solicitante" maxlength="100" required value="${esc(u.nombre)}">
            </div>
            <div class="grupo">
              <label class="etiqueta" for="t-correo">Correo institucional</label>
              <input class="campo" id="t-correo" name="correo" type="email" maxlength="120" required value="${esc(u.correo)}">
            </div>
          </div>
          <div class="grupo">
            <label class="etiqueta" for="t-cat">Categoría</label>
            <select class="campo" id="t-cat" name="categoria_id" required>
              <option value="">Selecciona una categoría…</option>
              ${areas.map((a) => `<optgroup label="${esc(a)}">${cats.filter((c) => c.area === a).map((c) => `<option value="${c.id}" data-sla="${c.sla_horas}">${esc(c.nombre)}</option>`).join('')}</optgroup>`).join('')}
            </select>
            <div class="pista-sla" id="pista-sla"><i class="bi bi-stopwatch"></i><span></span></div>
          </div>
          <div class="grupo">
            <span class="etiqueta">Prioridad</span>
            <div class="prioridades" role="radiogroup">
              <input type="radio" name="prioridad" id="p-baja" value="Baja"><label for="p-baja">Baja<small>Puede esperar</small></label>
              <input type="radio" name="prioridad" id="p-media" value="Media" checked><label for="p-media">Media<small>Afecta mi trabajo</small></label>
              <input type="radio" name="prioridad" id="p-alta" value="Alta"><label for="p-alta">Alta<small>Detiene una clase</small></label>
            </div>
          </div>
          <div class="grupo">
            <label class="etiqueta" for="t-desc">Descripción</label>
            <textarea class="campo" id="t-desc" name="descripcion" rows="5" maxlength="1000" required placeholder="Ej.: El video beam del aula 302 no proyecta imagen desde el PC 01."></textarea>
            <span class="ayuda">Incluye el número del aula y del computador o equipo.</span>
          </div>
          <div id="error-ticket"></div>
          <button class="btn btn-primario btn-bloque" type="submit"><i class="bi bi-send"></i> Enviar solicitud</button>
        </form>
        <aside class="rejilla">
          <div class="tarjeta tarjeta-cuerpo">
            <div class="tarjeta-titulo"><h3>¿Cómo se atiende?</h3></div>
            <ol class="pasos">
              <li><div class="num e-recibida">1</div><div><b>Recibida</b><span>Tu solicitud entra a la cola con un código.</span></div></li>
              <li><div class="num e-asignada">2</div><div><b>Asignada</b><span>Un técnico toma el caso.</span></div></li>
              <li><div class="num e-en-proceso">3</div><div><b>En proceso</b><span>Se está trabajando en la solución.</span></div></li>
              <li><div class="num e-resuelta">4</div><div><b>Resuelta</b><span>Caso cerrado y medido contra el SLA.</span></div></li>
            </ol>
          </div>
          <div class="tarjeta tarjeta-cuerpo">
            <div class="tarjeta-titulo"><h3>Tiempos máximos (SLA)</h3></div>
            <table class="tabla-sla"><tbody>
              ${cats.map((c) => `<tr><td>${esc(c.nombre)}<small>${esc(c.area)}</small></td><td>${c.sla_horas} h</td></tr>`).join('')}
            </tbody></table>
          </div>
        </aside>
      </div>`;
  }

  // =====================================================================
  //  Mis solicitudes
  // =====================================================================
  function vistaMis(u) {
    const correo = u.correo.toLowerCase();
    const mias = DB.vista().filter((r) => r.correo.toLowerCase() === correo).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    const abiertas = mias.filter((r) => r.estado !== 'Resuelta').length;
    return `
      <div class="cabecera">
        <div><div class="miga">Solicitudes</div><h1>Mis solicitudes</h1><p>${mias.length ? `${mias.length} en total · ${abiertas} abiertas` : 'Aquí verás el estado de lo que registres.'}</p></div>
        <div class="acciones"><a class="btn btn-primario" href="#/nueva"><i class="bi bi-plus-lg"></i> Nueva solicitud</a></div>
      </div>
      ${mias.length ? `<div class="lista-mis">${mias.map((r) => `
        <button type="button" class="tarjeta item-mis" data-accion="ver" data-id="${r.id}">
          <div style="min-width:0">
            <div class="linea1"><span class="cod">${esc(r.codigo)}</span>${insEstado(r.estado)}${insPrioridad(r.prioridad)}</div>
            <div class="desc">${esc(r.descripcion)}</div>
            <div class="meta">${esc(r.categoria)} · ${esc(hace(r.fecha_creacion))} · ${esc(r.responsable)}</div>
          </div>
          <div>${progreso(r.estado)}<div style="margin-top:.45rem">${sla(r)}</div></div>
        </button>`).join('')}</div>`
        : `<div class="tarjeta vacio"><i class="bi bi-inbox"></i>Aún no has registrado solicitudes.<div style="margin-top:1rem"><a class="btn btn-primario" href="#/nueva">Registrar la primera</a></div></div>`}`;
  }

  // =====================================================================
  //  Panel técnico
  // =====================================================================
  function accionesFila(r, compacto) {
    const tecs = DB.tecnicos.filter((t) => t.activo);
    const opciones = (sel) => tecs.map((t) => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${esc(t.nombre)}</option>`).join('');
    const s = compacto ? 'btn-s' : '';
    if (r.archivado) return `<button type="button" class="btn btn-secundario ${s}" data-accion="restaurar" data-id="${r.id}"><i class="bi bi-arrow-counterclockwise"></i> Restaurar</button>`;
    switch (r.estado) {
      case 'Recibida':
        return `<select class="campo campo-s" data-tecnico="${r.id}" aria-label="Responsable"><option value="">Responsable…</option>${opciones()}</select>
                <button type="button" class="btn btn-primario ${s}" data-accion="asignar" data-id="${r.id}">Asignar</button>`;
      case 'Asignada':
        return `<button type="button" class="btn btn-ambar ${s}" data-accion="iniciar" data-id="${r.id}"><i class="bi bi-play-fill"></i> Iniciar atención</button>`;
      case 'En proceso':
        return `<button type="button" class="btn btn-exito ${s}" data-accion="resolver" data-id="${r.id}"><i class="bi bi-check2"></i> Marcar resuelta</button>`;
      default:
        return `<span class="tenue">Cerrada ${esc(hace(r.fecha_cierre))}</span>
                <button type="button" class="btn btn-fantasma ${s}" data-accion="archivar" data-id="${r.id}" title="Archivar"><i class="bi bi-archive"></i> Archivar</button>`;
    }
  }

  function filasPanel() {
    const q = ui.buscar.trim().toLowerCase();
    return DB.vista()
      .filter((r) => r.archivado === ui.archivados)
      .filter((r) => !ui.estado || r.estado === ui.estado)
      .filter((r) => !ui.area || r.area === ui.area)
      .filter((r) => !ui.prioridad || r.prioridad === ui.prioridad)
      .filter((r) => !q || [r.codigo, r.solicitante, r.correo, r.descripcion, r.categoria, r.responsable].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (a.estado === 'Resuelta') - (b.estado === 'Resuelta') || new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  }

  function tablaPanel() {
    const filas = filasPanel();
    if (!filas.length) return `<div class="vacio"><i class="bi bi-inbox"></i>No hay solicitudes con estos filtros.</div>`;
    return `
      <div class="tabla-envoltura"><table class="tabla tabla-tarjetas">
        <thead><tr><th>Código</th><th>Solicitud</th><th>Prioridad</th><th>Estado</th><th>Responsable</th><th>SLA</th><th>Acción</th></tr></thead>
        <tbody>${filas.map((r) => `
          <tr class="clic" data-accion="ver" data-id="${r.id}">
            <td class="cod">${esc(r.codigo)}<div class="tenue">${esc(hace(r.fecha_creacion))}</div></td>
            <td class="col-sol"><div class="desc">${esc(r.descripcion)}</div><div class="tenue"><i class="bi bi-person"></i> ${esc(r.solicitante)} · ${esc(r.categoria)}</div></td>
            <td>${insPrioridad(r.prioridad)}</td>
            <td>${insEstado(r.estado)}</td>
            <td>${esc(r.responsable)}</td>
            <td>${sla(r)}</td>
            <td><div class="acciones-fila">${accionesFila(r, true)}</div></td>
          </tr>`).join('')}
        </tbody></table></div>
      <div class="pie-tabla">${filas.length} solicitud(es) · clic en una fila para ver el detalle y el historial</div>`;
  }

  function vistaPanel() {
    const v = DB.vista().filter((r) => !r.archivado);
    const n = (e) => v.filter((r) => r.estado === e).length;
    const vencidos = v.filter((r) => r.estado !== 'Resuelta' && new Date(r.vence) < Date.now()).length;
    const areas = [...new Set(DB.categorias.map((c) => c.area))];
    const filtro = (e, etiqueta, color, valor) => `<button type="button" class="filtro-estado ${ui.estado === e && !ui.archivados ? 'activo' : ''}" style="--c:${color}" data-accion="filtro" data-estado="${esc(e)}"><b>${valor}</b><span>${etiqueta}</span></button>`;
    return `
      <div class="cabecera">
        <div><div class="miga">Gestión</div><h1>${ui.archivados ? 'Solicitudes archivadas' : 'Gestión de solicitudes'}</h1>
          <p>${vencidos ? `<span class="sla sla-mal"><i class="bi bi-alarm-fill"></i>${vencidos} abierta(s) fuera del SLA</span>` : 'Todas las solicitudes abiertas están dentro del SLA.'}</p></div>
        <div class="acciones">
          <button type="button" class="btn btn-secundario" data-accion="archivados"><i class="bi ${ui.archivados ? 'bi-arrow-left' : 'bi-archive'}"></i> ${ui.archivados ? 'Volver a activas' : 'Ver archivadas'}</button>
          <button type="button" class="btn btn-secundario" data-accion="csv"><i class="bi bi-filetype-csv"></i> Exportar CSV</button>
        </div>
      </div>
      ${ui.archivados ? '' : `<div class="filtros-estado">
        ${filtro('', 'Todas activas', '#255a91', v.length)}
        ${ESTADOS.map((e) => filtro(e, e, COLOR_ESTADO[e], n(e))).join('')}
      </div>`}
      <div class="tarjeta">
        <div class="barra-herr">
          <div class="con-icono buscar"><i class="bi bi-search"></i><input class="campo" id="buscar" type="search" placeholder="Buscar por código, nombre, descripción…" value="${esc(ui.buscar)}" aria-label="Buscar"></div>
          <select class="campo" id="f-area" aria-label="Área"><option value="">Todas las áreas</option>${areas.map((a) => `<option ${ui.area === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>
          <select class="campo" id="f-prioridad" aria-label="Prioridad"><option value="">Toda prioridad</option>${['Alta', 'Media', 'Baja'].map((p) => `<option ${ui.prioridad === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
        </div>
        <div id="tabla-panel">${tablaPanel()}</div>
      </div>`;
  }

  // =====================================================================
  //  Detalle (modal)
  // =====================================================================
  function abrirDetalle(id) {
    const r = DB.ticket(id);
    if (!r) return;
    const tec = DB.esTecnico();
    const tecs = DB.tecnicos.filter((t) => t.activo && t.id !== r.tecnico_id);
    const hist = r.historial.slice().reverse();
    $modal.innerHTML = `
      <div class="modal-cab">
        <div><h2 id="modal-titulo">${esc(r.codigo)} ${insEstado(r.estado)} ${insPrioridad(r.prioridad)}</h2>
          <p>${esc(r.categoria)} · ${esc(r.area)} · creada ${esc(hace(r.fecha_creacion))}${r.archivado ? ' · <b>archivada</b>' : ''}</p></div>
        <button type="button" class="cerrar" data-accion="cerrar" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-cuerpo">
        ${progreso(r.estado)}
        <div class="datos-grid">
          <div class="dato"><small>Solicitante</small><div>${esc(r.solicitante)}</div></div>
          <div class="dato"><small>Correo</small><div>${esc(r.correo)}</div></div>
          <div class="dato"><small>Responsable</small><div>${esc(r.responsable)}</div></div>
          <div class="dato"><small>Creada</small><div>${esc(fmtFecha(r.fecha_creacion))}</div></div>
          <div class="dato"><small>Tiempo de respuesta</small><div>${fmtHoras(r.horas_respuesta)}</div></div>
          <div class="dato"><small>Tiempo de resolución</small><div>${fmtHoras(r.horas_resolucion)}</div></div>
          <div class="dato"><small>SLA de la categoría</small><div>${r.sla_horas} h</div></div>
          <div class="dato"><small>Vence</small><div>${esc(fmtFecha(r.vence))}</div></div>
          <div class="dato"><small>Cumplimiento</small><div>${sla(r)}</div></div>
        </div>
        <div><div class="seccion-t">Descripción</div><div class="caja-desc">${esc(r.descripcion)}</div></div>
        <div><div class="seccion-t">Historial</div>
          <ol class="linea-tiempo">${hist.map((h) => `
            <li><span class="punto" style="background:${COLOR_ESTADO[h.accion] || '#94a3b8'}"></span>
              <div><b>${esc(h.accion)}</b> <small>· ${esc(fmtFecha(h.fecha))} · ${esc(h.usuario || '')}</small><p>${esc(h.detalle)}</p></div></li>`).join('')}
          </ol>
        </div>
        ${tec ? `
        <div class="panel-acciones">
          <div class="seccion-t" style="margin:0">Acciones</div>
          ${r.estado === 'En proceso' && !r.archivado ? `
            <div class="fila"><input class="campo" id="nota-resolver" maxlength="300" placeholder="¿Cómo se solucionó? (opcional)">
              <button type="button" class="btn btn-exito" data-accion="resolver" data-id="${r.id}" data-modal="1"><i class="bi bi-check2"></i> Marcar resuelta</button></div>`
          : `<div class="fila">${accionesFila(r, false)}</div>`}
          ${['Asignada', 'En proceso'].includes(r.estado) && tecs.length ? `
            <div class="fila"><select class="campo" data-reasignar="${r.id}" aria-label="Reasignar"><option value="">Reasignar a…</option>${tecs.map((t) => `<option value="${t.id}">${esc(t.nombre)}</option>`).join('')}</select>
              <button type="button" class="btn btn-secundario" data-accion="reasignar" data-id="${r.id}"><i class="bi bi-arrow-left-right"></i> Reasignar</button></div>` : ''}
          <div class="fila"><input class="campo" id="nota-comentario" maxlength="300" placeholder="Agregar un comentario al historial…">
            <button type="button" class="btn btn-secundario" data-accion="comentar" data-id="${r.id}"><i class="bi bi-chat-left-text"></i> Comentar</button></div>
        </div>` : ''}
      </div>`;
    if (!$modal.open) $modal.showModal();
  }

  // =====================================================================
  //  Indicadores
  // =====================================================================
  function vistaIndicadores() {
    const todas = DB.vista();
    const v = ui.areaInd ? todas.filter((r) => r.area === ui.areaInd) : todas;
    const res = v.filter((r) => r.estado === 'Resuelta');
    const cumplen = res.filter((r) => r.estado_sla === 'Cumple').length;
    const pct = res.length ? Math.round(cumplen / res.length * 100) : null;
    const nivel = pct == null ? '' : pct >= 80 ? 'bueno' : pct >= 60 ? 'regular' : 'malo';
    const pResp = promedio(v.map((r) => r.horas_respuesta));
    const pRes = promedio(res.map((r) => r.horas_resolucion));
    const areas = [...new Set(DB.categorias.map((c) => c.area))];

    const porResp = {};
    v.forEach((r) => {
      const k = r.responsable;
      porResp[k] = porResp[k] || { total: 0, abiertas: 0, res: [], cumplen: 0, cerradas: 0 };
      porResp[k].total++;
      if (r.estado !== 'Resuelta') porResp[k].abiertas++;
      else { porResp[k].cerradas++; porResp[k].res.push(r.horas_resolucion); if (r.estado_sla === 'Cumple') porResp[k].cumplen++; }
    });
    const filasResp = Object.entries(porResp).sort((a, b) => b[1].total - a[1].total);
    const maxResp = Math.max(1, ...filasResp.map(([, x]) => x.total));

    const kpi = (icono, rot, valor, nota, cls) => `<div class="tarjeta kpi ${cls || ''}"><div class="rot"><i class="bi ${icono}"></i>${rot}</div><b>${valor}</b><small>${nota}</small></div>`;
    const sinChart = typeof window.Chart === 'undefined';
    const lienzo = (id) => `<div class="lienzo">${sinChart ? '<div class="sin-graficos">No se pudo cargar la librería de gráficos.<br>Revisa tu conexión a internet.</div>' : `<canvas id="${id}"></canvas>`}</div>`;

    RUTAS.indicadores.despues = () => dibujarGraficos(v);
    return `
      <div class="cabecera">
        <div><div class="miga">Gestión</div><h1>Tablero de indicadores</h1><p>Incluye solicitudes archivadas. Actualizado ${esc(fmtFecha(new Date().toISOString()))}.</p></div>
        <div class="acciones">
          <div class="segmentado" role="radiogroup" aria-label="Área">
            ${['', ...areas].map((a, i) => `<input type="radio" name="areaInd" id="ai-${i}" value="${esc(a)}" ${ui.areaInd === a ? 'checked' : ''}><label for="ai-${i}">${a ? esc(a) : 'Todas'}</label>`).join('')}
          </div>
          <button type="button" class="btn btn-secundario" data-accion="csv"><i class="bi bi-filetype-csv"></i> CSV para Power BI</button>
        </div>
      </div>
      <div class="kpis">
        ${kpi('bi-collection', 'Total solicitudes', v.length, 'registradas')}
        ${kpi('bi-hourglass-split', 'Abiertas', v.length - res.length, 'por resolver')}
        ${kpi('bi-check2-circle', 'Resueltas', res.length, v.length ? Math.round(res.length / v.length * 100) + '% del total' : '—')}
        ${kpi('bi-shield-check', 'Cumplimiento SLA', pct == null ? '—' : pct + '%', `${cumplen} de ${res.length} resueltas`, nivel)}
        ${kpi('bi-lightning-charge', 'Prom. respuesta', fmtHoras(pResp), 'creación → asignación')}
        ${kpi('bi-stopwatch', 'Prom. resolución', fmtHoras(pRes), 'creación → cierre')}
      </div>
      <div class="rejilla rejilla-2" style="margin-bottom:1.25rem">
        <div class="tarjeta tarjeta-cuerpo"><div class="tarjeta-titulo"><h3>Solicitudes por estado</h3></div>${lienzo('g-estado')}</div>
        <div class="tarjeta tarjeta-cuerpo"><div class="tarjeta-titulo"><h3>Solicitudes por categoría</h3></div>${lienzo('g-categoria')}</div>
      </div>
      <div class="rejilla rejilla-3-2" style="margin-bottom:1.25rem">
        <div class="tarjeta tarjeta-cuerpo"><div class="tarjeta-titulo"><h3>Cumplimiento de SLA</h3></div>${lienzo('g-sla')}</div>
        <div class="tarjeta tarjeta-cuerpo"><div class="tarjeta-titulo"><h3>Solicitudes por día</h3><span>últimos 14 días</span></div>${lienzo('g-dias')}</div>
      </div>
      <div class="tarjeta">
        <div class="tarjeta-cuerpo" style="padding-bottom:0"><div class="tarjeta-titulo"><h3>Carga por responsable</h3></div></div>
        <div class="tabla-envoltura"><table class="tabla">
          <thead><tr><th>Responsable</th><th>Carga</th><th class="num">Total</th><th class="num">Abiertas</th><th class="num">Prom. resolución</th><th class="num">SLA</th></tr></thead>
          <tbody>${filasResp.length ? filasResp.map(([nombre, x]) => `
            <tr><td><b>${esc(nombre)}</b></td>
              <td><div class="barra-mini"><span style="width:${Math.round(x.total / maxResp * 100)}%"></span></div></td>
              <td class="num">${x.total}</td><td class="num">${x.abiertas}</td>
              <td class="num">${fmtHoras(promedio(x.res))}</td>
              <td class="num">${x.cerradas ? Math.round(x.cumplen / x.cerradas * 100) + '%' : '—'}</td></tr>`).join('')
            : '<tr><td colspan="6" class="vacio">Aún no hay datos.</td></tr>'}
          </tbody></table></div>
      </div>`;
  }

  function dibujarGraficos(v) {
    if (typeof window.Chart === 'undefined') return;
    const C = window.Chart;
    C.defaults.font.family = getComputedStyle(document.body).fontFamily;
    C.defaults.color = '#52627a';
    C.defaults.borderColor = '#e3e9f1';
    const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { padding: 10, cornerRadius: 8 } } };
    const enteros = { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef2f6' } };
    const sinGrid = { grid: { display: false } };
    const nuevo = (id, cfg) => { const el = document.getElementById(id); if (el) graficos.push(new C(el, cfg)); };

    nuevo('g-estado', { type: 'bar', data: { labels: ESTADOS, datasets: [{ data: ESTADOS.map((e) => v.filter((r) => r.estado === e).length), backgroundColor: ESTADOS.map((e) => COLOR_ESTADO[e]), borderRadius: 8, maxBarThickness: 56 }] },
      options: { ...base, scales: { y: enteros, x: sinGrid } } });

    const cats = {}; v.forEach((r) => { cats[r.categoria] = (cats[r.categoria] || 0) + 1; });
    const ordenCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    nuevo('g-categoria', { type: 'bar', data: { labels: ordenCats.map((x) => x[0]), datasets: [{ data: ordenCats.map((x) => x[1]), backgroundColor: '#255a91', borderRadius: 8, maxBarThickness: 28 }] },
      options: { ...base, indexAxis: 'y', scales: { x: enteros, y: sinGrid } } });

    const slaL = ['Cumple', 'No cumple', 'Abierto'];
    nuevo('g-sla', { type: 'doughnut', data: { labels: slaL, datasets: [{ data: slaL.map((s) => v.filter((r) => r.estado_sla === s).length), backgroundColor: ['#15803d', '#c0262d', '#cbd5e1'], borderWidth: 2, borderColor: '#fff' }] },
      options: { ...base, cutout: '64%', plugins: { ...base.plugins, legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } } });

    const dias = [], conteo = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const fin = new Date(d); fin.setDate(fin.getDate() + 1);
      dias.push(d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }));
      conteo.push(v.filter((r) => { const f = new Date(r.fecha_creacion); return f >= d && f < fin; }).length);
    }
    nuevo('g-dias', { type: 'line', data: { labels: dias, datasets: [{ data: conteo, borderColor: '#255a91', backgroundColor: 'rgba(37,90,145,.12)', fill: true, tension: .35, pointRadius: 3.5, pointBackgroundColor: '#255a91' }] },
      options: { ...base, scales: { y: enteros, x: sinGrid } } });
  }

  // =====================================================================
  //  Administración
  // =====================================================================
  function vistaAdmin(u) {
    const usuarios = DB.usuarios.sort((a, b) => (a.rol === b.rol ? a.nombre.localeCompare(b.nombre) : a.rol === 'tecnico' ? -1 : 1));
    return `
      <div class="cabecera">
        <div><div class="miga">Gestión</div><h1>Administración</h1><p>Usuarios y permisos, tiempos de SLA y respaldo de la información.</p></div>
      </div>
      <div class="rejilla rejilla-form">
        <div class="tarjeta">
          <div class="tarjeta-cuerpo" style="padding-bottom:0"><div class="tarjeta-titulo"><h3>Usuarios</h3><span>${usuarios.length} cuentas</span></div></div>
          <div class="tabla-envoltura"><table class="tabla">
            <thead><tr><th>Nombre</th><th>Rol</th><th>Registro</th><th></th></tr></thead>
            <tbody>${usuarios.map((x) => `
              <tr><td><b>${esc(x.nombre)}</b><div class="tenue">${esc(x.correo)}</div></td>
                <td><span class="insignia sin-punto ${x.rol === 'tecnico' ? 'e-asignada' : 'e-recibida'}">${x.rol === 'tecnico' ? 'Técnico' : 'Solicitante'}</span></td>
                <td class="tenue">${esc(new Date(x.fecha_registro).toLocaleDateString('es-CO'))}</td>
                <td style="text-align:right">${x.id === u.id ? '<span class="tenue">Tú</span>' :
                  `<button type="button" class="btn btn-secundario btn-s" data-accion="rol" data-id="${x.id}" data-rol="${x.rol === 'tecnico' ? 'solicitante' : 'tecnico'}">${x.rol === 'tecnico' ? 'Quitar técnico' : 'Hacer técnico'}</button>`}</td></tr>`).join('')}
            </tbody></table></div>
        </div>
        <div class="rejilla">
          <div class="tarjeta tarjeta-cuerpo">
            <div class="tarjeta-titulo"><h3>SLA por categoría</h3><span>horas</span></div>
            <table class="tabla-sla"><tbody>${DB.categorias.map((c) => `
              <tr><td>${esc(c.nombre)}<small>${esc(c.area)} · prefijo ${esc(c.prefijo)}</small></td>
                <td><input class="campo campo-s input-sla" type="number" min="1" max="720" value="${c.sla_horas}" data-sla="${c.id}" aria-label="SLA ${esc(c.nombre)}"></td></tr>`).join('')}
            </tbody></table>
          </div>
          <div class="tarjeta tarjeta-cuerpo">
            <div class="tarjeta-titulo"><h3>Datos</h3></div>
            <div class="alerta alerta-info"><i class="bi bi-info-circle"></i><div>Los cambios se guardan en este navegador. Para publicarlos en GitHub descarga <b>datos.js</b> y reemplaza el archivo <code>data/datos.js</code> del proyecto.</div></div>
            <div class="lista-datos">
              <div class="accion-dato"><div><b>Descargar datos.js</b><span>Base de datos actual lista para subir al repositorio.</span></div><button type="button" class="btn btn-primario btn-s" data-accion="datosjs"><i class="bi bi-download"></i> datos.js</button></div>
              <div class="accion-dato"><div><b>Respaldo JSON</b><span>Exporta o importa una copia completa.</span></div>
                <div style="display:flex;gap:.4rem"><button type="button" class="btn btn-secundario btn-s" data-accion="json"><i class="bi bi-filetype-json"></i> Exportar</button>
                <label class="btn btn-secundario btn-s"><i class="bi bi-upload"></i> Importar<input type="file" accept=".json,application/json" id="importar" hidden></label></div></div>
              <div class="accion-dato"><div><b>Exportar CSV</b><span>Vista de indicadores para Power BI / Looker Studio.</span></div><button type="button" class="btn btn-secundario btn-s" data-accion="csv"><i class="bi bi-filetype-csv"></i> CSV</button></div>
              <div class="accion-dato"><div><b>Restablecer datos de ejemplo</b><span>Borra los cambios de este navegador.</span></div><button type="button" class="btn btn-peligro btn-s" data-accion="reset"><i class="bi bi-arrow-repeat"></i> Restablecer</button></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // =====================================================================
  //  Eventos
  // =====================================================================
  function ejecutar(fn, ok) {
    try { fn(); if (ok) aviso(ok); return true; } catch (e) { aviso(e.message, 'error'); return false; }
  }

  function accionTicket(accion, id, origen) {
    const extra = {};
    const enModal = origen.closest('#modal');
    if (accion === 'asignar') {
      const sel = (enModal || $app).querySelector(`[data-tecnico="${id}"]`);
      extra.tecnico_id = sel && sel.value;
      if (!extra.tecnico_id) { aviso('Selecciona un responsable.', 'error'); if (sel) sel.focus(); return; }
    }
    if (accion === 'reasignar') {
      const sel = $modal.querySelector(`[data-reasignar="${id}"]`);
      extra.tecnico_id = sel && sel.value;
      if (!extra.tecnico_id) { aviso('Selecciona el nuevo responsable.', 'error'); return; }
    }
    if (accion === 'resolver' && enModal) extra.nota = ($modal.querySelector('#nota-resolver') || {}).value;
    if (accion === 'comentar') extra.nota = ($modal.querySelector('#nota-comentario') || {}).value;
    if (accion === 'archivar' && !confirm('¿Archivar este ticket? Dejará de verse en el panel, pero seguirá contando en los indicadores.')) return;
    const mensajes = { asignar: 'Ticket asignado.', reasignar: 'Responsable actualizado.', iniciar: 'Atención iniciada.', resolver: 'Ticket resuelto.', archivar: 'Ticket archivado.', restaurar: 'Ticket restaurado.', comentar: 'Comentario agregado.' };
    if (ejecutar(() => DB.actualizarTicket(id, accion, extra), mensajes[accion])) {
      const seguirEnModal = enModal && !['archivar', 'restaurar'].includes(accion);
      render();
      if (seguirEnModal) abrirDetalle(id);
    }
  }

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-accion]');
    if (!el) return;
    const accion = el.dataset.accion;
    const id = el.dataset.id;

    // Clic en una fila: no abrir el detalle si se tocó un control de la fila
    if (accion === 'ver' && el.tagName === 'TR' && ev.target.closest('button, select, input, a, label') !== null) return;

    switch (accion) {
      case 'menu': document.body.classList.toggle('menu-abierto'); break;
      case 'salir': DB.cerrarSesion(); aviso('Sesión cerrada.'); ir('login'); break;
      case 'demo': {
        const tec = el.dataset.rol === 'tecnico';
        document.getElementById('l-correo').value = tec ? 'alan.sastre@uniminuto.edu.co' : 'ana.martinez@uniminuto.edu.co';
        document.getElementById('l-clave').value = tec ? 'Soporte2026' : 'Demo2026';
        document.getElementById('form-login').requestSubmit();
        break;
      }
      case 'otra': ev.preventDefault(); ui.ultimo = null; render(); break;
      case 'ver': abrirDetalle(id); break;
      case 'cerrar': $modal.close(); break;
      case 'filtro': ui.estado = el.dataset.estado; render(); break;
      case 'archivados': ui.archivados = !ui.archivados; ui.estado = ''; render(); break;
      case 'asignar': case 'reasignar': case 'iniciar': case 'resolver': case 'archivar': case 'restaurar': case 'comentar':
        accionTicket(accion, id, el); break;
      case 'csv': descargar('indicadores_tickets.csv', DB.exportarCSV(), 'text/csv;charset=utf-8'); aviso('CSV descargado.'); break;
      case 'json': descargar('respaldo_tickets_' + new Date().toISOString().slice(0, 10) + '.json', DB.exportarJSON(), 'application/json'); aviso('Respaldo descargado.'); break;
      case 'datosjs': descargar('datos.js', DB.exportarDatosJS(), 'text/javascript;charset=utf-8'); aviso('datos.js descargado. Reemplázalo en la carpeta data/.'); break;
      case 'rol': if (ejecutar(() => DB.cambiarRol(id, el.dataset.rol), 'Rol actualizado.')) render(); break;
      case 'reset':
        if (confirm('¿Restablecer los datos de ejemplo? Se perderán los cambios hechos en este navegador.')) { DB.restablecer(); aviso('Datos restablecidos.'); ir('login'); }
        break;
    }
  });

  // Cerrar el modal al hacer clic fuera
  $modal.addEventListener('click', (ev) => { if (ev.target === $modal) $modal.close(); });

  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    ev.preventDefault();
    const datos = Object.fromEntries(new FormData(f));
    const mostrarError = (sel, msg) => { const c = document.getElementById(sel); if (c) c.innerHTML = `<div class="alerta alerta-error"><i class="bi bi-exclamation-circle"></i><div>${esc(msg)}</div></div>`; };
    try {
      if (f.id === 'form-login') {
        const u = DB.iniciarSesion(datos.correo, datos.clave);
        aviso('¡Hola, ' + u.nombre.split(' ')[0] + '!');
        ir(u.rol === 'tecnico' ? 'panel' : 'nueva');
      } else if (f.id === 'form-registro') {
        DB.registrar(datos);
        aviso('¡Cuenta creada! Ya puedes registrar tu solicitud.');
        ir('nueva');
      } else if (f.id === 'form-ticket') {
        ui.ultimo = DB.crearTicket(datos);
        render();
      }
    } catch (e) {
      mostrarError(f.id === 'form-ticket' ? 'error-ticket' : 'error-acceso', e.message);
    }
  });

  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'buscar') {
      ui.buscar = ev.target.value;
      const t = document.getElementById('tabla-panel');
      if (t) t.innerHTML = tablaPanel();
    }
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.id === 'f-area') { ui.area = el.value; document.getElementById('tabla-panel').innerHTML = tablaPanel(); }
    else if (el.id === 'f-prioridad') { ui.prioridad = el.value; document.getElementById('tabla-panel').innerHTML = tablaPanel(); }
    else if (el.name === 'areaInd') { ui.areaInd = el.value; render(); }
    else if (el.id === 't-cat') {
      const op = el.selectedOptions[0];
      const p = document.getElementById('pista-sla');
      if (op && op.dataset.sla) { p.querySelector('span').textContent = `Tiempo máximo de atención para esta categoría: ${op.dataset.sla} horas.`; p.classList.add('visible'); }
      else p.classList.remove('visible');
    } else if (el.dataset.sla) {
      if (ejecutar(() => DB.guardarCategoria(el.dataset.sla, el.value), 'SLA actualizado.')) { /* ok */ } else render();
    } else if (el.id === 'importar' && el.files[0]) {
      const lector = new FileReader();
      lector.onload = () => { if (ejecutar(() => DB.importarJSON(lector.result), 'Datos importados.')) { render(); } };
      lector.readAsText(el.files[0]);
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') document.body.classList.remove('menu-abierto');
    const fila = ev.target.closest && ev.target.closest('tr[data-accion="ver"]');
    if (fila && ev.key === 'Enter' && ev.target === fila) abrirDetalle(fila.dataset.id);
  });

  window.addEventListener('hashchange', render);
  // Sincroniza entre pestañas abiertas
  window.addEventListener('storage', () => location.reload());

  render();
})();
