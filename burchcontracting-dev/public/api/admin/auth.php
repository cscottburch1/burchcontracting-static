<?php
declare(strict_types=1);

ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Lax');
session_start();

function requireLogin(): void
{
    if (empty($_SESSION['admin_authenticated'])) {
        header('Location: /api/admin/login.php');
        exit;
    }
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(?string $token): bool
{
    return $token !== null && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function csrfField(): string
{
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8') . '">';
}

/**
 * Simple session-based lockout: 5 failed attempts triggers a 60-second
 * cooldown. Single-admin tool, no IP tracking needed — the session itself
 * is the rate-limit key, which is enough to stop naive brute-forcing
 * without adding a database table just for login attempts.
 */
function loginLockoutSecondsRemaining(): int
{
    $attempts = $_SESSION['login_attempts'] ?? 0;
    $lastAttempt = $_SESSION['login_last_attempt'] ?? 0;
    if ($attempts < 5) {
        return 0;
    }
    $remaining = 60 - (time() - $lastAttempt);
    return max(0, $remaining);
}

function recordFailedLogin(): void
{
    $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
    $_SESSION['login_last_attempt'] = time();
}

function clearLoginAttempts(): void
{
    unset($_SESSION['login_attempts'], $_SESSION['login_last_attempt']);
}

function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
