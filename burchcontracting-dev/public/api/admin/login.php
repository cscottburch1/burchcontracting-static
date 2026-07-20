<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';

if (!empty($_SESSION['admin_authenticated'])) {
    header('Location: /api/admin/index.php');
    exit;
}

$config = file_exists(__DIR__ . '/../config.local.php')
    ? require __DIR__ . '/../config.local.php'
    : [];
$adminUsername = $config['admin_username'] ?? '';
$adminPasswordHash = $config['admin_password_hash'] ?? '';

$error = null;
$lockoutRemaining = loginLockoutSecondsRemaining();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $lockoutRemaining === 0) {
    if (!verifyCsrf($_POST['csrf_token'] ?? null)) {
        $error = 'Session expired — please try again.';
    } else {
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');

        $valid = $adminUsername !== '' && $adminPasswordHash !== ''
            && hash_equals($adminUsername, $username)
            && password_verify($password, $adminPasswordHash);

        if ($valid) {
            clearLoginAttempts();
            session_regenerate_id(true);
            $_SESSION['admin_authenticated'] = true;
            header('Location: /api/admin/index.php');
            exit;
        }

        recordFailedLogin();
        $error = 'Invalid username or password.';
    }
}

$lockoutRemaining = loginLockoutSecondsRemaining();
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Admin Login | Burch Contracting</title>
<link rel="stylesheet" href="/api/admin/admin.css">
</head>
<body>
<main class="login-wrap">
  <div class="card">
    <h1>Admin Login</h1>
    <?php if ($lockoutRemaining > 0): ?>
      <p class="error">Too many failed attempts. Try again in <?= $lockoutRemaining ?> seconds.</p>
    <?php elseif ($error !== null): ?>
      <p class="error"><?= escape($error) ?></p>
    <?php endif; ?>
    <form method="post" autocomplete="off">
      <?= csrfField() ?>
      <div class="field">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required autofocus>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit"<?= $lockoutRemaining > 0 ? ' disabled' : '' ?>>Log In</button>
    </form>
  </div>
</main>
</body>
</html>
