<?php
require_once 'config/database.php';
require_once 'utils/auth.php';

$user = checkAuth();
if (!$user) {
    header('Location: login.php');
    exit;
}

// 获取订单列表
$stmt = $pdo->prepare("
    SELECT * FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC
");
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的订单 - 优学优盘</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>
    
    <main class="container">
        <div class="orders-list">
            <h2 class="section-title">我的订单</h2>
            <?php if (empty($orders)): ?>
                <div class="empty-orders">
                    <i class="fas fa-shopping-cart"></i>
                    <p>暂无订单</p>
                    <a href="/" class="primary-btn">去选购</a>
                </div>
            <?php else: ?>
                <?php foreach ($orders as $order): ?>
                    <div class="order-item">
                        <div class="order-header">
                            <span class="order-number">订单号：<?= htmlspecialchars($order['order_number']) ?></span>
                            <span class="order-status <?= $order['status'] ?>"><?= getStatusText($order['status']) ?></span>
                        </div>
                        <div class="order-content">
                            <div class="order-info">
                                <p>
                                    <i class="fas fa-desktop"></i>
                                    系统：<?= getSystemText($order['system_type']) ?>
                                    <?php if ($order['linux_distro']): ?>
                                        (<?= htmlspecialchars($order['linux_distro']) ?>)
                                    <?php endif; ?>
                                </p>
                                <p>
                                    <i class="fas fa-hdd"></i>
                                    容量：<?= htmlspecialchars($order['capacity']) ?>GB
                                </p>
                                <?php if ($order['software_list']): ?>
                                    <p>
                                        <i class="fas fa-cube"></i>
                                        软件：<?= formatSoftwareList(json_decode($order['software_list'], true)) ?>
                                    </p>
                                <?php endif; ?>
                            </div>
                            <div class="order-price">
                                <span class="price">¥<?= htmlspecialchars($order['total_price']) ?></span>
                            </div>
                        </div>
                        <div class="order-actions">
                            <a href="order_detail.php?id=<?= $order['id'] ?>" class="btn">查看详情</a>
                            <?php if ($order['status'] === 'pending'): ?>
                                <button onclick="payOrder(<?= $order['id'] ?>)" class="btn primary">立即支付</button>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>
    <script src="js/payment.js"></script>
</body>
</html>

<?php
function getStatusText($status) {
    $statusMap = [
        'pending' => '待支付',
        'paid' => '已支付',
        'completed' => '已完成',
        'cancelled' => '已取消'
    ];
    return $statusMap[$status] ?? $status;
}

function getSystemText($system) {
    $systemMap = [
        'windows10' => 'Windows 10',
        'windows11' => 'Windows 11',
        'windowsPE' => 'Windows PE',
        'linux' => 'Linux'
    ];
    return $systemMap[$system] ?? $system;
}

function formatSoftwareList($software) {
    if (!is_array($software)) return '';
    return implode('、', $software);
}
?> 