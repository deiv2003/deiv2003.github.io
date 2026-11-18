<?php
// dashboard.php — tablero de indicadores dentro de la propia página
// Lee la misma vista que Power BI (vista_indicadores) y dibuja los gráficos con Chart.js
require __DIR__ . '/config/db.php';
$titulo = 'Indicadores';
	requiereTecnico();

// ---------- Filtro opcional por área ----------
$areasValidas = ['Soporte Técnico', 'Logística'];
$area   = in_array($_GET['area'] ?? '', $areasValidas, true) ? $_GET['area'] : '';
$cond   = $area ? " AND area = :area" : "";
$params = $area ? [':area' => $area] : [];

function consulta(PDO $pdo, string $sql, array $params): PDOStatement {
    $s = $pdo->prepare($sql);
    $s->execute($params);
    return $s;
}

// ---------- Tarjetas (KPIs) ----------
$k = consulta($pdo,
    "SELECT COUNT(*)                                  AS total,
            COALESCE(SUM(estado <> 'Resuelta'), 0)    AS abiertas,
            COALESCE(SUM(estado = 'Resuelta'), 0)     AS resueltas,
            COALESCE(SUM(estado_sla = 'Cumple'), 0)   AS cumplen,
            ROUND(AVG(horas_respuesta), 1)            AS prom_respuesta,
            ROUND(AVG(horas_resolucion), 1)           AS prom_resolucion
     FROM vista_indicadores WHERE 1=1 $cond", $params)->fetch();

$pctSla = ((int)$k['resueltas'] > 0) ? round($k['cumplen'] / $k['resueltas'] * 100) : null;
$colorSla = $pctSla === null ? 'secondary' : ($pctSla >= 80 ? 'success' : ($pctSla >= 60 ? 'warning' : 'danger'));

// ---------- Solicitudes por estado (aseguramos los 4 estados) ----------
$estadosBase = ['Recibida' => 0, 'Asignada' => 0, 'En proceso' => 0, 'Resuelta' => 0];
$porEstado = $estadosBase;
foreach (consulta($pdo, "SELECT estado, COUNT(*) FROM vista_indicadores WHERE 1=1 $cond GROUP BY estado", $params)
         ->fetchAll(PDO::FETCH_KEY_PAIR) as $est => $n) {
    $porEstado[$est] = (int)$n;
}

// ---------- Solicitudes por categoría ----------
$porCategoria = consulta($pdo,
    "SELECT categoria, COUNT(*) AS n FROM vista_indicadores WHERE 1=1 $cond
     GROUP BY categoria ORDER BY n DESC", $params)->fetchAll();

// ---------- Cumplimiento de SLA ----------
$slaBase = ['Cumple' => 0, 'No cumple' => 0, 'Abierto' => 0];
$sla = $slaBase;
foreach (consulta($pdo, "SELECT estado_sla, COUNT(*) FROM vista_indicadores WHERE 1=1 $cond GROUP BY estado_sla", $params)
         ->fetchAll(PDO::FETCH_KEY_PAIR) as $e => $n) {
    $sla[$e] = (int)$n;
}

// ---------- Solicitudes por día (últimos 14 días) ----------
$porDia = consulta($pdo,
    "SELECT DATE(fecha_creacion) AS dia, COUNT(*) AS n
     FROM vista_indicadores
     WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) $cond
     GROUP BY DATE(fecha_creacion) ORDER BY dia", $params)->fetchAll();

// ---------- Carga por responsable ----------
$porResp = consulta($pdo,
    "SELECT responsable,
            COUNT(*) AS total,
            SUM(estado <> 'Resuelta') AS abiertas,
            ROUND(AVG(horas_resolucion), 1) AS prom_resolucion
     FROM vista_indicadores WHERE 1=1 $cond
     GROUP BY responsable ORDER BY total DESC", $params)->fetchAll();

// Datos para JavaScript
$js = [
    'estados'   => ['labels' => array_keys($porEstado), 'datos' => array_values($porEstado)],
    'categoria' => ['labels' => array_column($porCategoria, 'categoria'), 'datos' => array_map('intval', array_column($porCategoria, 'n'))],
    'sla'       => ['labels' => array_keys($sla), 'datos' => array_values($sla)],
    'dias'      => ['labels' => array_column($porDia, 'dia'), 'datos' => array_map('intval', array_column($porDia, 'n'))],
];

require __DIR__ . '/includes/header.php';
?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
  <h4 class="fw-bold mb-0"><i class="bi bi-bar-chart-line-fill text-primary"></i> Tablero de indicadores</h4>
  <form method="GET" class="d-flex align-items-center gap-2">
    <label class="small text-muted mb-0">Área:</label>
    <select name="area" class="form-select form-select-sm" onchange="this.form.submit()">
      <option value="">Todas</option>
      <?php foreach ($areasValidas as $a): ?>
        <option value="<?= e($a) ?>" <?= $a === $area ? 'selected' : '' ?>><?= e($a) ?></option>
      <?php endforeach; ?>
    </select>
  </form>
</div>

<!-- Tarjetas -->
<div class="row g-3 mb-4">
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-primary"><?= (int)$k['total'] ?></div>
      <div class="small text-muted">Total solicitudes</div>
    </div></div>
  </div>
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-warning"><?= (int)$k['abiertas'] ?></div>
      <div class="small text-muted">Abiertas</div>
    </div></div>
  </div>
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-success"><?= (int)$k['resueltas'] ?></div>
      <div class="small text-muted">Resueltas</div>
    </div></div>
  </div>
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-<?= $colorSla ?>"><?= $pctSla === null ? '—' : $pctSla . '%' ?></div>
      <div class="small text-muted">Cumplimiento SLA</div>
    </div></div>
  </div>
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-info"><?= $k['prom_respuesta'] !== null ? e($k['prom_respuesta']) . ' h' : '—' ?></div>
      <div class="small text-muted">Prom. respuesta</div>
    </div></div>
  </div>
  <div class="col-6 col-lg-2">
    <div class="card card-form text-center h-100"><div class="card-body py-3">
      <div class="fs-2 fw-bold text-secondary"><?= $k['prom_resolucion'] !== null ? e($k['prom_resolucion']) . ' h' : '—' ?></div>
      <div class="small text-muted">Prom. resolución</div>
    </div></div>
  </div>
</div>

<!-- Gráficos -->
<div class="row g-4 mb-4">
  <div class="col-lg-6">
    <div class="card card-form h-100"><div class="card-body">
      <h6 class="fw-bold">Solicitudes por estado</h6>
      <div style="height:260px"><canvas id="gEstado"></canvas></div>
    </div></div>
  </div>
  <div class="col-lg-6">
    <div class="card card-form h-100"><div class="card-body">
      <h6 class="fw-bold">Solicitudes por categoría</h6>
      <div style="height:260px"><canvas id="gCategoria"></canvas></div>
    </div></div>
  </div>
  <div class="col-lg-4">
    <div class="card card-form h-100"><div class="card-body">
      <h6 class="fw-bold">Cumplimiento de SLA</h6>
      <div style="height:260px"><canvas id="gSla"></canvas></div>
    </div></div>
  </div>
  <div class="col-lg-8">
    <div class="card card-form h-100"><div class="card-body">
      <h6 class="fw-bold">Solicitudes por día (últimos 14 días)</h6>
      <div style="height:260px"><canvas id="gDias"></canvas></div>
    </div></div>
  </div>
</div>

<!-- Carga por responsable -->
<div class="card card-form mb-4">
  <div class="card-body">
    <h6 class="fw-bold mb-3">Carga por responsable</h6>
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead class="table-light">
          <tr><th>Responsable</th><th class="text-end">Total</th><th class="text-end">Abiertas</th><th class="text-end">Prom. resolución (h)</th></tr>
        </thead>
        <tbody>
        <?php foreach ($porResp as $r): ?>
          <tr>
            <td><?= e($r['responsable']) ?></td>
            <td class="text-end"><?= (int)$r['total'] ?></td>
            <td class="text-end"><?= (int)$r['abiertas'] ?></td>
            <td class="text-end"><?= $r['prom_resolucion'] !== null ? e($r['prom_resolucion']) : '—' ?></td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$porResp): ?>
          <tr><td colspan="4" class="text-center text-muted py-3">Aún no hay datos.</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">
      Incluye los tickets archivados. Los datos se actualizan al recargar la página (F5).
      Actualizado: <?= date('d/m/Y H:i') ?>
    </p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<script>
  const D = <?= json_encode($js, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
  Chart.defaults.font.family = 'system-ui, sans-serif';
  const opcionesBase = { responsive: true, maintainAspectRatio: false };
  const sinDecimales = { beginAtZero: true, ticks: { precision: 0 } };

  // Solicitudes por estado
  new Chart(document.getElementById('gEstado'), {
    type: 'bar',
    data: { labels: D.estados.labels,
            datasets: [{ data: D.estados.datos,
                         backgroundColor: ['#6c757d', '#0d6efd', '#ffc107', '#198754'], borderRadius: 6 }] },
    options: { ...opcionesBase, plugins: { legend: { display: false } }, scales: { y: sinDecimales } }
  });

  // Solicitudes por categoría (barras horizontales)
  new Chart(document.getElementById('gCategoria'), {
    type: 'bar',
    data: { labels: D.categoria.labels,
            datasets: [{ data: D.categoria.datos, backgroundColor: '#255a91', borderRadius: 6 }] },
    options: { ...opcionesBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: sinDecimales } }
  });

  // Cumplimiento de SLA (anillo)
  new Chart(document.getElementById('gSla'), {
    type: 'doughnut',
    data: { labels: D.sla.labels,
            datasets: [{ data: D.sla.datos, backgroundColor: ['#198754', '#dc3545', '#adb5bd'] }] },
    options: { ...opcionesBase, plugins: { legend: { position: 'bottom' } } }
  });

  // Solicitudes por día (línea)
  new Chart(document.getElementById('gDias'), {
    type: 'line',
    data: { labels: D.dias.labels,
            datasets: [{ data: D.dias.datos, borderColor: '#255a91', backgroundColor: 'rgba(37,90,145,.15)',
                         fill: true, tension: .3, pointRadius: 4 }] },
    options: { ...opcionesBase, plugins: { legend: { display: false } }, scales: { y: sinDecimales } }
  });
</script>
<?php require __DIR__ . '/includes/footer.php'; ?>