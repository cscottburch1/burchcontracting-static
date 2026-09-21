<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

requireLogin();

$statuses = ['new', 'contacted', 'quoted', 'won', 'lost'];
$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    exit('Missing lead id.');
}

$pdo = getPdo();
$notice = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? null)) {
        $notice = ['type' => 'error', 'text' => 'Session expired — please try again.'];
    } else {
        $action = (string) ($_POST['action'] ?? '');

        if ($action === 'update_status') {
            $newStatus = (string) ($_POST['status'] ?? '');
            if (in_array($newStatus, $statuses, true)) {
                $current = $pdo->prepare('SELECT status FROM leads WHERE id = :id');
                $current->execute(['id' => $id]);
                $oldStatus = $current->fetchColumn();

                if ($oldStatus !== false && $oldStatus !== $newStatus) {
                    $update = $pdo->prepare('UPDATE leads SET status = :status WHERE id = :id');
                    $update->execute(['status' => $newStatus, 'id' => $id]);

                    $log = $pdo->prepare('INSERT INTO lead_activity (lead_id, note) VALUES (:id, :note)');
                    $log->execute(['id' => $id, 'note' => "Status changed: {$oldStatus} \u{2192} {$newStatus}"]);
                    $notice = ['type' => 'success', 'text' => 'Status updated.'];
                }
            }
        } elseif ($action === 'add_note') {
            $note = trim((string) ($_POST['note'] ?? ''));
            if ($note !== '') {
                $insert = $pdo->prepare('INSERT INTO lead_activity (lead_id, note) VALUES (:id, :note)');
                $insert->execute(['id' => $id, 'note' => $note]);
                $notice = ['type' => 'success', 'text' => 'Note added.'];
            }
        }
    }
}

$leadStmt = $pdo->prepare('SELECT * FROM leads WHERE id = :id');
$leadStmt->execute(['id' => $id]);
$lead = $leadStmt->fetch();

if ($lead === false) {
    http_response_code(404);
    exit('Lead not found.');
}

$activityStmt = $pdo->prepare('SELECT * FROM lead_activity WHERE lead_id = :id ORDER BY created_at DESC');
$activityStmt->execute(['id' => $id]);
$activity = $activityStmt->fetchAll();

function detailRow(string $label, ?string $value): string
{
    return '<tr><th style="width: 140px;">' . escape($label) . '</th><td>' . escape($value !== null && $value !== '' ? $value : 'N/A') . '</td></tr>';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title><?= escape($lead['name']) ?> | Burch Contracting Admin</title>
<link rel="stylesheet" href="/api/admin/admin.css">
</head>
<body>
<header class="top">
  <a href="/api/admin/index.php">Burch Contracting — Leads</a>
  <nav><a href="/api/admin/logout.php">Log Out</a></nav>
</header>
<main>
  <p><a href="/api/admin/index.php">&larr; Back to all leads</a></p>
  <h1><?= escape($lead['name']) ?> <span class="badge badge-<?= escape($lead['status']) ?>"><?= escape($lead['status']) ?></span></h1>

  <?php if ($notice !== null): ?>
    <p class="<?= $notice['type'] === 'error' ? 'error' : 'success' ?>"><?= escape($notice['text']) ?></p>
  <?php endif; ?>

  <div class="card">
    <h2>Details</h2>
    <table>
      <?= detailRow('Submitted', date('F j, Y g:i A', strtotime($lead['created_at']))) ?>
      <?= detailRow('Phone', $lead['phone']) ?>
      <?= detailRow('Email', $lead['email']) ?>
      <?= detailRow('Address', $lead['address']) ?>
      <?= detailRow('Zip Code', $lead['zip_code']) ?>
      <?= detailRow('Service Type', $lead['service_type']) ?>
      <?= detailRow('Budget', $lead['budget_range']) ?>
      <?= detailRow('Timeframe', $lead['timeframe']) ?>
      <?= detailRow('Referral Source', $lead['referral_source']) ?>
      <?= detailRow('Attachments', $lead['attachment_count'] > 0 ? $lead['attachment_count'] . ' file(s) — sent by email, not stored here' : 'None') ?>
    </table>
    <h2 style="margin-top: 18px;">Description</h2>
    <p style="white-space: pre-wrap;"><?= escape($lead['description']) ?></p>
  </div>

  <div class="card">
    <h2>Update Status</h2>
    <form method="post" style="display: flex; gap: 8px; align-items: flex-end; max-width: 400px;">
      <?= csrfField() ?>
      <input type="hidden" name="action" value="update_status">
      <div class="field" style="flex: 1; margin-bottom: 0;">
        <select name="status">
          <?php foreach ($statuses as $s): ?>
            <option value="<?= escape($s) ?>"<?= $s === $lead['status'] ? ' selected' : '' ?>><?= escape(ucfirst($s)) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <button type="submit">Update</button>
    </form>
  </div>

  <div class="card">
    <h2>Activity &amp; Notes</h2>
    <form method="post">
      <?= csrfField() ?>
      <input type="hidden" name="action" value="add_note">
      <div class="field">
        <textarea name="note" rows="3" placeholder="Add a note (call summary, quote sent, etc.)"></textarea>
      </div>
      <button type="submit">Add Note</button>
    </form>

    <?php if (count($activity) > 0): ?>
    <div class="activity">
      <?php foreach ($activity as $entry): ?>
        <div class="activity-item">
          <div class="meta"><?= escape(date('M j, Y g:i A', strtotime($entry['created_at']))) ?></div>
          <div style="white-space: pre-wrap;"><?= escape($entry['note']) ?></div>
        </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
      <p class="meta" style="margin-top: 14px;">No activity yet.</p>
    <?php endif; ?>
  </div>
</main>
</body>
</html>
