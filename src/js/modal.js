import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config.js';

export function openMovieModal(movie, genreMap) {
  // Genres into String
  const genresText = movie.genre_ids.map(id => genreMap[id] || id).join(', ');

  // Poster URL
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : './img/placeholder.png';

  // Modal HTML
  const modalHTML = `
    <div class="movie-modal">
      <img src="${posterUrl}" class="modal-poster" alt="${movie.title}" />
      <div class="moda l-info">
        <h2 class="modal-title">${movie.title}</h2>
        <p><strong>Rating:</strong> ${movie.vote_average.toFixed(1)}</p>
        <p><strong>Genres:</strong> ${genresText}</p>
        <h3>Overview</h3>
        <p class="modal-overview">${
          movie.overview || 'No description available.'
        }</p>
      </div>
      ${
        movie.videos?.results?.length
          ? `<div class="modal-trailer-wrapper">
                <iframe class="modal-trailer" 
                    src="https://www.youtube.com/embed/${movie.videos.results[0].key}" 
                    frameborder="0" allowfullscreen>
                </iframe>
              </div>`
          : '<p>Trailer not available.</p>'
      }
    </div>
  `;

  // Create Modal with BasicLightbox
  const modalInstance = basicLightbox.create(modalHTML, {
    onShow: instance => {
      // Close with ESC
      function handleEsc(e) {
        if (e.key === 'Escape') {
          instance.close();
          window.removeEventListener('keydown', handleEsc);
        }
      }
      window.addEventListener('keydown', handleEsc);
    },
  });

  modalInstance.show();
}
