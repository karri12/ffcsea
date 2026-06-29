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

    // Load shop config (admin settings from localStorage, or defaults)
    const shopCfg = (typeof FFCConfig !== 'undefined') ? FFCConfig.getConfig() : null;

    // Selected weights per product (default 0.5 = half kg)
    const selectedWeights = {
        'prawn-100': 0.5,
        'prawn-150': 0.5,
        'prawn-200': 0.5
    };
    const selectedWeightLabels = {
        'prawn-100': '½ KG',
        'prawn-150': '½ KG',
        'prawn-200': '½ KG'
    };

    // basePrices loaded from admin config (falls back to defaults)
    const basePrices = {
        'prawn-100': shopCfg ? shopCfg.products['prawn-100'].pricePerKg : 300,
        'prawn-150': shopCfg ? shopCfg.products['prawn-150'].pricePerKg : 250,
        'prawn-200': shopCfg ? shopCfg.products['prawn-200'].pricePerKg : 200
    };

    // Helper: get prep service charge per KG from config
    function getPrepChargePerKg(serviceKey) {
        if (shopCfg && shopCfg.prepServices && shopCfg.prepServices[serviceKey]) {
            return shopCfg.prepServices[serviceKey].chargePerKg || 0;
        }
        // fallback defaults
        if (serviceKey === 'peeled' || serviceKey === 'butterfly') return 30;
        return 0;
    }

    // Helper: get delivery charge from config
    function getDeliveryCharge() {
        if (shopCfg && shopCfg.delivery) return shopCfg.delivery.charge || 0;
        return 0;
    }

    // Weight Selector Button handlers
    document.querySelectorAll('.weight-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            const weight = parseFloat(btn.getAttribute('data-weight'));
            const weightLabel = btn.getAttribute('data-weight-label');

            // Deactivate siblings
            const selectorWrapper = document.getElementById(`weight-${productId}`);
            if (selectorWrapper) {
                selectorWrapper.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
            }
            btn.classList.add('active');

            selectedWeights[productId] = weight;
            selectedWeightLabels[productId] = weightLabel;

            // Update price display tag
            const basePrice = basePrices[productId];
            if (basePrice) {
                const calculatedPrice = Math.round(basePrice * weight);
                const priceTag = document.getElementById(`price-tag-${productId}`);
                if (priceTag) {
                    priceTag.innerHTML = `₹${calculatedPrice} <span>/ ${weightLabel}</span>`;
                }
            }
        });
    });

    // Add to Cart Button handler
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const pricePerKg = parseInt(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');
            const count = btn.getAttribute('data-count');
            const weight = selectedWeights[id] || 0.5;
            const weightLabel = selectedWeightLabels[id] || '½ KG';
            const calculatedPrice = Math.round(pricePerKg * weight);

            addToCart(id, name, pricePerKg, img, count, weight, weightLabel, calculatedPrice);

            // Visual feedback on Cart bubble
            animateCartIcon();
        });
    });

    function addToCart(id, name, pricePerKg, img, count, weight, weightLabel, calculatedPrice) {
        // Direct checkout - only 1 item in the cart at a time
        cart = [];
        const cartKey = `${id}-${weight}`;
        cart.push({ cartKey, id, name, pricePerKg, price: calculatedPrice, img, count, weight, weightLabel, qty: 1 });
        
        updateCartUI();
        openCart(); // Automatically slide open the drawer
    }

    function removeFromCart(cartKey) {
        cart = cart.filter(item => item.cartKey !== cartKey);
        updateCartUI();
    }

    function updateCartItemQty(cartKey, newQty) {
        const item = cart.find(item => item.cartKey === cartKey);
        if (item) {
            item.qty = parseInt(newQty);
            if (item.qty <= 0) {
                removeFromCart(cartKey);
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
            let prepCharge = 0;

            cart.forEach(item => {
                totalItems += item.qty;
                subtotal += item.price * item.qty;
            });

            // Get selected prep service
            const prepServiceSelect = document.getElementById('prep-service');
            const selectedPrep = prepServiceSelect ? prepServiceSelect.value : 'none';
            
            // Get prep charge rate from admin config
            const prepRatePerKg = getPrepChargePerKg(selectedPrep);
            if (prepRatePerKg > 0) {
                cart.forEach(item => {
                    prepCharge += Math.round(prepRatePerKg * item.weight * item.qty);
                });
            }

            const grandTotal = subtotal + prepCharge;

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
                                <p class="cart-item-count">${item.count} &bull; <strong>${item.weightLabel}</strong></p>
                                <div class="cart-item-price-row">
                                    <span class="cart-item-price">₹${item.price * item.qty}</span>
                                    <div class="cart-item-qty">
                                        <button class="cart-item-qty-btn cart-qty-minus" data-cartkey="${item.cartKey}">-</button>
                                        <span class="cart-item-qty-val">${item.qty}</span>
                                        <button class="cart-item-qty-btn cart-qty-plus" data-cartkey="${item.cartKey}">+</button>
                                    </div>
                                </div>
                            </div>
                            <button class="cart-item-remove" data-cartkey="${item.cartKey}" aria-label="Remove item">&times;</button>
                        </div>
                    `;
                });
                itemsHtml += '</div>';
                cartItemsContainer.innerHTML = itemsHtml;

                // Show details & totals
                checkoutOptions.style.display = 'flex';
                cartDrawerFooter.style.display = 'block';
                cartSubtotalEl.textContent = `₹${subtotal}`;
                
                const prepChargeEl = document.getElementById('cart-prep-charge');
                if (prepChargeEl) {
                    prepChargeEl.textContent = prepCharge > 0 ? `₹${prepCharge}` : 'FREE';
                    if (prepCharge > 0) {
                        prepChargeEl.style.color = 'var(--text-dark)';
                    } else {
                        prepChargeEl.style.color = 'var(--primary)';
                    }
                }
                cartTotalEl.textContent = `₹${grandTotal}`;

                // Update QR Code and check prep service limitations
                updateUPIQRCode(grandTotal);
                handlePrepServiceChange();

                // Add Event Listeners to Cart Drawer Buttons
                addCartControlsListeners();
            }
    }

    function addCartControlsListeners() {
        // Minus Buttons in Cart
        document.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartKey = btn.getAttribute('data-cartkey');
                const item = cart.find(i => i.cartKey === cartKey);
                if (item) {
                    updateCartItemQty(cartKey, item.qty - 1);
                }
            });
        });

        // Plus Buttons in Cart
        document.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartKey = btn.getAttribute('data-cartkey');
                const item = cart.find(i => i.cartKey === cartKey);
                if (item) {
                    updateCartItemQty(cartKey, item.qty + 1);
                }
            });
        });

        // Remove Buttons in Cart
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartKey = btn.getAttribute('data-cartkey');
                removeFromCart(cartKey);
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
    // 4. PAYMENT AND UPI INTEGRATION LOGIC
    // -------------------------------------------------------------------------
    let paymentMethod = 'cod';
    const payCodRadio = document.getElementById('pay-cod');
    const payUpiRadio = document.getElementById('pay-upi');
    const upiDetailsBox = document.getElementById('upi-details-box');
    const prepServiceSelect = document.getElementById('prep-service');
    const paymentAlert = document.getElementById('payment-alert');
    const codOptionWrapper = document.getElementById('cod-option-wrapper');

    function handlePaymentMethodChange(method) {
        paymentMethod = method;
        if (method === 'upi') {
            upiDetailsBox.style.display = 'block';
        } else {
            upiDetailsBox.style.display = 'none';
        }
    }

    if (payCodRadio && payUpiRadio) {
        payCodRadio.addEventListener('change', () => handlePaymentMethodChange('cod'));
        payUpiRadio.addEventListener('change', () => handlePaymentMethodChange('upi'));
    }

    function handlePrepServiceChange() {
        // Cash on Delivery is always available for all preparation services now.
    }

    if (prepServiceSelect) {
        prepServiceSelect.addEventListener('change', () => {
            handlePrepServiceChange();
            updateCartUI();
        });
    }

    // Dynamic QR code generation
    function updateUPIQRCode(amount) {
        const upiId = '9573039197@ybl';
        const merchantName = 'FFC Sea Foods';
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;
        const qrCodeImg = document.getElementById('upi-qr-code');
        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;
        }
    }

    // Copy to clipboard for UPI ID
    const copyUpiBtn = document.getElementById('copy-upi-btn');
    const upiIdTextEl = document.getElementById('upi-id-text');

    if (copyUpiBtn && upiIdTextEl) {
        copyUpiBtn.addEventListener('click', () => {
            const upiId = upiIdTextEl.textContent;
            navigator.clipboard.writeText(upiId).then(() => {
                const originalText = copyUpiBtn.textContent;
                copyUpiBtn.textContent = 'Copied!';
                copyUpiBtn.style.backgroundColor = 'var(--primary)';
                setTimeout(() => {
                    copyUpiBtn.textContent = originalText;
                    copyUpiBtn.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // Custom screenshot uploader buttons
    const screenshotInput = document.getElementById('payment-screenshot');
    const screenshotCustomBtn = document.getElementById('screenshot-custom-btn');
    const screenshotFilename = document.getElementById('screenshot-filename');

    if (screenshotCustomBtn && screenshotInput) {
        screenshotCustomBtn.addEventListener('click', () => {
            screenshotInput.click();
        });
    }

    if (screenshotInput && screenshotFilename) {
        screenshotInput.addEventListener('change', () => {
            if (screenshotInput.files && screenshotInput.files.length > 0) {
                screenshotFilename.textContent = screenshotInput.files[0].name;
            } else {
                screenshotFilename.textContent = 'No file chosen';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 5. WHATSAPP ORDER GENERATOR
    // -------------------------------------------------------------------------
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');

    whatsappCheckoutBtn.addEventListener('click', () => {
        // Retrieve Form Details
        const prepService = document.getElementById('prep-service').value;
        const custName = document.getElementById('cust-name').value.trim();
        const custPhone = document.getElementById('cust-phone').value.trim();
        const custAddress = document.getElementById('cust-address').value.trim();
        const deliverySlot = document.getElementById('delivery-slot').value;

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

        // UPI Advance Payment Verification
        if (paymentMethod === 'upi') {
            if (!screenshotInput || !screenshotInput.files || screenshotInput.files.length === 0) {
                alert('Please complete your payment via UPI and upload the screenshot.');
                return;
            }
        }

        // Format Prep Service Text (dynamic from config)
        function buildPrepLabel(key) {
            const rate = getPrepChargePerKg(key);
            const rateStr = rate > 0 ? '₹' + rate + '/KG' : 'Free';
            const names = {
                'none': 'None (Whole Prawns with Shell)',
                'cleaning': 'Cleaning Only (Cleaned, Shell On)',
                'peeled': 'Peeled Service (Shell & Head Removed)',
                'butterfly': 'Butterfly Cut Service (Split Back)'
            };
            return (names[key] || key) + ' - ' + rateStr;
        }
        const prepLabel = buildPrepLabel(prepService);

        // Calculate Totals
        let subtotal = 0;
        let prepCharge = 0;
        let itemsText = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            itemsText += `${index + 1}. *${item.name}*\n`;
            itemsText += `   Count size: ${item.count}\n`;
            itemsText += `   Weight: ${item.weightLabel} x ${item.qty} = ${(item.weight * item.qty).toFixed(1)} KG\n`;
            itemsText += `   Price: ₹${item.pricePerKg}/KG → ₹${item.price} for ${item.weightLabel} x${item.qty} = ₹${itemTotal}\n\n`;
        });

        const prepRateWA = getPrepChargePerKg(prepService);
        if (prepRateWA > 0) {
            cart.forEach(item => {
                prepCharge += Math.round(prepRateWA * item.weight * item.qty);
            });
        }

        const deliveryCharge = getDeliveryCharge();
        const grandTotal = subtotal + prepCharge + deliveryCharge;

        // WhatsApp Business Contact Numbers from flyer
        const storeNumber = '918985734989'; // Primary Whatsapp number

        // Format Payment Text
        let paymentText = '';
        if (paymentMethod === 'upi') {
            const fileName = screenshotInput.files[0] ? screenshotInput.files[0].name : 'Uploaded';
            paymentText += `• *Method:* Online UPI Payment\n`;
            paymentText += `• *UPI ID:* 9573039197@ybl\n`;
            paymentText += `• *Payment Status:* Pending Verification\n`;
            paymentText += `• *Screenshot:* ${fileName}\n`;
        } else {
            paymentText += `• *Method:* Cash on Delivery (COD)\n`;
        }

        // Build Custom Message
        let message = `🦐 *NEW ORDER - FFC SEA FOODS* 🦐\n`;
        message += `===============================\n\n`;
        message += `👤 *Customer Details:*\n`;
        message += `• *Name:* ${custName}\n`;
        message += `• *Phone:* ${custPhone}\n`;
        message += `• *Address:* ${custAddress}\n`;
        message += `• *Delivery Slot:* ${deliverySlot}\n\n`;
        
        message += `📦 *Order Summary:*\n`;
        message += itemsText;
        
        message += `🔪 *Prep & Custom Cutting:*\n`;
        message += `• *Service Choice:* ${prepLabel}\n`;
        message += `• *Cost:* ${prepCharge > 0 ? `₹${prepCharge}` : 'FREE'}\n\n`;
 
        message += `💳 *Payment Information:*\n`;
        message += paymentText + `\n`;
        
        const deliveryChargeWA = getDeliveryCharge();
        message += `===============================\n`;
        message += `💰 *Grand Total:* *₹${grandTotal}*\n`;
        message += `🚚 *Delivery:* ${deliveryChargeWA > 0 ? '₹' + deliveryChargeWA : 'FREE'} (Tallarevu / Kakinada)\n`;
        message += `===============================\n\n`;
        message += `Thank you for ordering with FFC Sea Foods! Please reply to confirm and process this order.`;

        if (paymentMethod === 'upi') {
            message += `\n\n*⚠️ PLEASE ATTACH YOUR PAYMENT SCREENSHOT TO THIS WHATSAPP CHAT.*`;
        }

        // Encode Message
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp API Link
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeNumber}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    });
});
