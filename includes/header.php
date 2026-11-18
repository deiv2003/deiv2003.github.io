<?php
// includes/header.php — menú (según rol), estilos y mensajes comunes
// Si existe assets/logo-uniminuto.png se muestra el logo; si no, un ícono por defecto
$logoRuta = 'assets/logo-uniminuto.png';
$hayLogo  = file_exists(__DIR__ . '/../' . $logoRuta);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($titulo ?? 'Soporte UNIMINUTO') ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <style>
    :root { --uni-azul:#255a91; --uni-azul-oscuro:#173d66; }
    body { background: linear-gradient(160deg, #eaf1f9 0%, #f8fafc 60%); min-height:100vh; }
    .navbar-uni { background:#fff; border-bottom:4px solid var(--uni-azul); box-shadow:0 2px 10px rgba(0,0,0,.06); }
    .navbar-uni .navbar-brand { color:var(--uni-azul); font-weight:700; letter-spacing:.3px; }
    .navbar-uni .nav-link { color:#445; font-weight:500; border-radius:.5rem; }
    .navbar-uni .nav-link:hover, .navbar-uni .nav-link.active { background:#e8f0f9; color:var(--uni-azul); }
    .logo-uni { height:42px; width:auto; }
    .hero { background:linear-gradient(135deg,var(--uni-azul),var(--uni-azul-oscuro)); color:#fff;
            border-radius:1.25rem; padding:2rem 2.25rem; box-shadow:0 10px 25px rgba(37,90,145,.25); }
    .card-form { border:0; border-radius:1.25rem; box-shadow:0 8px 24px rgba(0,0,0,.08); }
    .input-group-text { background:#eef3f9; color:var(--uni-azul); border-right:0; }
    .input-group .form-control, .input-group .form-select { border-left:0; }
    .form-control:focus, .form-select:focus { border-color:var(--uni-azul); box-shadow:0 0 0 .2rem rgba(37,90,145,.15); }
    .btn-uni { background:var(--uni-azul); border-color:var(--uni-azul); color:#fff; font-weight:600; padding:.7rem; border-radius:.75rem; }
    .btn-uni:hover { background:var(--uni-azul-oscuro); border-color:var(--uni-azul-oscuro); color:#fff; }
    .paso { display:flex; gap:.9rem; align-items:flex-start; margin-bottom:1.1rem; }
    .paso .num { flex:0 0 38px; height:38px; border-radius:50%; display:flex; align-items:center;
                 justify-content:center; font-weight:700; color:#fff; }
  </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-uni">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center gap-2" href="index.php">
      <?php if ($hayLogo): ?>
        <img src="<?= e($logoRuta) ?>" alt="UNIMINUTO" class="logo-uni">
      <?php else: ?>
        <i class="bi bi-mortarboard-fill fs-3"></i>
      <?php endif; ?>
      <span>UNIMINUTO <span class="fw-normal text-muted d-none d-md-inline">| Soporte y Logística</span></span>
    </a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="menuPrincipal">
      <div class="navbar-nav align-items-lg-center">
        <?php if (estaLogueado()): ?>
          <a class="nav-link" href="index.php"><i class="bi bi-plus-circle"></i> Nueva solicitud</a>

          <?php if (esTecnico()): /* Solo los técnicos ven estas opciones */ ?>
            <a class="nav-link" href="admin.php"><i class="bi bi-speedometer2"></i> Panel técnico</a>
            <a class="nav-link" href="dashboard.php"><i class="bi bi-bar-chart-line"></i> Indicadores</a>
          <?php endif; ?>

          <span class="navbar-text ms-lg-3 small">
            <i class="bi bi-person-circle"></i> <?= e(usuarioActual()['nombre']) ?>
            <?php if (esTecnico()): ?><span class="badge text-bg-primary">Técnico</span><?php endif; ?>
          </span>
          <a class="nav-link" href="logout.php"><i class="bi bi-box-arrow-right"></i> Salir</a>
        <?php else: ?>
          <a class="nav-link" href="login.php"><i class="bi bi-box-arrow-in-right"></i> Iniciar sesión</a>
          <a class="nav-link" href="registro.php"><i class="bi bi-person-plus"></i> Registrarse</a>
        <?php endif; ?>
      </div>
    </div>
  </div>
</nav>
<main class="container py-4">
<?php if (!empty($_SESSION['flash'])): ?>
  <div class="alert alert-<?= e($_SESSION['flash']['tipo']) ?> alert-dismissible fade show shadow-sm">
    <?= e($_SESSION['flash']['msg']) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
  <?php unset($_SESSION['flash']); ?>
<?php endif; ?>
