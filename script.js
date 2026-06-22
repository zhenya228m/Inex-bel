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
// ==========================================================================
// МНОГОКОЛОНОЧНЫЙ УМНЫЙ СЛАЙДЕР С КОЛЕСИКОМ И АВТОПРОКРУТКОЙ
// ==========================================================================
const track = document.getElementById('sliderTrack');
const btnPrev = document.getElementById('slidePrev');
const btnNext = document.getElementById('slideNext');
const dotsContainer = document.getElementById('sliderDots');

if (track && btnPrev && btnNext && dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    const cards = track.querySelectorAll('.spec-card');
    let autoPlayTimer = null;
    let isThrottled = false; // Защита от слишком быстрого вращения колесика

    // Функция, определяющая параметры шага скролла
    function getSliderParams() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // Наш отступ из CSS
        const visibleWidth = track.offsetWidth;
        // Вычисляем, сколько карточек сейчас видно на экране (3 на ПК, 2 на планшете, 1 на мобилке)
        const visibleCount = Math.round(visibleWidth / (cardWidth + gap));
        return {
            step: cardWidth + gap,
            maxIndex: cards.length - visibleCount
        };
    }

    // Обновление активного индикатора (точки)
    function updateActiveDot() {
        const { step, maxIndex } = getSliderParams();
        let currentIndex = Math.round(track.scrollLeft / step);
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        dots.forEach((dot, idx) => {
            // Прячем точки, которые не нужны (например, на ПК доступны только 3 шага из 5)
            if (idx > maxIndex) {
                dot.style.display = 'none';
            } else {
                dot.style.display = 'block';
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            }
        });
    }

    // Отслеживаем скролл ленты
    track.addEventListener('scroll', updateActiveDot);
    window.addEventListener('resize', updateActiveDot); // Пересчет при смене ориентации экрана
    setTimeout(updateActiveDot, 100); // Первичная настройка при загрузке

    // Функция плавного перехода
    function navigate(direction) {
        const { step, maxIndex } = getSliderParams();
        let currentIndex = Math.round(track.scrollLeft / step);
        
        let targetIndex = currentIndex + direction;
        // Цикличность: если ушли за пределы, возвращаемся в начало или конец
        if (targetIndex > maxIndex) targetIndex = 0;
        if (targetIndex < 0) targetIndex = maxIndex;

        track.scrollTo({
            left: targetIndex * step,
            behavior: 'smooth'
        });
    }

    // Клики по стрелкам
    btnNext.addEventListener('click', () => navigate(1));
    btnPrev.addEventListener('click', () => navigate(-1));

    // Клики по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const { step } = getSliderParams();
            track.scrollTo({
                left: index * step,
                behavior: 'smooth'
            });
        });
    });

    // Улучшенный скролл колесиком мыши (с защитой от рывков)
    track.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (isThrottled) return;
        
        isThrottled = true;
        if (event.deltaY > 0) {
            navigate(1);
        } else {
            navigate(-1);
        }

        // Ставим задержку в 400мс, чтобы слайды переключались плавно, а не летели пачкой
        setTimeout(() => { isThrottled = false; }, 400);
    }, { passive: false });

    // Автопрокрутка раз в 5 секунд
    function startAutoPlay() {
        autoPlayTimer = setInterval(() => navigate(1), 5000);
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

// ==========================================================================
// ВАЛИДАЦИЯ ФОРМЫ ЗАКАЗА ЗВОНКА (ИМЯ, ТЕЛЕФОН, ГАЛОЧКА)
// ==========================================================================
const callForm = document.getElementById('callRequestForm');
const userName = document.getElementById('user-name');
const userPhone = document.getElementById('user-phone');
const userAgree = document.getElementById('user-agree');

const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');
const agreeError = document.getElementById('agreeError');

if (callForm && userName && userPhone && userAgree) {
    callForm.addEventListener('submit', (event) => {
        let isFormValid = true;

        // 1. Проверка поля Имени
        if (userName.value.trim() === '') {
            userName.classList.add('input-error');
            nameError.style.display = 'block';
            isFormValid = false;
        } else {
            userName.classList.remove('input-error');
            nameError.style.display = 'none';
        }

        // 2. Проверка поля Телефона (должно быть не пустым и содержать цифры)
        if (userPhone.value.trim() === '' || userPhone.value.trim().length < 7) {
            userPhone.classList.add('input-error');
            phoneError.style.display = 'block';
            isFormValid = false;
        } else {
            userPhone.classList.remove('input-error');
            phoneError.style.display = 'none';
        }

        // 3. Проверка галочки пользовательского соглашения
        if (!userAgree.checked) {
            agreeError.style.display = 'block';
            isFormValid = false;
        } else {
            agreeError.style.display = 'none';
        }

        // Если хоть одно условие не выполнено — отменяем отправку на почту
        if (!isFormValid) {
            event.preventDefault();
        }
    });

    // Сбрасываем визуальные ошибки сразу, как только пользователь начинает вводить данные
    userName.addEventListener('input', () => {
        userName.classList.remove('input-error');
        nameError.style.display = 'none';
    });

    userPhone.addEventListener('input', () => {
        userPhone.classList.remove('input-error');
        phoneError.style.display = 'none';
    });

    userAgree.addEventListener('change', () => {
        if (userAgree.checked) {
            agreeError.style.display = 'none';
        }
    });
}
// ==========================================================================
// ЛОГИКА СЛАЙДЕРА СЕРТИФИКАТОВ И ПОЛНОЭКРАННОГО ПРОСМОТРА (LIGHTBOX)
// ==========================================================================
const certTrack = document.getElementById('certTrack');
const certPrev = document.getElementById('certPrev');
const certNext = document.getElementById('certNext');
const certDotsContainer = document.getElementById('certDots');

if (certTrack && certPrev && certNext && certDotsContainer) {
    const certDots = certDotsContainer.querySelectorAll('.cert-dot');
    const certCards = certTrack.querySelectorAll('.cert-card');

    function getCertParams() {
        const cardWidth = certCards[0].offsetWidth;
        const gap = 24;
        const visibleWidth = certTrack.offsetWidth;
        const visibleCount = Math.round(visibleWidth / (cardWidth + gap));
        return {
            step: cardWidth + gap,
            maxIndex: certCards.length - visibleCount
        };
    }

    function updateCertDots() {
        const { step, maxIndex } = getCertParams();
        let currentIndex = Math.round(certTrack.scrollLeft / step);
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        certDots.forEach((dot, idx) => {
            if (idx > maxIndex) {
                dot.style.display = 'none';
            } else {
                dot.style.display = 'block';
                if (idx === currentIndex) {
                    dot.classList.add('cert-active');
                } else {
                    dot.classList.remove('cert-active');
                }
            }
        });
    }

    certTrack.addEventListener('scroll', updateCertDots);
    window.addEventListener('resize', updateCertDots);
    setTimeout(updateCertDots, 150);

    function navigateCert(direction) {
        const { step, maxIndex } = getCertParams();
        let currentIndex = Math.round(certTrack.scrollLeft / step);
        let targetIndex = currentIndex + direction;
        
        if (targetIndex > maxIndex) targetIndex = 0;
        if (targetIndex < 0) targetIndex = maxIndex;

        certTrack.scrollTo({
            left: targetIndex * step,
            behavior: 'smooth'
        });
    }

    certNext.addEventListener('click', () => navigateCert(1));
    certPrev.addEventListener('click', () => navigateCert(-1));

    certDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const { step } = getCertParams();
            certTrack.scrollTo({ left: index * step, behavior: 'smooth' });
        });
    });
}

// ЛОГИКА ОТКРЫТИЯ СЕРТИФИКАТА НА ВЕСЬ ЭКРАН (MODAL LIGHTBOX)
const certModal = document.getElementById('certModal');
const certModalImg = document.getElementById('certModalImg');
const certModalClose = document.getElementById('certModalClose');
const allCertImages = document.querySelectorAll('.cert-card__img');

if (certModal && certModalImg && certModalClose && allCertImages.length > 0) {
    // При клике на любую картинку сертификата открываем ее на весь экран
    allCertImages.forEach((img) => {
        img.addEventListener('click', () => {
            certModal.style.display = 'block';
            certModalImg.src = img.src; // Передаем путь к картинке в модальное окно
            document.body.style.overflow = 'hidden'; // Запрещаем скролл сайта на фоне
        });
    });

    // Функция закрытия окна
    function closeCertModal() {
        certModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Возвращаем скролл сайта
    }

    // Закрытие по клику на крестик
    certModalClose.addEventListener('click', closeCertModal);

    // Закрытие по клику на темный фон вокруг картинки
    certModal.addEventListener('click', (e) => {
        if (e.target === certModal) {
            closeCertModal();
        }
    });

    // Закрытие по кнопке Escape для удобства
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.style.display === 'block') {
            closeCertModal();
        }
    });
}
// ДОБАВЬТЕ ЭТОТ БЛОК В САМЫЙ КОНЕЦ ВАШЕГО SCRIPT.JS

// Находим все ссылки внутри нашего выпадающего бургер-меню
const burgerLinks = document.querySelectorAll('.burger-menu__link');

if (burgerLinks.length > 0 && burgerBtn && burgerMenu) {
    burgerLinks.forEach((link) => {
        link.addEventListener('click', () => {
            // Как только пользователь кликнул на ссылку — закрываем меню и возвращаем бургер в начальный вид
            burgerBtn.classList.remove('active');
            burgerMenu.classList.remove('active');
        });
    });
}
// ==========================================================================
// ЛОГИКА АДАПТИВНОГО СЛАЙДЕРА ТОВАРОВ И ИНТЕРАКТИВНЫХ КНОПОК ЦЕН
// ==========================================================================
const prodTrack = document.getElementById('prodTrack');
const prodPrev = document.getElementById('prodPrev');
const prodNext = document.getElementById('prodNext');
const prodDotsContainer = document.getElementById('prodDots');

if (prodTrack && prodPrev && prodNext && prodDotsContainer) {
    const prodDots = prodDotsContainer.querySelectorAll('.prod-dot');
    const prodCards = prodTrack.querySelectorAll('.product-card');

    function getProdParams() {
        const cardWidth = prodCards[0].offsetWidth;
        const gap = prodTrack.classList.contains('products-grid') ? 24 : 0;
        const visibleWidth = prodTrack.offsetWidth;
        const visibleCount = Math.round(visibleWidth / (cardWidth + gap));
        return {
            step: cardWidth + gap,
            maxIndex: prodCards.length - visibleCount
        };
    }

// НАЙДИТЕ И ЗАМЕНИТЕ ТОЛЬКО ЭТУ ФУНКЦИЮ В СТИЛЯХ СЛАЙДЕРА ТОВАРОВ В SCRIPT.JS:
function updateProdDots() {
    const { step, maxIndex } = getProdParams();
    let currentIndex = Math.round(prodTrack.scrollLeft / step);
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    prodDots.forEach((dot, idx) => {
        // Просто переключаем класс активности, не трогая отображение
        if (idx === currentIndex) {
            dot.classList.add('prod-active');
        } else {
            dot.classList.remove('prod-active');
        }
    });
}


    prodTrack.addEventListener('scroll', updateProdDots);
    window.addEventListener('resize', updateProdDots);
    setTimeout(updateProdDots, 200);

    function navigateProd(direction) {
        const { step, maxIndex } = getProdParams();
        let currentIndex = Math.round(prodTrack.scrollLeft / step);
        let targetIndex = currentIndex + direction;
        
        if (targetIndex > maxIndex) targetIndex = 0;
        if (targetIndex < 0) targetIndex = maxIndex;

        prodTrack.scrollTo({
            left: targetIndex * step,
            behavior: 'smooth'
        });
    }

    prodNext.addEventListener('click', () => navigateProd(1));
    prodPrev.addEventListener('click', () => navigateProd(-1));

    prodDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const { step } = getProdParams();
            prodTrack.scrollTo({ left: index * step, behavior: 'smooth' });
        });
    });
}

const productButtons = document.querySelectorAll('.product-card__btn');
const hiddenProductInput = document.getElementById('selected-product');

if (productButtons.length > 0 && hiddenProductInput) {
    productButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Берем название товара из атрибута data-product кнопки
            const productName = btn.getAttribute('data-product');
            
            // Записываем его в скрытое поле. Оно автоматически уйдет вам на почту вместе с формой!
            hiddenProductInput.value = productName;
        });
    });
}

