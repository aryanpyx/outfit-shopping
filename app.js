// Core Application State
let STATE = {
  cart: JSON.parse(localStorage.getItem('outfit_cart')) || [],
  theme: localStorage.getItem('outfit_theme') || 'light'
};

// Setup initial theme and UI hooks
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  updateCartCount();
  
  // Start router
  window.addEventListener('hashchange', router);
  
  // Show preloader slideshow on first homepage load in session
  const path = window.location.hash || '#/';
  if (path === '#/' && !sessionStorage.getItem('preloader-done')) {
    runPreloader(router);
  } else {
    router();
  }
});

// Setup event listeners for header navigation and buttons
function setupEventListeners() {
  // Theme Switcher Buttons
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme');
      setTheme(selectedTheme);
    });
  });

  // Logo link routing
  document.getElementById('header-logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/';
  });

  // Nav link active class helper
  document.getElementById('nav-shop').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/';
  });
  document.getElementById('nav-bag').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/bag';
  });
}

// Theme Handlers
function initTheme() {
  setTheme(STATE.theme);
}

function setTheme(themeName) {
  STATE.theme = themeName;
  localStorage.setItem('outfit_theme', themeName);
  
  // Set class on document element
  document.documentElement.className = `theme-${themeName}`;
  document.body.className = `theme-${themeName}`;

  // Update button active state
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Shopping Cart Actions
function updateCartCount() {
  const totalItems = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const bagLink = document.getElementById('nav-bag');
  if (bagLink) {
    bagLink.textContent = `Bag (${totalItems})`;
  }
}

function saveCart() {
  localStorage.setItem('outfit_cart', JSON.stringify(STATE.cart));
  updateCartCount();
}

function addItemToCart(product, size) {
  // Check if item with same handle and size already in cart
  const existingItemIndex = STATE.cart.findIndex(
    item => item.handle === product.handle && item.size === size
  );

  const price = parseFloat(product.priceRange.minVariantPrice.amount);

  if (existingItemIndex > -1) {
    STATE.cart[existingItemIndex].quantity += 1;
  } else {
    STATE.cart.push({
      handle: product.handle,
      title: product.title,
      price: price,
      size: size,
      quantity: 1,
      imageUrl: product.featuredImage.url
    });
  }

  saveCart();
  window.location.hash = '#/bag';
}

function removeItemFromCart(index) {
  STATE.cart.splice(index, 1);
  saveCart();
  renderBag();
}

function changeItemQty(index, delta) {
  STATE.cart[index].quantity += delta;
  if (STATE.cart[index].quantity <= 0) {
    STATE.cart.splice(index, 1);
  }
  saveCart();
  renderBag();
}

// Preloader Slideshow Animation
function runPreloader(callback) {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'preloader-overlay';
  overlay.innerHTML = `
    <div class="preloader-slideshow">
      <img src="preloader/image-01.jpg" class="preloader-image active" alt="preloader">
      <img src="preloader/image-02.jpg" class="preloader-image" alt="preloader">
      <img src="preloader/image-03.jpg" class="preloader-image" alt="preloader">
      <img src="preloader/image-04.jpg" class="preloader-image" alt="preloader">
      <img src="preloader/image-05.jpg" class="preloader-image" alt="preloader">
      <img src="preloader/image-06.jpg" class="preloader-image" alt="preloader">
    </div>
  `;
  document.body.appendChild(overlay);

  const images = overlay.querySelectorAll('.preloader-image');
  let currentIdx = 0;
  
  // Cycle through preloader images
  const interval = setInterval(() => {
    images[currentIdx].classList.remove('active');
    currentIdx++;
    if (currentIdx < images.length) {
      images[currentIdx].classList.add('active');
    } else {
      clearInterval(interval);
      // End animation: fade out and call router callback
      overlay.classList.add('fade-out');
      sessionStorage.setItem('preloader-done', 'true');
      
      // Delay removal to allow fade transition
      setTimeout(() => {
        overlay.remove();
        callback();
      }, 800);
    }
  }, 180);
}

// SPA Router
function router() {
  const hash = window.location.hash || '#/';
  const appRoot = document.getElementById('app-root');
  
  // Update header links active style
  const navShop = document.getElementById('nav-shop');
  const navBag = document.getElementById('nav-bag');
  if (navShop && navBag) {
    navShop.classList.remove('active');
    navBag.classList.remove('active');
    
    if (hash === '#/') {
      navShop.classList.add('active');
    } else if (hash === '#/bag') {
      navBag.classList.add('active');
    }
  }

  // Scroll to top on page navigation
  window.scrollTo(0, 0);

  // Match routes
  if (hash === '#/' || hash === '') {
    renderHome(appRoot);
  } else if (hash.startsWith('#/product/')) {
    const handle = hash.substring(10);
    renderProductDetail(appRoot, handle);
  } else if (hash === '#/bag') {
    renderBag(appRoot);
  } else if (hash === '#/shipping-and-return') {
    renderShipping(appRoot);
  } else {
    // 404 fallback
    appRoot.innerHTML = `
      <div style="text-align: center; padding: 6rem 0;">
        <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem;">PAGE NOT FOUND</h2>
        <a href="#/" class="bag-empty-btn">Return to Shop</a>
      </div>
    `;
  }
}

// View: Home
function renderHome(container) {
  // Home markup containing the hero and products grid
  container.innerHTML = `
    <!-- Hero Block -->
    <div class="hero-wrapper">
      <div class="hero-giant-logo-container">
        <svg class="hero-giant-logo" viewBox="0 0 1391 296" xmlns="http://www.w3.org/2000/svg">
          <path d="M140.747 296C119.074 296 99.5685 292.308 82.2301 284.924C64.8916 277.54 50.103 267.228 37.8641 253.987C25.6252 240.747 16.191 225.087 9.56164 207.009C3.18721 188.931 0 169.325 0 148.191C0 126.803 3.18721 107.069 9.56164 88.991C16.191 70.9127 25.6252 55.3807 37.8641 42.3948C50.103 29.1544 64.8916 18.8422 82.2301 11.4581C99.5685 3.81936 119.074 0 140.747 0C162.165 0 181.544 3.81936 198.882 11.4581C216.22 18.8422 231.009 29.1544 243.248 42.3948C255.487 55.3807 264.794 70.9127 271.168 88.991C277.797 107.069 281.112 126.803 281.112 148.191C281.112 169.325 277.797 188.931 271.168 207.009C264.794 225.087 255.487 240.747 243.248 253.987C231.009 267.228 216.22 277.54 198.882 284.924C181.544 292.308 162.165 296 140.747 296ZM141.13 242.529C153.369 242.529 164.078 240.11 173.257 235.272C182.436 230.434 190.085 223.814 196.205 215.412C202.324 207.009 206.914 197.079 209.974 185.621C213.033 174.163 214.563 161.686 214.563 148.191C214.563 134.696 213.033 122.219 209.974 110.761C206.914 99.0486 202.324 88.8637 196.205 80.2064C190.085 71.5492 182.436 64.8017 173.257 59.9639C164.078 55.126 153.369 52.7071 141.13 52.7071C128.891 52.7071 118.054 55.126 108.62 59.9639C99.441 64.8017 91.6642 71.5492 85.2898 80.2064C79.1703 88.8637 74.4533 99.0486 71.1386 110.761C68.0789 122.219 66.549 134.696 66.549 148.191C66.549 161.686 68.0789 174.163 71.1386 185.621C74.4533 197.079 79.1703 207.009 85.2898 215.412C91.6642 223.814 99.441 230.434 108.62 235.272C118.054 240.11 128.891 242.529 141.13 242.529Z"></path>
          <path d="M424.853 294.472C386.097 294.472 356.647 285.56 336.504 267.737C316.616 249.659 306.672 223.814 306.672 190.204V4.96517H371.691V191.732C371.691 207.264 375.898 219.486 384.312 228.397C392.981 237.309 406.495 241.765 424.853 241.765C441.937 241.765 454.813 237.182 463.482 228.016C472.152 218.594 476.486 206.118 476.486 190.586V4.96517H541.888V190.204C541.888 223.56 531.944 249.277 512.055 267.355C492.167 285.433 463.1 294.472 424.853 294.472Z"></path>
          <path d="M565.078 4.96517H799.912V60.3458H715.004V289.125H649.603V60.3458H565.078V4.96517Z"></path>
          <path d="M826.672 4.96517H1035.5V60.3458H891.691V122.219H1011.79V175.308H891.691V289.125H826.672V4.96517Z"></path>
          <path d="M1063.67 4.96517H1129.07V289.125H1063.67V4.96517Z"></path>
          <path d="M1156.17 4.96517H1391V60.3458H1306.09V289.125H1240.69V60.3458H1156.17V4.96517Z"></path>
          <path d="M1371 293C1359.83 293 1351 284.488 1351 273C1351 261.512 1359.83 253 1371 253C1382.17 253 1391 261.512 1391 273C1391 284.488 1382.17 293 1371 293ZM1371 289.612C1380.17 289.612 1387 282.587 1387 273C1387 263.496 1380.17 256.471 1371 256.471C1361.83 256.471 1355 263.496 1355 273C1355 282.587 1361.83 289.612 1371 289.612ZM1361.92 283.413V262.339H1372.58C1377 262.339 1381 264.322 1381 268.62C1381 271.017 1379.75 272.835 1377.5 273.661V273.826C1379.42 274.488 1380.08 275.727 1380.5 277.38C1381.08 279.86 1380.67 282.504 1381.58 282.917V283.413H1374.83C1374.25 283.083 1374.42 280.521 1374 278.537C1373.67 276.884 1372.92 276.306 1371.08 276.306H1368.75V283.413H1361.92ZM1368.75 267.545V271.595H1371.58C1373.33 271.595 1374.25 270.934 1374.25 269.529C1374.25 268.207 1373.5 267.545 1371.58 267.545H1368.75Z"></path>
        </svg>
      </div>
      
      <div class="hero-divider"></div>
      
      <div class="hero-grid">
        <div class="hero-title-col">
          <h1 class="hero-why-title">Outfit</h1>
        </div>
        <div class="hero-why-col">
          <h2 class="hero-why-title">Why</h2>
          <p class="hero-paragraph">
            Created by the ++hellohello team, this store and signature collection celebrates our collective creativity and passion for apparel. Carefully designed.
          </p>
        </div>
        <div class="hero-links-col">
          <a href="https://www.hellohello.is" target="_blank" rel="noreferrer noopener" class="hero-link">Visit ++ website</a>
          <a href="#/shipping-and-return" class="hero-link">Shipping & Returns</a>
        </div>
        <div class="hero-copyright-col">
          <p>©26</p>
        </div>
      </div>
    </div>

    <!-- Products Grid Section -->
    <div class="products-grid">
      ${PRODUCTS.map(p => {
        const hasPriceRange = p.priceRange && p.priceRange.minVariantPrice;
        const price = hasPriceRange ? `$${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}` : '$0.00';
        const isAvailable = p.availableForSale;
        
        return `
          <div class="product-card" onclick="window.location.hash = '#/product/${p.handle}'">
            <div class="product-image-container">
              <img class="product-image" src="${p.featuredImage.url}" alt="${p.title}" loading="lazy">
              ${!isAvailable ? `<div class="product-badge-soldout">Sold Out</div>` : ''}
            </div>
            <div class="product-metadata">
              <div>
                <p class="product-title">${p.title}</p>
                <p class="product-tag">Apparel</p>
              </div>
              <p class="product-price ${!isAvailable ? 'sold-out' : ''}">${price}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// View: Product Detail
function renderProductDetail(container, handle) {
  const product = PRODUCTS.find(p => p.handle === handle);
  
  if (!product) {
    container.innerHTML = `
      <div style="text-align: center; padding: 6rem 0;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">PRODUCT NOT FOUND</h2>
        <a href="#/" class="bag-empty-btn">Return to Shop</a>
      </div>
    `;
    return;
  }

  const isAvailable = product.availableForSale;
  const price = `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`;
  
  // Find Sizing option values
  const sizeOption = product.options.find(opt => opt.name === 'Size');
  const sizesList = sizeOption ? sizeOption.values : [];

  // Construct UI markup
  container.innerHTML = `
    <div class="product-detail-container">
      <!-- Gallery Column -->
      <div class="product-detail-gallery">
        ${product.images.map((img, index) => `
          <div class="product-detail-image-wrapper">
            <img src="${img.url}" alt="${product.title} - view ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
          </div>
        `).join('')}
      </div>
      
      <!-- Info Details Column -->
      <div class="product-detail-info">
        <a href="#/" class="product-detail-back">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
            <path d="M6 10L1 5L2.4 3.6L6 7.2L9.6 3.6L11 5L6 10Z" fill="currentColor"/>
          </svg>
          Back to Shop
        </a>
        
        <div class="product-detail-header">
          <h1 class="product-detail-title">${product.title}</h1>
          <p class="product-detail-price">${price}</p>
        </div>
        
        <p class="product-detail-description">${product.description}</p>
        
        ${isAvailable && sizesList.length > 0 ? `
          <div>
            <p class="sizing-selector-title">Select Size</p>
            <div class="sizing-options" id="sizing-container">
              ${sizesList.map(sz => `
                <button class="size-btn" data-size="${sz}">${sz}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <button class="add-to-bag-btn" id="add-to-bag-cta" ${!isAvailable ? 'disabled' : (sizesList.length > 0 ? 'disabled' : '')}>
          ${isAvailable ? (sizesList.length > 0 ? 'Select a size' : 'Add to Bag') : 'Sold Out'}
        </button>
      </div>
    </div>
  `;

  // Bind selector events
  if (isAvailable && sizesList.length > 0) {
    const sizingContainer = document.getElementById('sizing-container');
    const sizeButtons = sizingContainer.querySelectorAll('.size-btn');
    const addBtn = document.getElementById('add-to-bag-cta');
    let selectedSize = null;

    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active status
        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        selectedSize = btn.getAttribute('data-size');
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Bag';
      });
    });

    addBtn.addEventListener('click', () => {
      if (selectedSize) {
        addItemToCart(product, selectedSize);
      }
    });
  } else if (isAvailable) {
    // No size option, add directly
    const addBtn = document.getElementById('add-to-bag-cta');
    addBtn.addEventListener('click', () => {
      addItemToCart(product, 'OS'); // One Size
    });
  }
}

// View: Shopping Bag
function renderBag(container) {
  // Support both explicit container call or updates
  const root = container || document.getElementById('app-root');
  
  if (STATE.cart.length === 0) {
    root.innerHTML = `
      <h1 class="bag-title">Bag</h1>
      <div class="bag-empty">
        <p class="bag-empty-text">Not even one thing? That's sad.</p>
        <a href="#/" class="bag-empty-btn">Shop Collection</a>
      </div>
    `;
    return;
  }

  // Calculate prices
  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalStr = `$${subtotal.toFixed(2)}`;

  root.innerHTML = `
    <h1 class="bag-title">Bag</h1>
    
    <div class="bag-grid">
      <!-- Cart Items Section -->
      <div class="cart-items-list">
        ${STATE.cart.map((item, index) => `
          <div class="cart-item">
            <div class="cart-item-image">
              <img src="${item.imageUrl}" alt="${item.title}">
            </div>
            
            <div class="cart-item-details">
              <div class="cart-item-meta">
                <div>
                  <h3 class="cart-item-name">${item.title}</h3>
                  <p class="cart-item-size">Size: ${item.size}</p>
                </div>
                <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              
              <div class="cart-item-actions">
                <div class="qty-control">
                  <button class="qty-btn" onclick="changeItemQty(${index}, -1)">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="changeItemQty(${index}, 1)">+</button>
                </div>
                
                <button class="cart-remove-btn" onclick="removeItemFromCart(${index})">Remove</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Cart Summary Sidebar -->
      <div class="cart-summary">
        <h2 class="summary-title">Summary</h2>
        
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${totalStr}</span>
        </div>
        
        <div class="summary-row">
          <span>Shipping</span>
          <span style="text-transform: uppercase; font-weight: 700; color: var(--accent-color);">Free</span>
        </div>
        
        <div class="summary-row total">
          <span>Total</span>
          <span>${totalStr}</span>
        </div>
        
        <button class="checkout-btn" onclick="triggerCheckout()">Checkout</button>
      </div>
    </div>
  `;
}

// Mock checkout handler
function triggerCheckout() {
  alert("Thank you for trying OUTFIT®!\nThis is a demonstration mockup store copy. Real checkout transactions are disabled.");
}

// View: Shipping & Return Policy Page
function renderShipping(container) {
  container.innerHTML = `
    <div class="policy-container">
      <h1 class="policy-title">Shipping & Return Policy</h1>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Shipping</h2>
        <div class="policy-text">
          <p><strong>Processing Time:</strong> All orders are processed within 1–2 business days. Orders are not shipped on weekends or public holidays in Uruguay. During high-volume periods, shipments may be delayed slightly. Thank you for your patience.</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Shipping Rates & Delivery Estimates</h2>
        <div class="policy-text">
          <p>Shipping costs are calculated at checkout. Below are our typical delivery times:</p>
          <ul>
            <li><strong>Within Uruguay:</strong> 2–5 business days</li>
            <li><strong>International:</strong> 7–21 business days (varies by destination and customs processing)</li>
          </ul>
          <p>Delivery times are estimates and may vary based on postal service performance.</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Order Tracking</h2>
        <div class="policy-text">
          <p>Once your order has been shipped, you will receive a confirmation email with a tracking number. Tracking details may take up to 24 hours to become active.</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Customs, Duties & Taxes</h2>
        <div class="policy-text">
          <p>For international orders, customs duties, taxes, or other fees may apply. These charges are the buyer's responsibility and are not included in our prices or shipping costs.</p>
        </div>
      </div>
      
      <hr style="border:0; height:1px; background-color:var(--border-color); margin: 3rem 0;">
      
      <div class="policy-block">
        <h2 class="policy-block-title">Returns</h2>
        <div class="policy-text">
          <p>We want you to be happy with your purchase. If something isn't right, we're here to help.</p>
          <p><strong>Return Window:</strong> You may return items within 30 days of receiving your order. Products must be unused, in their original condition, and in their original packaging.</p>
          <p>To request a return, please contact us at <a href="mailto:outfit@hellohello.is" style="text-decoration:underline;">outfit@hellohello.is</a>.</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Exchanges</h2>
        <div class="policy-text">
          <p>We only replace items if they are defective or damaged. If you need to exchange an item, contact us at <a href="mailto:outfit@hellohello.is" style="text-decoration:underline;">outfit@hellohello.is</a>.</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Return Shipping</h2>
        <div class="policy-text">
          <p>Customers are responsible for return shipping costs unless the return is due to our error (e.g., incorrect or defective item).</p>
        </div>
      </div>
      
      <div class="policy-block">
        <h2 class="policy-block-title">Need Help?</h2>
        <div class="policy-text">
          <p>If you have any questions, contact us at <a href="mailto:outfit@hellohello.is" style="text-decoration:underline;">outfit@hellohello.is</a>.</p>
        </div>
      </div>
    </div>
  `;
}
