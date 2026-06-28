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
        const visibleWidth = track.offsetWidth;
        // Реальное расстояние между соседними карточками (точнее, чем формула cardWidth + gap,
        // и не зависит от округлений scroll-snap на мобильных устройствах)
        const step = cards.length > 1
            ? cards[1].offsetLeft - cards[0].offsetLeft
            : cards[0].offsetWidth;
        const cardWidth = cards[0].offsetWidth;
        const gap = step - cardWidth;
        // Вычисляем, сколько карточек сейчас видно на экране (3 на ПК, 2 на планшете, 1 на мобилке)
        const visibleCount = Math.max(1, Math.round(visibleWidth / step));
        return {
            step,
            maxIndex: cards.length - visibleCount
        };
    }

    let currentIndex = 0; // Храним текущий индекс в переменной, а не считаем его каждый раз из scrollLeft —
                           // во время плавной анимации scrollLeft ещё "в полёте" и даёт неверное значение

    // Обновление активного индикатора (точки)
    function updateActiveDot() {
        const { step, maxIndex } = getSliderParams();
        let idx = Math.round(track.scrollLeft / step);
        if (idx > maxIndex) idx = maxIndex;
        currentIndex = idx;

        dots.forEach((dot, i) => {
            // Прячем точки, которые не нужны (например, на ПК доступны только 3 шага из 5)
            if (i > maxIndex) {
                dot.style.display = 'none';
            } else {
                dot.style.display = 'block';
                if (i === idx) {
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

        let targetIndex = currentIndex + direction;
        // Цикличность: если ушли за пределы, возвращаемся в начало или конец
        if (targetIndex > maxIndex) targetIndex = 0;
        if (targetIndex < 0) targetIndex = maxIndex;

        currentIndex = targetIndex; // Обновляем сразу, не дожидаясь окончания анимации скролла
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
            currentIndex = index;
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

    // Автопрокрутка раз в 5 секунд (на 1 карточку)
    function startAutoPlay() {
        stopAutoPlay(); // На случай повторного вызова — не даём накопиться нескольким таймерам
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
// ПОЛНАЯ b2b-ВАЛИДАЦИЯ ФОРМЫ ЗАКАЗА ЗВОНКА (ИМЯ, КОМПАНИЯ, ТЕЛЕФОН, ГАЛОЧКА)
// ==========================================================================
const callForm = document.getElementById('callRequestForm');
const userName = document.getElementById('user-name');
const userCompany = document.getElementById('user-company');
const userPhone = document.getElementById('user-phone');
const userAgree = document.getElementById('user-agree');

const nameError = document.getElementById('nameError');
const companyError = document.getElementById('companyError');
const phoneError = document.getElementById('phoneError');
const agreeError = document.getElementById('agreeError');

if (callForm && userName && userCompany && userPhone && userAgree) {
    // ВАЖНО: Делаем функцию асинхронной (добавляем async)
    callForm.addEventListener('submit', async (event) => {
        // Всегда отменяем стандартное поведение, чтобы контролировать процесс
        event.preventDefault();
        
        let isFormValid = true;

        // 1. Проверка Имени
        if (userName.value.trim() === '') {
            userName.classList.add('input-error');
            nameError.style.display = 'block';
            isFormValid = false;
        } else {
            userName.classList.remove('input-error');
            nameError.style.display = 'none';
        }

        // 2. Проверка Названия компании
        if (userCompany.value.trim() === '') {
            userCompany.classList.add('input-error');
            companyError.style.display = 'block';
            isFormValid = false;
        } else {
            userCompany.classList.remove('input-error');
            companyError.style.display = 'none';
        }

        // 3. Проверка Номера телефона
        if (userPhone.value.trim() === '' || userPhone.value.trim().length < 7) {
            userPhone.classList.add('input-error');
            phoneError.style.display = 'block';
            isFormValid = false;
        } else {
            userPhone.classList.remove('input-error');
            phoneError.style.display = 'none';
        }

        // 4. Проверка Галочки соглашения
        if (!userAgree.checked) {
            agreeError.style.display = 'block';
            isFormValid = false;
        } else {
            agreeError.style.display = 'none';
        }

        // ЕСЛИ ЕСТЬ ОШИБКИ — прерываем выполнение и ничего не отправляем
        if (!isFormValid) {
            return; 
        }

        // --- БЛОК ОТПРАВКИ НА WEB3FORMS (срабатывает, только если всё заполнено верно) ---
        const button = callForm.querySelector('.form-submit-btn');
        const data = new FormData(callForm);

        // Блокируем кнопку на время отправки
        button.disabled = true;
        button.textContent = 'Отправка...';

        try {
            const response = await fetch(callForm.action, {
                method: callForm.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (response.status === 200) {
                alert('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в течение 15 минут.');
                callForm.reset(); // Сбрасываем поля формы после успешной отправки
            } else {
                alert('Ошибка сервера: ' + (result.message || 'Не удалось отправить форму.'));
            }
        } catch (error) {
            // Если вы всё еще тестируете на 127.0.0.1 и браузер ругается, вы увидите реальную причину в консоли (F12)
            console.error('Детали ошибки сети:', error);
            alert('Не удалось связаться с сервером. Попробуйте обновить страницу или отправить заявку позже.');
        } finally {
            // Возвращаем кнопку в начальное состояние в любом случае
            button.disabled = false;
            button.textContent = 'Заказать звонок';
        }
    });

    // Мгновенный сброс ошибок при начале ввода текста (ваш старый код)
    userName.addEventListener('input', () => { userName.classList.remove('input-error'); nameError.style.display = 'none'; });
    userCompany.addEventListener('input', () => { userCompany.classList.remove('input-error'); companyError.style.display = 'none'; });
    userPhone.addEventListener('input', () => { userPhone.classList.remove('input-error'); phoneError.style.display = 'none'; });
    userAgree.addEventListener('change', () => { if (userAgree.checked) agreeError.style.display = 'none'; });
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

// ЛОГИКА ПЛАВНОГО FAQ-АККОРДЕОНА (ОТКРЫТ ТОЛЬКО 1 ВОПРОС ЗА РАЗ)
const faqItems = document.querySelectorAll('.faq-item');

if (faqItems.length > 0) {
    faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-item__trigger');
        const panel = item.querySelector('.faq-item__panel');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Принудительно закрываем все остальные открытые вопросы
            faqItems.forEach((otherItem) => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-item__panel').style.maxHeight = null;
            });

            // Если текущий вопрос был закрыт — плавно открываем его
            if (!isActive) {
                item.classList.add('active');
                panel.style.maxHeight = panel.scrollHeight + "px"; // Задаем точную высоту контента
            }
        });
    });
}
// Автоматическое закрытие бургер-меню при прокрутке страницы
window.addEventListener('scroll', () => {
    // Проверяем, что элементы существуют и у меню есть активный класс
    if (typeof burgerBtn !== 'undefined' && typeof burgerMenu !== 'undefined') {
        if (burgerMenu.classList.contains('active')) {
            burgerBtn.classList.remove('active');
            burgerMenu.classList.remove('active');
        }
    }
});
// ЭФФЕКТ FADE-IN ПРИ ПРОКРУТКЕ СТРАНИЦЫ
document.addEventListener("DOMContentLoaded", () => {
    // Находим все секции, которые должны плавно появляться
    const animatedSections = document.querySelectorAll(
        '.specialization-section, .products-section, .certificates-section, .faq-section, .contact-section'
    );

    // Добавляем им базовый класс невидимости
    animatedSections.forEach(section => section.classList.add('fade-in-element'));

    // Настраиваем робота-наблюдателя
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Если блок зашел в зону видимости экрана хотя бы на 10%
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Запускаем анимацию
                observer.unobserve(entry.target); // Отключаем слежку, чтобы анимация не повторялась
            }
        });
    }, {
        threshold: 0.1 // 10% видимости блока достаточно для старта
    });

    // Запускаем слежку за каждым блоком
    animatedSections.forEach(section => observer.observe(section));
});

// ==========================================================================
// ИНТЕРАКТИВНЫЙ 3D-ПРОГИБ ДЛЯ КАРТОЧЕК ТОВАРОВ И ГАРАНТИЙ (СТРОГО ДЛЯ ПК)
// ==========================================================================
const b2bAllInteractiveCards = document.querySelectorAll('.product-card, .step-card, .cert-card');

// Запускаем 3D-расчет углов ТОЛЬКО на компьютерах и ноутбуках (где экран больше 768px)
if (b2bAllInteractiveCards.length > 0 && window.innerWidth > 1024) {
    b2bAllInteractiveCards.forEach((card) => {
        
        card.addEventListener('mousemove', (e) => {
            const width = card.offsetWidth;
            const height = card.offsetHeight;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = (width / 2 - x) / (width / 2);
            const yc = (y - height / 2) / (height / 2);
            
            const rotateX = (yc * -8).toFixed(2);
            const rotateY = (xc * 8).toFixed(2);
            
            card.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease';
            card.style.transform = `perspective(1000px) translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s ease';
            card.style.transform = 'perspective(1000px) translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}