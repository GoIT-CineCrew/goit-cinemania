import config from '../config.js';

const API_KEY = config.TMDB_API_KEY;
const BASE_URL = config.TMDB_BASE_URL;

async function showRandomHeroMovie() {
  try {
    const res = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );
    if (!res.ok) throw new Error(`API Hatası: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const movies = data.results;
    if (!movies || movies.length === 0) throw new Error('Film gelmedi');

    const movie = movies[Math.floor(Math.random() * movies.length)];

    const videoRes = await fetch(
      `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
    );
    const videoData = await videoRes.json();
    const trailer = videoData.results?.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );

    // DOM
    document.getElementById('hero-default').style.display = 'none';
    const heroRandom = document.getElementById('hero-random-movie');
    heroRandom.style.display = 'flex';

    if (movie.backdrop_path) {
      heroRandom.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
    }

    heroRandom.querySelector('.hero-movie-title').textContent = movie.title;
    heroRandom.querySelector('.hero-movie-details').textContent =
      movie.overview || 'Açıklama yok.';

    const poster = document.getElementById('hero-movie-poster');
    poster.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';

    // Yıldızlar
    const starsContainer = heroRandom.querySelector('.hero-movie-stars');
    starsContainer.innerHTML = '';

    const rating = Math.round(movie.vote_average || 0);
    const fullStars = Math.floor(rating / 2);
    const halfStars = rating % 2 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    function getStarSVG(type) {
      return `<svg class="star-icon" width="14" height="14"><use href="#${type}-star"></use></svg>`;
    }

    for (let i = 0; i < fullStars; i++)
      starsContainer.innerHTML += getStarSVG('full');
    for (let i = 0; i < halfStars; i++)
      starsContainer.innerHTML += getStarSVG('half');
    for (let i = 0; i < emptyStars; i++)
      starsContainer.innerHTML += getStarSVG('empty');

    // Trailer
    const trailerBtn = document.getElementById('watch-trailer-btn');
    if (trailerBtn && trailer) {
      trailerBtn.onclick = () => {
        const overlay = document.createElement('div');
        overlay.className = 'movie-popup-overlay';
        overlay.innerHTML = `
          <div class="popup-video-wrapper">
            <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allow="autoplay" allowfullscreen></iframe>
          </div>`;
        document.body.appendChild(overlay);
        overlay.onclick = () => overlay.remove();
      };
    }

    document.getElementById('more-details-btn').onclick = () => {
      if (typeof deleteHeroTrendsPopup === 'function')
        deleteHeroTrendsPopup(movie);
    };
  } catch (err) {
    console.error('Hero yüklenemedi:', err);
    document.getElementById('hero-default').style.display = 'block';
    document.getElementById('hero-random-movie').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', showRandomHeroMovie);
