document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. CAROUSEL/SLIDER LOGIC
    // -------------------------------------------------------------------------
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds
    let slideTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startSlideShow() {
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    function stopSlideShow() {
        clearInterval(slideTimer);
    }

    // Dot indicators click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideShow();
            showSlide(index);
            startSlideShow();
        });
    });

    // Initialize carousel
    if (slides.length > 0) {
        showSlide(0);
        startSlideShow();
    }

    // -------------------------------------------------------------------------
    // 2. DRAWERS AND BACKDROP LOGIC
    // -------------------------------------------------------------------------
    const backdrop = document.getElementById('backdrop');
    const navDrawer = document.getElementById('nav-drawer');
    const cartDrawer = document.getElementById('cart-drawer');
    
    const openNavBtn = document.getElementById('open-nav-btn');
    const closeNavBtn = document.getElementById('close-nav-btn');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const mobileOrderBtn = document.getElementById('mobile-order-btn');

    function closeAllDrawers() {
        navDrawer.classList.remove('open');
        cartDrawer.classList.remove('open');
        backdrop.classList.remove('active');
    }

    // Left Navigation Drawer
    openNavBtn.addEventListener('click', () => {
        closeAllDrawers();
        navDrawer.classList.add('open');
        backdrop.classList.add('active');
    });

    closeNavBtn.addEventListener('click', closeAllDrawers);

    // Right Cart Drawer
    function openCart() {
        closeAllDrawers();
        cartDrawer.classList.add('open');
        backdrop.classList.add('active');
    }

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeAllDrawers);
    
    if (mobileOrderBtn) {
        mobileOrderBtn.addEventListener('click', openCart);
    }

    // Backdrop Click
    backdrop.addEventListener('click', closeAllDrawers);

    // Navigation links clicking should close the drawer
    const navLinks = document.querySelectorAll('.nav-drawer-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Close nav drawer
            closeAllDrawers();
            
            // Set active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Smooth scroll handler is done by CSS scroll-behavior
        });
    });

    // -------------------------------------------------------------------------
    // 3. CART SYSTEM LOGIC
    // -------------------------------------------------------------------------
    let cart = [];

    // Local Product Quantities (in product section)
    const productQuantities = {
        'prawn-100': 1,
        'prawn-150': 1,
        'prawn-200': 1
    };

    // Plus/Minus handlers for Product Cards
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = btn.getAttribute('data-product-id');
            const qtyValEl = document.getElementById(`qty-${productId}`);
            let currentQty = productQuantities[productId];

            if (btn.classList.contains('plus')) {
                currentQty += 1;
            } else if (btn.classList.contains('minus')) {
                if (currentQty > 1) {
                    currentQty -= 1;
                }
            }

            productQuantities[productId] = currentQty;
            qtyValEl.textContent = currentQty;
        });
    });

    // Add to Cart Button handler
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');
            const count = btn.getAttribute('data-count');
            const qtyToAdd = productQuantities[id];

            addToCart(id, name, price, img, count, qtyToAdd);
            
            // Reset quantity display back to 1
            productQuantities[id] = 1;
            document.getElementById(`qty-${id}`).textContent = '1';

            // Visual feedback on Cart bubble
            animateCartIcon();
        });
    });

    function addToCart(id, name, price, img, count, qty) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({ id, name, price, img, count, qty });
        }
        
        updateCartUI();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    function updateCartItemQty(id, newQty) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.qty = parseInt(newQty);
            if (item.qty <= 0) {
                removeFromCart(id);
                return;
            }
        }
        updateCartUI();
    }

    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartCountEl = document.getElementById('cart-count');
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const cartTotalEl = document.getElementById('cart-total');
        const checkoutOptions = document.getElementById('cart-checkout-options');
        const cartDrawerFooter = document.getElementById('cart-drawer-footer');

        // Calculate Total Items & Total Price
        let totalItems = 0;
        let subtotal = 0;

        cart.forEach(item => {
            totalItems += item.qty;
            subtotal += item.price * item.qty;
        });

        // Update Header Cart Count
        cartCountEl.textContent = totalItems;

        if (cart.length === 0) {
            // Render Empty Cart Message
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <p>Your cart is empty.</p>
                    <p style="font-size: 12px;">Add some fresh prawns to start your order!</p>
                </div>
            `;
            checkoutOptions.style.display = 'none';
            cartDrawerFooter.style.display = 'none';
        } else {
            // Render Cart Items
            let itemsHtml = '<div class="cart-items-list">';
            cart.forEach(item => {
                itemsHtml += `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <span class="cart-item-name">${item.name.replace('Vannamei Prawns ', '')}</span>
                            <p class="cart-item-count">${item.count}</p>
                            <div class="cart-item-price-row">
                                <span class="cart-item-price">₹${item.price * item.qty}</span>
                                <div class="cart-item-qty">
                                    <button class="cart-item-qty-btn cart-qty-minus" data-id="${item.id}">-</button>
                                    <span class="cart-item-qty-val">${item.qty}</span>
                                    <button class="cart-item-qty-btn cart-qty-plus" data-id="${item.id}">+</button>
                                </div>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">&times;</button>
                    </div>
                `;
            });
            itemsHtml += '</div>';
            cartItemsContainer.innerHTML = itemsHtml;

            // Show details & totals
            checkoutOptions.style.display = 'flex';
            cartDrawerFooter.style.display = 'block';
            cartSubtotalEl.textContent = `₹${subtotal}`;
            cartTotalEl.textContent = `₹${subtotal}`; // Free delivery & prep service

            // Add Event Listeners to Cart Drawer Buttons
            addCartControlsListeners();
        }
    }

    function addCartControlsListeners() {
        // Minus Buttons in Cart
        document.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    updateCartItemQty(id, item.qty - 1);
                }
            });
        });

        // Plus Buttons in Cart
        document.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    updateCartItemQty(id, item.qty + 1);
                }
            });
        });

        // Remove Buttons in Cart
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                removeFromCart(id);
            });
        });
    }

    function animateCartIcon() {
        const cartBtn = document.getElementById('open-cart-btn');
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 200);
    }

    // -------------------------------------------------------------------------
    // 4. WHATSAPP ORDER GENERATOR
    // -------------------------------------------------------------------------
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');

    whatsappCheckoutBtn.addEventListener('click', () => {
        // Retrieve Form Details
        const prepService = document.getElementById('prep-service').value;
        const custName = document.getElementById('cust-name').value.trim();
        const custPhone = document.getElementById('cust-phone').value.trim();
        const custAddress = document.getElementById('cust-address').value.trim();

        // Validation
        if (!custName) {
            alert('Please enter your name.');
            document.getElementById('cust-name').focus();
            return;
        }
        if (!custPhone) {
            alert('Please enter your WhatsApp contact number.');
            document.getElementById('cust-phone').focus();
            return;
        }
        if (!custAddress) {
            alert('Please enter your delivery address.');
            document.getElementById('cust-address').focus();
            return;
        }

        // Format Prep Service Text
        const prepServiceLabels = {
            'none': 'None (Whole Prawns with Shell)',
            'cleaning': 'Cleaning Only (Cleaned, Shell On)',
            'peeled': 'Peeled Service (Shell & Head Removed)',
            'butterfly': 'Butterfly Cut Service (Split Back)'
        };
        const prepLabel = prepServiceLabels[prepService] || 'None';

        // Calculate Totals
        let grandTotal = 0;
        let itemsText = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;
            itemsText += `${index + 1}. *${item.name}*\n`;
            itemsText += `   Count size: ${item.count}\n`;
            itemsText += `   Quantity: ${item.qty} KG\n`;
            itemsText += `   Price: ₹${item.price}/KG (Total: ₹${itemTotal})\n\n`;
        });

        // WhatsApp Business Contact Numbers from flyer
        const storeNumber = '918985734989'; // Primary Whatsapp number

        // Build Custom Message
        let message = `🦐 *NEW ORDER - FFC SEA FOODS* 🦐\n`;
        message += `===============================\n\n`;
        message += `👤 *Customer Details:*\n`;
        message += `• *Name:* ${custName}\n`;
        message += `• *Phone:* ${custPhone}\n`;
        message += `• *Address:* ${custAddress}\n\n`;
        
        message += `📦 *Order Summary:*\n`;
        message += itemsText;
        
        message += `🔪 *Prep & Custom Cutting:*\n`;
        message += `• *Service Choice:* ${prepLabel}\n`;
        message += `• *Cost:* FREE\n\n`;
        
        message += `===============================\n`;
        message += `💰 *Grand Total:* *₹${grandTotal}*\n`;
        message += `🚚 *Delivery:* FREE (Tallarevu / Kakinada)\n`;
        message += `===============================\n\n`;
        message += `Thank you for ordering with FFC Sea Foods! Please reply to confirm and process this order.`;

        // Encode Message
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp API Link
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeNumber}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    });
});
