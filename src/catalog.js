import { openMovieModal } from './js/modal.js';

const genreMap = {};

// ---- API CONFIG ----
const API_KEY = "aaf24ac7ab7c5211361a71263e777bb9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// ---- DOM ELEMENTS ----
const movieList = document.querySelector(".catalog-movie-items");
const searchInput = document.querySelector(".catalog-search input");
const searchBtn = document.querySelector(".search-icon");
const clearBtn = document.querySelector(".clear-button");
// Sabit 5 butonu HTML'den seçiyoruz
const paginationContainer = document.querySelector(".catalog-pages");
const pageButtons = document.querySelectorAll(".catalog-page-btn"); 

// ---- DROPDOWN DOM ----
const selectBox = document.querySelector('.catalog-dropdown-filter');
const selected = selectBox.querySelector('.selected');
const optionsContainer = selectBox.querySelector('.options');
const optionsList = selectBox.querySelectorAll('.option');

let selectedYear = null;
let currentPage = 1;

// ----------------------------------------------------------------------
// 🧰 YARDIMCI FONKSİYONLAR
// ----------------------------------------------------------------------

// Genresleri API'den çekme
async function loadGenres() {
    if (Object.keys(genreMap).length > 0) return;

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

// Yıldızları oluşturma
function createStarRating(vote_average) {
    const ratingOutOfFive = (vote_average || 0) / 2;
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

// Film kartlarını oluşturma
function createMovieCard(movie) {
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    
    const genres = movie.genre_ids && movie.genre_ids.length > 0
        ? movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(", ")
        : "Unknown";
        
    const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "./img/no-poster.jpg";

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
              <span class="card-genre">${genres}</span> |
              <span class="card-year">${year}</span>
            </p>
            <ul class="card-rating">${ratingStars}</ul>
          </div>
        </section>
      </li>
    `;
}

// Filmleri renderlama
function renderMovies(movies) {
    movieList.innerHTML = '';
    movies.forEach(movie => {
        if (!movie.poster_path) return;
        movieList.insertAdjacentHTML('beforeend', createMovieCard(movie));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Sayfalama butonlarını aktif etme (Statik butonlar için)
function updatePaginationButtons(page) {
    // pageButtons DOM listesi güncel olmayabilir, bu yüzden tekrar seçiyoruz.
    const currentButtons = document.querySelectorAll(".catalog-page-btn");

    currentButtons.forEach(button => {
        button.classList.remove("active");
        // Butonun içindeki sayfa numarasını bulup karşılaştırıyoruz.
        // DİKKAT: Sayfa numaraları SVG'lerin içine gömülü olmadığı için,
        // bu fonksiyon düzgün çalışmaz. Bu yüzden HTML'deki SVG'lerin kaldırılıp
        // numaraların buton metni olarak eklenmesi gerekir (Önceki HTML yapısı).
        // Eğer butonlarda sadece "01", "02" metni varsa, bu mantık doğru çalışır:
        const buttonText = button.textContent.trim().replace(/^0+/, ''); // "01" -> "1"
        if (parseInt(buttonText) === page) {
            button.classList.add("active");
        }
    });
    currentPage = page;
}

// ----------------------------------------------------------------------
// ⚡️ ANA İŞLEV (handleMovieRequest, Kod Tekrarını Azaltır) ⚡️
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
        // Arama sorgusu varsa: /search/movie uç noktasını kullan
        url = `${BASE_URL}/search/movie`;
        params.query = query;
        if (selectedYear) {
            params.primary_release_year = selectedYear;
        }
    } else if (selectedYear) {
        // Sadece yıl filtresi varsa: /discover/movie uç noktasını kullan
        url = `${BASE_URL}/discover/movie`;
        params.sort_by = "popularity.desc";
        params.primary_release_year = selectedYear;
    } else {
        // Hiçbir filtre yoksa: /movie/popular uç noktasını kullan
        url = `${BASE_URL}/movie/popular`;
    }

    try {
        const res = await axios.get(url, { params });
        renderMovies(res.data.results);
        // Bu fonksiyonun doğru çalışması için HTML'deki SVG'li butonların sadece metin içermesi gerekir.
        updatePaginationButtons(page); 
    } catch (err) {
        console.error("Film isteği hatası:", err);
    }
}

// ----------------------------------------------------------------------
// 🎯 OLAY DİNLEYİCİLERİ (EVENTS)
// ----------------------------------------------------------------------

// --- Dropdown aç/kapa --- (Tekrarı Kaldırıldı)
selected.addEventListener('click', () => {
    const isOpen = selectBox.classList.toggle('open');
    optionsContainer.style.display = isOpen ? 'block' : 'none';
});

// --- Bir seçenek seçildiğinde --- (Tekrarı Kaldırıldı)
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

// --- Dropdown dışına tıklanınca kapanması --- (Tekrarı Kaldırıldı)
document.addEventListener('click', e => {
    if (!selectBox.contains(e.target)) {
        selectBox.classList.remove('open');
        optionsContainer.style.display = 'none';
    }
});

// Arama butonuna basıldığında
searchBtn.addEventListener("click", () => {
    // Yeni bir arama başlatıldığı için 1. sayfadan yükler.
    handleMovieRequest(1); 
});

// Enter ile arama
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

// Clear butonuna basıldığında
clearBtn.addEventListener("click", () => {
    // Filtreleri sıfırla
    searchInput.value = "";
    selectedYear = null;
    selected.childNodes[0].textContent = "Year";
    
    // Tüm seçeneklerden selected'ı kaldır
    optionsList.forEach(o => o.classList.remove('selected'));

    // Filtrelenmiş varsayılan seçeneği bul ve aktif yap
    const defaultOption = Array.from(optionsList).find(o => o.dataset.value === undefined || o.textContent.trim() === "2025");
    if (defaultOption) {
        defaultOption.classList.add('selected');
    }

    // Filmleri listele (1. sayfadan başla)
    handleMovieRequest(1);
});

// Sayfa değiştirme olay dinleyicisi (Önceki butonsuz/SVG'siz mantığa göre ayarlandı)
paginationContainer.addEventListener("click", (e) => {
    // Sadece numaralı butona basıldığında işlem yap
    const button = e.target.closest(".catalog-page-btn");
    if (!button) return;

    let newPage = currentPage;
    
    // Tıklanan butondaki metni alıyoruz
    const buttonText = button.textContent.trim().replace(/^0+/, ''); 

    // Basılan butonun numara mı (01, 02) yoksa ok (prev, next) mu olduğunu kontrol ediyoruz
    if (button.classList.contains("prev-btn")) {
        newPage = Math.max(1, currentPage - 1);
    } else if (button.classList.contains("next-btn")) {
        // totalPages değişkenine erişimimiz olmadığı için bu kısım şu an tam çalışmaz,
        // ancak varsayılan olarak ilerlemeye izin verir. 
        newPage = currentPage + 1; 
    } else {
        // Numaralı buton
        const pageNumber = parseInt(buttonText);
        if (!isNaN(pageNumber)) {
            newPage = pageNumber;
        }
    }
    
    // Yalnızca yeni bir sayfa numarasına basıldıysa API'yi çağır
    if (newPage !== currentPage) {
        handleMovieRequest(newPage); 
    }
});


// Kartlara tıklandığında modal aç
document.addEventListener('click', e => {
    const card = e.target.closest('.catalog-movie-item');
    if (card && card.dataset.movieId) {
        openMovieModal(card.dataset.movieId);
    }
});

handleMovieRequest(1);