<?php
// includes/auth.php — sesión y control de roles
// Se carga automáticamente desde config/db.php (que ya hizo session_start)

function usuarioActual() {
    return $_SESSION['usuario'] ?? null;
}

function estaLogueado() {
    return isset($_SESSION['usuario']);
}

function esTecnico() {
    return (usuarioActual()['rol'] ?? '') === 'tecnico';
}

// Exige haber iniciado sesión (cualquier rol)
function requiereLogin() {
    if (!estaLogueado()) {
        $_SESSION['flash'] = ['tipo' => 'warning', 'msg' => 'Inicia sesión para continuar.'];
        header('Location: login.php');
        exit;
    }
}

// Exige ser técnico: si no lo es, lo manda al formulario
function requiereTecnico() {
    requiereLogin();
    if (!esTecnico()) {
        $_SESSION['flash'] = ['tipo' => 'danger', 'msg' => 'No tienes permiso para entrar a esa sección.'];
        header('Location: index.php');
        exit;
    }
}
