<?php
// 显示所有错误
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // 直接连接数据库，不使用配置文件
    $conn = mysqli_connect('localhost', 'zxzvkmfl', 'j9y8MxFo14', 'zxzvkmfl', '3306');
    
    if (!$conn) {
        throw new Exception("连接失败: " . mysqli_connect_error());
    }
    
    echo "数据库连接成功！<br>";
    echo "MySQL 版本: " . mysqli_get_server_info($conn);
    
    mysqli_close($conn);
    
} catch (Exception $e) {
    echo "错误: " . $e->getMessage();
}
?>
