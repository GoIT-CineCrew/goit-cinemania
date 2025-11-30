// 1. Axios zaten CDN'den geldi, hazır
// 2. API anahtarını Vite gibi kullanıyoruz (senin .env dosyan varsa)
import config from './config.js';
import './js/hero.js';
import { openMovieModal } from './js/modal.js';

// en üste ekle (config import’tan sonra)
let genreMap = {}; // {28: "Aksiyon", 12: "Macera", ...}

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.TMDB_BASE_URL;
const IMAGE_BASE = config.TMDB_IMAGE_BASE_URL;
// Örnek: const API_KEY = 'c8b152c90517e0e6f9c365d9e0e48c7e';

async function loadGenres() {
  if (Object.keys(genreMap).length > 0) return; // zaten yüklendiyse tekrar çekme

  try {
    const response = await axios.get(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    response.data.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });
    console.log('Genres loaded:', genreMap);
  } catch (err) {
    console.error("Genres couldn't loaded:", err);
  }
}

// TMDB'den haftanın trend filmlerini çeken basit fonksiyon
async function getWeeklyTrends() {
  try {
    const response = await axios.get(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );
    return response.data.results;
  } catch (error) {
    console.error('API hatası:', error);
    return [];
  }
}

// Bu fonksiyonda rating için gerekli olan içleri boş, yarı-dolu ve tam-dolu olan yıldız svg'lerimizi formüllere göre kullanıyoruz.
function createStars(rating) {
  const score = rating / 2; // 10 üzerinden → 5 yıldız
  const full = Math.floor(score);
  const half = score - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  let html = '';
  for (let i = 0; i < full; i++)
    html += `<li>
        <svg width="14" height="14">
            <use href="./img/sprite.svg#full-star"></use>
        </svg>
    </li>`;
  if (half)
    html +=
      '<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>';
  for (let i = 0; i < empty; i++)
    html +=
      '<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>';
  return html;
}

async function initHomePage() {
  console.log("Anasayfa yüklendi, API'den veri çekiliyor...");

  await loadGenres(); // önce türleri yükle

  const movies = await getWeeklyTrends(); // haftanın popüler filmlerini yükle ve movies değişkenine ata
  console.log('Movies list' + JSON.stringify(movies.map(movie => movie.title)));

  await loadUpcomingMovie(); // upcoming this month filmlerini yükle

  if (movies.length === 0) return;

  // İlk 3 haftanın filmini çekmek için
  const weeklyMovies = movies.slice(0, 3);

  // Tüm kartları seç (3 tane home-movie-item var)
  const cardContainers = document.querySelectorAll('.home-movie-item');

  // Haftanın filmlerini içeren array'i gezerek, her bir indexteki elemanın özelliklerini container yapısında buluyoruz
  weeklyMovies.forEach((movie, index) => {
    const card = cardContainers[index];
    if (!card) return;

    // Başlık - Eğer .card-title class'ına sahip bir eleman var ise, bu elemanın içine, API'deki haftanın trendlerinde yer alan her filmin isim bilgisini atıyoruz.
    const titleEl = card.querySelector('.card-title');
    if (titleEl) titleEl.textContent = movie.title || movie.name;

    // Yıl - Eğer .card-year class'ına sahip bir eleman var ise, bu elemanın içine, API'deki haftanın trendlerinde yer alan her filmin, "-"den sonraki ilk elemanı olan yıl bilgisini atıyoruz.
    const year = movie.release_date ? movie.release_date.split('-')[0] : '—';
    const yearEl = card.querySelector('.card-year');
    if (yearEl) yearEl.textContent = year;

    // Poster - Eğer .card-image class'ına sahip bir eleman var ise, bu elemanın içine, API'deki haftanın trendlerinde yer alan her filmin poster bilgisini atıyoruz.
    const posterUrl = movie.poster_path
      ? `${IMAGE_BASE}/w342${movie.poster_path}`
      : './img/no-poster.jpg';
    const imgEl = card.querySelector('.card-image');
    if (imgEl) {
      imgEl.src = posterUrl;
      imgEl.alt = `${movie.title} poster`;
    }

    // Genre (en fazla 2 tür gösterelim) - API'deki haftanın trendlerinde yer alan her filmin, id'sine göre gezerek, içeriğindeki ilk iki değeri alıp, genreMap objesi içerisine ekleten ve bu genre bilgisini, eğer .card-genre class'ına sahip bir eleman var ise, bu elemanın içine atıyoruz.
    const genres = movie.genre_ids
      .slice(0, 2)
      .map(id => genreMap[id] || 'Bilinmiyor')
      .join(', ');
    const genreEl = card.querySelector('.card-genre');
    if (genreEl) genreEl.textContent = genres || 'No genres';

    // Rating (yıldızlar) - Öncelikle createStars fonksiyonunda rating hesaplaması mantığını kuruyoruz ve eğer .card-rating class'ına sahip bir eleman var ise, bu elemanın içine, API'deki haftanın trendlerinde yer alan her filmin rating bilgisini atıyoruz.
    const ratingEl = card.querySelector('.card-rating');
    if (ratingEl) {
      ratingEl.innerHTML = createStars(movie.vote_average);
    }
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Karta tıklandı, ID:', movie.id); // ← bu logu göreceksin
      openMovieModal(movie.id);
    });
  });

  console.log('3 kart başarıyla dolduruldu!');
}

// ===== UPCOMING THIS MONTH =====
async function loadUpcomingMovie() {
  try {
    const response = await axios.get(
      `${config.TMDB_BASE_URL}/movie/upcoming?api_key=${config.TMDB_API_KEY}&page=1`
    );

    // Bugün ve sonrası olan filmleri alalım
    const now = new Date().toISOString().split('T')[0];
    const futureMovies = response.data.results.filter(
      movie => movie.release_date >= now
    );

    if (futureMovies.length === 0) {
      console.log('There are no upcoming movies this month!');
      return;
    }

    // Rastgele bir tane seç
    const movie = futureMovies[Math.floor(Math.random() * futureMovies.length)];
    
    const posterPath = movie.poster_path || '';
    // Poster – RESPONSIVE + BOZULMAYAN
    const posterImg = document.getElementById('upcoming-poster');
    if (posterPath) {
      posterImg.srcset = `
    https://image.tmdb.org/t/p/w342${posterPath} 342w,
    https://image.tmdb.org/t/p/w500${posterPath} 500w,
    https://image.tmdb.org/t/p/w780${posterPath} 780w,
    https://image.tmdb.org/t/p/original${posterPath} 1280w
  `;
      posterImg.sizes =
        '(max-width: 767px) 90vw, (max-width: 1279px) 704px, 805px';
      posterImg.src = `https://image.tmdb.org/t/p/w780${posterPath}`; // fallback
      posterImg.alt = `${movie.title} poster`;
    } else {
      posterImg.src = './img/no-poster.jpg';
      posterImg.removeAttribute('srcset');
      posterImg.removeAttribute('sizes');
    }

    // Elementleri doldur

    document.getElementById('upcoming-title').textContent = movie.title;
    document.getElementById('upcoming-release').textContent = movie.release_date
      ? formatDate(movie.release_date)
      : '—';
    document.getElementById('upcoming-vote').textContent =
      movie.vote_average.toFixed(1);
    document.getElementById('upcoming-votes').textContent = movie.vote_count;
    document.getElementById('upcoming-popularity').textContent = Math.round(
      movie.popularity
    );

    // Genre
    const genres = movie.genre_ids
      .slice(0, 2)
      .map(id => genreMap[id] || 'Bilinmiyor')
      .join(', ');
    document.getElementById('upcoming-genre').textContent = genres;

    console.log('Film Açıklaması' + movie.overview);
    // Overview
    document
      .getElementById('upcoming-overview-content')
      .querySelector('p').textContent =
      movie.overview || "Movie overview couldn't find!";

    console.log('Upcoming movie yüklendi:', movie.title);

    // Butona film bilgisini ekleyelim (sonraki adımda kullanacağız)
    const btn = document.getElementById('upcoming-library-btn');
    btn.dataset.movieId = movie.id;
  } catch (err) {
    console.error('Upcoming movie yüklenemedi', err);
  }
}

// Güzel tarih formatı: 03 Mart 2025
function formatDate(dateString) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ===== LOCALSTORAGE - KÜTÜPHANE =====
const LIBRARY_KEY = 'myMovieLibrary';

function getLibrary() {
  return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || [];
}

function addToLibrary(movie) {
  const library = getLibrary();
  if (!library.find(m => m.id === movie.id)) {
    library.push(movie);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    alert(`${movie.title} added to your library.`);
  } else {
    alert('This movie is already in your library!');
  }
}

// Tüm "Add to my library" butonları
document.addEventListener('click', async function (e) {
  if (
    e.target.id === 'upcoming-library-btn' ||
    e.target.classList.contains('card-library-btn')
  ) {
    const movieId = e.target.dataset.movieId;

    if (!movieId) return;

    try {
      const res = await axios.get(
        `${config.TMDB_BASE_URL}/movie/${movieId}?api_key=${config.TMDB_API_KEY}`
      );
      addToLibrary(res.data);
      e.target.textContent = 'Remove from my library';
      e.target.disabled = true;
    } catch (err) {
      alert('An error occurred while adding the movie.');
    }
  }
});

// Sayfa tamamen yüklendiğinde çalışsın
document.addEventListener('DOMContentLoaded', initHomePage);
