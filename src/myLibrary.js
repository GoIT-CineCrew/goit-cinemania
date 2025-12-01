import { openMovieModal } from './js/modal.js';

const genreMap = {};
const API_KEY = 'aaf24ac7ab7c5211361a71263e777bb9';
let selectedGenre = null; // Seçilen tür ID'si (Number veya null)

// LOAD MORE  SAYFALAMA DEĞİŞKENLERİ
const MOVIES_PER_PAGE = 20; // Bir sayfada gösterilecek maksimum film sayısı
let currentLibraryPage = 1; // Başlangıç sayfası
let allFilteredMovies = []; // Filtreleme sonrası tüm filmlerin geçici olarak tutulduğu dizi

// DOM Elementleri
const selectBox = document.querySelector('.library-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const optionsContainer = selectBox.querySelector('.options');
const listEl = document.querySelector('.library-movie-items'); // Film listesi container'ı
const loadMoreBtn = document.querySelector('.library-load-button'); // Load More butonu

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
  const cachedGenresJson = localStorage.getItem('tmdbGenresIdToName');

  if (cachedGenresJson) {
    Object.assign(genreMap, JSON.parse(cachedGenresJson));
    return;
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list`,
      {
        params: { api_key: API_KEY, language: 'en-US' },
      }
    );

    const newGenreMap = {};
    response.data.genres.forEach(g => {
      newGenreMap[g.id] = g.name;
    });

    Object.assign(genreMap, newGenreMap);
    localStorage.setItem('tmdbGenresIdToName', JSON.stringify(newGenreMap));
  } catch (err) {
    console.error('Türler yüklenemedi:', err);
  }
}

// Kütüphanedeki filmlerden benzersiz tür ID'lerini toplar ve Dinamik dropdown oluşturur
function getGenresFromLibrary() {
  // ... (Mevcut getGenresFromLibrary içeriği) ...
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
        uniqueGenreIds.add(id);
      }
    });
  });

  return Array.from(uniqueGenreIds);
}

// Kütüphane türlerini kullanarak dropdown'ı oluşturur
function renderLibraryGenreDropdown() {
  // ... (Mevcut renderLibraryGenreDropdown içeriği) ...
  const requiredGenreIds = getGenresFromLibrary();

  optionsContainer.innerHTML = '';
  const defaultOption = document.createElement('div');
  defaultOption.classList.add('option', 'selected');
  defaultOption.textContent = 'All Film';
  defaultOption.dataset.value = '';
  optionsContainer.appendChild(defaultOption);

  requiredGenreIds.forEach(id => {
    const genreName = genreMap[id];

    if (genreName) {
      const option = document.createElement('div');
      option.classList.add('option');
      option.textContent = genreName;
      option.dataset.value = id;
      optionsContainer.appendChild(option);
    }
  });
  updateDropdownListeners();
}

// Yeni butonlara olay dinleyicisi ekler - Filtre değiştiğinde loadLibrary'i çağırır
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

      const genreId = option.dataset.value
        ? Number(option.dataset.value)
        : null;
      selectedGenre = genreId;

      // Filtre değiştiğinde 1. sayfadan başlamalı ve listeyi TEMİZLEMELİYİZ.
      currentLibraryPage = 1;
      loadLibrary(true); // true = reset the list
    });
  });
}

// myLibrary'i localden çekme
document.addEventListener('DOMContentLoaded', async () => {
  await loadGenres();
  renderLibraryGenreDropdown();
  loadLibrary(true); // Başlangıçta listeyi temizleyerek yükle
});

// 🌟 GÜNCELLENMİŞ loadLibrary FONKSİYONU 🌟
// resetList = true ise listeyi temizler ve filtrelemeyi baştan yapar.
function loadLibrary(resetList = false) {
  let library = JSON.parse(localStorage.getItem('myMovieLibrary')) || [];

  if (library.length === 0) {
    document.querySelector('.library-content').style.display = 'none';
    document.querySelector('.library-content-empty').style.display = 'block';
    loadMoreBtn.style.display = 'none'; // Film yoksa butonu gizle
    return;
  }

  // Eğer resetList true ise (yani filtre değiştiyse veya ilk yükleme ise)
  if (resetList) {
    currentLibraryPage = 1;
    // 1. Seçilen türe göre filtrele ve sonucu global değişkene kaydet
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
    allFilteredMovies = filteredLibrary; // Filtrelenmiş listeyi kaydet
    listEl.innerHTML = ''; // Listeyi temizle
    loadMoreBtn.style.display = 'none';
  }

  // 2. Sayfalama dilimlerini belirle (slice)
  const startIndex = (currentLibraryPage - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;

  // Sadece mevcut sayfadaki filmleri al
  const moviesToRender = allFilteredMovies.slice(startIndex, endIndex);

  if (moviesToRender.length === 0 && resetList) {
    listEl.innerHTML =
      "<p class='no-results'>Seçilen türe ait film bulunmamaktadır.</p>";
    loadMoreBtn.style.display = 'none';
    return;
  }

  // 3. Filmleri renderla (listeye ekle)
  moviesToRender.forEach(movie => {
    const title = movie.title || 'Unknown';
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : './img/placeholder.jpg';
    const rating = movie.vote_average ?? 'N/A';
    const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';

    let movieGenreIds = [];
    if (Array.isArray(movie.genre_ids)) {
      movieGenreIds = movie.genre_ids;
    } else if (Array.isArray(movie.genres)) {
      movieGenreIds = movie.genres.map(g => g.id);
    }

    const genres = movieGenreIds
      .map(id => genreMap[id])
      .filter(Boolean)
      .join(', ');

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

  // 4. Load More Butonunu Yönet
  // Toplam filtrelenmiş film sayısı, şu ana kadar gösterilen film sayısından fazlaysa butonu göster
  if (allFilteredMovies.length > endIndex) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

function createStarRating(vote_average, isHero = false) {
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

// Kart tıklama - MODAL AÇILMASI İÇİN
document.addEventListener('click', e => {
  const card = e.target.closest('.library-movie-item');
  if (card?.dataset.movieId) {
    openMovieModal(card.dataset.movieId);
  }
});

//LOAD MORE BUTONU
loadMoreBtn.addEventListener('click', () => {
  currentLibraryPage += 1; // Sayfa numarasını artır
  loadLibrary(false); // Listeyi temizlemeden yükle
});
