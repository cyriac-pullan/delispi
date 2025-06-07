document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Mini Cart Toggle
    const cartIcon = document.querySelector('.cart-icon');
    const miniCart = document.querySelector('.mini-cart');
    const closeMiniCart = document.querySelector('.close-mini-cart');
    
    cartIcon.addEventListener('click', function(e) {
        miniCart.classList.add('active');
        overlay.classList.add('active');
    });
    
    closeMiniCart.addEventListener('click', function() {
        miniCart.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Quick View Modal
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="product-quick-view">
                <div class="product-image">
                    <img src="" alt="Product Image">
                </div>
                <div class="product-details">
                    <h2></h2>
                    <p class="description"></p>
                    <div class="price"></div>
                    <div class="variations">
                        <h3>Available Sizes</h3>
                        <div class="size-options"></div>
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productImage = productCard.querySelector('img').src;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;

            modal.querySelector('.product-image img').src = productImage;
            modal.querySelector('.product-details h2').textContent = productName;
            modal.querySelector('.price').textContent = productPrice;
            
            modal.style.display = 'flex';
        });
    });
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Product Quantity Selector
    const quantityMinusButtons = document.querySelectorAll('.quantity-minus');
    const quantityPlusButtons = document.querySelectorAll('.quantity-plus');
    
    quantityMinusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.nextElementSibling;
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });
    
    quantityPlusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.value = parseInt(input.value) + 1;
        });
    });
    
    // Price formatting function
    function formatPrice(price) {
        return '₹' + price.toLocaleString('en-IN');
    }
    
    // Product Data - will be loaded from database
    let products = [];
    
    // Load products from database
    async function loadProducts() {
        try {
            products = await api.getProducts();
            console.log('Products loaded:', products);
            
            // Update product displays on page
            updateProductDisplays();
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to static data if API fails
            products = [
                {
                    id: 1,
                    name: 'Organic Turmeric Powder',
                    price: 249,
                    image: '/images/spices/turmeric.jpg',
                    category: 'Ground Spices',
                    description: 'Premium organic turmeric powder sourced from India.'
                },
                {
                    id: 2,
                    name: 'Ceylon Cinnamon Sticks',
                    price: 399,
                    image: '/images/spices/cinnamon.jpg',
                    category: 'Whole Spices',
                    description: 'Authentic Ceylon cinnamon sticks with sweet flavor.'
                },
                {
                    id: 3,
                    name: 'Green Cardamom Pods',
                    price: 499,
                    image: '/images/spices/cardamom.jpg',
                    category: 'Whole Spices',
                    description: 'Premium green cardamom pods with intense aroma.'
                }
            ];
        }
    }
    
    // Update product displays
    function updateProductDisplays() {
        // Update featured products section if it exists
        const featuredProductsContainer = document.querySelector('.featured-products .products-grid');
        if (featuredProductsContainer && products.length > 0) {
            featuredProductsContainer.innerHTML = '';
            
            // Show first 6 products as featured
            products.slice(0, 6).forEach(product => {
                const productCard = createProductCard(product);
                featuredProductsContainer.appendChild(productCard);
            });
        }
        
        // Update products page if it exists
        const productsContainer = document.querySelector('.products-container .products-grid');
        if (productsContainer && products.length > 0) {
            productsContainer.innerHTML = '';
            
            products.forEach(product => {
                const productCard = createProductCard(product);
                productsContainer.appendChild(productCard);
            });
        }
    }
    
    // Create product card HTML
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="quick-view" onclick="showQuickView(${product.id})">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                    <button class="add-to-wishlist" onclick="toggleWishlist(${product.id})">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span class="rating-count">(4.5)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Cart Functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    function updateCart() {
        const cartCount = document.querySelector('.cart-icon');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCount.setAttribute('data-count', totalItems);
        } else {
            cartCount.removeAttribute('data-count');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart updated:', cart);
    }
    
    function addToCart(productId, quantity = 1, variation = null) {
        const product = (typeof products !== 'undefined') ? products.find(p => p.id === productId) : null;

        if (!product) {
            console.error('Product not found in addToCart:', productId);
            showNotification('Error adding product to cart.');
            return;
        }

        const cartItem = {
            id: productId,
            quantity: quantity,
            variation: variation ? { type: variation.type, value: variation.value, price: variation.price } : null,
            price: variation ? variation.price : product.price,
            name: product.name,
            image: product.image
        };

        const existingItemIndex = cart.findIndex(item => 
            item.id === productId && 
            (!variation || (item.variation?.type === variation.type && item.variation?.value === variation.value))
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        updateCart();
        showNotification(`${product.name} added to cart!`);
    }
    
    // Add to Cart Event Listeners
    document.body.addEventListener('click', function(e) {
        const addToCartButton = e.target.closest('.add-to-cart, .add-to-cart-btn');

        if (addToCartButton) {
            e.preventDefault();

            const productElement = addToCartButton.closest('.product-card') || addToCartButton.closest('.product-detail');
            if (!productElement) {
                console.error('Could not find product element for add to cart.');
                showNotification('Error adding product to cart.');
                return;
            }
            
            let productId = null;
            let quantity = 1;
            let selectedVariation = null;

            if (productElement.classList.contains('product-card')) {
                 productId = parseInt(productElement.dataset.id);
            }

            if (productElement.classList.contains('product-detail')) {
                productId = parseInt(productElement.dataset.id) || 1;
                
                const quantityInput = productElement.querySelector('.quantity-selector input');
                quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                const selectedSizeButton = productElement.querySelector('.size-option.active');
                if (selectedSizeButton) {
                    selectedVariation = {
                        type: 'size',
                        value: selectedSizeButton.textContent.trim(),
                        price: parseFloat(selectedSizeButton.dataset.price)
                    };
                } else {
                     const productPriceElement = productElement.querySelector('.product-price .current-price');
                     if(productPriceElement) {
                         selectedVariation = {
                            type: 'base',
                            value: 'default',
                            price: parseFloat(productPriceElement.textContent.replace('₹', ''))
                         };
                     }
                }
            }

            if (!isNaN(productId)) {
                 addToCart(productId, quantity, selectedVariation);
            } else {
                 console.error('Invalid product ID for add to cart:', productId);
                 showNotification('Error adding product to cart.');
            }
        }
    });
    
    // Wishlist Functionality
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    function updateWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    function toggleWishlist(productId) {
        const index = wishlist.indexOf(productId);
        if (index === -1) {
            wishlist.push(productId);
            showNotification('Product added to wishlist!');
        } else {
            wishlist.splice(index, 1);
            showNotification('Product removed from wishlist!');
        }
        updateWishlist();
    }
    
    // Notification System
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            // Here you would typically send this to your backend
            showNotification('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }
    
    // WhatsApp Integration
    const whatsappButton = document.querySelector('.whatsapp-chat');
    if (whatsappButton) {
        whatsappButton.addEventListener('click', (e) => {
            e.preventDefault();
            const message = 'Hello! I have a question about your spices.';
            const whatsappUrl = `https://wa.me/YOUR-WHATSAPP-NUMBER?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add CSS for modal and notifications
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            position: relative;
        }

        .close-modal {
            position: absolute;
            right: 1rem;
            top: 1rem;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .product-quick-view {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from {
                transform: translate(-50%, 100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }

        .cart-icon {
            position: relative;
        }

        .cart-icon[data-count]:after {
            content: attr(data-count);
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 12px;
        }

        @media (max-width: 768px) {
            .product-quick-view {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize
    document.addEventListener('DOMContentLoaded', async () => {
        updateCart();
        
        // Load products from database
        await loadProducts();
        
        // Add event listeners for existing product cards
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = parseInt(card.dataset.id);
            
            const quickViewBtn = card.querySelector('.quick-view');
            const wishlistBtn = card.querySelector('.add-to-wishlist');
            const addToCartBtn = card.querySelector('.add-to-cart');
            
            if (quickViewBtn) quickViewBtn.onclick = () => showQuickView(productId);
            if (wishlistBtn) wishlistBtn.onclick = () => toggleWishlist(productId);
            if (addToCartBtn) addToCartBtn.onclick = () => addToCart(productId);
        });
    });
});