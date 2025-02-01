// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面已加载完成');

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 购买按钮点击事件
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            
            // 获取产品ID
            const productId = this.dataset.productId;
            if (!productId) {
                alert('产品信息不完整');
                return;
            }

            // 添加加载状态
            this.classList.add('loading');
            this.disabled = true;
            
            try {
                // 发送创建订单请求
                const response = await fetch('/api/create_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity: 1
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '创建订单失败');
                }

                // 订单创建成功
                alert('订单创建成功！订单号：' + data.order.id);
                
                // 可以选择跳转到订单详情页面
                // window.location.href = '/order_detail.php?id=' + data.order.id;
            } catch (error) {
                if (error.message === '请先登录') {
                    // 如果未登录，跳转到登录页面
                    window.location.href = '/login.php';
                } else {
                    alert('错误：' + error.message);
                }
            } finally {
                // 移除加载状态
                this.classList.remove('loading');
                this.disabled = false;
            }
        });
    });

    // 添加雪花效果
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // 随机大小
        const size = Math.random() * 4 + 2;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        
        // 随机位置
        snowflake.style.left = `${Math.random() * 100}%`;
        
        // 随机动画持续时间
        const duration = Math.random() * 3 + 2;
        snowflake.style.animationDuration = `${duration}s`;
        
        // 添加到容器
        document.querySelector('.snowfall').appendChild(snowflake);
        
        // 动画结束后移除雪花
        setTimeout(() => {
            snowflake.remove();
        }, duration * 1000);
    }

    // 定期创建雪花
    setInterval(createSnowflake, 100);

    // 初始创建一些雪花
    for(let i = 0; i < 50; i++) {
        setTimeout(createSnowflake, Math.random() * 2000);
    }

    // 添加按钮点击波纹效果
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;
        
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // 为所有课程卡片中的按钮添加点击效果
    document.querySelectorAll('.course-card .buy-btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // 添加滚动动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px 0px'
    });

    // 监听订单表单
    const orderForm = document.querySelector('.order-form');
    if (orderForm) {
        observer.observe(orderForm);
        if (isElementInViewport(orderForm)) {
            orderForm.classList.add('visible');
        }
    }

    // 监听所有产品项和课程卡片
    const productItems = document.querySelectorAll('.product-item');
    const courseCards = document.querySelectorAll('.course-card');

    // 监听产品项
    productItems.forEach(item => {
        observer.observe(item);
        if (isElementInViewport(item)) {
            item.classList.add('visible');
        }
    });

    // 监听课程卡片
    courseCards.forEach(card => {
        observer.observe(card);
        if (isElementInViewport(card)) {
            card.classList.add('visible');
        }
    });

    // 添加手机号验证函数
    function validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    // 检查手机号是否在1小时内提交过订单
    async function checkPhoneSubmitLimit(phone) {
        try {
            const response = await fetch('/api/check_phone_limit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });
            
            const data = await response.json();
            return data.canSubmit;
        } catch (error) {
            console.error('检查手机号限制出错:', error);
            return false;
        }
    }

    // 修改表单验证逻辑
    document.getElementById('orderForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 验证手机号格式
        const phone = document.getElementById('phone').value;
        const phoneError = document.getElementById('phone-error');
        
        if (!validatePhone(phone)) {
            phoneError.textContent = '请输入正确的手机号格式';
            return;
        }
        
        // 清除错误提示
        phoneError.textContent = '';
        
        const school = document.getElementById('school').value;
        if (school === 'no') {
            alert('抱歉，本产品仅限职校学生购买');
            return;
        }
        
        // 允许表单提交
        this.submit();
    });

    // 实时验证手机号格式
    document.getElementById('phone').addEventListener('input', function() {
        const phoneError = document.getElementById('phone-error');
        if (this.value && !validatePhone(this.value)) {
            phoneError.textContent = '请输入正确的手机号格式';
        } else {
            phoneError.textContent = '';
        }
    });

    // 实时验证学校选择
    document.getElementById('school').addEventListener('change', function() {
        const submitBtn = document.querySelector('.buy-button');
        const schoolInfoFields = document.querySelectorAll('.school-info');
        const warningMsg = document.getElementById('warning-message') || createWarningMessage();
        
        if (this.value === 'no') {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            schoolInfoFields.forEach(field => {
                field.style.display = 'none';
                field.querySelector('input').required = false;
            });
            warningMsg.style.display = 'block';
        } else if (this.value === 'yes') {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            schoolInfoFields.forEach(field => {
                field.style.display = 'block';
                field.querySelector('input').required = true;
            });
            warningMsg.style.display = 'none';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            schoolInfoFields.forEach(field => {
                field.style.display = 'none';
                field.querySelector('input').required = false;
            });
            warningMsg.style.display = 'none';
        }
    });

    // 创建警告消息元素
    function createWarningMessage() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'warning-message';
        warningDiv.className = 'warning-message';
        warningDiv.textContent = '禁止购买';
        warningDiv.style.display = 'none';
        
        // 插入到学校选择字段后面
        const schoolSelect = document.getElementById('school');
        schoolSelect.parentNode.appendChild(warningDiv);
        
        return warningDiv;
    }

    // 添加视频教程购买按钮点击事件
    document.querySelectorAll('.course-card .buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = createContactModal();
            document.body.appendChild(modal);
        });
    });
});

// 检查元素是否在视口中
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 打开客服对话框
function openCustomDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal custom-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>联系客服</h2>
            <div class="contact-info">
                <p><i class="fab fa-qq"></i> QQ：3084897108</p>
                <p><i class="far fa-envelope"></i> 邮箱：vcby520@gmail.com</p>
            </div>
            <div class="qr-code">
                <img src="images/kf.jpg" alt="微信二维码">
                <p>扫码添加客服微信</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭功能
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = function() {
        modal.remove();
    }
    
    // 点击模态框外部关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    }
}

// 添加模态框样式
const style = document.createElement('style');
style.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        position: relative;
        max-width: 500px;
        width: 90%;
    }
    
    .close-btn {
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    .contact-info {
        margin: 2rem 0;
    }
    
    .contact-info p {
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .qr-code {
        text-align: center;
    }
    
    .qr-code img {
        max-width: 200px;
        margin-bottom: 1rem;
    }
`;

document.head.appendChild(style);

// 打开选购弹窗
function openPurchaseModal() {
    // 首先验证必填字段
    const form = document.getElementById('orderForm');
    const requiredFields = form.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.classList.add('error');
            const errorElement = field.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '此字段为必填项';
            }
        } else {
            field.classList.remove('error');
            const errorElement = field.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        }
    });
    
    if (!isValid) {
        alert('请先填写必要的个人信息');
        return;
    }
    
    // 创建并显示配置弹窗
    const modal = createPurchaseModal();
    document.body.appendChild(modal);
    setupPurchaseModal(modal);
}

// 设置选购弹窗的交互逻辑
function setupPurchaseModal(modal) {
    let currentStep = 1;
    let selectedSystem = '';
    let selectedDistro = '';
    const totalSteps = 4;
    
    const nextBtn = modal.querySelector('.next-btn');
    const prevBtn = modal.querySelector('.prev-btn');
    const steps = modal.querySelectorAll('.step');
    const contents = modal.querySelectorAll('.step-content');
    
    let totalPrice = 0;
    const totalPriceElement = modal.querySelector('.total-price span');

    // 更新总价函数
    function updateTotalPrice() {
        let subtotal = 0;
        const shippingFee = 2; // 固定运费2元
        
        // 添加容量价格
        const selectedCapacity = modal.querySelector('.capacity-options .selected');
        if (selectedCapacity) {
            subtotal += parseInt(selectedCapacity.dataset.price);
        }
        
        // 添加软件价格
        const selectedSoftware = modal.querySelectorAll('.software-options input:checked');
        selectedSoftware.forEach(software => {
            subtotal += parseInt(software.dataset.price);
        });
        
        // 更新显示
        const subtotalElement = modal.querySelector('.subtotal');
        const totalPriceElement = modal.querySelector('.total-price');
        
        if (subtotalElement) {
            subtotalElement.textContent = `¥${subtotal}`;
        }
        
        if (totalPriceElement) {
            totalPriceElement.textContent = `¥${subtotal + shippingFee}`;
        }
        
        // 更新总价变量（用于提交表单）
        totalPrice = subtotal + shippingFee;
    }

    // 关闭按钮
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // 系统选择
    modal.querySelectorAll('.system-options .option-card').forEach(card => {
        card.onclick = () => {
            modal.querySelectorAll('.system-options .option-card').forEach(c => 
                c.classList.remove('selected'));
            card.classList.add('selected');
            selectedSystem = card.dataset.system;
            
            // 处理 Linux 选项
            const linuxOptions = modal.querySelector('.linux-options');
            const capacityOptions = modal.querySelector('.capacity-options');
            
            if (selectedSystem === 'linux') {
                linuxOptions.classList.add('visible');
                nextBtn.disabled = true; // 等待选择具体发行版
            } else {
                linuxOptions.classList.remove('visible');
                nextBtn.disabled = false;
            }
        };
    });
    
    // 提取容量选择事件绑定为单独函数
    function bindCapacityEvents() {
        modal.querySelectorAll('.capacity-options .option-card').forEach(card => {
            card.onclick = () => {
                modal.querySelectorAll('.capacity-options .option-card').forEach(c => 
                    c.classList.remove('selected'));
                card.classList.add('selected');
                updateTotalPrice();
            };
        });
    }

    // 初始绑定容量选择事件
    bindCapacityEvents();

    // 添加 Linux 发行版选择处理
    modal.querySelectorAll('.distro-options .option-card').forEach(card => {
        card.onclick = () => {
            modal.querySelectorAll('.distro-options .option-card').forEach(c => 
                c.classList.remove('selected'));
            card.classList.add('selected');
            selectedDistro = card.dataset.distro;
            nextBtn.disabled = false;
        };
    });
    
    // 下一步按钮
    nextBtn.onclick = () => {
        if (currentStep === totalSteps) {
            // 获取所有配置信息
            const selectedSystem = modal.querySelector('.system-options .selected')?.dataset.system;
            const selectedDistro = modal.querySelector('.distro-options .selected')?.dataset.distro;
            const selectedCapacity = modal.querySelector('.capacity-options .selected')?.dataset.capacity;
            const selectedSoftware = Array.from(modal.querySelectorAll('.software-options input:checked'))
                .map(input => input.parentElement.querySelector('span').textContent)
                .join(', ');

            // 更新表单隐藏字段
            document.getElementById('selectedSystem').value = selectedSystem;
            document.getElementById('selectedDistro').value = selectedDistro;
            document.getElementById('selectedCapacity').value = selectedCapacity;
            document.getElementById('selectedSoftware').value = selectedSoftware;
            document.getElementById('totalPrice').value = totalPrice;

            // 提交表单
            const form = document.getElementById('orderForm');
            form.submit();
            
            // 关闭弹窗
            modal.remove();
            return;
        }

        currentStep++;
        
        // 如果进入第二步且是 Linux 系统，设置 Linux 专用容量选项
        if (currentStep === 2 && selectedSystem === 'linux') {
            const capacityOptions = modal.querySelector('.capacity-options');
            capacityOptions.innerHTML = `
                <div class="option-card selected" data-capacity="8" data-price="10">
                    <span class="size">8GB</span>
                    <span class="price">¥10</span>
                </div>
                <div class="option-card premium-capacity" data-capacity="128" data-price="999">
                    <span class="size">128GB</span>
                    <span class="price">¥999</span>
                    <div class="capacity-tip">
                        <i class="fas fa-info-circle"></i>
                        建议通过底部私人订制渠道购买大容量 Linux
                    </div>
                </div>
            `;
            bindCapacityEvents();
            updateTotalPrice();
        }
        
        // 如果是第3步完成后，显示确认页面
        if (currentStep === 4) {
            const confirmContent = modal.querySelector('.step-content[data-step="4"]');
            const selectedSystem = modal.querySelector('.system-options .selected');
            const selectedDistro = modal.querySelector('.distro-options .selected');
            const selectedCapacity = modal.querySelector('.capacity-options .selected');
            const selectedSoftware = Array.from(modal.querySelectorAll('.software-options input:checked'));

            confirmContent.innerHTML = `
                <h3>确认您的配置</h3>
                <div class="confirm-details">
                    <div class="confirm-item">
                        <span class="label">系统类型：</span>
                        <span class="value">${selectedSystem.querySelector('h4').textContent}</span>
                    </div>
                    ${selectedDistro ? `
                        <div class="confirm-item">
                            <span class="label">Linux发行版：</span>
                            <span class="value">${selectedDistro.querySelector('h4').textContent}</span>
                        </div>
                    ` : ''}
                    <div class="confirm-item">
                        <span class="label">存储容量：</span>
                        <span class="value">${selectedCapacity.querySelector('.size').textContent}</span>
                    </div>
                    ${selectedSoftware.length > 0 ? `
                        <div class="confirm-item">
                            <span class="label">已选软件：</span>
                            <span class="value">${selectedSoftware.map(sw => 
                                sw.parentElement.querySelector('span').textContent).join('、')}</span>
                        </div>
                    ` : ''}
                    <div class="confirm-item total">
                        <span class="label">总价：</span>
                        <span class="value price">¥${totalPrice}</span>
                    </div>
                </div>
                <div class="confirm-notice">
                    <i class="fas fa-info-circle"></i>
                    请确认以上配置无误，点击"完成"按钮提交订单
                </div>
            `;
        }
        
        updateStepUI();
    };
    
    // 上一步按钮
    prevBtn.onclick = () => {
        currentStep--;
        updateStepUI();
    };
    
    // 更新步骤UI
    function updateStepUI() {
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });
        
        contents.forEach(content => {
            content.classList.toggle('hidden', 
                parseInt(content.dataset.step) !== currentStep);
        });
        
        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep === totalSteps ? '完成' : '下一步';
    }

    // 软件选择事件
    modal.querySelectorAll('.software-options input').forEach(checkbox => {
        checkbox.onchange = () => {
            updateTotalPrice();
        };
    });
}

// 创建选购弹窗
function createPurchaseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal purchase-modal';
    modal.innerHTML = `
        <style>
            .price-details {
                margin-top: 2rem;
                padding: 1.5rem;
                background: #f8fafc;
                border-radius: 0.8rem;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .price-item {
                display: flex;
                justify-content: space-between;
                padding: 0.8rem 0;
                color: #6b7280;
                font-size: 1rem;
            }

            .price-item:not(:last-child) {
                border-bottom: 1px dashed #e5e7eb;
            }

            .price-item.total {
                border-top: 2px solid #e5e7eb;
                margin-top: 0.5rem;
                padding-top: 1rem;
                font-weight: 600;
                color: #1f2937;
                font-size: 1.1rem;
            }

            .price-item.total .total-price {
                color: #dc2626;
                font-size: 1.3rem;
            }

            .price-item .shipping {
                color: #059669;
            }

            .price-item span:first-child {
                color: #4b5563;
            }
        </style>
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            
            <!-- 步骤指示器 -->
            <div class="steps">
                <div class="step active" data-step="1">系统选择</div>
                <div class="step" data-step="2">容量选择</div>
                <div class="step" data-step="3">软件选择</div>
                <div class="step" data-step="4">确认配置</div>
            </div>
            
            <!-- 步骤1：系统选择 -->
            <div class="step-content" data-step="1">
                <h3>选择系统类型</h3>
                <div class="system-options">
                    <div class="option-card" data-system="win10">
                        <i class="fab fa-windows"></i>
                        <h4>Windows 10</h4>
                    </div>
                    <div class="option-card" data-system="win11">
                        <i class="fab fa-windows"></i>
                        <h4>Windows 11</h4>
                    </div>
                    <div class="option-card" data-system="pe">
                        <i class="fas fa-compact-disc"></i>
                        <h4>Windows PE</h4>
                    </div>
                    <div class="option-card" data-system="linux">
                        <i class="fab fa-linux"></i>
                        <h4>Linux</h4>
                    </div>
                </div>
                
                <!-- Linux 发行版选择 -->
                <div class="linux-options">
                    <h3>选择 Linux 发行版</h3>
                    <div class="distro-options">
                        <div class="option-card" data-distro="ubuntu">
                            <div class="distro-emoji">🐧</div>
                            <h4>Ubuntu</h4>
                            <p>最流行的桌面发行版</p>
                        </div>
                        <div class="option-card" data-distro="fedora">
                            <div class="distro-emoji">🎩</div>
                            <h4>Fedora</h4>
                            <p>最新的软件包</p>
                        </div>
                        <div class="option-card" data-distro="manjaro">
                            <div class="distro-emoji">🎯</div>
                            <h4>Manjaro</h4>
                            <p>基于Arch的简单发行版</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 步骤2：容量选择 -->
            <div class="step-content hidden" data-step="2">
                <h3>选择存储容量</h3>
                <div class="capacity-options">
                    <div class="option-card" data-capacity="16" data-price="20">
                        <span class="size">16GB</span>
                        <span class="price">¥20</span>
                    </div>
                    <div class="option-card" data-capacity="32" data-price="35">
                        <span class="size">32GB</span>
                        <span class="price">¥35</span>
                    </div>
                    <div class="option-card" data-capacity="64" data-price="60">
                        <span class="size">64GB</span>
                        <span class="price">¥60</span>
                    </div>
                </div>
            </div>
            
            <!-- 步骤3：软件选择 -->
            <div class="step-content hidden" data-step="3">
                <h3>选择预装软件</h3>
                <div class="software-options">
                    <label class="software-item">
                        <span>Office 2021</span>
                        <input type="checkbox" data-price="30">
                        <span class="price">¥30</span>
                    </label>
                    <label class="software-item">
                        <span>Adobe 全家桶</span>
                        <input type="checkbox" data-price="50">
                        <span class="price">¥50</span>
                    </label>
                    <label class="software-item">
                        <span>编程开发套件</span>
                        <input type="checkbox" data-price="40">
                        <span class="price">¥40</span>
                    </label>
                </div>
                <div class="price-details">
                    <div class="price-item">
                        <span>商品金额：</span>
                        <span class="subtotal">¥0</span>
                    </div>
                    <div class="price-item">
                        <span>运费：</span>
                        <span class="shipping">¥2</span>
                    </div>
                    <div class="price-item total">
                        <span>总计：</span>
                        <span class="total-price">¥2</span>
                    </div>
                </div>
            </div>
            
            <!-- 步骤4：确认配置 -->
            <div class="step-content hidden" data-step="4">
                <!-- 这部分内容会在 JS 中动态生成 -->
            </div>
            
            <!-- 步骤按钮 -->
            <div class="step-buttons">
                <button class="prev-btn" disabled>上一步</button>
                <button class="next-btn">下一步</button>
            </div>
        </div>
    `;
    
    return modal;
}

// 创建联系方式弹窗
function createContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal contact-modal';
    modal.innerHTML = `
        <style>
            .contact-modal .modal-content {
                max-width: 400px;
                padding: 2rem;
            }

            .contact-qr {
                text-align: center;
                margin: 1.5rem 0;
            }

            .contact-qr img {
                max-width: 200px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .contact-title {
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 600;
                text-align: center;
                margin-bottom: 1rem;
            }

            .contact-desc {
                color: #6b7280;
                text-align: center;
                margin-bottom: 1.5rem;
            }

            .contact-notice {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1.5rem;
                font-size: 0.9rem;
                color: #4b5563;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .contact-notice i {
                color: #2563eb;
            }
        </style>
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <div class="contact-title">添加客服微信</div>
            <div class="contact-desc">扫描下方二维码添加客服微信，获取视频教程</div>
            <div class="contact-qr">
                <img src="images/kf.jpg" alt="客服微信二维码">
            </div>
            <div class="contact-notice">
                <i class="fas fa-info-circle"></i>
                <span>添加后请说明需要购买的教程版本</span>
            </div>
        </div>
    `;

    // 添加关闭功能
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    return modal;
} 