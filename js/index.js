  /* ════════════════════════════
     CART STATE
  ════════════════════════════ */
  function saveCart() { localStorage.setItem('kvb_cart', JSON.stringify(cart)); }
  function loadCart() { try { return JSON.parse(localStorage.getItem('kvb_cart') || '[]'); } catch(e) { return []; } }

  let cart = loadCart();
  let currentOrderId  = '';

  const OWNER_WA = '917338781288';

  /* ── Add to cart ── */
  function addToCart(id, name, price, category, emoji) {
    emoji = emoji || '🥻';
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, category, emoji, qty: 1 });
    }
    saveCart();
    renderCart();
    flashBadge();
    showToast(name);
  }

  /* ── Update quantity ── */
  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  /* ── Remove item ── */
  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  /* ── Render cart ── */
  function renderCart() {
    const body  = document.getElementById('cartBody');
    const foot  = document.getElementById('cartFoot');
    const badge = document.getElementById('cartBadge');
    const countLbl = document.getElementById('cartCountLbl');

    const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    /* update badge */
    badge.textContent = totalQty > 0 ? totalQty : '0';
    countLbl.textContent = totalQty > 0 ? `(${totalQty} item${totalQty > 1 ? 's' : ''})` : '';
    document.getElementById('cartItemCount').textContent = totalQty;
    document.getElementById('cartSubtotal').textContent  = '₹' + totalPrice.toLocaleString('en-IN');
    document.getElementById('cartTotal').textContent      = '₹' + totalPrice.toLocaleString('en-IN');

    if (cart.length === 0) {
      body.innerHTML = `<div class="cart-empty"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><p>Your cart is empty.<br/>Add sarees to get started!</p></div>`;
      foot.style.display = 'none';
      return;
    }

    foot.style.display = 'block';
    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        ${item.img ? `<img src="${item.img}" style="width:42px;height:42px;border-radius:6px;object-fit:cover;flex-shrink:0;" alt="">` : `<div class="cart-item-emoji">${item.emoji||'🥻'}</div>`}
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
            <span style="font-size:.75rem;color:var(--text3);margin-left:.3rem">× ₹${item.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">✕</button>
      </div>
    `).join('');
  }

  /* ── Open / close cart ── */
  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('overlayBg').classList.add('show');
  }
  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('overlayBg').classList.remove('show');
  }

  /* ── Toast ── */
  let toastTimer;
  function showToast(name) {
    const t = document.getElementById('toast');
    const short = name.length > 40 ? name.slice(0, 38) + '…' : name;
    t.textContent = '✓ Added to cart: ' + short;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ── Badge pop animation ── */
  function flashBadge() {
    const b = document.getElementById('cartBadge');
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
  }

  /* ════════════════════════════
     ORDER FLOW
  ════════════════════════════ */
  function generateOrderId() {
    const d = new Date();
    const date = d.getFullYear().toString().slice(2)
      + String(d.getMonth()+1).padStart(2,'0')
      + String(d.getDate()).padStart(2,'0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `KVB-${date}-${rand}`;
  }

  function placeOrder() {
    if (cart.length === 0) return;
    currentOrderId = generateOrderId();
    const total = cart.reduce((s,i) => s + i.price * i.qty, 0);

    document.getElementById('orderIdDisplay').textContent = currentOrderId;
    document.getElementById('orderTotalDisplay').textContent = '₹' + total.toLocaleString('en-IN');

    const lines = cart.map((item, idx) => `
      <div class="order-line">
        <div class="oname">${idx+1}. ${item.name}<br/><span class="oqty">${item.category} × ${item.qty}</span></div>
        <div class="oprice">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
    document.getElementById('orderSummaryLines').innerHTML = lines;

    closeCart();
    document.getElementById('orderModal').classList.add('show');
  }

  function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('show');
    openCart();
  }

  function copyOrderId() {
    navigator.clipboard.writeText(currentOrderId).then(() => {
      const btn = document.querySelector('.copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy ID', 2000);
    });
  }

  /* ── Build & send WhatsApp message ── */
  function sendOrderWhatsApp() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const total   = cart.reduce((s,i) => s + i.price * i.qty, 0);

    let itemLines = cart.map((item, idx) =>
      `  ${idx+1}. ${item.name} (${item.category}) × ${item.qty}  —  ₹${(item.price * item.qty).toLocaleString('en-IN')}`
    ).join('\n');

    const msg =
`🛍️ *New Order — KVB Sarees*

📋 *Order ID:* ${currentOrderId}
📅 *Date:* ${dateStr}, ${timeStr}

🧵 *Items Ordered:*
${itemLines}

💰 *Total Amount: ₹${total.toLocaleString('en-IN')}*

Please confirm my order. Thank you! 🙏`;

    const url = `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
    cart = []; saveCart(); renderCart();
    document.getElementById('orderModal').classList.remove('show');
  }

  /* ════════════════════════════
     MISC
  ════════════════════════════ */
  /* ── Scroll reveal ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('up'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── Mobile nav ── */
  function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('open');
    document.getElementById('overlayBg').classList.toggle('show');
  }
  function closeMobileNav() {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('overlayBg').classList.remove('show');
    document.getElementById('cartDrawer').classList.remove('open');
  }

  /* ── Search ── */
  const SEARCH_INDEX = [
    { label: 'Gini Tissue Saree – Diwali Offer', tags: 'gini tissue diwali offer deepavali festive', href: 'diwali-offers.html' },
    { label: 'Couple Combo – Vaira Oosi Soft Silk Saree', tags: 'couple combo vaira oosi soft silk shirt saree set', href: 'couple-combo.html' },
    { label: 'Silk Sarees Collection', tags: 'silk kanchipuram pattu bridal wedding saree', section: 'categories' },
    { label: 'Uniform Sarees', tags: 'uniform school office cotton plain border saree', section: 'featured' },
    { label: 'Contact Us', tags: 'contact phone address whatsapp location store', section: 'contact' },
  ];

  function doSearch() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    let box = document.getElementById('searchResults');
    if (!box) {
      box = document.createElement('div');
      box.id = 'searchResults';
      box.style.cssText = 'margin-top:.8rem;display:flex;flex-direction:column;gap:.4rem;';
      document.getElementById('searchDialog').appendChild(box);
    }
    if (!q) { box.innerHTML = ''; return; }
    const hits = SEARCH_INDEX.filter(item => item.tags.includes(q) || item.label.toLowerCase().includes(q));
    if (!hits.length) {
      box.innerHTML = '<p style="color:var(--text3);font-size:.85rem;margin:0">No results found. Try "silk", "uniform" or "diwali".</p>';
      return;
    }
    box.innerHTML = hits.map(h => h.href
      ? `<a href="${h.href}" style="display:block;padding:.55rem .8rem;background:var(--cream2);border-radius:6px;font-size:.88rem;font-weight:600;color:var(--maroon);text-decoration:none;">${h.label} →</a>`
      : `<button onclick="toggleSearch();document.getElementById('${h.section}').scrollIntoView({behavior:'smooth'})" style="text-align:left;padding:.55rem .8rem;background:var(--cream2);border-radius:6px;font-size:.88rem;font-weight:600;color:var(--maroon);border:none;cursor:pointer;width:100%">${h.label} →</button>`
    ).join('');
  }

  function toggleSearch() {
    const ov = document.getElementById('searchOverlay');
    ov.classList.toggle('show');
    if (ov.classList.contains('show')) setTimeout(() => document.getElementById('searchInput').focus(), 200);
    else { document.getElementById('searchInput').value = ''; const b = document.getElementById('searchResults'); if(b) b.innerHTML=''; }
  }
  function closeSearchOnBg() { toggleSearch(); }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { toggleSearch(); closeMobileNav(); closeCart(); }
  });

  /* ── Wishlist ── */
  function saveWishlist() { localStorage.setItem('kvb_wishlist', JSON.stringify(wishlist)); }
  function loadWishlist() { try { return JSON.parse(localStorage.getItem('kvb_wishlist') || '[]'); } catch(e) { return []; } }

  let wishlist = loadWishlist();
  document.getElementById('wishlistBadge').textContent = wishlist.length || '0';

  function toggleHeart(btn) {
    const liked = btn.classList.toggle('liked');
    btn.textContent = liked ? '♥' : '♡';
    // pick product info from whichever card wrapper exists
    const card = btn.closest('.prod-card') || btn.closest('.uniform-card') || btn.closest('.diwali-card');
    const name = card ? (card.querySelector('.prod-name')?.textContent || '') : '';
    const cat  = card ? (card.querySelector('.prod-cat')?.textContent  || '') : '';
    const img  = card ? (card.querySelector('img')?.src || '') : '';
    const safeId = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const id = btn.dataset.id || (name ? safeId(name) : Math.random().toString(36).slice(2));
    btn.dataset.id = id;
    if (liked) { if (!wishlist.some(i => i.id === id)) wishlist.push({id, name, cat, img}); }
    else { wishlist = wishlist.filter(i => i.id !== id); }
    saveWishlist();
    document.getElementById('wishlistBadge').textContent = wishlist.length;
  }

  function renderWishlist() {
    const body = document.getElementById('wishlistBody');
    body.style.background = '#fff5f5';
    if (!wishlist.length) {
      body.innerHTML = '<div class="cart-empty"><div class="empty-icon">♡</div><p>No liked items yet.<br/>Tap the ♡ on any product!</p></div>';
      return;
    }
    const isCC = item => item.cat === 'Couple Combo';
    body.innerHTML = wishlist.map((item, idx) => {
      const displayName = item.name || (isCC(item) ? 'Vaira Oosi Design – Soft Silk Saree' : 'KVB Saree');
      const isClickable = isCC(item);
      return `
      <div class="wl-item" style="cursor:${isClickable ? 'pointer' : 'default'}" data-link="${isClickable ? 'couple-combo.html' : ''}">
        ${item.img ? `<img class="wl-img" src="${item.img}" alt="${displayName}">` : `<div class="wl-img-placeholder">🥻</div>`}
        <div class="wl-info">
          <div class="wl-cat">${item.cat || 'Saree'}</div>
          <div class="wl-name">${displayName}</div>
        </div>
        <button class="wl-remove" data-idx="${idx}" aria-label="Remove from wishlist">✕</button>
      </div>`;
    }).join('');

    /* attach handlers directly after each render */
    body.querySelectorAll('.wl-remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var i = parseInt(btn.getAttribute('data-idx'), 10);
        wishlist.splice(i, 1);
        saveWishlist();
        document.getElementById('wishlistBadge').textContent = wishlist.length;
        renderWishlist();
      });
    });
    body.querySelectorAll('.wl-item').forEach(function(el) {
      var link = el.getAttribute('data-link');
      if (link) {
        el.addEventListener('click', function() { window.location.href = link; });
      }
    });
  }

  function removeWishlistItem(idx) {
    wishlist.splice(idx, 1);
    saveWishlist();
    document.getElementById('wishlistBadge').textContent = wishlist.length;
    renderWishlist();
  }

  function openWishlist() {
    renderWishlist();
    document.getElementById('wishlistDrawer').classList.add('open');
    document.getElementById('overlayBg').classList.add('show');
  }
  function closeWishlist() { document.getElementById('wishlistDrawer').classList.remove('open'); document.getElementById('overlayBg').classList.remove('show'); }

  /* ── Active nav on scroll ── */
  const sections = ['home','categories','featured','contact'];
  window.addEventListener('scroll', () => {
    const pos = window.scrollY + 100;
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const link = document.querySelector(`.nav-menu a[href="#${id}"]`);
      if (link) link.classList.toggle('active', pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight);
    });
  });

  /* init cart badge */
  renderCart();
