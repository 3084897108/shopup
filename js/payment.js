async function payOrder(orderId) {
    try {
        // 调用支付接口
        const response = await fetch('/api/create_payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: orderId })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error);
        }
        
        // 跳转到支付页面或显示支付二维码
        if (result.payment_url) {
            window.location.href = result.payment_url;
        } else if (result.qr_code) {
            showPaymentQRCode(result.qr_code);
        }
        
    } catch (error) {
        alert('支付失败：' + error.message);
    }
}

function showPaymentQRCode(qrCode) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>请扫码支付</h3>
            <img src="${qrCode}" alt="支付二维码">
            <p>支付完成后页面将自动刷新</p>
        </div>
    `;
    document.body.appendChild(modal);
} 