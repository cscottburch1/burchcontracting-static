<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

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
$maxFileSize = 10 * 1024 * 1024;
$maxFiles = 10;

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

function sendConfirmationEmail(string $to, string $from, string $subject, string $htmlBody): bool
{
    $headers = [
        'From: Burch Contracting <' . $from . '>',
        'Reply-To: ' . $from,
        'MIME-Version: 1.0',
    ];

    $logoPath = __DIR__ . '/../images/burch-contracting-logo.webp';
    $logoData = file_exists($logoPath) ? file_get_contents($logoPath) : false;

    if ($logoData === false) {
        // No local logo to embed — fall back to a plain HTML send rather than failing outright.
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        return mail($to, $subject, $htmlBody, implode("\r\n", $headers), '-f' . $from);
    }

    $boundary = 'bc_rel_' . bin2hex(random_bytes(8));
    $headers[] = 'Content-Type: multipart/related; boundary="' . $boundary . '"';

    $message = '--' . $boundary . "\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $htmlBody . "\r\n";

    $message .= '--' . $boundary . "\r\n";
    $message .= "Content-Type: image/webp; name=\"burch-contracting-logo.webp\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-ID: <burch-logo>\r\n";
    $message .= "Content-Disposition: inline; filename=\"burch-contracting-logo.webp\"\r\n\r\n";
    $message .= chunk_split(base64_encode($logoData)) . "\r\n";

    $message .= '--' . $boundary . '--';

    return mail($to, $subject, $message, implode("\r\n", $headers), '-f' . $from);
}

function sendLeadEmail(
    string $to,
    string $from,
    string $replyTo,
    string $subject,
    string $body,
    array $attachments
): bool {
    $headers = [
        'From: Burch Contracting <' . $from . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
    ];

    if ($attachments === []) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        $message = $body;
    } else {
        $boundary = 'bc_' . bin2hex(random_bytes(8));
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

        $message = '--' . $boundary . "\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $message .= $body . "\r\n";

        foreach ($attachments as $attachment) {
            $message .= '--' . $boundary . "\r\n";
            $message .= 'Content-Type: ' . $attachment['type'] . '; name="' . $attachment['name'] . "\"\r\n";
            $message .= "Content-Transfer-Encoding: base64\r\n";
            $message .= 'Content-Disposition: attachment; filename="' . $attachment['name'] . "\"\r\n\r\n";
            $message .= chunk_split(base64_encode($attachment['data'])) . "\r\n";
        }

        $message .= '--' . $boundary . '--';
    }

    $headerString = implode("\r\n", $headers);

    return mail($to, $subject, $message, $headerString, '-f' . $from);
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
$subject = 'New Estimate Request: ' . $name . ($projectLabel !== 'N/A' ? ' - ' . $projectLabel : '');
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

if (!sendLeadEmail($toEmail, $fromEmail, $email, $subject, $body, $attachments)) {
    respond(500, ['error' => 'Failed to send message. Please call (864) 724-4600.']);
}

$firstName = explode(' ', $name)[0];
$confirmationHtml = renderConfirmationEmail($firstName, $projectLabel);
if ($confirmationHtml !== null) {
    // Best-effort: a failed confirmation email should never fail the lead submission itself.
    sendConfirmationEmail($email, $fromEmail, 'Thank You for Contacting Burch Contracting', $confirmationHtml);
}

respond(200, [
    'success' => true,
    'message' => 'Request submitted successfully',
    'filesUploaded' => count($attachments),
]);