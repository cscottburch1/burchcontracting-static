<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';

$_SESSION = [];
session_destroy();

header('Location: /api/admin/login.php');
exit;
