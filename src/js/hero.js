import { getRandomMovie, getMovieVideos, getGenres } from './api.js';
import { deleteHeroTrendsPopup } from './modal.js';

// DOM Elements
const heroDefault = document.getElementById('hero-default');
const heroRandom = document.getElementById('hero-random-movie');
const posterEl = document.getElementById('hero-movie-poster');
const titleEl = heroRandom.querySelector('.hero-movie-title');
const detailsEl = heroRandom.querySelector('.hero-movie-details');
const starsEl = heroRandom.querySelector('.hero-movie-stars');
const trailerBtn = document.getElementById('watch-trailer-btn');
const detailsBtn = document.getElementById('more-details-btn');

async function showHeroBasedOnAPI() {
  try {
    const movies = await getRandomMovie();
    if (!movies.length) throw new Error('No movies found');

    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    const videoData = await getMovieVideos(randomMovie.id);
    randomMovie.videos = videoData;

    const hasTrailer = videoData.results.some(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );

    if (hasTrailer && randomMovie.backdrop_path) {
      // Background and Visibility
      heroRandom.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${randomMovie.backdrop_path})`;
      heroRandom.style.backgroundSize = 'cover';
      heroRandom.style.backgroundPosition = 'center';
      heroRandom.style.backgroundRepeat = 'no-repeat';
      heroDefault.style.display = 'none';
      heroRandom.style.display = 'flex';

      // Title and Details
      titleEl.textContent = randomMovie.title;
      detailsEl.textContent =
        randomMovie.overview || 'No description available.';

      // Poster
      posterEl.src = randomMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

      // Star Points
      const rating = randomMovie.vote_average;
      const fullStars = Math.floor(rating / 2);
      const halfStar = rating % 2 >= 1 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      starsEl.innerHTML = '';

      for (let i = 0; i < fullStars; i++) {
        const img = document.createElement('img');
        img.src = './svg/star.svg';
        img.alt = 'full star';
        img.classList.add('star-icon');
        starsEl.appendChild(img);
      }
      if (halfStar) {
        const img = document.createElement('img');
        img.src = './svg/star-half.svg';
        img.alt = 'half star';
        img.classList.add('star-icon');
        starsEl.appendChild(img);
      }
      for (let i = 0; i < emptyStars; i++) {
        const img = document.createElement('img');
        img.src = './svg/star-outline.svg';
        img.alt = 'empty star';
        img.classList.add('star-icon');
        starsEl.appendChild(img);
      }

      // Trailer Button
      if (trailerBtn) {
        trailerBtn.onclick = () => {
          const video = videoData.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube'
          );
          if (video) {
            const iframeHTML = `
              <div class="popup-video-wrapper">
                <iframe width="800" height="450"
                  src="https://www.youtube.com/embed/${video.key}?autoplay=1"
                  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>
            `;
            const overlay = document.createElement('div');
            overlay.classList.add('movie-popup-overlay');
            overlay.style.display = 'flex';
            overlay.innerHTML = iframeHTML;
            document.body.appendChild(overlay);

            overlay.addEventListener('click', e => {
              if (e.target === overlay) overlay.remove();
            });
          } else {
            alert('Trailer not available.');
          }
        };
      }

      // More Details Button
      if (detailsBtn) {
        detailsBtn.onclick = async () => {
          const genresData = await getGenres();
          const genreMap = genresData.genres.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
          }, {});
          deleteHeroTrendsPopup(randomMovie, genreMap);
        };
      }
    } else {
      // Fallback Default Hero
      heroDefault.style.display = 'block';
      heroRandom.style.display = 'none';
    }
  } catch (err) {
    console.error('Hero yüklenirken hata:', err);
    heroDefault.style.display = 'block';
    heroRandom.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showHeroBasedOnAPI();

  const getStartedBtn = document.querySelector('#hero-default .hero-button');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      alert('Get started clicked!');
    });
  }
});
