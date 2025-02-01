// API接口封装
const API = {
    // 基础请求函数
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }
            
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },

    // 用户登录
    async login(username, password) {
        return await this.request('/api/login.php', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // 用户注册
    async register(username, password, email) {
        return await this.request('/api/register.php', {
            method: 'POST',
            body: JSON.stringify({ username, password, email })
        });
    },

    // 获取产品列表
    async getProducts(type = null) {
        const url = type ? `/api/products.php?type=${type}` : '/api/products.php';
        return await this.request(url);
    },

    // 创建订单
    async createOrder(productId, quantity = 1) {
        return await this.request('/api/create_order.php', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }
};
