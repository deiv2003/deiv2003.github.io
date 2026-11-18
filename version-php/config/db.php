<?php
// config/db.php — conexión a MySQL (XAMPP: usuario root y sin contraseña)
session_start();

$host = 'localhost';
$db   = 'soporte_tickets';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                 PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ]
    );
} catch (PDOException $e) {
    die('Error de conexión a la base de datos: ' . $e->getMessage());
}

// Función auxiliar: escapa texto para mostrarlo seguro en HTML
function e($texto) {
    return htmlspecialchars((string)$texto, ENT_QUOTES, 'UTF-8');
}

// Funciones de sesión y roles (login, técnico, etc.)
require __DIR__ . '/../includes/auth.php';