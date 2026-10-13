/* ============================================
   ARISELUX - Main JavaScript
   Full Interactive Functionality
   ============================================ */

let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
if (rawApiUrl.includes(':5001')) {
  rawApiUrl = rawApiUrl.replace(':5001', ':5000');
}
const API_BASE_URL = rawApiUrl;

function apiUrl(path) {
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

// --- Header Scroll Effect ---
const header = document.getElementById('header');
if (header) {
  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// --- Active Nav Link Highlighting ---
function updateActiveNavLink() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')) {
      return;
    }
    const cleanHref = href.replace(/\/$/, '') || '/';
    if (cleanHref === currentPath || (currentPath === '' && cleanHref === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
updateActiveNavLink();

// --- Mobile Navigation Toggle ---
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');

function closeMobileNav() {
  if (hamburger) hamburger.classList.remove('active');
  if (mobileNav) mobileNav.classList.remove('active');
  document.body.classList.remove('nav-open');
  document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const willOpen = !mobileNav.classList.contains('active');
    hamburger.classList.toggle('active', willOpen);
    mobileNav.classList.toggle('active', willOpen);
    document.body.classList.toggle('nav-open', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  });

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  // Close mobile nav when any link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
}

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length > 0 && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
} else {
  // Fallback for older browsers
  revealElements.forEach(el => el.classList.add('revealed'));
}

// --- Stat Counter Animation ---
const statNumbers = document.querySelectorAll('.stat-number[data-count]');
if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 1800;
        const step = Math.max(1, Math.ceil(target / (duration / 16)));

        const counter = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          el.textContent = current + suffix;
        }, 16);

        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(el => statObserver.observe(el));
}

// --- Client Logo Slider (Infinite Auto-scroll) ---
function initLogoSliders() {
  const sliders = document.querySelectorAll('.logo-slider-track');
  sliders.forEach(track => {
    // Avoid re-cloning if already cloned
    if (track.dataset.cloned === 'true') return;
    const items = track.innerHTML;
    track.innerHTML = items + items;
    track.dataset.cloned = 'true';
  });
}
initLogoSliders();

// --- Product Category Tabs Filter (products.html) ---
function initProductFilters() {
  const tabs = document.querySelectorAll('.category-tab');
  const products = document.querySelectorAll('.product-item');

  if (tabs.length === 0 || products.length === 0) return;

  function filterCategory(category) {
    // Update active tab
    tabs.forEach(tab => {
      if (tab.getAttribute('data-category') === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Filter product cards
    products.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      if (category === 'all' || itemCategory === category) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  // Handle Tab Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');
      filterCategory(category);
      if (category !== 'all') {
        history.replaceState(null, null, '#' + category);
      } else {
        history.replaceState(null, null, window.location.pathname);
      }
    });
  });

  // Handle Initial Hash on Load (e.g. products.html#diesel)
  const initialHash = window.location.hash.replace('#', '').toLowerCase();
  if (initialHash) {
    const matchedTab = document.querySelector(`.category-tab[data-category="${initialHash}"]`);
    if (matchedTab) {
      filterCategory(initialHash);
      const targetElement = document.getElementById(initialHash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }

  // Listen to hash changes (e.g. user clicks footer link while on products page)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      filterCategory(hash);
    } else {
      filterCategory('all');
    }
  });
}
initProductFilters();

// --- Contact Form Handlers (contact.html) ---
function initContactForm() {
  // 1. Tab Switcher
  const tabEnqBtn = document.getElementById('c-tab-enquiry');
  const tabQuoteBtn = document.getElementById('c-tab-quote');
  const paneEnq = document.getElementById('c-pane-enquiry');
  const paneQuote = document.getElementById('c-pane-quote');

  function setContactTab(tab) {
    if (tab === 'quotation') {
      if (tabQuoteBtn) {
        tabQuoteBtn.style.background = '#000';
        tabQuoteBtn.style.color = '#fff';
        tabQuoteBtn.style.borderColor = '#000';
      }
      if (tabEnqBtn) {
        tabEnqBtn.style.background = '#f8fafc';
        tabEnqBtn.style.color = '#334155';
        tabEnqBtn.style.borderColor = '#cbd5e1';
      }
      if (paneQuote) paneQuote.style.display = 'block';
      if (paneEnq) paneEnq.style.display = 'none';
    } else {
      if (tabEnqBtn) {
        tabEnqBtn.style.background = 'var(--primary)';
        tabEnqBtn.style.color = '#fff';
        tabEnqBtn.style.borderColor = 'transparent';
      }
      if (tabQuoteBtn) {
        tabQuoteBtn.style.background = '#f8fafc';
        tabQuoteBtn.style.color = '#334155';
        tabQuoteBtn.style.borderColor = '#cbd5e1';
      }
      if (paneEnq) paneEnq.style.display = 'block';
      if (paneQuote) paneQuote.style.display = 'none';
    }
  }

  if (tabEnqBtn) tabEnqBtn.addEventListener('click', () => setContactTab('enquiry'));
  if (tabQuoteBtn) tabQuoteBtn.addEventListener('click', () => setContactTab('quotation'));

  // Check URL params for active tab: ?action=quotation or ?action=enquiry
  const urlParams = new URLSearchParams(window.location.search);
  const actionParam = urlParams.get('action') || urlParams.get('type');
  if (actionParam === 'quotation' || actionParam === 'quote' || actionParam === 'rfq') {
    setContactTab('quotation');
  }

  // Pre-select product dropdown if passed in URL query param: ?product=ace-b-01
  const selectedProduct = urlParams.get('product');
  if (selectedProduct) {
    document.querySelectorAll('#contact-enquiry-form select[name="product"], #contact-quotation-form select[name="product"]').forEach(select => {
      for (const option of select.options) {
        const optVal = (option.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetSlug = selectedProduct.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (optVal && (optVal === targetSlug || optVal.includes(targetSlug) || targetSlug.includes(optVal))) {
          option.selected = true;
          break;
        }
      }
    });
  }

  // 2. Enquiry Form Submit
  const enqForm = document.getElementById('contact-enquiry-form') || document.getElementById('contact-form');
  if (enqForm && !enqForm.__initialized) {
    enqForm.__initialized = true;
    let isSubmitting = false;

    enqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const submitBtn = enqForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

      const formData = new FormData(enqForm);
      const email = (formData.get('email') || '').trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        alert('⚠️ Please enter a correct email address.\n\nExample: yourname@company.com');
        const emailInput = enqForm.querySelector('input[name="email"]');
        if (emailInput) emailInput.focus();
        isSubmitting = false;
        return;
      }

      const payload = {
        name: (formData.get('name') || '').trim(),
        phone: (formData.get('phone') || '').trim(),
        email: email,
        company: (formData.get('company') || '').trim(),
        enquiryType: formData.get('enquiryType') || formData.get('enquiry_type') || 'Technical Consultation',
        projectType: formData.get('projectType') || 'General Infrastructure',
        product: formData.get('product') || 'General Factory Enquiry',
        preferredChannel: formData.get('preferredChannel') || 'WhatsApp',
        message: (formData.get('message') || '').trim(),
        entryType: 'enquiry',
        source: 'contact-page-enquiry'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Enquiry...';
      }

      try {
        const response = await fetch(apiUrl('enquiries'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const enqId = data.enquiry ? data.enquiry.id : 'Recorded';
          const msg = `Thank you, ${payload.name}!\n\nYour technical enquiry (#${enqId}) has been received by our sales engineering desk at Roorkee Works.\n\nWe will connect via ${payload.preferredChannel} within 2-4 business hours.\n\nWould you like to open WhatsApp now to chat with our engineering desk?`;
          if (confirm(msg)) {
            window.open(data.whatsappDirectUrl || `https://wa.me/918126732502?text=${encodeURIComponent(`Hello Ariselux Team, I submitted an enquiry (Ref #${enqId}):\n*Name:* ${payload.name}\n*Product:* ${payload.product}\n*Phone:* ${payload.phone}\n*Query:* ${payload.message}`)}`, '_blank');
          }
          enqForm.reset();
        } else {
          alert(data.message || 'There was an issue submitting your enquiry. Please WhatsApp us at +91-8126732502.');
        }
      } catch (err) {
        console.warn('Enquiry fallback:', err);
        const waText = encodeURIComponent(`Hello Ariselux Team, I want to enquire:\n*Name:* ${payload.name}\n*Product:* ${payload.product}\n*Phone:* ${payload.phone}\n*Company:* ${payload.company}\n*Query:* ${payload.message}`);
        if (confirm('Enquiry recorded locally. Would you like to chat with Ariselux sales desk on WhatsApp right now?')) {
          window.open(`https://wa.me/918126732502?text=${waText}`, '_blank');
        }
        enqForm.reset();
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
    });
  }

  // 3. Commercial Quotation Form Submit
  const quoteForm = document.getElementById('contact-quotation-form');
  if (quoteForm && !quoteForm.__initialized) {
    quoteForm.__initialized = true;
    let isQuoteSubmitting = false;

    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isQuoteSubmitting) return;
      isQuoteSubmitting = true;

      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

      const formData = new FormData(quoteForm);
      const email = (formData.get('email') || '').trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        alert('⚠️ Please enter a valid work email address.\n\nExample: name@company.com');
        const emailInput = quoteForm.querySelector('input[name="email"]');
        if (emailInput) emailInput.focus();
        isQuoteSubmitting = false;
        return;
      }

      const payload = {
        name: (formData.get('name') || '').trim(),
        company: (formData.get('company') || '').trim(),
        email: email,
        phone: (formData.get('phone') || '').trim(),
        quantity: formData.get('quantity') || '1 Unit',
        deliveryTimeline: formData.get('deliveryTimeline') || 'Immediate Dispatch',
        deliveryLocation: (formData.get('deliveryLocation') || '').trim(),
        gstin: (formData.get('gstin') || '').trim(),
        product: formData.get('product') || 'Ariselux Light Tower',
        specifications: (formData.get('specifications') || '').trim(),
        entryType: 'quotation',
        source: 'contact-page-quotation'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Quotation Request...';
      }

      try {
        const response = await fetch(apiUrl('quotations'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const quoteId = data.quotation ? data.quotation.id : 'Recorded';
          const msg = `Thank you, ${payload.name}!\n\nYour commercial quotation request for "${payload.product}" (Ref #${quoteId}) has been received at Roorkee Works.\n\nWe will share your formal quotation within 2-4 business hours.\n\nWould you like to connect directly on WhatsApp with our sales desk right now?`;
          if (confirm(msg)) {
            window.open(data.whatsappDirectUrl || `https://wa.me/918126732502?text=${encodeURIComponent(`Hello Ariselux Team, I requested quotation Ref #${quoteId} for ${payload.product}`)}`, '_blank');
          }
          quoteForm.reset();
        } else {
          alert(data.message || 'There was an issue submitting your quotation request. Please WhatsApp us at +91-8126732502.');
        }
      } catch (err) {
        console.warn('Quotation fallback:', err);
        const waText = encodeURIComponent(`Hello Ariselux Sales Desk, I requested a quote:\n*Product:* ${payload.product}\n*Quantity:* ${payload.quantity}\n*Buyer:* ${payload.name} (${payload.company})\n*Phone:* ${payload.phone}`);
        if (confirm('Quotation recorded locally. Would you like to connect directly on WhatsApp with our sales desk right now?')) {
          window.open(`https://wa.me/918126732502?text=${waText}`, '_blank');
        }
        quoteForm.reset();
      } finally {
        isQuoteSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
    });
  }
}
initContactForm();

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Request for Quotation (RFQ) System & Modal ---
function initRequestForQuotation() {
  if (window.__rfqInitialized) return;
  window.__rfqInitialized = true;

  const productContainers = document.querySelectorAll('.product-card-image, .product-detail-image');
  
  // Inject RFQ Modal if not already in DOM
  let rfqModal = document.getElementById('rfq-modal');
  if (!rfqModal) {
    rfqModal = document.createElement('div');
    rfqModal.id = 'rfq-modal';
    rfqModal.className = 'rfq-modal-overlay';
    rfqModal.setAttribute('role', 'dialog');
    rfqModal.setAttribute('aria-modal', 'true');
    rfqModal.setAttribute('aria-labelledby', 'rfq-modal-title');
    rfqModal.innerHTML = `
      <div class="rfq-modal-dialog">
        <!-- Header -->
        <div class="rfq-modal-header">
          <div class="rfq-modal-title-group">
            <h3 id="rfq-modal-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Request for Quotation
            </h3>
            <p>Official Factory Pricing & Technical Datasheet • Direct Roorkee Works</p>
          </div>
          <button type="button" class="rfq-close-btn" id="rfq-close-btn" aria-label="Close Quotation Form">&times;</button>
        </div>

        <!-- Body -->
        <div class="rfq-modal-body">
          <!-- Form View -->
          <form id="rfq-form">
            <!-- Selected Product Preview ("in form selected item appear") -->
            <div class="rfq-selected-product">
              <img src="" alt="Selected Product" class="rfq-product-thumb" id="rfq-product-thumb">
              <div class="rfq-product-info">
                <span class="rfq-product-badge">Selected Item</span>
                <h4 class="rfq-product-name" id="rfq-product-name">Ariselux Light Tower</h4>
                <div class="rfq-product-sub" id="rfq-product-sub">Direct Roorkee Works OEM Dispatch</div>
              </div>
            </div>

            <input type="hidden" name="product" id="rfq-hidden-product" value="">
            <input type="hidden" name="entryType" value="quotation">
            <input type="hidden" name="source" value="rfq-badge-modal">
            <!-- Anti-bot honeypot field -->
            <input type="text" name="website_hp" style="position:absolute;left:-9999px;opacity:0;" tabindex="-1" autocomplete="off">

            <div class="rfq-form-grid">
              <!-- Full Name -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-name">Full Name <span class="req">*</span></label>
                <input type="text" id="rfq-input-name" name="name" class="rfq-input" placeholder="e.g. Your Name" required>
              </div>

              <!-- Company Name -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-company">Company / Organization <span class="req">*</span></label>
                <input type="text" id="rfq-input-company" name="company" class="rfq-input" placeholder="e.g. L&T Infrastructure / NTPC" required>
              </div>

              <!-- Work Email -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-email">Work Email <span class="req">*</span></label>
                <input type="email" id="rfq-input-email" name="email" class="rfq-input" placeholder="e.g. name@company.com" required>
              </div>

              <!-- Phone Number -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-phone">Phone / WhatsApp <span class="req">*</span></label>
                <input type="tel" id="rfq-input-phone" name="phone" class="rfq-input" placeholder="e.g. +91 98765 43210" required>
              </div>

              <!-- Quantity Required -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-select-quantity">Quantity Required <span class="req">*</span></label>
                <select id="rfq-select-quantity" name="quantity" class="rfq-select" required>
                  <option value="1 Unit">1 Unit (Standard Deployment)</option>
                  <option value="2 - 5 Units">2 - 5 Units (Fleet Requirement)</option>
                  <option value="6 - 10 Units">6 - 10 Units (Project Order)</option>
                  <option value="10+ Units">10+ Units (Tender / Institutional Procurement)</option>
                </select>
              </div>

              <!-- Delivery Timeline -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-select-timeline">Target Delivery Timeline</label>
                <select id="rfq-select-timeline" name="deliveryTimeline" class="rfq-select">
                  <option value="Immediate Dispatch">Immediate Dispatch (Ready Stock)</option>
                  <option value="Within 1 - 2 Weeks">Within 1 - 2 Weeks</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="Bidding / Tender Stage">Bidding / Project Tender Stage</option>
                </select>
              </div>

              <!-- Project Location / Delivery Site -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-location">Delivery City / Site <span class="req">*</span></label>
                <input type="text" id="rfq-input-location" name="location" class="rfq-input" placeholder="e.g. Roorkee, Gujarat, Delhi NCR" required>
              </div>

              <!-- Company GSTIN (Optional) -->
              <div class="rfq-form-group">
                <label class="rfq-label" for="rfq-input-gstin">Company GSTIN <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Optional)</span></label>
                <input type="text" id="rfq-input-gstin" name="gstin" class="rfq-input" placeholder="e.g. 05AAAAA0000A1Z5">
              </div>

              <!-- Requirement / Specifications (Optional) -->
              <div class="rfq-form-group full-width">
                <label class="rfq-label" for="rfq-textarea-message">Requirement Details & Specifications <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Optional)</span></label>
                <textarea id="rfq-textarea-message" name="message" class="rfq-textarea" rows="3" placeholder="Specify mast height, engine brand, or technical requirements..."></textarea>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="rfq-submit-btn" id="rfq-submit-btn">
              <span>Submit Commercial Quotation</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

            <div class="rfq-trust-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>ISO 9001:2015 Certified OEM • Roorkee Works • Commercial Quotation within 2-4 Hours</span>
            </div>
          </form>

          <!-- Success Confirmation View -->
          <div id="rfq-success-view" class="rfq-success-view" style="display: none;">
            <div class="rfq-success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h4 class="rfq-success-title">Commercial Quotation Request Received!</h4>
            <div class="rfq-ref-pill" id="rfq-ref-id">Ref #RFQ-1001</div>
            <p class="rfq-success-desc" id="rfq-success-msg">
              Thank you! Our engineering desk at Roorkee has received your quotation request. We will prepare an official commercial quotation and technical proposal within 2-4 business hours.
            </p>
            <div class="rfq-success-actions">
              <a href="#" target="_blank" class="rfq-wa-btn" id="rfq-wa-direct-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                <span>Connect on WhatsApp Now</span>
              </a>
              <button type="button" class="rfq-done-btn" id="rfq-done-btn">Done / Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(rfqModal);
  }

  const closeBtn = document.getElementById('rfq-close-btn');
  const doneBtn = document.getElementById('rfq-done-btn');
  const rfqForm = document.getElementById('rfq-form');
  const rfqSuccessView = document.getElementById('rfq-success-view');
  const rfqProductThumb = document.getElementById('rfq-product-thumb');
  const rfqProductName = document.getElementById('rfq-product-name');
  const rfqProductSub = document.getElementById('rfq-product-sub');
  const rfqHiddenProduct = document.getElementById('rfq-hidden-product');
  const rfqMessageArea = document.getElementById('rfq-textarea-message');
  const rfqSubmitBtn = document.getElementById('rfq-submit-btn');

  function openRFQModal(productInfo) {
    const { title, imgSrc, specs } = productInfo;
    
    // Set selected item fields
    rfqProductName.textContent = title;
    rfqProductThumb.src = imgSrc || '/images/hero/hero-bg.png';
    rfqProductThumb.alt = title;
    rfqProductSub.textContent = specs || 'Direct Roorkee Works OEM Dispatch • Industrial Heavy Duty Spec';
    rfqHiddenProduct.value = title;
    rfqMessageArea.value = '';

    // Reset views
    isRfqSubmitting = false;
    rfqForm.style.display = 'block';
    rfqSuccessView.style.display = 'none';
    if (rfqSubmitBtn) {
      rfqSubmitBtn.disabled = false;
      rfqSubmitBtn.innerHTML = `<span>Submit Commercial Quotation</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }

    rfqModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    const firstInput = document.getElementById('rfq-input-name');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  }

  function closeRFQModal() {
    rfqModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeRFQModal);
  if (doneBtn) doneBtn.addEventListener('click', closeRFQModal);
  rfqModal.addEventListener('click', (e) => {
    if (e.target === rfqModal) closeRFQModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rfqModal.classList.contains('active')) {
      closeRFQModal();
    }
  });

  // Extract product details helper
  function extractProductDetails(element) {
    const card = element.closest('.product-detail-card, .product-card, .product-item') || element;
    const heading = card.querySelector('h4, h3, h5, .product-title');
    const img = card.querySelector('img');
    const specsEl = card.querySelector('.product-specs');

    let title = '';
    if (heading) {
      title = heading.textContent.trim().replace(/\s+/g, ' ');
    } else if (img && img.alt) {
      title = img.alt.trim();
    } else {
      title = 'Ariselux Light Tower';
    }

    const imgSrc = img ? img.src : '';
    const specs = specsEl ? specsEl.textContent.trim().replace(/\s+/g, ' ') : '';
    return { title, imgSrc, specs };
  }

  // Attach "Request for Quotation" button badge to each product container
  productContainers.forEach(container => {
    // Remove any leftover zoom hints
    const oldHint = container.querySelector('.image-zoom-hint');
    if (oldHint) oldHint.remove();

    const img = container.querySelector('img');
    if (!img) return;

    // Add "Request for Quotation" button badge if not present
    if (!container.querySelector('.btn-request-quote-badge')) {
      const rfqBadge = document.createElement('button');
      rfqBadge.type = 'button';
      rfqBadge.className = 'btn-request-quote-badge';
      rfqBadge.setAttribute('title', 'Request Quotation for this model');
      rfqBadge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>Request for Quotation</span>
      `;
      container.appendChild(rfqBadge);

      rfqBadge.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const details = extractProductDetails(container);
        openRFQModal(details);
      });
    }

    // Clicking image container opens the RFQ modal directly
    container.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      e.preventDefault();
      const details = extractProductDetails(container);
      openRFQModal(details);
    });
  });



  // Handle Form Submission
  let isRfqSubmitting = false;
  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isRfqSubmitting) return;
      isRfqSubmitting = true;

      const formData = new FormData(rfqForm);
      const name = (formData.get('name') || '').trim();
      const company = (formData.get('company') || '').trim();
      const email = (formData.get('email') || '').trim().toLowerCase();
      const phone = (formData.get('phone') || '').trim();
      const product = formData.get('product') || 'Ariselux Light Tower';
      const quantity = formData.get('quantity') || '1 Unit';
      const deliveryTimeline = formData.get('deliveryTimeline') || 'Immediate Dispatch';
      const deliveryLocation = (formData.get('location') || '').trim();
      const gstin = (formData.get('gstin') || '').trim();
      const specifications = (formData.get('message') || '').trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        alert('⚠️ Please enter a valid work email address.\n\nExample: name@company.com');
        const emailInput = document.getElementById('rfq-input-email');
        if (emailInput) emailInput.focus();
        isRfqSubmitting = false;
        return;
      }

      const payload = {
        name,
        company,
        email,
        phone,
        product,
        quantity,
        deliveryTimeline,
        deliveryLocation,
        gstin,
        specifications,
        entryType: 'quotation',
        source: 'rfq-badge-modal'
      };

      if (rfqSubmitBtn) {
        rfqSubmitBtn.disabled = true;
        rfqSubmitBtn.innerHTML = `<span>Submitting Quotation Request...</span>`;
      }

      try {
        const response = await fetch(apiUrl('quotations'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const quoteId = data.quotation ? data.quotation.id : 'Recorded';
          
          // Show Success View
          rfqForm.style.display = 'none';
          rfqSuccessView.style.display = 'block';

          const refPill = document.getElementById('rfq-ref-id');
          if (refPill) refPill.textContent = `Quotation Ref #${quoteId}`;

          const successMsg = document.getElementById('rfq-success-msg');
          if (successMsg) {
            successMsg.innerHTML = `Thank you, <strong>${name}</strong>! Your official quotation request for <strong>${product}</strong> (${quantity}) has been registered at Roorkee Works.<br><br>📧 A commercial confirmation email has been dispatched to <strong>${email}</strong>. Our engineering desk will deliver your formal pricing and freight estimate within 2-4 business hours.`;
          }

          const waBtn = document.getElementById('rfq-wa-direct-btn');
          if (waBtn) {
            const waNotes = specifications || 'Official quotation requested.';
            const waText = encodeURIComponent(`Hello Ariselux Sales Desk, I requested Quotation Ref #${quoteId}:\n*Product:* ${product}\n*Quantity:* ${quantity}\n*Timeline:* ${deliveryTimeline}\n*Site:* ${deliveryLocation}\n*Company:* ${company}\n*Buyer:* ${name} (${phone})\n*Notes:* ${waNotes}`);
            waBtn.href = data.whatsappDirectUrl || `https://wa.me/918126732502?text=${waText}`;
          }

          rfqForm.reset();
        } else {
          alert(data.message || 'There was an issue submitting your quotation request. Please WhatsApp us directly at +91-8126732502.');
        }
      } catch (err) {
        console.warn('RFQ API submission fallback:', err);
        const waNotes = specifications || 'Official quotation requested.';
        const waText = encodeURIComponent(`Hello Ariselux Sales Desk, I would like to request a quotation:\n*Product:* ${product}\n*Quantity:* ${quantity}\n*Timeline:* ${deliveryTimeline}\n*Buyer:* ${name} (${company})\n*Phone:* ${phone}\n*Details:* ${waNotes}`);
        
        // Show Success with direct WhatsApp option
        rfqForm.style.display = 'none';
        rfqSuccessView.style.display = 'block';
        
        const refPill = document.getElementById('rfq-ref-id');
        if (refPill) refPill.textContent = `Instant WhatsApp Connect`;

        const successMsg = document.getElementById('rfq-success-msg');
        if (successMsg) {
          successMsg.innerHTML = `Thank you, <strong>${name}</strong>! We've prepared your quotation details for <strong>${product}</strong>.<br><br>Click below to connect directly with our sales engineer on WhatsApp for instant pricing.`;
        }

        const waBtn = document.getElementById('rfq-wa-direct-btn');
        if (waBtn) {
          waBtn.href = `https://wa.me/918126732502?text=${waText}`;
        }

        rfqForm.reset();
      } finally {
        isRfqSubmitting = false;
        if (rfqSubmitBtn) {
          rfqSubmitBtn.disabled = false;
          rfqSubmitBtn.innerHTML = `<span>Submit Commercial Quotation</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        }
      }
    });
  }
}
initRequestForQuotation();

// ============================================
// DEDICATED GENERAL & TECHNICAL ENQUIRY SYSTEM
// ============================================
function initEnquiryModal() {
  if (window.__enquiryInitialized) return;
  window.__enquiryInitialized = true;

  // Inject Enquiry Modal if not in DOM
  let enquiryModal = document.getElementById('enquiry-modal');
  if (!enquiryModal) {
    enquiryModal = document.createElement('div');
    enquiryModal.id = 'enquiry-modal';
    enquiryModal.className = 'enquiry-modal-overlay';
    enquiryModal.setAttribute('role', 'dialog');
    enquiryModal.setAttribute('aria-modal', 'true');
    enquiryModal.setAttribute('aria-labelledby', 'enquiry-modal-title');
    enquiryModal.innerHTML = `
      <div class="enquiry-modal-dialog">
        <!-- Header -->
        <div class="enquiry-modal-header">
          <div class="enquiry-modal-title-group">
            <h3 id="enquiry-modal-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Technical &amp; General Enquiry Desk
            </h3>
            <p>Direct Factory Consultation • Model Guidance, Dealership &amp; Specifications</p>
          </div>
          <button type="button" class="enquiry-close-btn" id="enquiry-close-btn" aria-label="Close Enquiry Form">&times;</button>
        </div>

        <!-- Body -->
        <div class="enquiry-modal-body">
          <!-- Form View -->
          <form id="enquiry-form">
            <!-- Context Banner (when enquiring from a product) -->
            <div class="enquiry-context-banner" id="enquiry-context-banner" style="display: none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Enquiring regarding: <strong id="enquiry-context-product">Mobile Light Tower</strong></span>
            </div>

            <input type="hidden" name="product" id="enquiry-hidden-product" value="General Factory Enquiry">
            <input type="hidden" name="source" value="enquiry-modal">
            <!-- Anti-bot honeypot field -->
            <input type="text" name="website_hp" style="position:absolute;left:-9999px;opacity:0;" tabindex="-1" autocomplete="off">

            <div class="enquiry-form-grid">
              <!-- Full Name -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-input-name">Full Name <span class="req">*</span></label>
                <input type="text" id="enquiry-input-name" name="name" class="enquiry-input" placeholder="e.g. Your Name" required>
              </div>

              <!-- Contact Mobile -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-input-phone">Phone / WhatsApp Number <span class="req">*</span></label>
                <input type="tel" id="enquiry-input-phone" name="phone" class="enquiry-input" placeholder="e.g. +91 98765 43210" required>
              </div>

              <!-- Work Email -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-input-email">Official / Work Email <span class="req">*</span></label>
                <input type="email" id="enquiry-input-email" name="email" class="enquiry-input" placeholder="e.g. name@company.com" required>
              </div>

              <!-- Company / Organization -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-input-company">Company / Organization <span style="font-weight:400;color:#64748b;font-size:11px;">(Optional)</span></label>
                <input type="text" id="enquiry-input-company" name="company" class="enquiry-input" placeholder="e.g. Infrastructure, Contractor, PSU">
              </div>

              <!-- Nature of Enquiry (Best field for enquiry!) -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-select-nature">Nature of Enquiry <span class="req">*</span></label>
                <select id="enquiry-select-nature" name="enquiryType" class="enquiry-select" required>
                  <option value="Technical Specifications & Consultation">Technical Specifications &amp; Consultation</option>
                  <option value="Price & Availability Query">Price &amp; Availability Query</option>
                  <option value="Dealership & Distribution Inquiry">Dealership &amp; Distribution Inquiry</option>
                  <option value="Custom Engineering & Mast Fabrication">Custom Engineering &amp; Special Mast</option>
                  <option value="After-Sales Service & Spare Parts">After-Sales Service, Warranty &amp; Spares</option>
                  <option value="Government Tender / Bulk Purchase">Government Tender / Fleet Order</option>
                  <option value="General Question / Other">General Question / Other</option>
                </select>
              </div>

              <!-- Equipment Series of Interest -->
              <div class="enquiry-form-group">
                <label class="enquiry-label" for="enquiry-select-category">Category of Interest</label>
                <select id="enquiry-select-category" name="category" class="enquiry-select">
                  <option value="All / General Mobile Towers">All / Need Technical Guidance</option>
                  <option value="Battery Powered Series (Zero Emission)">Battery Powered Series (Zero Emission)</option>
                  <option value="Diesel Engine Series (Heavy-Duty Industrial)">Diesel Engine Series (4.5M - 12M Mast)</option>
                  <option value="Solar Powered Series (100% Off-Grid)">Solar Powered Series (100% Off-Grid)</option>
                  <option value="Battery-Petrol Hybrid Series">Battery-Petrol Hybrid Series</option>
                  <option value="Inflatable Balloon Series (360° Glare-Free)">Inflatable Balloon Series (360° Glare-Free)</option>
                  <option value="External Grid Powered (Without Genset)">External Grid Powered (Without Genset)</option>
                  <option value="Spare Parts & Components">Spare Parts &amp; Illumination Kits</option>
                </select>
              </div>

              <!-- City / State -->
              <div class="enquiry-form-group full-width">
                <label class="enquiry-label" for="enquiry-input-location">City / State / Site Location</label>
                <input type="text" id="enquiry-input-location" name="location" class="enquiry-input" placeholder="e.g. Roorkee, Ahmedabad, Delhi NCR, Hyderabad">
              </div>

              <!-- Preferred Response Channel -->
              <div class="enquiry-form-group full-width">
                <label class="enquiry-label">Preferred Response Channel</label>
                <div class="enquiry-channel-group">
                  <label class="enquiry-channel-label">
                    <input type="radio" name="preferredChannel" value="WhatsApp" checked>
                    <span>💬 WhatsApp</span>
                  </label>
                  <label class="enquiry-channel-label">
                    <input type="radio" name="preferredChannel" value="Phone Call">
                    <span>📞 Phone Call</span>
                  </label>
                  <label class="enquiry-channel-label">
                    <input type="radio" name="preferredChannel" value="Email">
                    <span>✉️ Email</span>
                  </label>
                </div>
              </div>

              <!-- Your Enquiry Details -->
              <div class="enquiry-form-group full-width">
                <label class="enquiry-label" for="enquiry-textarea-message">Your Enquiry / Questions <span class="req">*</span></label>
                <textarea id="enquiry-textarea-message" name="message" class="enquiry-textarea" rows="3" placeholder="Tell our engineering team about your project requirement, site conditions, or questions..." required></textarea>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="enquiry-submit-btn" id="enquiry-submit-btn">
              <span>Submit Factory Enquiry</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>

            <div class="rfq-trust-footer" style="margin-top: 14px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1b5faa" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Direct Factory Desk: +91-8126732502 • Response within 2-4 business hours • Roorkee Works</span>
            </div>
          </form>

          <!-- Success View -->
          <div id="enquiry-success-view" class="enquiry-success-view" style="display: none;">
            <div class="enquiry-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h4 class="enquiry-success-title">Enquiry Received Successfully!</h4>
            <div class="enquiry-ref-pill" id="enquiry-ref-id">Ref #ARL-ENQ-1001</div>
            <p class="enquiry-success-desc" id="enquiry-success-msg">
              Thank you! Your enquiry has been received by our technical sales engineering desk in Roorkee. An engineer will reach out to you via your preferred channel within 2-4 business hours.
            </p>
            <div class="enquiry-success-actions">
              <a href="#" target="_blank" class="rfq-wa-btn" id="enquiry-wa-direct-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                <span>Chat Directly on WhatsApp Now</span>
              </a>
              <button type="button" class="rfq-done-btn" id="enquiry-done-btn">Done / Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(enquiryModal);
  }

  const enquiryForm = document.getElementById('enquiry-form');
  const enquirySuccessView = document.getElementById('enquiry-success-view');
  const enquiryCloseBtn = document.getElementById('enquiry-close-btn');
  const enquiryDoneBtn = document.getElementById('enquiry-done-btn');
  const enquirySubmitBtn = document.getElementById('enquiry-submit-btn');

  function openEnquiryModal(productInfo) {
    if (!enquiryModal) return;
    if (enquiryForm) enquiryForm.style.display = 'block';
    if (enquirySuccessView) enquirySuccessView.style.display = 'none';

    const contextBanner = document.getElementById('enquiry-context-banner');
    const contextProduct = document.getElementById('enquiry-context-product');
    const hiddenProduct = document.getElementById('enquiry-hidden-product');

    if (productInfo && productInfo.title) {
      if (contextBanner) contextBanner.style.display = 'flex';
      if (contextProduct) contextProduct.textContent = productInfo.title;
      if (hiddenProduct) hiddenProduct.value = productInfo.title;
    } else {
      if (contextBanner) contextBanner.style.display = 'none';
      if (hiddenProduct) hiddenProduct.value = 'General Factory Enquiry';
    }

    enquiryModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const nameInput = document.getElementById('enquiry-input-name');
      if (nameInput) nameInput.focus();
    }, 150);
  }

  function closeEnquiryModal() {
    if (!enquiryModal) return;
    enquiryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (enquiryCloseBtn) enquiryCloseBtn.addEventListener('click', closeEnquiryModal);
  if (enquiryDoneBtn) enquiryDoneBtn.addEventListener('click', closeEnquiryModal);
  enquiryModal.addEventListener('click', (e) => {
    if (e.target === enquiryModal) closeEnquiryModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && enquiryModal.classList.contains('active')) {
      closeEnquiryModal();
    }
  });

  // Wire all "Enquire Now" buttons on product pages and navigation
  document.querySelectorAll('a[href*="/contact.html?product="], a[href*="contact.html?product="], .btn-enquire, [data-action="enquire"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-detail-card, .product-card, .product-item') || btn;
      const heading = card.querySelector('h4, h3, h5, .product-title');
      const title = heading ? heading.textContent.trim().replace(/\s+/g, ' ') : (new URL(btn.href, window.location.origin).searchParams.get('product') || 'Mobile Light Tower');
      openEnquiryModal({ title });
    });
  });

  // Wire header and general "Enquire Now" buttons to open Enquiry Modal
  document.querySelectorAll('a.header-cta, a.btn-solid[href*="contact.html"]').forEach(btn => {
    if (window.location.pathname.includes('contact')) return;
    if (btn.textContent.toLowerCase().includes('enquire')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openEnquiryModal();
      });
    }
  });

  // Handle Enquiry Form Submission
  let isEnquirySubmitting = false;
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isEnquirySubmitting) return;
      isEnquirySubmitting = true;

      const formData = new FormData(enquiryForm);
      const name = (formData.get('name') || '').trim();
      const phone = (formData.get('phone') || '').trim();
      const email = (formData.get('email') || '').trim().toLowerCase();
      const company = (formData.get('company') || '').trim();
      const enquiryType = formData.get('enquiryType') || 'Technical Consultation';
      const category = formData.get('category') || '';
      const product = formData.get('product') || category || 'General Enquiry';
      const location = (formData.get('location') || '').trim();
      const preferredChannel = formData.get('preferredChannel') || 'WhatsApp';
      const userMessage = (formData.get('message') || '').trim();

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        alert('⚠️ Please enter a valid work email address.\n\nExample: yourname@company.com');
        const emailInput = document.getElementById('enquiry-input-email');
        if (emailInput) emailInput.focus();
        isEnquirySubmitting = false;
        return;
      }

      const fullMessage = `Nature of Enquiry: ${enquiryType}\nCategory / Model: ${product}\nLocation: ${location || 'Not specified'}\nPreferred Channel: ${preferredChannel}\n\nEnquiry Query: ${userMessage}`;

      const payload = {
        name,
        email,
        phone,
        company,
        enquiryType,
        projectType: category || 'General Consultation',
        product: product !== 'General Factory Enquiry' ? product : `${enquiryType} (${category})`,
        location,
        preferredChannel,
        message: userMessage,
        fullMessage: fullMessage,
        entryType: 'enquiry',
        source: 'enquiry-modal'
      };

      if (enquirySubmitBtn) {
        enquirySubmitBtn.disabled = true;
        enquirySubmitBtn.innerHTML = `<span>Submitting Factory Enquiry...</span>`;
      }

      try {
        const response = await fetch(apiUrl('enquiries'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const enqId = data.enquiry ? data.enquiry.id : 'Recorded';
          enquiryForm.style.display = 'none';
          enquirySuccessView.style.display = 'block';

          const refPill = document.getElementById('enquiry-ref-id');
          if (refPill) refPill.textContent = `Enquiry Ref #${enqId}`;

          const successMsg = document.getElementById('enquiry-success-msg');
          if (successMsg) {
            successMsg.innerHTML = `Thank you, <strong>${name}</strong>! Your technical enquiry regarding <strong>${payload.product}</strong> has been received.<br><br>📧 A confirmation acknowledgment has been sent to <strong>${email}</strong>. Our engineering desk will connect via <strong>${preferredChannel}</strong> within 2-4 business hours.`;
          }

          const waBtn = document.getElementById('enquiry-wa-direct-btn');
          if (waBtn) {
            const waText = encodeURIComponent(`Hello Ariselux Engineering Desk, I submitted an enquiry (Ref #${inqId}):\n*Name:* ${name}\n*Nature:* ${enquiryType}\n*Product:* ${product}\n*Phone:* ${phone}\n*Query:* ${userMessage}`);
            waBtn.href = data.whatsappDirectUrl || `https://wa.me/918126732502?text=${waText}`;
          }

          enquiryForm.reset();
        } else {
          alert(data.message || 'There was an issue submitting your enquiry. Please WhatsApp us directly at +91-8126732502.');
        }
      } catch (err) {
        console.warn('Enquiry submission error fallback:', err);
        const waText = encodeURIComponent(`Hello Ariselux Engineering Desk, I want to submit an enquiry:\n*Name:* ${name}\n*Nature:* ${enquiryType}\n*Product:* ${product}\n*Phone:* ${phone}\n*Query:* ${userMessage}`);
        enquiryForm.style.display = 'none';
        enquirySuccessView.style.display = 'block';

        const refPill = document.getElementById('enquiry-ref-id');
        if (refPill) refPill.textContent = `Instant WhatsApp Connect`;

        const successMsg = document.getElementById('enquiry-success-msg');
        if (successMsg) {
          successMsg.innerHTML = `Thank you, <strong>${name}</strong>! We've prepared your enquiry details.<br><br>Click below to connect directly with our engineering team on WhatsApp.`;
        }

        const waBtn = document.getElementById('enquiry-wa-direct-btn');
        if (waBtn) {
          waBtn.href = `https://wa.me/918126732502?text=${waText}`;
        }
        enquiryForm.reset();
      } finally {
        isEnquirySubmitting = false;
        if (enquirySubmitBtn) {
          enquirySubmitBtn.disabled = false;
          enquirySubmitBtn.innerHTML = `<span>Submit Factory Enquiry</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
        }
      }
    });
  }

  // Export globally
  window.openEnquiryModal = openEnquiryModal;
}
initEnquiryModal();


// ─── TOWER IMAGE: Professional Grounded Stance + Smooth 3D Mouse Parallax ────
(function initTowerMotion() {
  const towerCol = document.querySelector('.about-hero-tower-col');
  const towerImg = document.getElementById('aboutHeroTowerImg') || document.querySelector('.about-hero-tower-img');
  if (!towerCol || !towerImg) return;

  const section = document.querySelector('.about-hero-showcase-section');
  if (!section) return;

  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let isHovering = false;

  const MAX_TILT = 5.5; // subtle, high-end industrial tilt
  const LERP = 0.08;    // smooth response

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentRX = lerp(currentRX, targetRX, LERP);
    currentRY = lerp(currentRY, targetRY, LERP);

    const scale = isHovering ? 1.02 : 1.0;

    towerImg.style.transform = `
      perspective(1100px)
      rotateX(${currentRX.toFixed(2)}deg)
      rotateY(${currentRY.toFixed(2)}deg)
      scale(${scale})
    `;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  section.addEventListener('mousemove', (e) => {
    isHovering = true;
    const rect = towerCol.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    targetRY = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT));
    targetRX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 0.5));
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRX = 0;
    targetRY = 0;
  });
})();

// ============================================
// --- CAREER APPLICATION FORM (With Resume Upload & 10MB Limit) ---
// ============================================
function initCareerForm() {
  const form = document.getElementById('careerApplicationForm');
  if (!form) return;

  const fileInput = document.getElementById('careerResumeInput');
  const dropzone = document.getElementById('resumeDropzone');
  const uploadPrompt = document.getElementById('resumeUploadPrompt');
  const filePreview = document.getElementById('resumeFilePreview');
  const fileNameEl = document.getElementById('resumeFileName');
  const fileSizeEl = document.getElementById('resumeFileSize');
  const removeBtn = document.getElementById('resumeRemoveBtn');
  const warningEl = document.getElementById('resumeWarning');
  const warningText = document.getElementById('resumeWarningText');
  const statusEl = document.getElementById('careerFormStatus');
  const submitBtn = document.getElementById('careerSubmitBtn');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  function resetFile() {
    if (fileInput) fileInput.value = '';
    if (uploadPrompt) uploadPrompt.style.display = 'block';
    if (filePreview) filePreview.style.display = 'none';
  }

  function showWarning(msg) {
    if (warningEl && warningText) {
      warningText.textContent = msg;
      warningEl.style.display = 'block';
    }
  }

  function hideWarning() {
    if (warningEl) warningEl.style.display = 'none';
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleFileSelected(file) {
    hideWarning();
    if (!file) {
      resetFile();
      return;
    }

    // CHECK FILE SIZE: STRICTLY REJECT IF > 10MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      showWarning(`⚠️ File too large! Your selected resume is ${sizeMb} MB, which exceeds the 10 MB limit. The file was rejected. Please select a resume file under 10 MB.`);
      resetFile();
      return;
    }

    // VALID FILE
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `${formatBytes(file.size)} • Ready to upload ✓`;
    if (uploadPrompt) uploadPrompt.style.display = 'none';
    if (filePreview) filePreview.style.display = 'flex';
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== removeBtn && !removeBtn?.contains(e.target)) {
        fileInput.click();
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--primary, #1b5faa)';
      dropzone.style.background = '#f0f9ff';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '#94a3b8';
      dropzone.style.background = '#f8fafc';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#94a3b8';
      dropzone.style.background = '#f8fafc';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileSelected(fileInput.files[0]);
      } else {
        resetFile();
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFile();
        hideWarning();
      });
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideWarning();
    if (statusEl) statusEl.style.display = 'none';

    // Validate file presence and size
    const file = fileInput?.files?.[0];
    if (!file) {
      showWarning('Please select and attach your resume file (PDF / DOC under 10 MB).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showWarning(`Your selected resume (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit. Please choose a smaller file.`);
      resetFile();
      return;
    }

    const formData = new FormData(form);

    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting Application & Uploading Resume...';
    }

    try {
      const response = await fetch(apiUrl('careers'), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.background = '#f0fdf4';
          statusEl.style.border = '1.5px solid #86efac';
          statusEl.style.color = '#166534';
          statusEl.innerHTML = `
            <strong style="display:block; font-size:15px; margin-bottom:4px;">🎉 Application Submitted Successfully!</strong>
            <div>${data.message}</div>
            <div style="margin-top:6px; font-size:12.5px; color:#15803d;">Application Ref: <strong>#${data.applicationId}</strong> &bull; Resume: <strong>${data.candidate?.resumeName || file.name}</strong></div>
          `;
        }
        form.reset();
        resetFile();
      } else {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.background = '#fef2f2';
          statusEl.style.border = '1.5px solid #fca5a5';
          statusEl.style.color = '#991b1b';
          statusEl.textContent = data.message || 'Failed to submit application. Please check your details and try again.';
        }
      }
    } catch (err) {
      console.error('Career submit error:', err);
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.background = '#fffbeb';
        statusEl.style.border = '1.5px solid #fde68a';
        statusEl.style.color = '#92400e';
        statusEl.innerHTML = `
          <strong>Connection issue:</strong> Could not connect to the backend server. You can also directly email your resume to <a href="mailto:sales@ariselux.com" style="color:#1b5faa;font-weight:700;text-decoration:underline;">sales@ariselux.com</a>.
        `;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  });
}

initCareerForm();

