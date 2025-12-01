import { loadHeroSection } from './hero.js';

// Bu dosya, hero.html yüklendiği anda otomatik çalışır
function initHeroOnLoad() {
  // hero-random-movie elementi yüklendi mi diye kontrol et
  const heroSection = document.getElementById('hero-random-movie');
  const heroDefault = document.getElementById('hero-default');

  if (!heroSection || !heroDefault) return;

  // Eğer zaten yüklendiyse tekrar çalıştırma
  if (heroSection.dataset.heroLoaded === 'true') return;

  // Hero'yu yükle
  loadHeroSection().then(() => {
    heroSection.dataset.heroLoaded = 'true'; // tekrar yüklenmesin
  });
}

// MutationObserver ile <load src="./partials/hero.html"> tamamlandığında tetikle
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        // Element node
        if (
          node.id === 'hero-random-movie' ||
          node.querySelector?.('#hero-random-movie')
        ) {
          initHeroOnLoad();
        }
      }
    });
  });
});

// DOM hazır olduğunda ve sonrasında gelen eklemeleri izle
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    initHeroOnLoad(); // zaten varsa hemen çalıştır
  });
} else {
  observer.observe(document.body, { childList: true, subtree: true });
  initHeroOnLoad();
}
