<?php
// ... Setup code for headers and getting $mobile ...
require 'vendor/autoload.php'; // Path to Composer autoloader

// Initialize Firebase using your Service Account credentials
$factory = (new \Kreait\Firebase\Factory())
    ->withServiceAccount(__DIR__ . '/config/firebase-credentials.json');
$firestore = $factory->createFirestore();
$db = $firestore->database();

try {
    $mobile = $data['mobile'];
    
    // 1. Query the 'user' collection
    $userCollection = $db->collection('user');
    $query = $userCollection->where('mobile', '==', $mobile);
    $snapshot = $query->documents();
    
    if ($snapshot->isEmpty()) {
        // User not found in Firestore
        echo json_encode(['success' => false, 'error' => 'not_found']);
    } else {
        // User found
        $doc = $snapshot->documents()[0];
        $userData = $doc->data();
        $userWithId = array_merge($userData, ['id' => $doc->id()]);
        
        // Success response
        echo json_encode(['success' => true, 'user' => $userWithId]);
    }

} catch (Exception $e) {
    // Handle any connection or query error
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'server_error', 'message' => $e->getMessage()]);
}
?>