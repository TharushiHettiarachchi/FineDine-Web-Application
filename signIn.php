<?php

require 'vendor/autoload.php'; 


$factory = (new \Kreait\Firebase\Factory())
    ->withServiceAccount(__DIR__ . '/config/firebase-credentials.json');
$firestore = $factory->createFirestore();
$db = $firestore->database();

try {
    $mobile = $data['mobile'];
    
   
    $userCollection = $db->collection('user');
    $query = $userCollection->where('mobile', '==', $mobile);
    $snapshot = $query->documents();
    
    if ($snapshot->isEmpty()) {
       
        echo json_encode(['success' => false, 'error' => 'not_found']);
    } else {
      
        $doc = $snapshot->documents()[0];
        $userData = $doc->data();
        $userWithId = array_merge($userData, ['id' => $doc->id()]);
        
       
        echo json_encode(['success' => true, 'user' => $userWithId]);
    }

} catch (Exception $e) {
    
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'server_error', 'message' => $e->getMessage()]);
}
?>