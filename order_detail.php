<?php
require_once 'config/database.php';
require_once 'utils/auth.php';

$user = checkAuth();
if (!$user) {
    header('Location: login.php');
    exit;
}

$order_id = $_GET['id'] ?? null;
if (!$order_id) {
    header('Location: orders.php');
    exit;
}

// 获取订单详情
$stmt = $pdo->prepare("
    SELECT * FROM orders 
    WHERE id = ? AND user_id = ?
");
$stmt->execute([$order_id, $user['id']]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    header('Location: orders.php');
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>订单详情</title>
    <!-- ... -->
</head>
<body>
    <div class="order-detail">
        <h2>订单详情</h2>
        <div class="order-info">
            <p>订单号：<?= htmlspecialchars($order['order_number']) ?></p>
            <p>系统类型：<?= htmlspecialchars($order['system_type']) ?></p>
            <?php if ($order['linux_distro']): ?>
                <p>Linux发行版：<?= htmlspecialchars($order['linux_distro']) ?></p>
            <?php endif; ?>
            <p>容量：<?= htmlspecialchars($order['capacity']) ?>GB</p>
            <p>总价：¥<?= htmlspecialchars($order['total_price']) ?></p>
            <p>状态：<?= htmlspecialchars($order['status']) ?></p>
        </div>
        <?php if ($order['status'] === 'pending'): ?>
            <button onclick="payOrder(<?= $order['id'] ?>)">立即支付</button>
        <?php endif; ?>
    </div>
</body>
</html> 