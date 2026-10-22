<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();

// Deshabilitado por política de autenticación individual estricta.
// Cada usuario debe iniciar sesión con su propio correo y contraseña.
flashRedirect('../index.php', 'Acceso denegado: Debe cerrar sesión e iniciar con sus credenciales individuales.', 'error');
exit(0);
