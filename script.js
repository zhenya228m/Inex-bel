const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');

// Открытие / закрытие с плавной анимацией scale и opacity
burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerBtn.classList.toggle('active');
    burgerMenu.classList.toggle('active');
});

// Клик вне меню закрывает его
document.addEventListener('click', (event) => {
    if (!burgerBtn.contains(event.target) && !burgerMenu.contains(event.target)) {
        burgerBtn.classList.remove('active');
        burgerMenu.classList.remove('active');
    }
});

// Закрытие по клавише Escape для удобства
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        burgerBtn.classList.remove('active');
        burgerMenu.classList.remove('active');
    }
});
// ЛОГИКА ДЛЯ ПРОКРУТКИ ГАЛЕРЕИ (СЛАЙДЕРА) КНОПКАМИ
const sliderTrack = document.getElementById('sliderTrack');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');

if (sliderTrack && slidePrev && slideNext) {
    // При клике вперед смещаем ленту вправо на ширину одной карточки + зазор
    slideNext.addEventListener('click', () => {
        sliderTrack.scrollLeft += 324; 
    });

    // При клике назад смещаем ленту влево
    slidePrev.addEventListener('click', () => {
        sliderTrack.scrollLeft -= 324;
    });
}
// ОБНОВЛЕННАЯ СИНХРОННАЯ ЛОГИКА СЛАЙДЕРА (ПОД 100% ШИРИНУ СЛАЙДА)
const track = document.getElementById('sliderTrack');
const btnPrev = document.getElementById('slidePrev');
const btnNext = document.getElementById('slideNext');
const dotsContainer = document.getElementById('sliderDots');

if (track && btnPrev && btnNext && dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    let currentIndex = 0;
    const totalSlides = dots.length;
    let autoPlayTimer = null;

    function updateDots(index) {
        dots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        currentIndex = index;
    }

    // Рассчитываем индекс на основе точной ширины текущей карточки
    track.addEventListener('scroll', () => {
        const slideWidth = track.offsetWidth;
        // Добавили небольшой сдвиг (+10), чтобы избежать погрешностей округления браузера
        const calculatedIndex = Math.floor((track.scrollLeft + 10) / slideWidth); 
        if (calculatedIndex >= 0 && calculatedIndex < totalSlides && calculatedIndex !== currentIndex) {
            updateDots(calculatedIndex);
        }
    });

    function scrollToSlide(index) {
        const slideWidth = track.offsetWidth;
        track.scrollTo({
            left: slideWidth * index,
            behavior: 'smooth'
        });
        updateDots(index); // Принудительно зажигаем нужную точку при клике
    }

    btnNext.addEventListener('click', () => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= totalSlides) nextIndex = 0;
        scrollToSlide(nextIndex);
    });

    btnPrev.addEventListener('click', () => {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = totalSlides - 1;
        scrollToSlide(prevIndex);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            scrollToSlide(index);
        });
    });

    function startAutoPlay() {
        autoPlayTimer = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= totalSlides) nextIndex = 0;
            scrollToSlide(nextIndex);
        }, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
    }

    startAutoPlay();

    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        sliderWrapper.addEventListener('mouseenter', stopAutoPlay);
        sliderWrapper.addEventListener('mouseleave', startAutoPlay);
        sliderWrapper.addEventListener('touchstart', stopAutoPlay);
        sliderWrapper.addEventListener('touchend', startAutoPlay);
    }
}
