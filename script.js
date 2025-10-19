/* script.js: gallery behavior (filter, lightbox, nav, keyboard) */
(() => {
  const gallery = document.getElementById('gallery');
  const cards = Array.from(gallery.querySelectorAll('.card'));
  const catButtons = Array.from(document.querySelectorAll('.cat-btn'));
  const filterSelect = document.getElementById('img-filter');

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbNext = document.getElementById('lb-next');
  const lbPrev = document.getElementById('lb-prev');

  let currentIndex = -1;
  let currentFilter = 'none';

  // Apply image filter to all gallery images and to the lightbox image
  function applyImageFilter(value) {
    cards.forEach(c => {
      const img = c.querySelector('img');
      img.style.filter = value;
    });
    lbImg.style.filter = value;
  }

  filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    applyImageFilter(currentFilter);
  });

  // CATEGORY FILTERING
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      filterGallery(cat);
    });
  });

  function filterGallery(category) {
    cards.forEach(card => {
      const cardCat = card.dataset.category;
      if (category === 'all' || cardCat === category) {
        card.style.display = '';
        // small stagger for nicer transition:
        requestAnimationFrame(() => card.style.opacity = '1');
      } else {
        card.style.display = 'none';
      }
    });
  }

  // LIGHTBOX OPEN
  function openLightbox(index) {
    const card = cards[index];
    if (!card || card.style.display === 'none') return;
    currentIndex = index;
    const img = card.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = card.dataset.caption || img.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    // ensure filter matches
    lbImg.style.filter = currentFilter;
    // focus for keyboard events
    lbClose.focus();
  }

  // CLOSE LIGHTBOX
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    currentIndex = -1;
  }

  // NAVIGATION
  function showNext() {
    if (currentIndex === -1) return;
    // find next visible index (wrap)
    let i = currentIndex;
    for (let k=1;k<=cards.length;k++){
      const idx = (i + k) % cards.length;
      if (cards[idx].style.display !== 'none') { openLightbox(idx); break; }
    }
  }
  function showPrev() {
    if (currentIndex === -1) return;
    let i = currentIndex;
    for (let k=1;k<=cards.length;k++){
      const idx = (i - k + cards.length) % cards.length;
      if (cards[idx].style.display !== 'none') { openLightbox(idx); break; }
    }
  }

  // Attach click to each card
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
  });

  // Lightbox controls
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', showNext);
  lbPrev.addEventListener('click', showPrev);

  // Close by clicking outside (on background)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation: Esc, left, right
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  // Initialize default filter
  applyImageFilter(currentFilter);

  // Nice touch: lazy ensure images loaded & equal heights if desired
  // (we rely on object-fit in CSS so no JS layout needed)

  // Optional: touch swipe for mobile (simple)
  let touchStartX = 0;
  lbImg.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  lbImg.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) showPrev();
    else if (dx < -40) showNext();
  });

})();
