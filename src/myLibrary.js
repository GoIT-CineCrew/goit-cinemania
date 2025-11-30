const API_KEY = "aaf24ac7ab7c5211361a71263e777bb9";
const genreMap = {};
const selectBox = document.querySelector('.library-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const arrow = selected.querySelector('.arrow');
const optionsContainer = selectBox.querySelector('.options');
const optionsList = selectBox.querySelectorAll('.option');

let selectedGenre = null; // TMDb genre ID burada tutulacak

// Dropdown aç/kapa
selected.addEventListener('click', () => {
  const isOpen = selectBox.classList.toggle('open');
  optionsContainer.style.display = isOpen ? 'block' : 'none';
});

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

// Sayfa dışına tıklayınca dropdown kapanır
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
    optionsContainer.style.display = 'none';
  }
});

// ======================
// LIBRARY DOM ELEMENTS
// ======================
const movieList = document.querySelector(".library-movie-items");

// ======================
// TMDB GENRE LOAD
// ======================
async function loadGenres() {
  if (Object.keys(genreMap).length > 0) return;

  try {
    const response = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
      params: { api_key: API_KEY, language: "en-US" }
    });

    response.data.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });

  } catch (err) {
    console.error("Türler yüklenemedi:", err);
  }
}

// ======================
// LOAD LIBRARY FROM LOCALSTORAGE
// ======================
document.addEventListener("DOMContentLoaded", async () => {
  await loadGenres();
  loadLibrary();
});

// ======================
// MOVIE RENDER
// ======================
function loadLibrary() {
  const listEl = document.querySelector(".library-movie-items");
  let library = JSON.parse(localStorage.getItem("myMovieLibrary")) || [];

  if (library.length === 0) {
    document.querySelector(".library-content").style.display = "none";
    document.querySelector(".library-content-empty").style.display = "block";
    return;
  }

  listEl.innerHTML = "";

  library.forEach(movie => {
    const title = movie.title || "Unknown";
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : "./img/placeholder.jpg";
    const rating = movie.vote_average ?? "N/A";

    // --- GENRE FİLTRESİ ---
let movieGenreIds = [];

// 1) genre_ids varsa direkt al
if (Array.isArray(movie.genre_ids)) {
  movieGenreIds = movie.genre_ids;
}

// 2) genres (objeler) varsa ID'leri çek
else if (Array.isArray(movie.genres)) {
  movieGenreIds = movie.genres.map(g => g.id);
}

// 3) genre_names varsa genreMap üzerinden ID’ye çevir
else if (Array.isArray(movie.genre_names)) {
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
    let genres = "Unknown";
    if (movie.genres?.length) {
      genres = movie.genres.map(g => g.name).join(", ");
    } else if (movie.genre_names?.length) {
      genres = movie.genre_names.join(", ");
    } else if (movie.genre_ids?.length) {
      genres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(", ");
    }

    const li = document.createElement("li");
    li.classList.add("library-movie-item");

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

function createStarRating(vote_average) {
  const ratingOutOfFive = vote_average / 2;

  const fullStars = Math.floor(ratingOutOfFive);
  const halfStar = ratingOutOfFive % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let starsHTML = "";

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
