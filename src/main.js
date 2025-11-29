// main.js
// Bu dosya home.html tarafından yükleniyor

// 1. Axios zaten CDN'den geldi, hazır
// 2. API anahtarını Vite gibi kullanıyoruz (senin .env dosyan varsa)
import config from './config.js';

// main.js – en üste ekle (config import’tan sonra)
let genreMap = {}; // {28: "Aksiyon", 12: "Macera", ...}

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.TMDB_BASE_URL;
const IMAGE_BASE = config.TMDB_IMAGE_BASE_URL;
// Örnek: const API_KEY = 'c8b152c90517e0e6f9c365d9e0e48c7e';

async function loadGenres() {
  if (Object.keys(genreMap).length > 0) return; // zaten yüklendiyse tekrar çekme

  try {
    const response = await axios.get(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=tr-TR`
    );
    response.data.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });
    console.log('Türler yüklendi:', genreMap);
  } catch (err) {
    console.error('Türler yüklenemedi', err);
  }
}

// TMDB'den haftanın trend filmlerini çeken basit fonksiyon
async function getWeeklyTrends() {
  try {
    const response = await axios.get(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=tr-TR`
    );
    return response.data.results;
  } catch (error) {
    console.error('API hatası:', error);
    return [];
  }
}

function createStars(rating) {
  const score = rating / 2; // 10 üzerinden → 5 yıldız
  const full = Math.floor(score);
  const half = score - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  let html = '';
  for (let i = 0; i < full; i++)
    html += 
    `<li>
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

// // Sayfa yüklendiğinde çalışacak ana fonksiyon
// async function initHomePage() {
//   console.log("Anasayfa yüklendi, API'den veri çekiliyor...");

//   const movies = await getWeeklyTrends();

//   if (movies.length === 0) {
//     console.log('Film gelmedi, internet veya API key kontrol et');
//     return;
//   }

//   // Şimdilik sadece ilk filme bakalım
//   const firstMovie = movies[0];
//   console.log('İlk film geldi:', firstMovie.title);

//   // HTML'de ilk card'ın başlığını değiştirelim
//   const firstCardTitle = document.querySelector('.home-movie-item .card-title');

//   if (firstCardTitle) {
//     firstCardTitle.textContent = firstMovie.title;
//     console.log('Başlık başarıyla değiştirildi:', firstMovie.title);
//   } else {
//     console.log('card-title bulunamadı! card.html içeriğini kontrol et');
//   }

//   // 1) Başlık
//   const titleEl = document.querySelector('.home-movie-item .card-title');
//   if (titleEl) titleEl.textContent = firstMovie.title;

//   // 2) YIL (yeni eklediğimiz)
//   const year = firstMovie.release_date
//     ? firstMovie.release_date.split('-')[0]
//     : 'Bilinmiyor';

//   const yearEl = document.querySelector('.home-movie-item .card-year');
//   if (yearEl) {
//     yearEl.textContent = year;
//     console.log('Yıl eklendi:', year);
//   } else {
//     console.log(
//       'card-year elementi bulunamadı! card.html\'e <p class="card-year"></p> ekle'
//     );
//   }

//   // 3) POSTER FOTOĞRAFI (yeni eklediğimiz)
//   const posterPath = firstMovie.poster_path;
//   const posterUrl = posterPath
//     ? `https://image.tmdb.org/t/p/w342${posterPath}` // w342 = güzel kart boyutu
//     : './img/no-poster.jpg'; // yedek resim

//   const imgEl = document.querySelector('.home-movie-item .card-image');
//   if (imgEl) {
//     imgEl.src = posterUrl;
//     imgEl.alt = firstMovie.title + ' poster';
//     console.log('Poster eklendi:', posterUrl);
//   } else {
//     console.log('card-image bulunamadı!');
//   }
// }

// main.js – initHomePage fonksiyonunu tamamen bununla değiştir
async function initHomePage() {
  console.log("Anasayfa yüklendi, API'den veri çekiliyor...");

  await loadGenres(); // önce türleri yükle
  const movies = await getWeeklyTrends();

  if (movies.length === 0) return;

  // İlk 3 filmi alalım
  const weeklyMovies = movies.slice(0, 3);

  // Tüm kartları seç (3 tane home-movie-item var)
  const cardContainers = document.querySelectorAll('.home-movie-item');

  weeklyMovies.forEach((movie, index) => {
    const card = cardContainers[index];
    if (!card) return;

    // Başlık
    const titleEl = card.querySelector('.card-title');
    if (titleEl) titleEl.textContent = movie.title || movie.name;

    // Yıl
    const year = movie.release_date ? movie.release_date.split('-')[0] : '—';
    const yearEl = card.querySelector('.card-year');
    if (yearEl) yearEl.textContent = year;

    // Poster
    const posterUrl = movie.poster_path
      ? `${IMAGE_BASE}/w342${movie.poster_path}`
      : './img/no-poster.jpg';
    const imgEl = card.querySelector('.card-image');
    if (imgEl) {
      imgEl.src = posterUrl;
      imgEl.alt = `${movie.title} poster`;
    }

    // Genre (en fazla 2 tür gösterelim)
    const genres = movie.genre_ids
      .slice(0, 2)
      .map(id => genreMap[id] || 'Bilinmiyor')
      .join(', ');
    const genreEl = card.querySelector('.card-genre');
    if (genreEl) genreEl.textContent = genres || 'Tür yok';

    // Rating (yıldızlar)
    const ratingEl = card.querySelector('.card-rating');
    if (ratingEl) {
      ratingEl.innerHTML = createStars(movie.vote_average);
    }
  });

  console.log('3 kart başarıyla dolduruldu!');
}

// Sayfa tamamen yüklendiğinde çalışsın
document.addEventListener('DOMContentLoaded', initHomePage);
