// Простой, надёжный слайдер: клики, свайпы, кнопки, точки и клавиши.
// Работает с разметкой: .slides > .slide > img.slide-img
(function () {
  const slidesEl = document.getElementById('slides');
  const slides = Array.from(slidesEl.children);
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const dotsEl = document.getElementById('dots');

  if (!slides.length) return;

  let index = 0;
  let startX = 0;
  let deltaX = 0;
  let isDragging = false;

  // Инициализация точек
  function createDots() {
    dotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = i === index ? 'active' : '';
      b.setAttribute('aria-label', 'Перейти к слайду ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(b);
    });
  }

  function updateDots() {
    Array.from(dotsEl.children).forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });
  }

  function update() {
    slidesEl.style.transform = `translateX(${-index * 100}%)`;
    updateDots();
  }

  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    update();
  }

  function next() {
    index = (index + 1) % slides.length;
    update();
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, slides.length - 1));
    update();
  }

  // Клики по кнопкам
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Клавиши
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Свайп: touch
  slidesEl.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    slidesEl.style.transition = 'none';
  }, {passive:true});

  slidesEl.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    deltaX = e.touches[0].clientX - startX;
    const percent = (deltaX / slidesEl.clientWidth) * 100;
    slidesEl.style.transform = `translateX(${ -index * 100 + percent }%)`;
  }, {passive:true});

  slidesEl.addEventListener('touchend', (e) => {
    slidesEl.style.transition = '';
    isDragging = false;
    const threshold = slidesEl.clientWidth * 0.12; // 12% ширины — порог
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) prev(); else next();
    } else {
      update(); // вернуться
    }
    deltaX = 0;
  });

  // Свайп: мышь (опционально для десктопа)
  let mouseDown = false;
  slidesEl.addEventListener('mousedown', (e) => {
    mouseDown = true;
    startX = e.clientX;
    slidesEl.style.transition = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    deltaX = e.clientX - startX;
    const percent = (deltaX / slidesEl.clientWidth) * 100;
    slidesEl.style.transform = `translateX(${ -index * 100 + percent }%)`;
  });
  window.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    slidesEl.style.transition = '';
    const threshold = slidesEl.clientWidth * 0.12;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) prev(); else next();
    } else {
      update();
    }
    deltaX = 0;
  });

  // Ждём загрузки картинок — чтобы не дергалось при первом показе
  const imgs = slidesEl.querySelectorAll('img.slide-img');
  let toLoad = imgs.length;
  if (toLoad === 0) {
    createDots();
    update();
  } else {
    imgs.forEach(img => {
      if (img.complete) {
        toLoad--;
      } else {
        img.addEventListener('load', () => { toLoad--; if (toLoad === 0) { createDots(); update(); } });
        img.addEventListener('error', () => { toLoad--; if (toLoad === 0) { createDots(); update(); } });
      }
    });
    if (toLoad === 0) { createDots(); update(); }
  }
})();