<?php
session_start();

$ADMIN_PASSWORD = 'peshawar.123';
header('Content-Type: application/json');

// GET: check login status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $isLoggedIn = false;
    if (isset($_SESSION['cms_logged_in']) && $_SESSION['cms_logged_in'] === true) {
        $isLoggedIn = true;
    }
    echo json_encode(['loggedIn' => $isLoggedIn]);
    exit;
}

// POST: login attempt
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if it's a JSON request
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Handle logout action
    if (isset($input['action']) && $input['action'] === 'logout') {
        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Handle login
    $password = $input['password'] ?? '';
    if ($password === $ADMIN_PASSWORD) {
        session_regenerate_id(true);
        $_SESSION['cms_logged_in'] = true;
        $_SESSION['cms_login_time'] = time();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
    exit;
}
?>