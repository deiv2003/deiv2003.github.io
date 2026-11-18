<?php
// login.php — inicio de sesión
require __DIR__ . '/config/db.php';
$titulo = 'Iniciar sesión';

if (estaLogueado()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = trim($_POST['correo'] ?? '');
    $clave  = $_POST['clave'] ?? '';

    $stmt = $pdo->prepare("SELECT id, nombre, correo, clave_hash, rol FROM usuarios WHERE correo = ?");
    $stmt->execute([$correo]);
    $u = $stmt->fetch();

    if ($u && password_verify($clave, $u['clave_hash'])) {
        session_regenerate_id(true);   // evita robo de sesión
        $_SESSION['usuario'] = [
            'id'     => (int)$u['id'],
            'nombre' => $u['nombre'],
            'correo' => $u['correo'],
            'rol'    => $u['rol'],
        ];
        // El técnico entra al panel; el solicitante, al formulario
        header('Location: ' . ($u['rol'] === 'tecnico' ? 'admin.php' : 'index.php'));
        exit;
    }
    $error = 'Correo o contraseña incorrectos.';
}

require __DIR__ . '/includes/header.php';
?>
<div class="row justify-content-center">
  <div class="col-md-6 col-lg-5">
    <div class="card card-form">
      <div class="card-body p-4">
        <h4 class="fw-bold mb-4 text-center"><i class="bi bi-box-arrow-in-right text-primary"></i> Iniciar sesión</h4>

        <?php if ($error): ?>
          <div class="alert alert-danger"><?= e($error) ?></div>
        <?php endif; ?>

        <form method="POST">
          <label class="form-label fw-semibold">Correo</label>
          <div class="input-group mb-3">
            <span class="input-group-text"><i class="bi bi-envelope-fill"></i></span>
            <input type="email" name="correo" class="form-control" required autofocus>
          </div>

          <label class="form-label fw-semibold">Contraseña</label>
          <div class="input-group mb-4">
            <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
            <input type="password" name="clave" class="form-control" required>
          </div>

          <button class="btn btn-uni w-100">Entrar</button>
        </form>

        <p class="text-center mt-3 mb-0 small">¿No tienes cuenta? <a href="registro.php">Regístrate aquí</a></p>
      </div>
    </div>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
