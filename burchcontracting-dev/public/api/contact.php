<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$config = file_exists(__DIR__ . '/config.local.php')
    ? require __DIR__ . '/config.local.php'
    : [];

$toEmail = $config['to_email'] ?? 'estimates@burchcontracting.com';
$fromEmail = $config['from_email'] ?? 'noreply@burchcontracting.com';
$recaptchaSecret = $config['recaptcha_secret_key'] ?? '';
$minScore = (float) ($config['recaptcha_min_score'] ?? 0.5);
$smtpHost = $config['smtp_host'] ?? '';
$smtpPort = (int) ($config['smtp_port'] ?? 587);
$smtpUsername = $config['smtp_username'] ?? '';
$smtpPassword = $config['smtp_password'] ?? '';
$smtpSecure = $config['smtp_secure'] ?? 'tls'; // 'tls' (STARTTLS, usually port 587) or 'ssl' (implicit TLS, usually port 465)
$maxFileSize = 10 * 1024 * 1024;
$maxFiles = 10;
$fallbackLogPath = __DIR__ . '/leads-fallback.log';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function clean(string $value): string
{
    return trim($value);
}

function headerSafe(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function verifyRecaptcha(string $secret, string $token, string $action, float $minScore): ?string
{
    if ($secret === '') {
        return null;
    }

    if ($token === '') {
        return 'Security verification failed. Please refresh and try again.';
    }

    $response = file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query([
                'secret' => $secret,
                'response' => $token,
            ]),
            'timeout' => 10,
        ],
    ]));

    if ($response === false) {
        return 'Security verification failed. Please try again.';
    }

    $data = json_decode($response, true);
    if (!is_array($data) || empty($data['success'])) {
        return 'Security verification failed. Please try again.';
    }

    if (($data['action'] ?? '') !== $action) {
        return 'Security verification failed. Please try again.';
    }

    if ((float) ($data['score'] ?? 0) < $minScore) {
        return 'Spam detection triggered. Please try again.';
    }

    return null;
}

function collectUploadedFiles(int $maxFiles, int $maxFileSize): array
{
    $allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    $files = [];

    foreach ($_FILES as $field) {
        if (!is_array($field['name'])) {
            $entries = [$field];
        } else {
            $entries = [];
            foreach ($field['name'] as $index => $name) {
                $entries[] = [
                    'name' => $name,
                    'type' => $field['type'][$index] ?? '',
                    'tmp_name' => $field['tmp_name'][$index] ?? '',
                    'error' => $field['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                    'size' => $field['size'][$index] ?? 0,
                ];
            }
        }

        foreach ($entries as $upload) {
            if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            if (($upload['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
                throw new RuntimeException('File upload failed. Please try again with smaller files.');
            }

            if (count($files) >= $maxFiles) {
                throw new RuntimeException('Too many files. Please upload up to 10 files.');
            }

            $size = (int) ($upload['size'] ?? 0);
            if ($size <= 0 || $size > $maxFileSize) {
                throw new RuntimeException('Each file must be 10MB or smaller.');
            }

            $mime = (string) ($upload['type'] ?? '');
            if ($mime !== '' && !in_array($mime, $allowedTypes, true)) {
                throw new RuntimeException('Unsupported file type. Use images, PDF, or Word documents.');
            }

            $tmpName = (string) ($upload['tmp_name'] ?? '');
            $data = $tmpName !== '' ? file_get_contents($tmpName) : false;
            if ($data === false) {
                throw new RuntimeException('File upload failed. Please try again.');
            }

            $files[] = [
                'name' => basename((string) ($upload['name'] ?? 'attachment')),
                'type' => $mime !== '' ? $mime : 'application/octet-stream',
                'data' => $data,
            ];
        }
    }

    return $files;
}

function labelFor(string $value, array $labels): string
{
    return $labels[$value] ?? ($value !== '' ? $value : 'N/A');
}

function renderConfirmationEmail(string $firstName, string $projectLabel): ?string
{
    $templatePath = __DIR__ . '/email-templates/confirmation.html';
    if (!file_exists($templatePath)) {
        return null;
    }

    $template = file_get_contents($templatePath);
    if ($template === false) {
        return null;
    }

    $projectText = ($projectLabel !== '' && $projectLabel !== 'N/A') ? $projectLabel : 'home remodeling';

    return str_replace(
        ['[Customer First Name]', '[Project Type or "home remodeling"]'],
        [htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8'), htmlspecialchars($projectText, ENT_QUOTES, 'UTF-8')],
        $template
    );
}

/**
 * Every submission that reaches this point gets appended here — regardless
 * of whether the email send below succeeds — so a lead can never vanish
 * silently just because SMTP had a bad moment or config.local.php isn't
 * fully set up yet. Append-only, best-effort: a logging failure must never
 * break the response to the visitor. *.log is already gitignored, and
 * public/api/.htaccess denies direct HTTP access to it.
 */
function logSubmissionFallback(string $logPath, array $submission, bool $emailSent, ?string $emailError = null): void
{
    $entry = array_merge($submission, [
        'timestamp' => date('c'),
        'email_sent' => $emailSent,
        'email_error' => $emailError,
    ]);
    @file_put_contents($logPath, json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function createMailer(string $host, int $port, string $username, string $password, string $secure): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->Port = $port;
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = $password;
    $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    return $mail;
}

/**
 * Sends the lead notification via authenticated SMTP. Returns null on
 * success, or the PHPMailer error string on failure — the caller decides
 * what to do with a failure (log it, fall back to the local record, and
 * still tell the visitor it worked, per the transport-swap spec).
 */
function sendLeadEmail(
    string $smtpHost,
    int $smtpPort,
    string $smtpUsername,
    string $smtpPassword,
    string $smtpSecure,
    string $to,
    string $from,
    string $replyTo,
    string $subject,
    string $body,
    array $attachments
): ?string {
    if ($smtpHost === '' || $smtpUsername === '' || $smtpPassword === '') {
        return 'SMTP is not configured (missing host/username/password in config.local.php)';
    }

    try {
        $mail = createMailer($smtpHost, $smtpPort, $smtpUsername, $smtpPassword, $smtpSecure);
        $mail->setFrom($from, 'Burch Contracting');
        $mail->addAddress($to);
        $mail->addReplyTo($replyTo);
        $mail->Subject = $subject;
        $mail->isHTML(false);
        $mail->Body = $body;

        foreach ($attachments as $attachment) {
            $mail->addStringAttachment($attachment['data'], $attachment['name'], PHPMailer::ENCODING_BASE64, $attachment['type']);
        }

        $mail->send();
        return null;
    } catch (PHPMailerException $exception) {
        return $exception->getMessage();
    }
}

/**
 * Best-effort confirmation auto-reply — a failure here must never fail the
 * lead submission itself. Returns null on success, error string on failure.
 */
function sendConfirmationEmail(
    string $smtpHost,
    int $smtpPort,
    string $smtpUsername,
    string $smtpPassword,
    string $smtpSecure,
    string $to,
    string $from,
    string $subject,
    string $htmlBody
): ?string {
    if ($smtpHost === '' || $smtpUsername === '' || $smtpPassword === '') {
        return 'SMTP is not configured (missing host/username/password in config.local.php)';
    }

    try {
        $mail = createMailer($smtpHost, $smtpPort, $smtpUsername, $smtpPassword, $smtpSecure);
        $mail->setFrom($from, 'Burch Contracting');
        $mail->addAddress($to);
        $mail->addReplyTo($from);
        $mail->Subject = $subject;
        $mail->isHTML(true);
        $mail->Body = $htmlBody;

        // MUST be PNG, not WebP. Gmail and Outlook cannot decode image/webp in email —
        // Outlook's Word rendering engine has no WebP decoder at all. A WebP CID
        // attachment embeds correctly but renders as a blank space in most inboxes.
        $logoPath = __DIR__ . '/../images/burch-contracting-logo-email.png';
        if (file_exists($logoPath)) {
            $mail->addEmbeddedImage($logoPath, 'burch-logo', 'burch-contracting-logo-email.png', PHPMailer::ENCODING_BASE64, 'image/png');
        } else {
            error_log('[contact.php] confirmation email: logo not found at ' . $logoPath . ' — sent without embedded logo');
        }

        $mail->send();
        return null;
    } catch (PHPMailerException $exception) {
        return $exception->getMessage();
    }
}

if (clean((string) ($_POST['website'] ?? '')) !== '') {
    respond(400, ['error' => 'Invalid submission']);
}

$name = clean((string) ($_POST['name'] ?? ''));
$phone = clean((string) ($_POST['phone'] ?? ''));
$email = clean((string) ($_POST['email'] ?? ''));
$street = clean((string) ($_POST['address'] ?? ''));
$city = clean((string) ($_POST['city'] ?? ''));
$state = clean((string) ($_POST['state'] ?? ''));
$zipCode = clean((string) ($_POST['zipCode'] ?? ''));
$address = $street;
if ($city !== '' || $state !== '' || $zipCode !== '') {
    $address = implode(', ', array_filter([$street, $city, $state, $zipCode], static fn (string $part): bool => $part !== ''));
}
$serviceType = clean((string) ($_POST['serviceType'] ?? ($_POST['projectType'] ?? '')));
$budgetRange = clean((string) ($_POST['budgetRange'] ?? ''));
$timeframe = clean((string) ($_POST['timeframe'] ?? ''));
$referralSource = clean((string) ($_POST['referralSource'] ?? ''));
$description = clean((string) ($_POST['description'] ?? ''));

if ($name === '' || $phone === '' || $email === '' || $description === '') {
    respond(400, ['error' => 'Missing required fields']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'Enter a valid email address']);
}

$recaptchaError = verifyRecaptcha(
    $recaptchaSecret,
    clean((string) ($_POST['recaptchaToken'] ?? '')),
    'contact_form',
    $minScore
);

if ($recaptchaError !== null) {
    respond(400, ['error' => $recaptchaError]);
}

try {
    $attachments = collectUploadedFiles($maxFiles, $maxFileSize);
} catch (RuntimeException $exception) {
    respond(400, ['error' => $exception->getMessage()]);
}

$projectLabels = [
    'garage' => 'Garage',
    'addition' => 'Home Addition',
    'deck' => 'Deck',
    'screened-porch' => 'Screened Porch',
    'covered-patio' => 'Covered Patio',
    'remodeling' => 'Remodeling',
    'commercial' => 'Commercial Upfit',
    'other' => 'Other / Not Sure',
];
$budgetLabels = [
    'under-10k' => 'Under $10,000',
    '10k-25k' => '$10,000 – $25,000',
    '25k-50k' => '$25,000 – $50,000',
    '50k-100k' => '$50,000 – $100,000',
    'over-100k' => 'Over $100,000',
    'not-sure' => 'Not Sure Yet',
];
$timeframeLabels = [
    'asap' => 'As soon as possible',
    '1-3months' => 'Within 1–3 months',
    '3-6months' => '3–6 months',
    '6-12months' => '6–12 months',
    'flexible' => 'Flexible / Planning ahead',
];
$referralLabels = [
    'google' => 'Google Search',
    'referral' => 'Friend or Family Referral',
    'neighbor' => 'Saw Work in Neighborhood',
    'repeat' => 'Previous Customer',
    'facebook' => 'Facebook',
    'nextdoor' => 'Nextdoor',
    'other' => 'Other',
];

$projectLabel = labelFor($serviceType, $projectLabels);
$subject = 'New Estimate Request: ' . headerSafe($name) . ($projectLabel !== 'N/A' ? ' - ' . $projectLabel : '');
$body = implode("\n", [
    'New contact form submission',
    '',
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . $email,
    'Address: ' . ($address !== '' ? $address : 'N/A'),
    'Zip Code: ' . ($zipCode !== '' ? $zipCode : 'N/A'),
    'Project Type: ' . $projectLabel,
    'Budget: ' . labelFor($budgetRange, $budgetLabels),
    'Timeframe: ' . labelFor($timeframe, $timeframeLabels),
    'Referral: ' . labelFor($referralSource, $referralLabels),
    '',
    'Description:',
    $description,
    '',
    'Attachments: ' . (count($attachments) > 0 ? count($attachments) . ' file(s)' : 'None'),
]);

$leadEmailError = sendLeadEmail(
    $smtpHost,
    $smtpPort,
    $smtpUsername,
    $smtpPassword,
    $smtpSecure,
    $toEmail,
    $fromEmail,
    $email,
    $subject,
    $body,
    $attachments
);

if ($leadEmailError !== null) {
    // Visible in the server error log — this is the "make the failure
    // visible" half of the spec. The visitor still gets a success response
    // below; the fallback log entry (written regardless of outcome) is the
    // durable record that the lead must not vanish silently.
    error_log('[contact.php] Lead email failed to send: ' . $leadEmailError);
}

logSubmissionFallback($fallbackLogPath, [
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'address' => $address,
    'zipCode' => $zipCode,
    'projectType' => $projectLabel,
    'budgetRange' => labelFor($budgetRange, $budgetLabels),
    'timeframe' => labelFor($timeframe, $timeframeLabels),
    'referralSource' => labelFor($referralSource, $referralLabels),
    'description' => $description,
    'attachmentCount' => count($attachments),
], $leadEmailError === null, $leadEmailError);

$firstName = explode(' ', $name)[0];
$confirmationHtml = renderConfirmationEmail($firstName, $projectLabel);
if ($confirmationHtml !== null) {
    $confirmationError = sendConfirmationEmail(
        $smtpHost,
        $smtpPort,
        $smtpUsername,
        $smtpPassword,
        $smtpSecure,
        $email,
        $fromEmail,
        'Thank You for Contacting Burch Contracting',
        $confirmationHtml
    );
    if ($confirmationError !== null) {
        error_log('[contact.php] Confirmation email failed to send: ' . $confirmationError);
    }
}

// Always respond success once we reach this point: the submission is
// captured in the fallback log even if email delivery failed above, so a
// visitor-facing error here would be misleading (the lead was not lost)
// and would just prompt an unnecessary phone call.
respond(200, [
    'success' => true,
    'message' => 'Request submitted successfully',
    'filesUploaded' => count($attachments),
]);
