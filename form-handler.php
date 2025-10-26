<?php
// =============================================
// ODAM Producción Musical - Form Handler Backend
// Procesamiento Seguro de Formularios + Mailto Fallback
// Version: 2.0.0
// =============================================

header('Access-Control-Allow-Origin: https://www.osklindealba.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// ===== CONFIGURACIÓN DE SEGURIDAD =====
define('SECURITY_KEY', 'odam_prod_musical_2024_secure');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('RATE_LIMIT_REQUESTS', 5); // 5 requests por minuto
define('RATE_LIMIT_TIME', 60); // 60 segundos

// ===== CONFIGURACIÓN DE EMAIL =====
define('SITE_EMAIL', 'odeam@osklindealba.com');
define('ADMIN_EMAIL', 'odeam@osklindealba.com');
define('EMAIL_SUBJECT_PREFIX', '🎵 ODAM - ');

// ===== CONFIGURACIÓN CDN Y DOMINIOS PERMITIDOS =====
$allowed_domains = [
    'https://www.osklindealba.com',
    'https://osklindealba.com',
    'https://cdn.osklindealba.com'
];

// ===== INICIALIZACIÓN =====
session_start();
ob_start();

// ===== MANEJO DE CORS Y PREFLIGHT =====
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===== FUNCIÓN PRINCIPAL DE RESPUESTA =====
function sendResponse($success, $message, $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c'),
        'version' => '2.0.0'
    ];
    
    // Log de respuesta para debugging
    error_log("ODAM Form Response: " . json_encode($response));
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// ===== VALIDACIÓN DE SEGURIDAD =====
function validateSecurity() {
    // Verificar origen de la petición
    $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
    
    global $allowed_domains;
    $is_allowed_origin = false;
    
    foreach ($allowed_domains as $domain) {
        if (strpos($origin, $domain) === 0) {
            $is_allowed_origin = true;
            break;
        }
    }
    
    if (!$is_allowed_origin && !in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
        error_log("ODAM Security: Intento de acceso desde origen no permitido - " . $origin);
        sendResponse(false, 'Origen no autorizado', [], 403);
    }
    
    // Verificar rate limiting
    validateRateLimit();
    
    // Verificar token CSRF si está presente
    validateCSRFToken();
}

// ===== RATE LIMITING =====
function validateRateLimit() {
    $client_ip = $_SERVER['REMOTE_ADDR'];
    $rate_key = 'rate_limit_' . md5($client_ip);
    
    if (!isset($_SESSION[$rate_key])) {
        $_SESSION[$rate_key] = [
            'count' => 1,
            'timestamp' => time()
        ];
        return true;
    }
    
    $rate_data = $_SESSION[$rate_key];
    $time_diff = time() - $rate_data['timestamp'];
    
    if ($time_diff < RATE_LIMIT_TIME) {
        if ($rate_data['count'] >= RATE_LIMIT_REQUESTS) {
            error_log("ODAM Rate Limit: Límite excedido para IP " . $client_ip);
            sendResponse(false, 'Demasiadas solicitudes. Por favor espera un momento.', [], 429);
        }
        $rate_data['count']++;
    } else {
        $rate_data = [
            'count' => 1,
            'timestamp' => time()
        ];
    }
    
    $_SESSION[$rate_key] = $rate_data;
    return true;
}

// ===== VALIDACIÓN CSRF =====
function validateCSRFToken() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['csrf_token'])) {
        if (!isset($_SESSION['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            error_log("ODAM CSRF: Token inválido o expirado");
            sendResponse(false, 'Token de seguridad inválido. Por favor recarga la página.', [], 403);
        }
    }
}

// ===== GENERACIÓN DE TOKEN CSRF =====
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// ===== SANITIZACIÓN DE DATOS =====
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    
    return $data;
}

// ===== VALIDACIÓN DE EMAIL =====
function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    
    // Verificar dominio de email
    $domain = strtolower(substr($email, strpos($email, '@') + 1));
    $disposable_domains = [
        'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
        '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
    ];
    
    if (in_array($domain, $disposable_domains)) {
        return false;
    }
    
    return true;
}

// ===== VALIDACIÓN DE TELÉFONO =====
function validatePhone($phone) {
    // Eliminar espacios y caracteres especiales
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
    // Validar formato internacional o local
    if (preg_match('/^\+?[0-9]{10,15}$/', $phone)) {
        return $phone;
    }
    
    return false;
}

// ===== VALIDACIÓN DE TEXTO CONTRA PALABRAS RESTRINGIDAS =====
function validateContent($text) {
    $restricted_words = [
        'palabrota', 'insulto', 'groseria', 'vulgar', 'obsceno',
        'racista', 'sexista', 'homofobico', 'discriminatorio',
        'amenaza', 'violencia', 'odio', 'daño', 'atacar',
        'acoso', 'difamacion', 'humillacion', 'abusivo',
        'estafa', 'phishing', 'correo no deseado', 'spam',
        'promoción', 'marketing', 'publicidad'
    ];
    
    $text_lower = strtolower($text);
    
    foreach ($restricted_words as $word) {
        if (strpos($text_lower, $word) !== false) {
            return false;
        }
    }
    
    return true;
}

// ===== PROCESAMIENTO DE ARCHIVOS =====
function handleFileUpload($file_field) {
    if (!isset($_FILES[$file_field]) || $_FILES[$file_field]['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'No se pudo subir el archivo'];
    }
    
    $file = $_FILES[$file_field];
    
    // Validar tamaño
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'El archivo es demasiado grande'];
    }
    
    // Validar tipo de archivo
    $allowed_types = [
        'audio/mpeg' => 'mp3',
        'audio/wav' => 'wav',
        'audio/ogg' => 'ogg',
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif'
    ];
    
    $file_type = mime_content_type($file['tmp_name']);
    
    if (!isset($allowed_types[$file_type])) {
        return ['success' => false, 'message' => 'Tipo de archivo no permitido'];
    }
    
    // Generar nombre seguro
    $extension = $allowed_types[$file_type];
    $filename = 'upload_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.' . $extension;
    $upload_path = 'uploads/' . $filename;
    
    // Crear directorio si no existe
    if (!is_dir('uploads')) {
        mkdir('uploads', 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        return [
            'success' => true,
            'filename' => $filename,
            'path' => $upload_path,
            'size' => $file['size'],
            'type' => $file_type
        ];
    }
    
    return ['success' => false, 'message' => 'Error al guardar el archivo'];
}

// ===== ENVÍO DE EMAIL =====
function sendEmail($to, $subject, $body, $headers = []) {
    $default_headers = [
        'From: ' . SITE_EMAIL,
        'Reply-To: ' . SITE_EMAIL,
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    $all_headers = array_merge($default_headers, $headers);
    
    // Plantilla HTML para el email
    $html_template = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { 
                font-family: 'Poppins', Arial, sans-serif; 
                background: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                background: white; 
                margin: 0 auto; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #c8a25f, #d4af37); 
                color: white; 
                padding: 20px; 
                text-align: center; 
                border-radius: 10px 10px 0 0; 
                margin: -30px -30px 20px -30px; 
            }
            .content { 
                line-height: 1.6; 
                color: #333; 
            }
            .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee; 
                text-align: center; 
                color: #666; 
                font-size: 14px; 
            }
            .badge { 
                background: #c8a25f; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 15px; 
                font-size: 12px; 
                display: inline-block; 
                margin: 5px; 
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎵 ODAM Producción Musical</h1>
                <p>Producción Musical Con Propósito</p>
            </div>
            <div class='content'>
                {$body}
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " ODAM Producción Musical. Todos los derechos reservados.</p>
                <p><a href='https://www.osklindealba.com' style='color: #c8a25f;'>www.osklindealba.com</a></p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $full_subject = EMAIL_SUBJECT_PREFIX . $subject;
    
    if (mail($to, $full_subject, $html_template, implode("\r\n", $all_headers))) {
        return true;
    }
    
    // Fallback a mail básico si falla el HTML
    $plain_headers = [
        'From: ' . SITE_EMAIL,
        'Reply-To: ' . SITE_EMAIL,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $full_subject, strip_tags($body), implode("\r\n", $plain_headers));
}

// ===== PROCESAMIENTO DE FORMULARIO DE CONTACTO =====
function processContactForm($data) {
    // Validar campos requeridos
    $required_fields = ['service-type', 'name', 'email', 'phone', 'message'];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            sendResponse(false, "El campo {$field} es obligatorio");
        }
    }
    
    // Validar email
    if (!validateEmail($data['email'])) {
        sendResponse(false, "Por favor ingresa un correo electrónico válido");
    }
    
    // Validar teléfono
    $phone = validatePhone($data['phone']);
    if (!$phone) {
        sendResponse(false, "Por favor ingresa un número de teléfono válido");
    }
    
    // Validar contenido del mensaje
    if (!validateContent($data['message'])) {
        sendResponse(false, "El mensaje contiene contenido no permitido");
    }
    
    // Procesar archivos adjuntos si existen
    $attachments_info = [];
    if (isset($_FILES['audio-file']) && $_FILES['audio-file']['error'] === UPLOAD_ERR_OK) {
        $file_result = handleFileUpload('audio-file');
        if ($file_result['success']) {
            $attachments_info[] = $file_result;
        }
    }
    
    // Construir cuerpo del email
    $email_body = "
    <h2>📞 Nueva Solicitud de Contacto</h2>
    
    <h3>Información del Cliente:</h3>
    <p><strong>Nombre:</strong> {$data['name']}</p>
    <p><strong>Email:</strong> {$data['email']}</p>
    <p><strong>Teléfono/WhatsApp:</strong> {$phone}</p>
    
    <h3>Detalles del Servicio:</h3>
    <p><strong>Servicio solicitado:</strong> <span class='badge'>{$data['service-type']}</span></p>
    <p><strong>Tipo de proyecto:</strong> " . ($data['project-type'] ?? 'No especificado') . "</p>
    <p><strong>Presupuesto estimado:</strong> " . ($data['budget'] ?? 'No especificado') . "</p>
    <p><strong>Fecha límite:</strong> " . ($data['deadline'] ?? 'No especificada') . "</p>
    
    <h3>Descripción del Proyecto:</h3>
    <div style='background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #c8a25f;'>
        " . nl2br($data['message']) . "
    </div>
    ";
    
    if (!empty($attachments_info)) {
        $email_body .= "<h3>Archivos Adjuntos:</h3><ul>";
        foreach ($attachments_info as $file) {
            $email_body .= "<li>{$file['filename']} ({$file['type']}, " . round($file['size']/1024, 2) . " KB)</li>";
        }
        $email_body .= "</ul>";
    }
    
    $email_body .= "
    <hr>
    <p><small>Este mensaje fue enviado desde el formulario de contacto de ODAM Producción Musical.</small></p>
    ";
    
    // Enviar email al administrador
    if (sendEmail(ADMIN_EMAIL, "Nueva Solicitud: {$data['service-type']}", $email_body)) {
        // Enviar email de confirmación al cliente
        $confirmation_body = "
        <h2>¡Gracias por contactar con ODAM!</h2>
        <p>Hemos recibido tu solicitud de <strong>{$data['service-type']}</strong> y nos pondremos en contacto contigo muy pronto.</p>
        
        <h3>Resumen de tu solicitud:</h3>
        <p><strong>Servicio:</strong> {$data['service-type']}</p>
        <p><strong>Nombre:</strong> {$data['name']}</p>
        <p><strong>Email:</strong> {$data['email']}</p>
        <p><strong>Teléfono:</strong> {$phone}</p>
        
        <div style='background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <h4>📝 Tu mensaje:</h4>
            <p>" . nl2br($data['message']) . "</p>
        </div>
        
        <p><strong>Próximos pasos:</strong></p>
        <ul>
            <li>Revisaremos tu proyecto en las próximas 24 horas</li>
            <li>Recibirás una cotización detallada</li>
            <li>Coordinaremos una reunión para discutir los detalles</li>
        </ul>
        
        <p>Si tienes alguna pregunta adicional, no dudes en responder este email.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Osklin De Alba</strong><br>
        ODAM Producción Musical</p>
        ";
        
        sendEmail($data['email'], "Confirmación de Solicitud Recibida", $confirmation_body);
        
        // Guardar en base de datos o archivo de log
        logSubmission($data, 'contact_form', $attachments_info);
        
        return [
            'success' => true,
            'email_sent' => true,
            'confirmation_sent' => true,
            'attachments' => $attachments_info
        ];
    }
    
    return ['success' => false, 'email_sent' => false];
}

// ===== PROCESAMIENTO DE FORMULARIO DE FEEDBACK =====
function processFeedbackForm($data) {
    // Validar campos requeridos
    if (empty($data['comment'])) {
        sendResponse(false, "El comentario es obligatorio");
    }
    
    // Validar contenido
    if (!validateContent($data['comment'])) {
        sendResponse(false, "El comentario contiene contenido no permitido");
    }
    
    // Construir cuerpo del email
    $email_body = "
    <h2>💬 Nuevo Feedback Recibido</h2>
    
    <h3>Comentario del Usuario:</h3>
    <div style='background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #c8a25f;'>
        " . nl2br($data['comment']) . "
    </div>
    
    <h3>Información Adicional:</h3>
    <p><strong>Rating del usuario:</strong> " . ($data['user_rating'] ?? 'No especificado') . "</p>
    <p><strong>Página:</strong> " . ($_SERVER['HTTP_REFERER'] ?? 'Directo') . "</p>
    <p><strong>IP:</strong> " . ($_SERVER['REMOTE_ADDR'] ?? 'Desconocida') . "</p>
    <p><strong>User Agent:</strong> " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido') . "</p>
    ";
    
    // Enviar email al administrador
    if (sendEmail(ADMIN_EMAIL, "Nuevo Feedback del Sitio", $email_body)) {
        // Guardar en base de datos o archivo de log
        logSubmission($data, 'feedback_form');
        
        return ['success' => true, 'email_sent' => true];
    }
    
    return ['success' => false, 'email_sent' => false];
}

// ===== LOG DE SUBMISSIONS =====
function logSubmission($data, $form_type, $attachments = []) {
    $log_entry = [
        'timestamp' => date('c'),
        'form_type' => $form_type,
        'data' => $data,
        'attachments' => $attachments,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    $log_file = 'submissions_log.json';
    
    // Leer log existente
    $existing_logs = [];
    if (file_exists($log_file)) {
        $existing_content = file_get_contents($log_file);
        $existing_logs = json_decode($existing_content, true) ?: [];
    }
    
    // Agregar nueva entrada
    $existing_logs[] = $log_entry;
    
    // Guardar (limitar a 1000 entradas)
    if (count($existing_logs) > 1000) {
        $existing_logs = array_slice($existing_logs, -1000);
    }
    
    file_put_contents($log_file, json_encode($existing_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// ===== ENDPOINT PARA GENERAR TOKEN CSRF =====
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'csrf_token') {
    $token = generateCSRFToken();
    sendResponse(true, 'Token CSRF generado', ['csrf_token' => $token]);
}

// ===== PROCESAMIENTO PRINCIPAL =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Validaciones de seguridad
        validateSecurity();
        
        // Obtener datos del formulario
        $input_data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        if (empty($input_data)) {
            sendResponse(false, 'No se recibieron datos del formulario');
        }
        
        // Sanitizar datos
        $clean_data = sanitizeInput($input_data);
        
        // Determinar tipo de formulario
        $form_type = $clean_data['form_type'] ?? 'contact';
        
        // Procesar según el tipo de formulario
        switch ($form_type) {
            case 'contact':
                $result = processContactForm($clean_data);
                break;
                
            case 'feedback':
                $result = processFeedbackForm($clean_data);
                break;
                
            default:
                sendResponse(false, 'Tipo de formulario no válido');
        }
        
        if ($result['success']) {
            // Track en Google Analytics si está disponible
            trackGoogleAnalytics($form_type, $clean_data);
            
            sendResponse(true, 'Formulario procesado exitosamente', $result);
        } else {
            sendResponse(false, 'Error al procesar el formulario', $result);
        }
        
    } catch (Exception $e) {
        error_log("ODAM Form Error: " . $e->getMessage());
        sendResponse(false, 'Error interno del servidor: ' . $e->getMessage(), [], 500);
    }
}

// ===== TRACKING DE GOOGLE ANALYTICS =====
function trackGoogleAnalytics($form_type, $data) {
    // Esta función simularía el envío de datos a Google Analytics
    // En producción, se usaría la Measurement Protocol API
    
    $analytics_data = [
        'form_type' => $form_type,
        'timestamp' => date('c'),
        'service_type' => $data['service-type'] ?? 'N/A',
        'has_attachments' => !empty($_FILES)
    ];
    
    error_log("ODAM Analytics: " . json_encode($analytics_data));
    
    // En producción, aquí se enviaría a Google Analytics
    // usando cURL o file_get_contents a la Measurement Protocol
}

// ===== MANEJO DE RUTAS NO VÁLIDAS =====
http_response_code(404);
sendResponse(false, 'Endpoint no encontrado', [], 404);

?>
