// js/theme.js

const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');

const setTheme = theme => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => (btn.style.transform = ''), 200);
  });
  // Tüm tema butonlarının ikonunu güncelle
  themeToggleButtons.forEach(btn => {
    const moon = btn.querySelector('[href$="moon"]');
    const sun = btn.querySelector('[href$="sun"]');
    const moonCircle = btn.querySelector('[href*="moon-circle"]');
    const sunCircle = btn.querySelector('[href*="sun-circle"]');

    if (theme === 'light') {
      moon?.parentElement?.style.setProperty('display', 'none');
      sun?.parentElement?.style.removeProperty('display');
      moonCircle?.parentElement?.style.setProperty('display', 'none');
      sunCircle?.parentElement?.style.removeProperty('display');
    } else {
      moon?.parentElement?.style.removeProperty('display');
      sun?.parentElement?.style.setProperty('display', 'none');
      moonCircle?.parentElement?.style.removeProperty('display');
      sunCircle?.parentElement?.style.setProperty('display', 'none');
    }
  });
};

// Butonlara tıklama
themeToggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
});

// Sayfa yüklendiğinde kaydedilen temayı uygula
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  if (initialTheme) {
    document.documentElement.dataset.theme = initialTheme;
  }
  setTheme(document.documentElement.dataset.theme || 'dark');
});
