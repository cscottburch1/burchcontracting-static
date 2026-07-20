<?php
declare(strict_types=1);

/**
 * Single shared PDO connection, built from the same config.local.php that
 * already holds SMTP/reCAPTCHA secrets (see public/api/contact.php) — one
 * gitignored config file, not two.
 */
function getPdo(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $config = file_exists(__DIR__ . '/../config.local.php')
        ? require __DIR__ . '/../config.local.php'
        : [];

    $host = $config['db_host'] ?? 'localhost';
    $dbname = $config['db_name'] ?? '';
    $user = $config['db_user'] ?? '';
    $password = $config['db_password'] ?? '';

    if ($dbname === '' || $user === '') {
        throw new RuntimeException('Database is not configured — set db_host/db_name/db_user/db_password in config.local.php.');
    }

    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
