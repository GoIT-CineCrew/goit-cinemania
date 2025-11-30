import { openMovieModal } from './js/modal.js';

const genreMap = {};
// ---- DROPDOWN ----
const selectBox = document.querySelector('.catalog-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const arrow = selected.querySelector('.arrow');
const optionsContainer = selectBox.querySelector('.options');
const optionsList = selectBox.querySelectorAll('.option');

// --- Dropdown aç/kapa ---
selected.addEventListener('click', () => {
  const isOpen = selectBox.classList.toggle('open');
  optionsContainer.style.display = isOpen ? 'block' : 'none';
});

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

    selectedYear = option.dataset.value;
  });
});

// --- Dropdown dışına tıklanınca kapanması ---
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  }
});

// ---- API CONFIG ----
const API_KEY = 'aaf24ac7ab7c5211361a71263e777bb9';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ---- DOM ELEMENTS ----
const movieList = document.querySelector('.catalog-movie-items');
const searchInput = document.querySelector('.catalog-search input');
const searchBtn = document.querySelector('.search-icon');
const yearFilterOptions = document.querySelectorAll(
  '.catalog-dropdown-filter .option'
);
const clearBtn = document.querySelector('.clear-button');
const paginationContainer = document.querySelector(
  '.catalog-pages .catalog-pages-list'
);
// prevBtn ve nextBtn tanımları DOM'da yok, ancak pagination butonu oluşturulduğunda dinamik olarak atanacak.

let selectedYear = null;
let currentPage = 1; // Mevcut sayfa
let totalPages = 1; // API'den gelen toplam sayfa sayısı

// **********************************************
// 🌟 DÜZELTME: loadGenres fonksiyon tanımı buraya eklendi.
// **********************************************

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

// yıldız oluşturma
function createStarRating(vote_average) {
  const ratingOutOfFive = vote_average / 2; // 0-5 arası değer
  const fullStars = Math.floor(ratingOutOfFive);
  const halfStar = ratingOutOfFive % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let starsHTML = '';

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>`;
  }
  if (halfStar) {
    starsHTML += `<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>`;
  }

  return starsHTML;
}

// ---- filmleri renderla
function renderMovies(movies) {
  movieList.innerHTML = '';
  movies.forEach(movie => {
    if (!movie.poster_path) return;
    movieList.insertAdjacentHTML('beforeend', createMovieCard(movie));
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- film kartları html yapısında oluşturma
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : './img/Modal-Example.jpg';

  const year = movie.release_date
    ? movie.release_date.slice(0, 4)
    : 'Rating not Found';

  const genreNames =
    movie.genre_ids && movie.genre_ids.length > 0
      ? movie.genre_ids
          .map(id => genreMap[id])
          .filter(Boolean)
          .join(', ')
      : 'Genre not Found';

  const ratingStars = createStarRating(movie.vote_average);

  return `
      <li class="catalog-movie-item" data-movie-id="${movie.id}">
        <section class="card" style="cursor: pointer;">
          <img
            class="card-image"
            src="${poster}"
            alt="${movie.title}"
            loading="lazy"
          />
          <div class="card-content">
            <h2 class="card-title">${movie.title}</h2>
            <p class="card-info">
              <span class="card-genre">${genreNames}</span> |
              <span class="card-year">${year}</span>
            </p>
            <ul class="card-rating">
              ${ratingStars}
            </ul>
          </div>
        </section>
      </li>
    `;
}

// Sayfalama butonlarını dinamik olarak oluşturma ve güncelleme
function renderPaginationButtons(total_pages, current_page) {
  totalPages = total_pages > 24 ? 24 : total_pages; //  24 sayfa ile sınırlar
  currentPage = current_page;
  paginationContainer.innerHTML = ''; // Mevcut butonları temizle

  // Önceki Butonu
  paginationContainer.insertAdjacentHTML(
    'beforeend',
    `
        <li>
            <button type="button" class="catalog-page-btn prev-btn" ${
              currentPage === 1 ? 'disabled' : ''
            }>
                <svg>
                    <use href="./img/sprite.svg#back-arrow-${
                      currentPage === 1 ? 'passive' : 'active'
                    }-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `
  );

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // İlk sayfa ve gerekirse üç nokta
  if (startPage > 1) {
    paginationContainer.insertAdjacentHTML(
      'beforeend',
      createPageButton(1, currentPage)
    );
    if (startPage > 2) {
      paginationContainer.insertAdjacentHTML(
        'beforeend',
        `
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `
      );
    }
  }

  // Sayfa Numarası Butonları
  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.insertAdjacentHTML(
      'beforeend',
      createPageButton(i, currentPage)
    );
  }

  // Son sayfa ve gerekirse üç nokta
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationContainer.insertAdjacentHTML(
        'beforeend',
        `
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `
      );
    }
    paginationContainer.insertAdjacentHTML(
      'beforeend',
      createPageButton(totalPages, currentPage)
    );
  }

  // Sonraki Butonu
  paginationContainer.insertAdjacentHTML(
    'beforeend',
    `
        <li>
            <button type="button" class="catalog-page-btn next-btn" ${
              currentPage === totalPages ? 'disabled' : ''
            }>
                <svg>
                    <use href="./img/sprite.svg#forward-arrow-${
                      currentPage === totalPages ? 'passive' : 'active'
                    }-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `
  );

  // Yeni butonlar için olay dinleyicilerini yeniden ata
  attachPaginationListeners();
}

function createPageButton(pageNumber, currentPage) {
  const isActive = pageNumber === currentPage;
  const useHref = isActive
    ? 'button-active-dark-mobile'
    : 'button-passive-dark-mobile';
  return `
        <li>
            <button type="button" class="catalog-page-btn page-number-btn ${
              isActive ? 'active' : ''
            }" data-page="${pageNumber}">
                <svg>
                    <use href="./img/sprite.svg#${useHref}"></use>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="${
                      isActive ? 'white' : 'currentColor'
                    }">${pageNumber.toString().padStart(2, '0')}</text>
                </svg>
            </button>
        </li>
    `;
}

// Sayfalama Olay Dinleyicilerini Atama
function attachPaginationListeners() {
  const allButtons = paginationContainer.querySelectorAll('.catalog-page-btn');

  allButtons.forEach(button => {
    // Dinamik olarak oluşturulan butonlar için olay dinleyicisi ekle
    // Önceki dinleyiciyi kaldırmaya gerek yok çünkü DOM temizlenip yeniden oluşturuluyor (`paginationContainer.innerHTML = "";`)
    // Ancak güvenlik için removeEventListener bırakılabilir.
    button.removeEventListener('click', handlePageClick);
    button.addEventListener('click', handlePageClick);
  });
}

// Sayfalama butonuna tıklama işleyicisi
function handlePageClick(e) {
  const button = e.currentTarget;
  const isPrev = button.classList.contains('prev-btn');
  const isNext = button.classList.contains('next-btn');

  if (isPrev && currentPage > 1) {
    handleMovieRequest(currentPage - 1);
  } else if (isNext && currentPage < totalPages) {
    handleMovieRequest(currentPage + 1);
  } else if (button.classList.contains('page-number-btn')) {
    const newPage = parseInt(button.dataset.page);
    if (newPage !== currentPage) {
      handleMovieRequest(newPage);
    }
  }
}

// **********************************************
// 🌟 handleMovieRequest fonksiyonu artık loadGenres'ı tanımlı bulabilir.
// **********************************************

async function handleMovieRequest(page = 1) {
  await loadGenres(); // Türleri her zaman yükle (Şimdi tanımlı!)

  const query = searchInput.value.trim();
  let url = '';
  let params = {
    api_key: API_KEY,
    language: 'en-US',
    page: page,
  };

  // API uç noktası belirleme mantığı: query ve selectedYear kontrolü
  if (query) {
    url = `${BASE_URL}/search/movie`;
    params.query = query;
    if (selectedYear) {
      params.primary_release_year = selectedYear;
    }
  } else if (selectedYear) {
    url = `${BASE_URL}/discover/movie`;
    params.sort_by = 'popularity.desc';
    params.primary_release_year = selectedYear;
  } else {
    url = `${BASE_URL}/movie/popular`;
  }

  try {
    const res = await axios.get(url, { params });
    renderMovies(res.data.results);
    // Sayfalama butonlarını toplam sayfa sayısı ile güncelle
    renderPaginationButtons(res.data.total_pages, res.data.page);
  } catch (err) {
    console.error('Film isteği hatası:', err);
  }
}
// ----------------------------------------------------------------------

// Kartlara tıklandığında modal aç
document.addEventListener('click', e => {
  const card = e.target.closest('.catalog-movie-item');
  if (card?.dataset.movieId) {
    openMovieModal(card.dataset.movieId);
  }
});

searchBtn.addEventListener('click', () => {
  handleMovieRequest(1);
});

// ---- yıl seçimi (Dropdown Mantığı)
yearFilterOptions.forEach(option => {
  option.addEventListener('click', () => {
    selectedYear = option.dataset.value;
    // Not: Dropdown'da seçimi tamamladıktan sonra filtreyi uygulamak için
    // handleMovieRequest(1) çağrısını buraya eklemeyi düşünebilirsiniz.
    // Ancak bu, dropdown mantığının üst kısımlarında zaten yönetiliyor olabilir.
  });
});

// Clear butonuna basıldığında handleMovieRequest'i çağır
clearBtn.addEventListener('click', () => {
  // inputu temizle
  searchInput.value = '';

  // seçili yılı sıfırla
  selectedYear = null;

  // dropdown daki selected kısmı
  selected.childNodes[0].textContent = 'Year';

  // tüm seçeneklerden selectedı kaldır
  optionsList.forEach(o => o.classList.remove('selected'));

  // Year seçeneğine selected class ekle (İlk seçenek)
  const defaultOption = Array.from(optionsList).find(
    o => o.dataset.value === undefined || o.textContent.trim() === 'Year'
  );
  if (defaultOption) {
    defaultOption.classList.add('selected');
  }

  // filmleri listele (1. sayfadan başla)
  handleMovieRequest(1);
});

// Enter ile arama
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchBtn.click();
  }
});

// ---- SAYFA AÇILDIĞINDA POPÜLER FİLMLER (1. Sayfa) ----
handleMovieRequest(1);
