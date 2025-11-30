import { openMovieModal } from './js/modal.js';

const genreMap = {};
const API_KEY = 'aaf24ac7ab7c5211361a71263e777bb9';
let selectedGenre = null; // Seçilen tür ID'si (Number veya null)

// Dropdown
const selectBox = document.querySelector('.library-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const optionsContainer = selectBox.querySelector('.options');

// Dropdown aç/kapa
selected.addEventListener('click', () => {
  const isOpen = selectBox.classList.toggle('open');
  optionsContainer.style.display = isOpen ? 'block' : 'none';
});

// Sayfa dışına tıklayınca dropdown kapanır
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  }
});

// TMDB apisinden genre çekme ve mapleme(genreMap)
async function loadGenres() {
  // LocalStorage'ı ID -> Name eşleşmesi için kontrol et (Renderlama için gerekli)
  const cachedGenresJson = localStorage.getItem('tmdbGenresIdToName');

  if (cachedGenresJson) {
    Object.assign(genreMap, JSON.parse(cachedGenresJson));
    return;
  }

  // Yoksa API'den çek
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list`,
      {
        params: { api_key: API_KEY, language: 'en-US' },
      }
    );

    const newGenreMap = {};
    response.data.genres.forEach(g => {
      newGenreMap[g.id] = g.name; // ID -> İSİM olarak kaydet
    });

    Object.assign(genreMap, newGenreMap);
    localStorage.setItem('tmdbGenresIdToName', JSON.stringify(newGenreMap));
  } catch (err) {
    console.error('Türler yüklenemedi:', err);
  }
}

// Kütüphanedeki filmlerden benzersiz tür ID'lerini toplar ve Dinamik dropdown oluşturur
function getGenresFromLibrary() {
  const libraryJson = localStorage.getItem('myMovieLibrary');
  if (!libraryJson) return [];
  const libraryMovies = JSON.parse(libraryJson);
  const uniqueGenreIds = new Set();
  libraryMovies.forEach(movie => {
    let genreIds = [];

    if (Array.isArray(movie.genre_ids)) {
      genreIds = movie.genre_ids;
    } else if (Array.isArray(movie.genres)) {
      genreIds = movie.genres.map(g => g.id);
    }

    genreIds.forEach(id => {
      if (genreMap[id]) {
        // Sadece elimizdeki ID'leri toplarız
        uniqueGenreIds.add(id);
      }
    });
  });

  return Array.from(uniqueGenreIds);
}

// Kütüphane türlerini kullanarak dropdown'ı oluşturur
function renderLibraryGenreDropdown() {
  const requiredGenreIds = getGenresFromLibrary();

  optionsContainer.innerHTML = ''; // Önceki seçenekleri temizle
  // 1. Varsayılan (Tümü) seçeneğini ekle
  const defaultOption = document.createElement('div');
  defaultOption.classList.add('option', 'selected');
  defaultOption.textContent = 'All Genres';
  defaultOption.dataset.value = ''; // Filtrelememek için boş değer
  optionsContainer.appendChild(defaultOption);
  // 2. Dinamik olarak türleri ekle
  requiredGenreIds.forEach(id => {
    const genreName = genreMap[id];

    if (genreName) {
      const option = document.createElement('div');
      option.classList.add('option');
      option.textContent = genreName;
      option.dataset.value = id; // data-value olarak ID'yi sakla
      optionsContainer.appendChild(option);
    }
  });
  // 3. Olay dinleyicilerini yeniden bağla
  updateDropdownListeners();
}

// Yeni butonlara olay dinleyicisi ekler
function updateDropdownListeners() {
  const optionsList = document.querySelectorAll(
    '.library-dropdown-filter .option'
  );

  optionsList.forEach(option => {
    option.addEventListener('click', () => {
      selected.childNodes[0].textContent = option.textContent;
      optionsList.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectBox.classList.remove('open');
      optionsContainer.style.display = 'none';
      // Seçilen tür ID'sini al ve number'a çevir (yoksa null)
      const genreId = option.dataset.value
        ? Number(option.dataset.value)
        : null;
      selectedGenre = genreId;

      // Kütüphaneyi filtreleyerek yeniden yükle
      loadLibrary();
    });
  });
}

// myLibrary'i localden çekme
document.addEventListener('DOMContentLoaded', async () => {
  await loadGenres(); // Tüm ID->Name eşleşmelerini yükle
  renderLibraryGenreDropdown(); // Kütüphanedeki filmlerin türlerine göre dropdown'ı oluştur
  loadLibrary(); // Kütüphaneyi varsayılan olarak yükle
});

// filmlerin genlereli gelmekte ve genrelere göre filtreleme
function loadLibrary() {
  const listEl = document.querySelector('.library-movie-items');
  let library = JSON.parse(localStorage.getItem('myMovieLibrary')) || [];
  if (library.length === 0) {
    document.querySelector('.library-content').style.display = 'none';
    document.querySelector('.library-content-empty').style.display = 'block';
    return;
  }
  // Seçilen türe göre filtrele
  let filteredLibrary = library;
  if (selectedGenre) {
    filteredLibrary = library.filter(movie => {
      let movieGenreIds = [];

      if (Array.isArray(movie.genre_ids)) {
        movieGenreIds = movie.genre_ids;
      } else if (Array.isArray(movie.genres)) {
        movieGenreIds = movie.genres.map(g => g.id);
      }

      return movieGenreIds.includes(selectedGenre);
    });
  }
  listEl.innerHTML = '';

  if (filteredLibrary.length === 0) {
    listEl.innerHTML =
      "<p class='no-results'>Seçilen türe ait film bulunmamaktadır.</p>";
    return;
  }
  filteredLibrary.forEach(movie => {
    const title = movie.title || 'Unknown';

    // TMDB apide resim yolu
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : './img/placeholder.jpg';

    const rating = movie.vote_average ?? 'N/A';

    // YIL BİLGİSİNİ ÇEKME
    const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
    // --- DÜZELTME: Genre isimleri oluşturma (Sadece filme ait ID'leri kullan) ---
    let movieGenreIds = [];
    if (Array.isArray(movie.genre_ids)) {
      movieGenreIds = movie.genre_ids;
    } else if (Array.isArray(movie.genres)) {
      movieGenreIds = movie.genres.map(g => g.id);
    }

    // Sadece bu filme ait ID'leri genreMap ile isme çevirir
    const genres = movieGenreIds
      .map(id => genreMap[id])
      .filter(Boolean)
      .join(', ');
    const li = document.createElement('li');
    li.classList.add('library-movie-item');
    li.dataset.movieId = movie.id; // MODAL İÇİN GEREKLİ
    li.style.cursor = 'pointer'; // Kullanıcıya tıklanabilir olduğunu göster

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
                       
                        | <span class="card-year">${year}</span>
                       
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

function createStarRating(vote_average) {
  const ratingOutOfFive = vote_average / 2;
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

// Kart tıklama - MODAL AÇILMASI İÇİN EK
document.addEventListener('click', e => {
  const card = e.target.closest('.library-movie-item');
  if (card?.dataset.movieId) {
    openMovieModal(card.dataset.movieId);
  }
});
