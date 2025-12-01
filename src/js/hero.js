// js/hero-core.js
import { openMovieModal } from './modal.js';
import config from '../config.js';

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.TMDB_BASE_URL;

function createStarRating(vote_average) {
  const rating = vote_average / 2;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  let html = '';
  for (let i = 0; i < full; i++) {
    html += `<li><svg class="star-svg"><use href="./img/sprite.svg#full-star"></use></svg></li>`;
  }
  if (hasHalf) {
    html += `<li><svg class="star-svg"><use href="./img/sprite.svg#half-star"></use></svg></li>`;
  }
  for (let i = 0; i < empty; i++) {
    html += `<li><svg class="star-svg"><use href="./img/sprite.svg#empty-star"></use></svg></li>`;
  }
  return html;
}

async function getMovieFromLibrary() {
  try {
    const raw = localStorage.getItem('myMovieLibrary');
    if (!raw) return null;

    const library = JSON.parse(raw);
    if (!Array.isArray(library) || library.length === 0) return null;

    const randomItem = library[Math.floor(Math.random() * library.length)];
    const movieId = typeof randomItem === 'number' ? randomItem : randomItem.id;

    if (!movieId) return null;

    const res = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`
    );
    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error('Kütüphaneden film çekilemedi:', err);
    return null;
  }
}

function truncateText(text, maxWords = 20) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

export async function loadHeroSection() {
  const heroDefault = document.getElementById('hero-default');
  const heroRandom = document.getElementById('hero-random-movie');

  if (!heroRandom || heroRandom.dataset.heroLoaded === 'true') return;

  let movie = null;
  let trailer = null;

  try {
    // MY LIBRARY MODU MU?
    const isLibraryMode = document.querySelector('[data-hero-mode="library"]');

    if (isLibraryMode) {
      // Kütüphaneden film çek
      movie = await getMovieFromLibrary();
    }

    // Kütüphane boşsa veya hata varsa → trending film
    if (!movie) {
      const res = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
      );
      if (!res.ok) throw new Error('API Hatası');
      const data = await res.json();
      movie = data.results[Math.floor(Math.random() * data.results.length)];
    }

    // Trailer bul (videos zaten append_to_response ile geldi, yoksa ayrı çek)
    if (movie.videos?.results) {
      trailer = movie.videos.results.find(
        v =>
          v.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(v.type)
      );
    } else {
      const videoRes = await fetch(
        `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoRes.json();
      trailer = videoData.results?.find(
        v =>
          v.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(v.type)
      );
    }
    // DOM Güncelleme
    heroDefault.style.display = 'none';
    heroRandom.style.display = 'flex';

    heroRandom.querySelector('.hero-movie-title').textContent = movie.title;

    const detailsEl = heroRandom.querySelector('.hero-movie-details');
    const fullText = movie.overview || 'Açıklama yok.';
    detailsEl.textContent = truncateText(fullText, 20);
    if (fullText.split(/\s+/).length > 20) detailsEl.title = fullText;

    heroRandom.querySelector('.hero-movie-stars').innerHTML = `
      <ul class="card-rating hero-rating">${createStarRating(
        movie.vote_average
      )}</ul>
    `;

    const posterCrop = heroRandom.querySelector('.hero-movie-poster-crop');
    const imageUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : movie.poster_path
      ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
      : './img/no-poster.jpg';
    posterCrop.style.backgroundImage = `url(${imageUrl})`;

    // Trailer Modal
    const modal = document.getElementById('trailer-modal');
    const trailerBtn = document.getElementById('watch-trailer-btn');
    const trailerContent = modal.querySelector('.trailer-content');

    const openTrailer = () => {
      if (trailer) {
        trailerContent.innerHTML = `
          <button class="trailer-close-btn" type="button">
            <svg><use href="./img/sprite.svg#close-mobile"></use></svg>
          </button>
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0" 
                  allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
        `;
      }
      modal.style.display = 'block';
    };

    const closeTrailer = () => {
      modal.style.display = 'none';
      trailerContent.innerHTML = `
        <button class="trailer-close-btn" type="button">
          <svg><use href="./img/sprite.svg#close-mobile"></use></svg>
        </button>
        <p class="trailer-info">OOPS...<br>We are very sorry!<br>But we couldn’t find the trailer.</p>
        <img src="./img/Trailer-Error-Mobile.png" srcset="./img/Trailer-Error-Desktop@2x.png 2x" alt="Trailer not found" class="trailer-image">
      `;
    };

    trailerBtn.onclick = openTrailer;
    modal.querySelector('.trailer-close-btn').onclick = closeTrailer;
    modal.onclick = e => e.target === modal && closeTrailer();
    document.addEventListener(
      'keydown',
      e =>
        e.key === 'Escape' && modal.style.display === 'block' && closeTrailer()
    );

    // More Details
    document.getElementById('more-details-btn').onclick = async () => {
      await openMovieModal(movie.id);
    };

    heroRandom.dataset.heroLoaded = 'true';
  } catch (err) {
    console.error('Hero yüklenemedi:', err);
    heroDefault.style.display = 'block';
    heroRandom.style.display = 'none';
  }
}
