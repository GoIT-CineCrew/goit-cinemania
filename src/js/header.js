// src/js/header-active.js

// Bu fonksiyona her yerden erişebilelim
window.setActiveNavLink = function () {
  // 100ms bekle ki header tamamen yüklensin (çok önemli!)
  setTimeout(() => {
    const currentPath = location.pathname.split('/').pop() || 'index.html';

    // Tüm linkleri bul (header yüklendikten sonra çalışıyor mu diye kontrol et)
    const links = document.querySelectorAll('a[href]');

    links.forEach(link => {
      let href = link.getAttribute('href') || '';

      // "./home.html", "home.html", "/home.html" gibi varyasyonları düzelt
      href = href.replace(/^\.?\//, ''); // başındaki ./ veya / kaldır

      const isHome =
        currentPath === 'index.html' ||
        currentPath === '' ||
        currentPath === 'home.html';
      const targetIsHome = href === 'home.html' || href === 'index.html';

      const isActive = href === currentPath || (isHome && targetIsHome);

      if (isActive) {
        link.classList.add('active');
        // li'ye de ekle (mobil menü için)
        const li = link.closest('li');
        if (li) li.classList.add('active');
      } else {
        link.classList.remove('active');
        const li = link.closest('li');
        if (li) li.classList.remove('active');
      }
    });
  }, 100);
};

// Sayfa ilk yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', window.setActiveNavLink);

// <load> bittikten sonra tetiklenen event (bu plugin genelde bunu atar)
document.addEventListener('load:partial', window.setActiveNavLink);
document.addEventListener('DOMContentLoaded', () => {
  // fallback: her 500ms kontrol et (son çare)
  const interval = setInterval(() => {
    if (document.querySelector('.header-nav-link')) {
      window.setActiveNavLink();
      clearInterval(interval);
    }
  }, 200);
});
