// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        return this.items; // Return updated items array
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
            this.saveCart();
            this.updateCartCount();
        }
        return this.items; // Return updated items array
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        
        cartCounts.forEach(count => {
            count.textContent = totalItems;
        });
    }

    getItems() {
        return this.items;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }
}

// Initialize cart
const cart = new Cart();

// Export cart instance
window.cart = cart; 
// Enhanced Cart Management System
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.discounts = JSON.parse(localStorage.getItem('cartDiscounts')) || {};
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // Update cart count on storage change (for multiple tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.items = JSON.parse(e.newValue) || [];
                this.updateCartCount();
            }
        });
    }

    addItem(product, quantity = 1, variation = null) {
        const existingItemIndex = this.items.findIndex(item => 
            item.id === product.id && 
            JSON.stringify(item.variation) === JSON.stringify(variation)
        );

        if (existingItemIndex > -1) {
            this.items[existingItemIndex].quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                variation: variation,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`);
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { action: 'add', product, quantity } 
        }));
    }

    removeItem(productId, variation = null) {
        this.items = this.items.filter(item => 
            !(item.id == productId && JSON.stringify(item.variation) === JSON.stringify(variation))
        );
        
        this.saveCart();
        this.updateCartCount();
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { action: 'remove', productId } 
        }));
    }

    updateQuantity(productId, newQuantity, variation = null) {
        if (newQuantity <= 0) {
            this.removeItem(productId, variation);
            return;
        }

        const itemIndex = this.items.findIndex(item => 
            item.id == productId && JSON.stringify(item.variation) === JSON.stringify(variation)
        );

        if (itemIndex > -1) {
            this.items[itemIndex].quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
                detail: { action: 'update', productId, newQuantity } 
            }));
        }
    }

    getItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    applyDiscount(code, discountValue) {
        this.discounts[code] = discountValue;
        localStorage.setItem('cartDiscounts', JSON.stringify(this.discounts));
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { action: 'discount', code, discountValue } 
        }));
    }

    removeDiscount(code) {
        delete this.discounts[code];
        localStorage.setItem('cartDiscounts', JSON.stringify(this.discounts));
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { action: 'removeDiscount', code } 
        }));
    }

    getTotalDiscount() {
        return Object.values(this.discounts).reduce((total, discount) => total + discount, 0);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getTotalDiscount();
        const shipping = this.getShippingCost();
        const tax = this.getTaxAmount();
        
        return Math.max(0, subtotal - discount + shipping + tax);
    }

    getShippingCost() {
        const subtotal = this.getSubtotal();
        return subtotal >= 500 ? 0 : 100; // Free shipping over ₹500
    }

    getTaxAmount() {
        const subtotal = this.getSubtotal();
        return Math.round(subtotal * 0.1); // 10% tax
    }

    clearCart() {
        this.items = [];
        this.discounts = {};
        this.saveCart();
        localStorage.removeItem('cartDiscounts');
        this.updateCartCount();
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { action: 'clear' } 
        }));
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'block' : 'none';
        });
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.cart-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles if not exists
        if (!document.querySelector('#cart-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'cart-notification-styles';
            style.textContent = `
                .cart-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: #28a745;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                }
                
                .cart-notification-error {
                    background-color: #dc3545;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Wishlist functionality
    toggleWishlist(productId) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.indexOf(productId);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            this.showNotification('Removed from wishlist');
        } else {
            wishlist.push(productId);
            this.showNotification('Added to wishlist');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update wishlist UI
        const wishlistButtons = document.querySelectorAll(`[data-product-id="${productId}"] .add-to-wishlist`);
        wishlistButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (wishlist.includes(productId)) {
                icon.className = 'fas fa-heart';
                button.style.color = '#e74c3c';
            } else {
                icon.className = 'far fa-heart';
                button.style.color = '';
            }
        });
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { productId, added: wishlist.includes(productId) } 
        }));
    }

    getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    // Save for later functionality
    saveForLater(productId, variation = null) {
        const itemIndex = this.items.findIndex(item => 
            item.id == productId && JSON.stringify(item.variation) === JSON.stringify(variation)
        );

        if (itemIndex > -1) {
            const item = this.items[itemIndex];
            let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
            
            // Check if already saved
            const alreadySaved = savedItems.some(saved => 
                saved.id == productId && JSON.stringify(saved.variation) === JSON.stringify(variation)
            );

            if (!alreadySaved) {
                savedItems.push({...item, savedAt: new Date().toISOString()});
                localStorage.setItem('savedItems', JSON.stringify(savedItems));
                this.showNotification('Item saved for later');
            }

            this.removeItem(productId, variation);
        }
    }

    getSavedItems() {
        return JSON.parse(localStorage.getItem('savedItems')) || [];
    }

    moveToCart(productId, variation = null) {
        let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        const itemIndex = savedItems.findIndex(item => 
            item.id == productId && JSON.stringify(item.variation) === JSON.stringify(variation)
        );

        if (itemIndex > -1) {
            const item = savedItems[itemIndex];
            this.addItem(item, item.quantity, item.variation);
            
            savedItems.splice(itemIndex, 1);
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
            
            this.showNotification('Item moved to cart');
        }
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Coupon management
class CouponManager {
    constructor() {
        this.coupons = {
            'WELCOME10': { type: 'percentage', value: 10, minOrder: 500 },
            'SAVE50': { type: 'fixed', value: 50, minOrder: 300 },
            'NEWUSER': { type: 'percentage', value: 15, minOrder: 1000 },
            'FREESHIP': { type: 'shipping', value: 0, minOrder: 0 }
        };
    }

    validateCoupon(code, orderTotal) {
        const coupon = this.coupons[code.toUpperCase()];
        
        if (!coupon) {
            return { valid: false, message: 'Invalid coupon code' };
        }

        if (orderTotal < coupon.minOrder) {
            return { 
                valid: false, 
                message: `Minimum order amount ₹${coupon.minOrder} required` 
            };
        }

        return { valid: true, coupon };
    }

    calculateDiscount(code, orderTotal) {
        const validation = this.validateCoupon(code, orderTotal);
        
        if (!validation.valid) {
            return 0;
        }

        const coupon = validation.coupon;
        
        switch (coupon.type) {
            case 'percentage':
                return Math.round(orderTotal * (coupon.value / 100));
            case 'fixed':
                return Math.min(coupon.value, orderTotal);
            case 'shipping':
                return 0; // Handled separately
            default:
                return 0;
        }
    }
}

// Initialize coupon manager
const couponManager = new CouponManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, CouponManager };
}
