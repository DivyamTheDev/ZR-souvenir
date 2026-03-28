document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Trigger scroll event on load in case page is already scrolled
    window.dispatchEvent(new Event('scroll'));

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.section-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Shopping Cart Logic with Sidebar UI
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartBadge = document.querySelector('.cart-badge');
    const addToCartBtns = document.querySelectorAll('.btn-add-cart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    
    let cartCount = 0;
    let totalPrice = 0;

    function openCart() {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
    }

    function hideCart() {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
    }

    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', hideCart);
    cartOverlay.addEventListener('click', hideCart);

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            cartCount++;
            cartBadge.textContent = cartCount;
            
            // Get product info
            const card = this.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const priceStr = card.querySelector('.product-price').textContent;
            const price = parseFloat(priceStr.replace('€', ''));
            const imgSrc = card.querySelector('.product-img').src;
            
            totalPrice += price;
            cartTotalPrice.textContent = '€' + totalPrice.toFixed(2);
            
            // Remove empty cart message if it exists
            const emptyMsg = cartItemsContainer.querySelector('.empty-cart');
            if (emptyMsg) emptyMsg.remove();
            
            // Add item to cart DOM
            const itemHTML = `
                <div class="cart-item">
                    <img src="${imgSrc}" alt="${name}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${name}</div>
                        <div class="cart-item-price">${priceStr}</div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            
            // Visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            this.style.backgroundColor = 'var(--gold)';
            this.style.color = '#fff';
            this.style.borderColor = 'var(--gold)';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
                this.style.color = '';
                this.style.borderColor = '';
            }, 1000);
            
            openCart();
        });
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartCount === 0) {
                alert(currentLang === 'EN' ? 'Your cart is empty!' : 'Votre panier est vide !');
            } else {
                alert(currentLang === 'EN' ? 'Moving to Checkout...' : 'Passage à la caisse...');
            }
        });
    }

    // 5. Background Music Toggle
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    // Set lower volume
    if (bgMusic) bgMusic.volume = 0.3;

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
                musicToggle.title = "Play background music";
            } else {
                // Error handling for browsers that block autoplay
                let playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        musicToggle.classList.add('playing');
                        musicToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
                        musicToggle.title = "Pause background music";
                    }).catch(error => {
                        console.error("Audio playback failed:", error);
                        alert("Your browser prefers you to interact with the page more before playing audio.");
                    });
                }
            }
            isPlaying = !isPlaying;
        });
    }

    // 6. Language Toggle System
    const langToggle = document.getElementById('langToggle');
    const langSpans = langToggle.querySelectorAll('span');
    let currentLang = 'EN';

    langToggle.addEventListener('click', () => {
        // Switch visually
        langSpans.forEach(span => span.classList.toggle('active'));
        
        // Toggle state
        currentLang = currentLang === 'EN' ? 'FR' : 'EN';
        
        // Update texts directly querying all dynamic translatable elements
        const translatableElements = document.querySelectorAll('[data-en]');
        
        translatableElements.forEach(el => {
            const translation = el.getAttribute(`data-${currentLang.toLowerCase()}`);
            if (translation) {
                if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else if(el.hasAttribute('value') && el.tagName === 'INPUT') {
                    el.value = translation;
                } else {
                    el.innerHTML = translation; // use HTML to maintain any icons inside tags
                }
            }
        });
    });
});
