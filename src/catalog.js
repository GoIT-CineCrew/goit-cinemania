import { openMovieModal } from './js/modal.js';

const genreMap = {};
// ---- API CONFIG ----
const API_KEY = 'aaf24ac7ab7c5211361a71263e777bb9';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ---- DOM ELEMENTS ----
const movieList = document.querySelector('.catalog-movie-items');
const searchInput = document.querySelector('.catalog-search input');
const searchBtn = document.querySelector('.search-icon');
const clearBtn = document.querySelector('.clear-button');
const yearFilterOptions = document.querySelectorAll(
  '.catalog-dropdown-filter .option'
);
let selectedYear = null;

// ---- DROPDOWN ----
const selectBox = document.querySelector('.catalog-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const optionsContainer = selectBox.querySelector('.options');
const optionsList = selectBox.querySelectorAll('.option');

// --- Dropdown aç/kapa ---
selected.addEventListener('click', () => {
  const isOpen = selectBox.classList.toggle('open');
  optionsContainer.style.display = isOpen ? 'block' : 'none';
});

// ---- yıl seçimi ----
yearFilterOptions.forEach(option => {
  option.addEventListener('click', () => {
    selected.childNodes[0].textContent = option.textContent;
    selectedYear = option.dataset.value || null;
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  });
});

// --- Dropdown dışına tıklanınca kapanması ---
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  }
});

// genresleri apiden çekme
async function loadGenres() {
  if (Object.keys(genreMap).length > 0) return; // zaten yüklüyse tekrar çekme

  try {
    const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: { api_key: API_KEY, language: 'en-US' },
    });
    response.data.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });
  } catch (err) {
    console.error('Türler yüklenemedi:', err);
  }
}

// Yıldızlar
function createStarRating(vote_average) {
  const rating = vote_average || 0;
  const score = rating / 2;
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

// ---- film kartları html yapısında oluşturma ----
function createMovieCard(movie) {
  // ratingi hesaplanamıyosa
  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  // genreye sahip değilse
  const genres =
    movie.genre_ids
      ?.map(id => genreMap[id])
      .filter(Boolean)
      .join(', ') || 'Unknown';
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : './img/no-poster.jpg';

  return `
    <li class="catalog-movie-item" data-movie-id="${movie.id}">
      <section class="card" style="cursor: pointer;">
        <img class="card-image" src="${poster}" alt="${
    movie.title
  }" loading="lazy" />
        <div class="card-content">
          <h2 class="card-title">${movie.title}</h2>
          <p class="card-info">
            <span class="card-genre">${genres}</span> |
            <span class="card-year">${year}</span>
          </p>
          <ul class="card-rating">${createStarRating(movie.vote_average)}</ul>
        </div>
      </section>
    </li>
  `;
}

// ---- filmleri renferla ----
function renderMovies(movies) {
  movieList.innerHTML = '';
  movies.forEach(movie => {
    if (!movie.poster_path) return;
    movieList.insertAdjacentHTML('beforeend', createMovieCard(movie));
  });
}

// --- Bir seçenek seçildiğinde ---
optionsList.forEach(option => {
  option.addEventListener('click', () => {
    // sadece text'i değiştir
    selected.childNodes[0].textContent = option.textContent;

    // seçili class'ı güncelle
    optionsList.forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');

    // menüyü kapat
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  });
});

// ---- popüler filmleri getir ----
async function getMovies(page = 1) {
  try {
    await loadGenres(); // önce türleri yükle
    const res = await axios.get(`${BASE_URL}/movie/popular`, {
      params: { api_key: API_KEY, language: 'en-US', page },
    });
    renderMovies(res.data.results);
  } catch (err) {
    console.error('API Hatası:', err);
  }
}

// ---- film arama yıl filtresi ile ----
async function searchMovies(query, year = null) {
  try {
    const params = {
      api_key: API_KEY,
      language: 'en-US',
      query: query,
    };
    if (year) params.primary_release_year = year;

    const res = await axios.get(`${BASE_URL}/search/movie`, { params });
    renderMovies(res.data.results);
  } catch (err) {
    console.error('Arama hatası:', err);
  }
}

// ----yıla göre film ----
async function getMoviesByYear(year) {
  try {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        primary_release_year: year,
      },
    });
    renderMovies(res.data.results);
  } catch (err) {
    console.error('Yıl filtre hatası:', err);
  }
}

// ---- arama butonuyla arama ----
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();

  if (query) {
    // arama + yıl filtresi
    searchMovies(query, selectedYear);
  } else if (selectedYear) {
    // yalnızca yıl filtresi
    getMoviesByYear(selectedYear);
  } else {
    // hiçbir filtre yoksa popüler filmler
    getMovies();
  }
});

// Enter ile arama

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault(); // form submit vs. engelle
    searchBtn.click(); // Search butonuna tıklamış gibi çalıştır
  }
});

clearBtn.addEventListener('click', () => {
  // inputu temizle
  searchInput.value = '';

  // seçili yılı sıfırla
  selectedYear = null;

  // dropdown daki selected kısmı
  selected.childNodes[0].textContent = 'Year';

  // tüm seçeneklerden selectedı kaldır
  optionsList.forEach(o => o.classList.remove('selected'));

  // Year seçeneğine selected class ekle
  const defaultOption = Array.from(optionsList).find(
    o => o.dataset.value === undefined || o.textContent === 'Year'
  );
  if (defaultOption) {
    defaultOption.classList.add('selected');
  }

  // filmleri listele
  getMovies();
});

// Kartlara tıklandığında modal aç
document.addEventListener('click', e => {
  const card = e.target.closest('.catalog-movie-item');
  if (card && card.dataset.movieId) {
    openMovieModal(card.dataset.movieId);
  }
});

// ---- SAYFA AÇILDIĞINDA POPÜLER FİLMLER ----
getMovies();
