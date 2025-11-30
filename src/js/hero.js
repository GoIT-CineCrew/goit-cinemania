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
      v =>
        v.site === 'YouTube' &&
        (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
    );

    // DOM güncellemeleri (senin mevcut kodun aynı kalıyor)
    document.getElementById('hero-default').style.display = 'none';
    const heroRandom = document.getElementById('hero-random-movie');
    heroRandom.style.display = 'flex';

    if (movie.backdrop_path) {
      heroRandom.style.backgroundImage = `url[](https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
    }

    heroRandom.querySelector('.hero-movie-title').textContent = movie.title;
    heroRandom.querySelector('.hero-movie-details').textContent =
      movie.overview || 'Açıklama yok.';

    const poster = document.getElementById('hero-movie-poster');
    poster.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';

    // Yıldızlar (aynı)
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

    // TRAILER
    const modal = document.getElementById('trailer-modal');
    const trailerBtn = document.getElementById('watch-trailer-btn');
    const closeBtn = modal.querySelector('.trailer-close-btn');
    const trailerContent = modal.querySelector('.trailer-content');

    // Trailer varsa video, yoksa hata ekranı (zaten var)
    const openTrailerModal = () => {
      if (trailer) {
        // Trailer varsa → YouTube videosu koy
        trailerContent.innerHTML = `
      <button class="trailer-close-btn" type="button">
        <svg><use href="./img/sprite.svg#close-mobile"></use></svg>
      </button>
      <iframe 
        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        style="position:absolute; top:0; left:0; width:100%; height:100%;">
      </iframe>
    `;
      }
      // Her durumda modal'ı aç
      modal.style.display = 'block';
    };

    // Kapatma
    const closeTrailerModal = () => {
      modal.style.display = 'none';
      trailerContent.innerHTML = `
    <button class="trailer-close-btn" type="button">
      <svg><use href="./img/sprite.svg#close-mobile"></use></svg>
    </button>
    <p class="trailer-info">
      OOPS... <br />
      We are very sorry! <br />
      But we couldn’t find the trailer.
    </p>
    <img src="./img/Trailer-Error-Mobile.png" 
         srcset="./img/Trailer-Error-Desktop@2x.png 2x" 
         alt="Trailer not found" class="trailer-image">
  `;
    };

    // Olaylar
    trailerBtn.onclick = openTrailerModal;
    closeBtn.onclick = closeTrailerModal;

    // Dışarı tıklayınca kapan
    modal.addEventListener('click', e => {
      if (e.target === modal) closeTrailerModal();
    });

    // ESC tuşu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeTrailerModal();
      }
    });

    // Buton tıklama
    if (trailerBtn && trailer) {
      trailerBtn.style.cursor = 'pointer';
      trailerBtn.disabled = false;
      trailerBtn.onclick = openTrailerModal;
    } else if (trailerBtn) {
      trailerBtn.disabled = true;
      trailerBtn.style.cursor = 'not-allowed';
      trailerBtn.title = 'Bu film için fragman bulunamadı';
    }

    // Kapatma olayları
    if (closeBtn) closeBtn.onclick = closeTrailerModal;
    modal.addEventListener('click', e => {
      if (e.target === modal) closeTrailerModal();
    });

    // ESC tuşu ile kapatma (ekstra güzel dokunuş)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeTrailerModal();
      }
    });

    // More details butonu
    document.getElementById('more-details-btn').onclick = () => {
      if (typeof deleteHeroTrendsPopup === 'function') {
        deleteHeroTrendsPopup(movie);
      }
    };
  } catch (err) {
    console.error('Hero yüklenemedi:', err);
    document.getElementById('hero-default').style.display = 'block';
    document.getElementById('hero-random-movie').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', showRandomHeroMovie);
