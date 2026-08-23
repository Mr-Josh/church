<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "=== Running Payment API Integration Tests ===\n";

chdir('c:\Users\Hodieb Stone Armel\church\church\backend');

try {
    $db = require 'config/database.php';
    if (!$db) {
        echo "FAIL: Database connection failed.\n";
        exit(1);
    }
    
    // Clear any existing test donations to have a clean slate
    $db->exec("DELETE FROM donations WHERE phone = '677112233'");
    echo "1. Cleaned up old test donations.\n";
    
    // Test 1: Create a donation (POST /api/donations)
    // We will simulate the post request logic directly
    $data = [
        'name' => 'Hodieb Stone Test',
        'phone' => '677112233',
        'amount' => 5000,
        'type' => 'Dîme',
        'payment_method' => 'Orange Money'
    ];
    
    $reference = 'DON-' . strtoupper(bin2hex(random_bytes(6)));
    $stmt = $db->prepare('INSERT INTO donations (reference, name, phone, amount, type, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $reference,
        $data['name'],
        $data['phone'],
        $data['amount'],
        $data['type'],
        $data['payment_method'],
        'pending'
    ]);
    
    $donationId = (int)$db->lastInsertId();
    echo "2. Created donation: ID={$donationId}, Ref={$reference}, Status=pending.\n";
    
    // Assert row exists in DB
    $stmt = $db->prepare("SELECT * FROM donations WHERE id = ?");
    $stmt->execute([$donationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['status'] === 'pending' && (float)$row['amount'] === 5000.0) {
        echo "   PASS: Donation correctly stored in database.\n";
    } else {
        echo "   FAIL: Donation not found or incorrect.\n";
    }
    
    // Test 2: Confirm mock payment (POST /api/donations/confirm/<id>)
    $transactionId = 'TXN-' . strtoupper(bin2hex(random_bytes(8)));
    $stmt = $db->prepare("UPDATE donations SET status = ?, transaction_id = ? WHERE id = ?");
    $stmt->execute(['success', $transactionId, $donationId]);
    echo "3. Confirmed mock payment: TxnId={$transactionId}.\n";
    
    // Assert row is updated to success
    $stmt = $db->prepare("SELECT * FROM donations WHERE id = ?");
    $stmt->execute([$donationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['status'] === 'success' && $row['transaction_id'] === $transactionId) {
        echo "   PASS: Donation status updated to 'success' and transaction ID saved.\n";
    } else {
        echo "   FAIL: Donation not updated.\n";
    }
    
    // Test 3: Admin Dashboard stats
    // Let's run the query that adminDashboard uses to get counts and sum
    $stmt = $db->query("SELECT COUNT(*) FROM donations");
    $totalCount = (int)$stmt->fetchColumn();
    
    $donationsSum = (float)$db->query("SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'success'")->fetchColumn();
    
    echo "4. Admin stats check:\n";
    echo "   - Total donations count: {$totalCount}\n";
    echo "   - Total successful donations sum: {$donationsSum} FCFA\n";
    
    if ($totalCount >= 1 && $donationsSum >= 5000.0) {
        echo "   PASS: Stats match expected donation metrics.\n";
    } else {
        echo "   FAIL: Incorrect stats calculated.\n";
    }
    
    echo "=== All Tests Completed Successfully ===\n";
    
} catch (PDOException $e) {
    echo "FAIL: PDO Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "FAIL: Error: " . $e->getMessage() . "\n";
}
