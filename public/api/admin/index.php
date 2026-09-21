<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

requireLogin();

$statuses = ['new', 'contacted', 'quoted', 'won', 'lost'];
$statusFilter = $_GET['status'] ?? '';
if (!in_array($statusFilter, $statuses, true)) {
    $statusFilter = '';
}
$search = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 50;
$offset = ($page - 1) * $perPage;

$pdo = getPdo();

$where = [];
$params = [];
if ($statusFilter !== '') {
    $where[] = 'status = :status';
    $params['status'] = $statusFilter;
}
if ($search !== '') {
    $where[] = '(name LIKE :search OR email LIKE :search OR phone LIKE :search)';
    $params['search'] = '%' . $search . '%';
}
$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM leads {$whereSql}");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

$stmt = $pdo->prepare("SELECT id, created_at, status, name, phone, email, service_type FROM leads {$whereSql} ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}");
$stmt->execute($params);
$leads = $stmt->fetchAll();

$countsStmt = $pdo->query('SELECT status, COUNT(*) AS c FROM leads GROUP BY status');
$statusCounts = array_fill_keys($statuses, 0);
foreach ($countsStmt->fetchAll() as $row) {
    $statusCounts[$row['status']] = (int) $row['c'];
}
$totalAll = array_sum($statusCounts);

function qs(array $overrides): string
{
    $params = array_merge($_GET, $overrides);
    $params = array_filter($params, static fn ($v) => $v !== '' && $v !== null);
    return '?' . http_build_query($params);
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Leads | Burch Contracting Admin</title>
<link rel="stylesheet" href="/api/admin/admin.css">
</head>
<body>
<header class="top">
  <a href="/api/admin/index.php">Burch Contracting — Leads</a>
  <nav><a href="/api/admin/logout.php">Log Out</a></nav>
</header>
<main>
  <h1>Leads <span class="meta">(<?= $totalAll ?> total)</span></h1>

  <div class="filters">
    <a href="<?= escape(qs(['status' => '', 'page' => null])) ?>" class="<?= $statusFilter === '' ? 'active' : '' ?>">All (<?= $totalAll ?>)</a>
    <?php foreach ($statuses as $s): ?>
      <a href="<?= escape(qs(['status' => $s, 'page' => null])) ?>" class="<?= $statusFilter === $s ? 'active' : '' ?>"><?= escape(ucfirst($s)) ?> (<?= $statusCounts[$s] ?>)</a>
    <?php endforeach; ?>
  </div>

  <form method="get" style="margin-bottom: 16px; display: flex; gap: 8px; max-width: 400px;">
    <?php if ($statusFilter !== ''): ?><input type="hidden" name="status" value="<?= escape($statusFilter) ?>"><?php endif; ?>
    <input type="text" name="q" value="<?= escape($search) ?>" placeholder="Search name, email, phone">
    <button type="submit">Search</button>
  </form>

  <div class="card">
    <?php if (count($leads) === 0): ?>
      <p class="meta">No leads found.</p>
    <?php else: ?>
    <table>
      <thead>
        <tr><th>Date</th><th>Name</th><th>Contact</th><th>Service</th><th>Status</th></tr>
      </thead>
      <tbody>
        <?php foreach ($leads as $lead): ?>
        <tr>
          <td class="meta"><?= escape(date('M j, Y', strtotime($lead['created_at']))) ?></td>
          <td><a href="/api/admin/lead.php?id=<?= (int) $lead['id'] ?>"><?= escape($lead['name']) ?></a></td>
          <td class="meta"><?= escape($lead['phone']) ?><br><?= escape($lead['email']) ?></td>
          <td class="meta"><?= escape($lead['service_type'] ?? 'N/A') ?></td>
          <td><span class="badge badge-<?= escape($lead['status']) ?>"><?= escape($lead['status']) ?></span></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>

  <?php if ($total > $perPage): ?>
  <div class="pagination">
    <?php if ($page > 1): ?><a class="btn btn-secondary" href="<?= escape(qs(['page' => $page - 1])) ?>">&larr; Newer</a><?php endif; ?>
    <?php if ($offset + $perPage < $total): ?><a class="btn btn-secondary" href="<?= escape(qs(['page' => $page + 1])) ?>">Older &rarr;</a><?php endif; ?>
  </div>
  <?php endif; ?>
</main>
</body>
</html>
