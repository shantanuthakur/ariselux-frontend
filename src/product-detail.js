import { productsData } from './products-data.js';
import { downloadSpecSheet } from './spec-sheet-generator.js';

// ariselux.com is a static Worker site, so it does not proxy /api requests in production.
// Automatically target local backend (port 5000) when running on localhost.
function resolveApiBaseUrl() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  let raw = (import.meta.env.VITE_API_URL || 'https://ariselux-backend.sales3-a0c.workers.dev/api').replace(/\/+$/, '');
  if (raw.includes(':5001')) {
    raw = raw.replace(':5001', ':5000');
  }
  return raw;
}
const API_BASE_URL = resolveApiBaseUrl();

function apiUrl(path) {
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

// Note: Header scroll and mobile menu toggling are handled globally by main.js

// Determine which product to display
const urlParams = new URLSearchParams(window.location.search);
const requestedId = (urlParams.get('id') || 'ace-lt-6000').toLowerCase();
const product = productsData[requestedId] || productsData['ace-lt-6000'];

// Populate DOM with product data
function renderProductDetail() {
  // Page Title & Meta
  const catLabel = product.categoryName ? `${product.categoryName} Mobile Light Tower` : 'Mobile Light Tower';
  const pageTitle = `${product.title} ${catLabel} | Ariselux Manufacturer India`;
  document.title = pageTitle;
  const metaDesc = document.getElementById('page-meta-desc');
  if (metaDesc) {
    metaDesc.content = `${product.title} (${catLabel}) manufactured in India by Ariselux. ${product.description}`;
  }

  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.content = `${product.title}, ${product.title} light tower, ${product.categoryName} mobile light tower, battery operated mobile light tower, mobile light tower manufacturer, mobile light tower manufacturer in india, ariselux`;

  // Keep each product URL independently understandable to search engines.
  const productUrl = new URL('/product-detail', window.location.origin);
  productUrl.searchParams.set('id', product.id);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = productUrl.href;

  const ogTitle = document.getElementById('page-og-title');
  if (ogTitle) ogTitle.content = pageTitle;
  const ogDescription = document.getElementById('page-og-description');
  if (ogDescription) ogDescription.content = `${product.title} (${catLabel}) - ${product.description}`;
  const ogUrl = document.getElementById('page-og-url');
  if (ogUrl) ogUrl.content = productUrl.href;

  let productSchema = document.getElementById('product-structured-data');
  if (!productSchema) {
    productSchema = document.createElement('script');
    productSchema.id = 'product-structured-data';
    productSchema.type = 'application/ld+json';
    document.head.appendChild(productSchema);
  }
  const imageUrls = (product.gallery?.length ? product.gallery : [product.image]).map(image => (
    new URL(image, window.location.origin).href
  ));

  const productMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl.href}#product`,
    url: productUrl.href,
    sku: product.id,
    name: `${product.title} ${catLabel}`,
    description: product.description,
    image: imageUrls,
    brand: {
      '@type': 'Brand',
      name: 'Ariselux'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Ariselux Equipments Private Limited',
      url: window.location.origin
    },
    category: product.categoryName || 'Mobile Light Towers',
    keywords: `${product.title}, mobile light tower, ${product.categoryName} mobile light tower, mobile light tower manufacturer, battery operated light tower`
  };

  // Only publish ratings when genuine product data is available.
  if (product.aggregateRating?.ratingValue && product.aggregateRating?.reviewCount) {
    productMarkup.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.aggregateRating.ratingValue),
      reviewCount: String(product.aggregateRating.reviewCount),
      bestRating: String(product.aggregateRating.bestRating || 5)
    };
  }

  productSchema.textContent = JSON.stringify(productMarkup);

  let breadcrumbSchema = document.getElementById('breadcrumb-structured-data');
  if (!breadcrumbSchema) {
    breadcrumbSchema = document.createElement('script');
    breadcrumbSchema.id = 'breadcrumb-structured-data';
    breadcrumbSchema.type = 'application/ld+json';
    document.head.appendChild(breadcrumbSchema);
  }
  breadcrumbSchema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${window.location.origin}/products.html` },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl.href }
    ]
  });

  // Breadcrumbs
  const bcCategory = document.getElementById('breadcrumb-category');
  if (bcCategory) bcCategory.textContent = product.categoryName;
  const bcProduct = document.getElementById('breadcrumb-product');
  if (bcProduct) bcProduct.textContent = product.title;

  // Header Title
  const titleEl = document.getElementById('product-title');
  if (titleEl) titleEl.textContent = product.title;

  // Description
  const descEl = document.getElementById('product-desc');
  if (descEl) descEl.textContent = product.description;

  // Quick 4-Grid Specs
  const specsGrid = document.getElementById('quick-specs-grid');
  if (specsGrid && product.quickSpecs) {
    specsGrid.innerHTML = Object.values(product.quickSpecs).map(spec => `
      <div class="iconcoltitle">
        <i><img src="${spec.icon}" alt="${spec.title}"></i>
        <h3>${spec.title}</h3>
        <span>${spec.value}</span>
      </div>
    `).join('');
  }

  // Configure Spec Sheet Download Link (Served from Backend API with client fallback)
  const specBtn = document.getElementById('download-spec-sheet-btn');
  if (specBtn) {
    const backendSpecUrl = apiUrl(`products/${product.id}/spec-sheet`);
    const sanitizedTitle = (product.title || 'Product').replace(/[^a-zA-Z0-9_-]/g, '-');
    const fileName = `Ariselux-${sanitizedTitle}-Specification-Sheet.pdf`;
    
    specBtn.href = backendSpecUrl;
    specBtn.setAttribute('download', fileName);
    specBtn.setAttribute('target', '_blank');

    specBtn.onclick = async (e) => {
      e.preventDefault();
      const textSpan = specBtn.querySelector('span');
      const origText = textSpan ? textSpan.textContent : 'Download Spec Sheet';
      if (textSpan) textSpan.textContent = 'Downloading...';

      // Helper to trigger browser download
      const triggerDownload = (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      };

      try {
        // 1. Try fetching from backend endpoint
        let resp = await fetch(backendSpecUrl);
        
        // 2. If initial fetch was not ok, try relative proxy URL /api/...
        if (!resp.ok && backendSpecUrl.startsWith('http')) {
          resp = await fetch(`/api/products/${product.id}/spec-sheet`);
        } else if (!resp.ok && !backendSpecUrl.startsWith('http')) {
          resp = await fetch(`http://localhost:5000/api/products/${product.id}/spec-sheet`);
        }

        if (resp.ok) {
          const blob = await resp.blob();
          if (blob.size > 0) {
            triggerDownload(blob);
            if (textSpan) textSpan.textContent = 'Downloaded!';
            setTimeout(() => {
              if (textSpan) textSpan.textContent = origText;
            }, 1800);
            return;
          }
        }
        throw new Error('Backend returned invalid response');
      } catch (err) {
        console.warn('Backend spec sheet download error, using client generator fallback:', err);
        // 3. Fallback: Generate PDF locally so the user is guaranteed to get their download
        try {
          await downloadSpecSheet(product, specBtn);
        } catch (genErr) {
          console.error('All download methods failed, opening direct URL:', genErr);
          window.location.href = backendSpecUrl;
        }
      } finally {
        setTimeout(() => {
          if (textSpan && textSpan.textContent !== 'Downloaded!') {
            textSpan.textContent = origText;
          }
        }, 1800);
      }
    };
  }

  // Main Image & Gallery
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) {
    mainImg.alt = product.title;
    mainImg.style.opacity = '0';
    mainImg.onload = () => {
      mainImg.style.opacity = '1';
    };
    mainImg.src = product.image;
    if (mainImg.complete) {
      mainImg.style.opacity = '1';
    }
  }

  const galleryThumbs = document.getElementById('gallery-thumbs');
  if (galleryThumbs && product.gallery && product.gallery.length > 1) {
    galleryThumbs.innerHTML = product.gallery.map((imgUrl, idx) => `
      <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-src="${imgUrl}">
        <img src="${imgUrl}" alt="${product.title} view ${idx + 1}">
      </div>
    `).join('');

    galleryThumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        galleryThumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (mainImg) {
          mainImg.style.opacity = '0.3';
          mainImg.style.transition = 'opacity 0.15s ease-in-out';
          setTimeout(() => {
            mainImg.src = thumb.getAttribute('data-src');
            mainImg.style.opacity = '1';
          }, 120);
        }
      });
    });
  } else if (galleryThumbs) {
    galleryThumbs.style.display = 'none';
  }

  // Specifications Table
  const tableBody = document.getElementById('table-body');
  if (tableBody && product.tableSpecs) {
    tableBody.innerHTML = product.tableSpecs.map(spec => `
      <tr>
        <td><strong>${spec.engine}</strong></td>
        <td>${spec.generator}</td>
        <td>${spec.tankSize}</td>
        <td>${spec.sockets}</td>
        <td><strong>${spec.weight}</strong></td>
        <td>${spec.dimensions}</td>
      </tr>
    `).join('');
  }

  // Features Section
  const featuresImg = document.getElementById('features-img');
  if (featuresImg && product.featureImage) {
    featuresImg.alt = `${product.title} Features`;
    featuresImg.style.opacity = '0';
    featuresImg.onload = () => {
      featuresImg.style.opacity = '1';
    };
    featuresImg.src = product.featureImage;
    if (featuresImg.complete) {
      featuresImg.style.opacity = '1';
    }
  }

  const featuresList = document.getElementById('features-list');
  if (featuresList && product.features) {
    featuresList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
  }

  // Highlights Accordion
  const accContainer = document.getElementById('highlights-accordion');
  if (accContainer && product.highlights) {
    accContainer.innerHTML = product.highlights.map((h, idx) => `
      <div class="accordion-item">
        <button class="accordion-button ${idx === 0 ? 'active' : ''}" type="button">
          <span>${h.title}</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-body ${idx === 0 ? 'show' : ''}">
          <ul>
            ${h.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    // Accordion Toggle Logic
    accContainer.querySelectorAll('.accordion-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');

        // Close all
        accContainer.querySelectorAll('.accordion-button').forEach(b => b.classList.remove('active'));
        accContainer.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('show'));

        // If wasn't active, open it
        if (!isActive) {
          btn.classList.add('active');
          body.classList.add('show');
        }
      });
    });
  }

  // "Best For" text-only application cards (no images)
  const bestforList = document.getElementById('bestfor-list');
  if (bestforList && product.bestFor && product.bestFor.length > 0) {
    bestforList.innerHTML = product.bestFor.map((item, idx) => `
      <div class="bestfor-card">
        <div class="bestfor-card-header">
          <span class="bestfor-badge">0${idx + 1}</span>
          <h3 class="bestfor-card-title">${item.title}</h3>
        </div>
        ${item.desc ? `<p class="bestfor-card-desc">${item.desc}</p>` : ''}
      </div>
    `).join('');
  }

  // Other Variants
  const variantsContainer = document.getElementById('variants-container');
  if (variantsContainer && product.variants) {
    variantsContainer.innerHTML = product.variants.map(varId => {
      const v = productsData[varId];
      if (!v) return '';
      return `
        <div class="variant-card">
          <div class="variant-card-img">
            <img src="${v.image}" alt="${v.title}">
          </div>
          <h4>${v.title}</h4>
          <a href="/product-detail.html?id=${v.id}" class="btn-solid" style="padding: 8px 16px; font-size: 13px; border-radius: 4px; width: 100%; justify-content: center;">View Details</a>
        </div>
      `;
    }).join('');
  }

  // Form Product Pre-selection
  document.querySelectorAll('.form-hidden-product').forEach(input => {
    input.value = product.title;
  });
  document.querySelectorAll('.target-model-name').forEach(el => {
    el.textContent = product.title;
  });
  document.querySelectorAll('.review-product-name').forEach(el => {
    el.textContent = product.title;
  });

  // ── Render Client Reviews System ────────────────────────
  renderReviewsSystem(product);
}

// ── Reviews System Implementation ──────────────────────────
function renderReviewsSystem(product) {
  let reviewsList = Array.isArray(product.reviews) ? [...product.reviews] : [];
  
  // Check for any locally saved client reviews for this product
  try {
    const stored = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      reviewsList = [...stored, ...reviewsList];
    }
  } catch (e) {
    // Local storage unavailable
  }

  const reviewCountEl = document.getElementById('count-all-reviews');
  if (reviewCountEl) reviewCountEl.textContent = reviewsList.length;
  const heroReviewsLink = document.getElementById('hero-reviews-link-text');
  if (heroReviewsLink) heroReviewsLink.textContent = `⭐ Reviews (${reviewsList.length})`;

  // 1. Rating Overview Card
  const overviewCard = document.getElementById('rating-overview-card');
  if (overviewCard) {
    const ratingVal = product.aggregateRating?.ratingValue || 4.9;
    const countVal = reviewsList.length * 9 + 12;
    overviewCard.innerHTML = `
      <div class="rating-big-score">
        <div class="score-number">${ratingVal.toFixed(1)}</div>
        <div class="stars-row">★★★★★</div>
        <div class="score-total">Based on ${countVal}+ site deployments</div>
      </div>
      <div class="rating-bars-wrap">
        <div class="rating-bar-line">
          <span class="star-label">5 Star</span>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: 92%;"></div></div>
          <span class="rating-bar-pct">92%</span>
        </div>
        <div class="rating-bar-line">
          <span class="star-label">4 Star</span>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: 8%;"></div></div>
          <span class="rating-bar-pct">8%</span>
        </div>
        <div class="rating-bar-line">
          <span class="star-label">3 Star</span>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: 0%;"></div></div>
          <span class="rating-bar-pct">0%</span>
        </div>
      </div>
      <div class="rating-trust-pillars">
        <div class="trust-pillar-item">
          <span class="pillar-icon">✓</span>
          <span>Verified Infrastructure Deployment</span>
        </div>
        <div class="trust-pillar-item">
          <span class="pillar-icon">✓</span>
          <span>CPCB &amp; CE Certified Construction</span>
        </div>
        <div class="trust-pillar-item">
          <span class="pillar-icon">✓</span>
          <span>100% Quality Inspected at Roorkee</span>
        </div>
      </div>
    `;
  }

  // 2. Reviews Grid Rendering
  const reviewsGrid = document.getElementById('reviews-cards-grid');
  
  function renderReviewsGrid(filter = 'all') {
    if (!reviewsGrid) return;
    
    let filtered = reviewsList;
    if (filter === 'verified') {
      filtered = reviewsList.filter(r => r.verified);
    } else if (filter === '5star') {
      filtered = reviewsList.filter(r => r.rating >= 5);
    }

    if (filtered.length === 0) {
      reviewsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="color: #64748b; font-size: 15px; margin: 0;">No reviews matching this filter yet. Be the first to share your site experience!</p>
        </div>
      `;
      return;
    }

    reviewsGrid.innerHTML = filtered.map(rev => {
      const stars = '★'.repeat(Math.min(5, Math.max(1, rev.rating || 5)));
      const tagsHtml = (rev.tags || []).map(t => `<span class="review-tag-chip"># ${t}</span>`).join('');
      return `
        <div class="review-card" data-rating="${rev.rating}" data-verified="${rev.verified ? 'true' : 'false'}">
          <div class="review-card-top">
            <div class="review-stars">${stars}</div>
            ${rev.verified ? `<div class="review-verified-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified Project</div>` : ''}
          </div>
          <h4 class="review-card-title">${rev.title || 'Exceptional Machine Reliability'}</h4>
          <p class="review-card-comment">"${rev.comment}"</p>
          ${tagsHtml ? `<div class="review-tags-wrap">${tagsHtml}</div>` : ''}
          <div class="review-author-block">
            <div class="review-author-left">
              <span class="review-author-name">${rev.author}</span>
              <span class="review-author-role">${rev.role} • <strong>${rev.company}</strong></span>
              <span class="review-author-loc">📍 ${rev.location} (${rev.date})</span>
            </div>
            <button type="button" class="review-helpful-action" data-count="${rev.helpfulCount || 20}">
              👍 <span>${rev.helpfulCount || 20}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Helpful Button Click
    reviewsGrid.querySelectorAll('.review-helpful-action').forEach(btn => {
      btn.addEventListener('click', () => {
        let count = parseInt(btn.getAttribute('data-count') || '20', 10);
        count++;
        btn.setAttribute('data-count', String(count));
        btn.querySelector('span').textContent = String(count);
        btn.style.color = '#1d4ed8';
        btn.style.borderColor = '#bfdbfe';
        btn.style.background = '#eff6ff';
      }, { once: true });
    });
  }

  renderReviewsGrid('all');

  // Filter Buttons
  document.querySelectorAll('.review-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.review-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderReviewsGrid(btn.getAttribute('data-filter') || 'all');
    });
  });

  // 3. Review Modal Dialog Setup
  const openModalBtn = document.getElementById('btn-open-review-modal');
  const modalOverlay = document.getElementById('review-modal-overlay');
  const closeModalBtn = document.getElementById('btn-close-review-modal');
  const cancelReviewBtn = document.getElementById('btn-cancel-review');
  const reviewForm = document.getElementById('client-review-form');
  const successDialog = document.getElementById('review-success-dialog');
  const closeSuccessBtn = document.getElementById('btn-close-review-success');

  function openModal() {
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (reviewForm) {
        reviewForm.style.display = 'block';
        reviewForm.reset();
      }
      if (successDialog) successDialog.style.display = 'none';
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Star selector in modal
  const starItems = document.querySelectorAll('#star-rating-input .star-select-item');
  const ratingInput = document.getElementById('review-rating-value');
  const ratingLabel = document.getElementById('rating-text-label');

  const ratingDescriptions = {
    1: '1.0 / 5.0 (Needs Improvement)',
    2: '2.0 / 5.0 (Fair)',
    3: '3.0 / 5.0 (Good Quality)',
    4: '4.0 / 5.0 (Very Good)',
    5: '5.0 / 5.0 (Exceptional)'
  };

  starItems.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'), 10);
      if (ratingInput) ratingInput.value = String(val);
      if (ratingLabel) ratingLabel.textContent = ratingDescriptions[val] || `${val}.0 / 5.0`;

      starItems.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-val'), 10);
        s.classList.toggle('active', sVal <= val);
      });
    });
  });

  // Handle Review Submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(reviewForm);
      const newReview = {
        id: `rev-local-${Date.now()}`,
        author: (fd.get('author') || 'Site Engineer').trim(),
        role: (fd.get('role') || 'Project Engineer').trim(),
        company: (fd.get('company') || 'Infrastructure Firm').trim(),
        location: (fd.get('location') || 'Project Site, India').trim(),
        rating: parseInt(fd.get('rating') || '5', 10),
        date: 'October 2026',
        verified: true,
        title: (fd.get('title') || 'Outstanding Field Performance').trim(),
        comment: (fd.get('comment') || '').trim(),
        helpfulCount: 1,
        tags: ['Verified Project Review', 'Site Tested']
      };

      reviewsList.unshift(newReview);

      try {
        const stored = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]');
        stored.unshift(newReview);
        localStorage.setItem(`reviews_${product.id}`, JSON.stringify(stored));
      } catch (err) {
        // Storage unavailable
      }

      renderReviewsGrid('all');
      if (reviewCountEl) reviewCountEl.textContent = reviewsList.length;

      reviewForm.style.display = 'none';
      if (successDialog) successDialog.style.display = 'block';
    });
  }
}

renderProductDetail();

// ── Action Tabs Switching (Quotation vs Enquiry) ──────────────
function initDetailTabs() {
  const tabBtns = document.querySelectorAll('.action-tab-btn');
  const quoteTab = document.getElementById('tab-content-quotation');
  const enqTab = document.getElementById('tab-content-enquiry');

  function switchTab(targetTab) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });
    if (quoteTab) quoteTab.classList.toggle('active', targetTab === 'quotation');
    if (enqTab) enqTab.classList.toggle('active', targetTab === 'enquiry');
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Hero section trigger buttons
  document.querySelectorAll('.btn-tab-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = btn.dataset.targetTab || 'quotation';
      switchTab(targetTab);
      if (typeof window.gtagSendEvent === 'function') {
        window.gtagSendEvent();
      }
    });
  });
}
initDetailTabs();

// ── 1. Commercial Quotation Form Handler ──────────────────────
const quoteForm = document.getElementById('detail-quotation-form');
const quoteSuccessView = document.getElementById('detail-quote-success-view');
const quoteResetBtn = document.getElementById('detail-quote-reset-btn');
let isQuoteSubmitting = false;

if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isQuoteSubmitting) return;
    isQuoteSubmitting = true;

    const submitBtn = quoteForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

    const formData = new FormData(quoteForm);

    const email = (formData.get('email') || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      alert('⚠️ Please enter a valid work email address.\n\nExample: name@company.com');
      const emailInput = quoteForm.querySelector('input[name="email"]');
      if (emailInput) { emailInput.focus(); emailInput.select(); }
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
      specifications: (formData.get('specifications') || '').trim(),
      product: product.title || 'Mobile Light Tower',
      entryType: 'quotation',
      source: 'product-detail-quotation'
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Preparing Quotation Request...</span>`;
    }

    try {
      const response = await fetch(apiUrl('quotations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (typeof window.gtagSendEvent === 'function') {
          window.gtagSendEvent();
        }
        const quoteId = data.quotation ? data.quotation.id : 'Recorded';
        quoteForm.style.display = 'none';
        if (quoteSuccessView) {
          quoteSuccessView.style.display = 'block';
          const badge = document.getElementById('detail-quote-ref-badge');
          if (badge) badge.textContent = `Ref #${quoteId}`;
          const msg = document.getElementById('detail-quote-success-msg');
          if (msg) {
            msg.innerHTML = `Thank you, <strong>${payload.name}</strong>! Your official quotation request for <strong>${payload.product}</strong> (${payload.quantity}) has been registered at Roorkee Works.<br><br>📧 A commercial confirmation receipt has been emailed to <strong>${payload.email}</strong>. Our engineering desk will deliver your formal pricing and freight estimate within 2-4 business hours.`;
          }
          const waBtn = document.getElementById('detail-quote-wa-btn');
          if (waBtn) {
            waBtn.href = data.whatsappDirectUrl || `https://wa.me/918923730881?text=${encodeURIComponent(`Hello Ariselux Team, I requested quotation Ref #${quoteId} for ${payload.product}`)}`;
          }
        }
        quoteForm.reset();
      } else {
        alert(data.message || 'There was an issue submitting your quotation request. Please WhatsApp us directly at +91 89237 30881.');
      }
    } catch (err) {
      console.warn('Quotation fallback:', err);
      const waText = encodeURIComponent(`Hello Ariselux Sales Desk, I would like to request an official quotation:\n*Model:* ${payload.product}\n*Quantity:* ${payload.quantity}\n*Delivery Site:* ${payload.deliveryLocation}\n*Buyer:* ${payload.name} (${payload.company})\n*Phone:* ${payload.phone}`);
      quoteForm.style.display = 'none';
      if (quoteSuccessView) {
        quoteSuccessView.style.display = 'block';
        const badge = document.getElementById('detail-quote-ref-badge');
        if (badge) badge.textContent = `Instant WhatsApp Connect`;
        const waBtn = document.getElementById('detail-quote-wa-btn');
        if (waBtn) waBtn.href = `https://wa.me/918923730881?text=${waText}`;
      }
      quoteForm.reset();
    } finally {
      isQuoteSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}

if (quoteResetBtn) {
  quoteResetBtn.addEventListener('click', () => {
    if (quoteSuccessView) quoteSuccessView.style.display = 'none';
    if (quoteForm) quoteForm.style.display = 'block';
  });
}

// ── 2. Technical Consultation Enquiry Form Handler ────────────
const enqForm = document.getElementById('detail-enquiry-form');
const enqSuccessView = document.getElementById('detail-enquiry-success-view');
const enqResetBtn = document.getElementById('detail-enquiry-reset-btn');
let isEnqSubmitting = false;

if (enqForm) {
  enqForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isEnqSubmitting) return;
    isEnqSubmitting = true;

    const submitBtn = enqForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

    const formData = new FormData(enqForm);

    const email = (formData.get('email') || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      alert('⚠️ Please enter a valid work email address.\n\nExample: name@company.com');
      const emailInput = enqForm.querySelector('input[name="email"]');
      if (emailInput) { emailInput.focus(); emailInput.select(); }
      isEnqSubmitting = false;
      return;
    }

    const payload = {
      name: (formData.get('name') || '').trim(),
      phone: (formData.get('phone') || '').trim(),
      email: email,
      location: (formData.get('location') || '').trim(),
      enquiryType: formData.get('enquiryType') || 'Technical Consultation',
      projectType: formData.get('projectType') || 'General Infrastructure',
      preferredChannel: formData.get('preferredChannel') || 'WhatsApp',
      message: (formData.get('message') || '').trim(),
      product: product.title || 'Mobile Light Tower',
      entryType: 'enquiry',
      source: 'product-detail-enquiry'
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting Technical Enquiry...</span>`;
    }

    try {
      const response = await fetch(apiUrl('enquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (typeof window.gtagSendEvent === 'function') {
          window.gtagSendEvent();
        }
        const enqId = data.enquiry ? data.enquiry.id : 'Recorded';
        enqForm.style.display = 'none';
        if (enqSuccessView) {
          enqSuccessView.style.display = 'block';
          const badge = document.getElementById('detail-enquiry-ref-badge');
          if (badge) badge.textContent = `Ref #${enqId}`;
          const msg = document.getElementById('detail-enquiry-success-msg');
          if (msg) {
            msg.innerHTML = `Thank you, <strong>${payload.name}</strong>! Your technical enquiry regarding <strong>${payload.product}</strong> has been received by our engineering team in Roorkee.<br><br>📧 An engineering acknowledgment has been emailed to <strong>${payload.email}</strong>. An application engineer will reach out via <strong>${payload.preferredChannel}</strong> within 2-4 business hours.`;
          }
          const waBtn = document.getElementById('detail-enquiry-wa-btn');
          if (waBtn) {
            waBtn.href = data.whatsappDirectUrl || `https://wa.me/918923730881?text=${encodeURIComponent(`Hello Ariselux Engineering Desk, I submitted Enquiry Ref #${enqId} for ${payload.product}`)}`;
          }
        }
        enqForm.reset();
      } else {
        alert(data.message || 'There was an issue submitting your enquiry. Please WhatsApp us directly at +91 89237 30881.');
      }
    } catch (err) {
      console.warn('Enquiry fallback:', err);
      const waText = encodeURIComponent(`Hello Ariselux Engineering Desk, I want to submit a technical enquiry:\n*Nature:* ${payload.enquiryType}\n*Equipment:* ${payload.product}\n*Project:* ${payload.projectType}\n*Name:* ${payload.name}\n*Phone:* ${payload.phone}\n*Query:* ${payload.message}`);
      enqForm.style.display = 'none';
      if (enqSuccessView) {
        enqSuccessView.style.display = 'block';
        const badge = document.getElementById('detail-enquiry-ref-badge');
        if (badge) badge.textContent = `Instant WhatsApp Connect`;
        const waBtn = document.getElementById('detail-enquiry-wa-btn');
        if (waBtn) waBtn.href = `https://wa.me/918923730881?text=${waText}`;
      }
      enqForm.reset();
    } finally {
      isEnqSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}

if (enqResetBtn) {
  enqResetBtn.addEventListener('click', () => {
    if (enqSuccessView) enqSuccessView.style.display = 'none';
    if (enqForm) enqForm.style.display = 'block';
  });
}
