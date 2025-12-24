const API_URL = 'http://localhost:3000/api/products';

let cart = [];
let allProducts = [];
let currentFilter = '';

async function fetchProducts(category = '', search = '') {
    try {
        showLoading();
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        
        const url = params.toString() ? `${API_URL}?${params}` : API_URL;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.data;
            renderProducts(allProducts);
        } else {
            showError('Không có sản phẩm nào');
        }
        
    } catch (error) {
        console.error('Lỗi khi fetch products:', error);
        showError(`Lỗi kết nối: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-container">
                <div class="empty-icon">📦</div>
                <p>Không tìm thấy sản phẩm nào</p>
            </div>
        `;
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="product-badge ${product.badge_class || ''}">${product.badge}</span>` : ''}
            <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="product-image"
                onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'"
            >
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price}đ</div>
                    <button 
                        class="btn-add-cart" 
                        onclick="addToCart(${product.id})"
                        ${product.stock <= 0 ? 'disabled' : ''}
                    >
                        ${product.stock > 0 ? 'Thêm' : 'Hết hàng'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = productsHTML;
}

function filterProducts(category) {
    const filtered = allProducts.filter(product => 
        product.category === category
    );
    renderProducts(filtered);
}

function searchProducts(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.category.toLowerCase().includes(lowerKeyword)
    );
    
    renderProducts(results);
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('Sản phẩm này đã hết hàng!', 'error');
        return;
    }
    
    cart.push(product);
    updateCartCount();
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cartCount');
    cartCountEl.textContent = cart.length;
}

function viewCart() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng của bạn đang trống!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/\./g, ''));
        return sum + price;
    }, 0);
    
    const cartContent = cart.map((item, index) => 
        `${index + 1}. ${item.name} - ${item.price}đ`
    ).join('\n');
    
    alert(`Giỏ hàng của bạn:\n\n${cartContent}\n\nTổng cộng: ${total.toLocaleString('vi-VN')}đ`);
}

function showLoading() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner">⚽</div>
            <p style="font-size: 18px; color: #6b7280;">Đang tải sản phẩm...</p>
        </div>
    `;
}

function hideLoading() {
}

function showError(message) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">😕</div>
            <p class="error-message">${message}</p>
            <button class="btn-reset" onclick="fetchProducts()">
                Thử lại
            </button>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function filterByCategory(category) {
    currentFilter = category;
    fetchProducts(category);
    scrollToProducts();
}

function resetFilter() {
    currentFilter = '';
    fetchProducts();
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();
    
    if (keyword) {
        fetchProducts('', keyword);
        scrollToProducts();
    }
}

function scrollToProducts() {
    const element = document.getElementById('products');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', viewCart);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    document.querySelectorAll('.nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});

function formatPrice(price) {
    return parseInt(price.replace(/\./g, '')).toLocaleString('vi-VN');
}

function isProductAvailable(product) {
    return product.stock > 0;
}

function getProductById(id) {
    return allProducts.find(product => product.id === id);
}