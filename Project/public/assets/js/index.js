$(document).ready(function() {
        $('#btn-instagram').click(function() {
            $('#popup-instagram').toggleClass('active');
        });

        $('#btn-youtube').click(function() {
            $('#popup-youtube').toggleClass('active');
        });

        $('#btn-twitter').click(function() {
            $('#popup-twitter').toggleClass('active');
        });

        $('.popup__close').click(function() {
            $(this).closest('.popup').removeClass('active');
        });

        $(document).mouseup(function(e) {
            var popup = $(".popup");
            if (!popup.is(e.target) && popup.has(e.target).length === 0) {
                popup.removeClass('active');
            }
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
    const activeUsersCounter = document.querySelector('.section5__feature .range');

    const randomUsers = Math.floor(Math.random() * (10000 - 9000 + 1)) + 9000;

    activeUsersCounter.setAttribute('data-target', randomUsers);
    const counters = document.querySelectorAll('.number');

    const options = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, options);

    counters.forEach(counter => {
        observer.observe(counter);
    });

    function animateCount(counter) {
    const target = +counter.getAttribute('data-target');
    let finalValue = target;
    let suffix = '';

    if (counter.classList.contains('percent')) {
        suffix = '%';
    } else if (counter.classList.contains('plus')) {
        suffix = '+';
    }

    const duration = 2000;
    const start = Date.now();
    const initial = +counter.textContent.replace(/\D/g, '');
    const increment = (finalValue - initial) / duration;

    const step = () => {
        const now = Date.now();
        const elapsed = now - start;
        if (elapsed <= duration) {
            const value = initial + increment * elapsed;
            if (target === 1) {
                counter.textContent = Math.floor(value).toLocaleString() + suffix;
            } else if (target === 100) {
                counter.textContent = value.toFixed(1) + suffix;
            } else {
                counter.textContent = Math.floor(value).toLocaleString() + suffix;
            }
            requestAnimationFrame(step);
        } else {
            if (target === 1) {
                counter.textContent = finalValue + suffix;
            } else if (target === 100) {
                counter.textContent = finalValue.toFixed(1) + suffix;
            } else {
                counter.textContent = finalValue.toLocaleString() + suffix;
            }
        }
    };
    step();
}

});