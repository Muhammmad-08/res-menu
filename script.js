// Скрипт управления слайдером (клик по краям, свайп, клавиши)
// Лёгкий, без зависимостей.

(function(){
  const slider = document.getElementById('menuSlider');
  const slidesEl = slider.querySelector('.slides');
  const slides = Array.from(slidesEl.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dots');

  let index = 0;
  const total = slides.length;
  let startX = null;
  let isTouch = false;

  // Создать точки-индикацию (опционально)
  function createDots(){
    if(!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for(let i=0;i<total;i++){
      const b = document.createElement('button');
      b.dataset.idx = i;
      b.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(b);
    }
    updateDots();
  }

  function updateDots(){
    if(!dotsContainer) return;
    const children = Array.from(dotsContainer.children);
    children.forEach((c,i)=> c.classList.toggle('active', i===index));
  }

  function show(){
    const offset = -index * 100;
    slidesEl.style.transform = `translateX(${offset}%)`;
    updateDots();
  }

  function prev(){
    index = (index - 1 + total) % total;
    show();
  }

  function next(){
    index = (index + 1) % total;
    show();
  }

  function goTo(i){
    index = Math.max(0, Math.min(total-1, i));
    show();
  }

  // Поддержка клавиш
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
  });

  // Клики на зоны
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Свайп для мобильных
  slider.addEventListener('touchstart', (e)=>{
    isTouch = true;
    startX = e.touches[0].clientX;
  }, {passive:true});

  slider.addEventListener('touchmove', (e)=>{
    if(startX === null) return;
    const dx = e.touches[0].clientX - startX;
    // не мешаем native scroll если вертикальный свайп
    if(Math.abs(dx) < 10) return;
    e.preventDefault();
  }, {passive:false});

  slider.addEventListener('touchend', (e)=>{
    if(startX === null) return;
    const endX = (e.changedTouches && e.changedTouches[0].clientX) || startX;
    const dx = endX - startX;
    const threshold = Math.max(window.innerWidth * 0.08, 24);
    if(dx > threshold) prev();
    else if(dx < -threshold) next();
    startX = null;
    setTimeout(()=> isTouch = false, 50);
  });

  // Поддержка мыши: перетаскивание
  let mouseDown = false;
  let mouseStartX = 0;
  slider.addEventListener('mousedown', (e)=>{
    mouseDown = true;
    mouseStartX = e.clientX;
  });

  window.addEventListener('mouseup', (e)=>{
    if(!mouseDown) return;
    const dx = e.clientX - mouseStartX;
    const threshold = Math.max(window.innerWidth * 0.02, 40);
    if(dx > threshold) prev();
    else if(dx < -threshold) next();
    mouseDown = false;
  });

  // Предзагрузка изображений (на случай, если изображения большие)
  function preload() {
    slides.forEach(img => {
      if(!img.complete) {
        const src = img.src;
        const i = new Image();
        i.src = src;
      }
    });
  }

  // Инициализация
  createDots();
  preload();
  show();

  // Для автоматического слайд-шоу — раскомментируйте:
  // let autoInterval = setInterval(next, 6000);
  // slider.addEventListener('mouseenter', ()=> clearInterval(autoInterval));
  // slider.addEventListener('mouseleave', ()=> autoInterval = setInterval(next, 6000));
})();