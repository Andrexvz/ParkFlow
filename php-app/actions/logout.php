<?php
/**
 * ParkFlow - Cerrar Sesión PHP
 */
require_once __DIR__ . '/../config/db.php';

unset($_SESSION['current_user_id']);
session_destroy();

header('Location: ../login.php');
exit;
