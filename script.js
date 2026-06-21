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
