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
const API_KEY = "aaf24ac7ab7c5211361a71263e777bb9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// ---- DOM ELEMENTS ----
const movieList = document.querySelector(".catalog-movie-items");
const searchInput = document.querySelector(".catalog-search input");
const searchBtn = document.querySelector(".search-icon");
const yearFilterOptions = document.querySelectorAll(".catalog-dropdown-filter .option");
const clearBtn = document.querySelector(".clear-button");
const paginationContainer = document.querySelector(".catalog-pages");
const pageButtons = document.querySelectorAll(".catalog-page-btn");


let selectedYear = null;
let currentPage = 1; // Mevcut sayfa 

// genresleri apiden çekme
async function loadGenres() {
    if (Object.keys(genreMap).length > 0) return; // zaten yüklüyse tekrar çekme

    try {
        const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
            params: { api_key: API_KEY, language: "en-US" }
        });
        response.data.genres.forEach(g => {
            genreMap[g.id] = g.name;
        });
    } catch (err) {
        console.error("Türler yüklenemedi:", err);
    }
}

// yıldız oluşturma
function createStarRating(vote_average) {
    const ratingOutOfFive = vote_average / 2; // 0-5 arası değer
    // ... yıldız oluşturma mantığı ...
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

// ---- filmleri renderla
function renderMovies(movies) {
    movieList.innerHTML = "";
    movies.forEach(movie => {
        if (!movie.poster_path) return;
        movieList.insertAdjacentHTML("beforeend", createMovieCard(movie));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//  Sayfalama butonlarını aktif etme 
function  updatePaginationButtons  (page) {
    pageButtons.forEach(button => {
        button.classList.remove("active");
        if (parseInt(button.textContent) === page) {
            button.classList.add("active");
        }
    });
    currentPage = page;
}

// ---- film kartları html yapısında oluşturma
function createMovieCard(movie) {
    const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "./img/Modal-Example.jpg";

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "Rating n ot Found";

    const genreNames = movie.genre_ids && movie.genre_ids.length > 0
        ? movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(", ")
        : "Genre not Found";

    const ratingStars = createStarRating(movie.vote_average);

    return `
      <li class="catalog-movie-item">
        <section class="card">
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

// ----------------------------------------------------------------------
// ⚡️ KOD TEKRARINI AZALTAN ANA İŞLEV (Yeni / Birleştirilmiş) ⚡️
// ----------------------------------------------------------------------

async function handleMovieRequest(page = 1) {
    await loadGenres(); // Türleri her zaman yükle

    const query = searchInput.value.trim();
    let url = "";
    let params = {
        api_key: API_KEY,
        language: "en-US",
        page: page,
    };

    if (query) {
        // Arama sorgusu varsa: /search/movie basesini al
        url = `${BASE_URL}/search/movie`;
        params.query = query;
        if (selectedYear) {
            params.primary_release_year = selectedYear;
        }
    } else if (selectedYear) {
        // Sadece yıl filtresi varsa: /discover/movie basesini al
        url = `${BASE_URL}/discover/movie`;
        params.sort_by = "popularity.desc";
        params.primary_release_year = selectedYear;
    } else {
        // Hiçbir filtre yoksa: /movie/popular basesini al
        url = `${BASE_URL}/movie/popular`;
    }

    try {
        const res = await axios.get(url, { params });
        renderMovies(res.data.results);
        updatePaginationButtons(page);
    } catch (err) {
        console.error("Film isteği hatası:", err);
    }
}
// ----------------------------------------------------------------------

//  Arama butonuna basıldığında -> handleMovieRequest'i çağır 
searchBtn.addEventListener("click", () => {
    // Arama yapıldığında veya filtre değiştiğinde her zaman 1. sayfadan başlar ve API ye istek attığımızdaki ilk sayfayı oluşturur 
  handleMovieRequest(1); 

});

// ---- yıl seçimi 
yearFilterOptions.forEach(option => {
    option.addEventListener("click", () => {
        selectedYear = option.dataset.value;
    });
});

// Clear butonuna basıldığında handleMovieRequest'i çağır
clearBtn.addEventListener("click", () => {
    // inputu temizle
    searchInput.value = "";

    // seçili yılı sıfırla
    selectedYear = null;

    // dropdown daki selected kısmı
    selected.childNodes[0].textContent = "Year";

    // tüm seçeneklerden selectedı kaldır
    optionsList.forEach(o => o.classList.remove('selected'));

    // Year seçeneğine selected class ekle (İlk seçenek)
    const defaultOption = Array.from(optionsList).find(o => o.dataset.value === undefined || o.textContent.trim() === "2025");
    if (defaultOption) {
        defaultOption.classList.add('selected');
    }

    // filmleri listele (1. sayfadan başla)
    handleMovieRequest(1);
});

// Enter ile arama
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

//  Sayfa değiştirme olay dinleyicisi handleMovieRequest'i çağır
paginationContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("catalog-page-btn")) {
        const newPage = parseInt(e.target.textContent); // Tıklanan sayfa numarasında tekrardan API isteği oluşturur yeni filmleri çeker
        handleMovieRequest(newPage); //yeni sayfada API yi çağıran ve tetikleyen fonksiyon
    }
});


//  SAYFA AÇILDIĞINDA POPÜLER FİLMLER (1. Sayfa)
handleMovieRequest(1);