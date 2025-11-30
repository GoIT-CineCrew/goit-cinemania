import { openMovieModal } from './js/modal.js';

const genreMap = {};
const API_KEY = 'aaf24ac7ab7c5211361a71263e777bb9';

// Dropdown
const selectBox = document.querySelector('.library-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const optionsContainer = selectBox.querySelector('.options');
const optionsList = selectBox.querySelectorAll('.option');

let selectedGenre = null; // TMDb genre ID burada tutulacak

// Dropdown aç/kapa
selected.addEventListener('click', () => {
  selectBox.classList.toggle('open');
  optionsContainer.style.display = selectBox.classList.contains('open')
    ? 'block'
    : 'none';
});

document
  .querySelectorAll('.library-dropdown-filter .option')
  .forEach(option => {
    option.addEventListener('click', () => {
      selected.childNodes[0].textContent = option.textContent;
      const map = {
        romance: 10749,
        detective: 9648,
        thriller: 53,
        action: 28,
        documentary: 99,
        horror: 27,
      };
      selectedGenre = map[option.dataset.value] || null;
      selectBox.classList.remove('open');
      optionsContainer.style.display = 'none';
      loadLibrary();
    });
  });

// Sayfa dışına tıklayınca dropdown kapanır
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  }
});

// ======================
// TMDB GENRE LOAD
// ======================
async function loadGenres() {
  if (Object.keys(genreMap).length > 0) return;

  try {
    const response = await axios.get(
      'https://api.themoviedb.org/3/genre/movie/list',
      {
        params: { api_key: API_KEY, language: 'en-US' },
      }
    );

    response.data.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });
  } catch (err) {
    console.error('Türler yüklenemedi:', err);
  }
}

// Yıldızlar
function createStarRating(rating) {
  const score = (rating || 0) / 2;
  const full = Math.floor(score);
  const half = score - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++)
    html += `<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>`;
  if (half)
    html += `<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>`;
  for (let i = 0; i < empty; i++)
    html += `<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>`;
  return html;
}

// Dropdown seçenek seçildiğinde
optionsList.forEach(option => {
  option.addEventListener('click', () => {
    selected.childNodes[0].textContent = option.textContent;

    optionsList.forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');

    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';

    const value = option.dataset.value;

    // dropdown değerlerine ID eşleme
    const genreIdMap = {
      romance: 10749,
      detective: 9648,
      thriller: 53,
      action: 28,
      documentary: 99,
      horror: 27,
    };

    selectedGenre = genreIdMap[value] ?? null;

    loadLibrary(); // filmi filtrele
  });
});

// ======================
// MOVIE RENDER
// ======================
async function loadLibrary() {
  await loadGenres();
  let library = JSON.parse(localStorage.getItem('myMovieLibrary')) || '[]';
  const listEl = document.querySelector('.library-movie-items');

  if (library.length === 0) {
    document.querySelector('.library-content').style.display = 'none';
    document.querySelector('.library-content-empty').style.display = 'block';
    return;
  }

  document.querySelector('.library-content').style.display = 'block';
  document.querySelector('.library-content-empty').style.display = 'none';

  listEl.innerHTML = '';

  library.forEach(movie => {
    // --- GENRE FİLTRESİ ---
    let movieGenreIds = [];
    const title = movie.title || 'Unknown';
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : './img/placeholder.jpg';
    const rating = movie.vote_average ?? 'N/A';

    // 1) genre_ids varsa direkt al
    if (movie.genre_ids) movieGenreIds = movie.genre_ids;
    // 2) genres (objeler) varsa ID'leri çek
    else if (movie.genres) movieGenreIds = movie.genres.map(g => g.id);
    // 3) genre_names varsa genreMap üzerinden ID’ye çevir
    else if (movie.genre_names) {
      movieGenreIds = movie.genre_names
        .map(name => {
          const match = Object.entries(genreMap).find(([id, n]) => n === name);
          return match ? Number(match[0]) : null;
        })
        .filter(Boolean);
    }

    // Filtreleme
    if (selectedGenre && !movieGenreIds.includes(selectedGenre)) return;
    
    // --- Genre isimleri ---
    let genres = 'Unknown';
    if (movie.genres?.length) {
      genres = movie.genres.map(g => g.name).join(', ');
    } else if (movie.genre_names?.length) {
      genres = movie.genre_names.join(', ');
    } else if (movie.genre_ids?.length) {
      genres = movie.genre_ids
        .map(id => genreMap[id])
        .filter(Boolean)
        .join(', ');
    }

    const li = document.createElement('li');
    li.classList.add('library-movie-item');
    li.dataset.movieId = movie.id;
    li.style.cursor = 'pointer';

    li.innerHTML = `
      <section class="card">
        <img
          class="card-image"
          src="${poster}"
          alt="${title}"
          loading="lazy"
        />
        <div class="card-content">
          <h2 class="card-title">${title}</h2>
          <p class="card-info">
            <span class="card-genre">${genres}</span>
          </p>
          <ul class="card-rating">
            ${createStarRating(rating)}
          </ul>
        </div>
      </section>
    `;

    listEl.appendChild(li);
  });
}

// Kart tıklama
document.addEventListener('click', e => {
  const card = e.target.closest('.library-movie-item');
  if (card && card.dataset.movieId) {
    openMovieModal(card.dataset.movieId);
  }
});

// ======================
// LOAD LIBRARY FROM LOCALSTORAGE
// ======================
loadLibrary();
