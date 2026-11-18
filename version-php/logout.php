<?php
// logout.php — cierra la sesión
require __DIR__ . '/config/db.php';

$_SESSION = [];
session_destroy();

session_start();
$_SESSION['flash'] = ['tipo' => 'success', 'msg' => 'Sesión cerrada.'];
header('Location: login.php');
exit;
