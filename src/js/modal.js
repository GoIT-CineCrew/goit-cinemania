import config from '../config.js';

let modal, closeBtn, libraryBtn;

// Modal yüklendi mi diye sürekli kontrol eden fonksiyon
function waitForModal() {
  return new Promise(resolve => {
    const check = () => {
      modal = document.getElementById('movie-modal');
      closeBtn = document.getElementById('modal-close-btn');
      libraryBtn = document.getElementById('modal-library-btn');

      if (modal && closeBtn && libraryBtn) {
        setupModalEvents();
        resolve();
      } else {
        requestAnimationFrame(check); // 60fps'de sürekli kontrol et
      }
    };
    check();
  });
}

// Modal event’lerini bir kere kur
function setupModalEvents() {
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop')) closeModal();
  });
}

function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = '';
  const wrapper = document.getElementById('modal-trailer-wrapper');
  const iframe = document.getElementById('modal-trailer-iframe');
  if (wrapper) wrapper.style.display = 'none';
  if (iframe) iframe.src = '';
}

// Ana fonksiyon – artık her yerden güvenle çağırılabilir
export async function openMovieModal(movieId) {
  await waitForModal(); // modal gelene kadar bekle

  try {
    const [movieRes, videoRes] = await Promise.all([
      axios.get(
        `${config.TMDB_BASE_URL}/movie/${movieId}?api_key=${config.TMDB_API_KEY}`
      ),
      axios.get(
        `${config.TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${config.TMDB_API_KEY}`
      ),
    ]);

    const movie = movieRes.data;
    const trailer = videoRes.data.results.find(
      v => v.site === 'YouTube' && v.type === 'Trailer'
    );

    // Artık null olma ihtimali YOK
    document.getElementById('modal-poster').src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : './img/no-poster.jpg';

    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-vote').textContent =
      movie.vote_average.toFixed(1);
    document.getElementById('modal-votes').textContent = movie.vote_count;
    document.getElementById('modal-popularity').textContent = Math.round(
      movie.popularity
    );

    // API'den gelen gerçek tür isimleri
    const genreElement = document.getElementById('modal-genre');

    if (movie.genres && movie.genres.length > 0) {
      const genres = movie.genres.map(g => g.name);

      // Mobil için: maksimum 2 tür + "..."
      // Tablet & Desktop: maksimum 3 tür + "..."
      const isMobile = window.innerWidth < 768;
      const maxGenres = isMobile ? 2 : 3;

      if (genres.length <= maxGenres) {
        genreElement.textContent = genres.join(', ');
      } else {
        const visible = genres.slice(0, maxGenres).join(', ');
        const remaining = genres.length - maxGenres;
        genreElement.textContent = `${visible} +${remaining}`;
        // Bonus: hover’da tüm türleri göster (çok şık olur)
        genreElement.title = genres.join(', ');
      }
    } else {
      genreElement.textContent = '—';
    }

    document.getElementById('modal-overview').textContent =
      movie.overview || 'Açıklama yok.';

    // Trailer gösterimi için kullanılan yapı
    const trailerWrapper = document.getElementById('modal-trailer-wrapper');
    const iframe = document.getElementById('modal-trailer-iframe');
    if (trailer && trailerWrapper && iframe) {
      trailerWrapper.style.display = 'block';
      iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
    } else if (trailerWrapper) {
      trailerWrapper.style.display = 'none';
    }

    // Kütüphaneye ekle butonu - addToLibrary ile birlikte localStorage içerisine verileri ekleyebildiğimiz bir sistem oluşturuyoruz.
    // Filmin kütüphanede olup olmadığını kontrol et
    const isInLibrary = isMovieInLibrary(movie);

    if (isInLibrary) {
      // Kütüphanedeyse: "Kaldır" butonu ayarları
      libraryBtn.textContent = 'Remove from library';
      libraryBtn.disabled = false;
      libraryBtn.onclick = () => removeFromLibrary(movie);
    } else {
      // Kütüphanede değilse: "Ekle" butonu ayarları
      libraryBtn.textContent = 'Add to my library';
      libraryBtn.disabled = false;
      libraryBtn.onclick = () => addToLibrary(movie);
    }

    modal.classList.add('show'); // flex’i aç
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('Modal hatası:', err);
    alert('Movie details could not be loaded!');
  }
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const d = new Date(dateString);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Add to my library fonksiyonu - LocalStorage içerisine mevcut filmlerin verilerini json oluşturup, oraya ekleyen bir yapı kuruldu.
function addToLibrary(movie) {
  const library = JSON.parse(localStorage.getItem('myMovieLibrary') || '[]');

  if (library.some(m => m.id === movie.id)) {
    alert('This movie is already in your library!');
    return;
  }

  library.push(movie);

  try {
    localStorage.setItem('myMovieLibrary', JSON.stringify(library));

    alert(`${movie.title} added to your library.`);

    //  Başarılı ekleme sonrası butonu "Kaldır" moduna geçir
    libraryBtn.textContent = 'Remove from library';
    libraryBtn.disabled = false;
    libraryBtn.onclick = () => removeFromLibrary(movie); // Kaldırma fonksiyonunu bağla
  } catch (error) {
    console.error("Local storage'a kaydetme hatası:", error);
    alert('Filmi eklerken bir sorun oluştu.');
  }
}

// Kütüphanede olup olmadığını kontrol eden fonksiyon
function isMovieInLibrary(movie) {
  const library = JSON.parse(localStorage.getItem('myMovieLibrary') || '[]');
  // Filmin ID'sini kontrol et
  return library.some(m => m.id === movie.id);
}

function removeFromLibrary(movie) {
  let library = JSON.parse(localStorage.getItem('myMovieLibrary') || '[]');

  // Kaldırılmak istenen filme ait olmayanları filtrele
  const updatedLibrary = library.filter(m => m.id !== movie.id);

  try {
    localStorage.setItem('myMovieLibrary', JSON.stringify(updatedLibrary));

    alert(`${movie.title} kütüphanenizden kaldırıldı.`);

    // İşlem sonrası butonu "Ekle" moduna geri geçir (Anlık güncelleme)
    libraryBtn.textContent = 'Add to my library';
    libraryBtn.disabled = false;
    libraryBtn.onclick = () => addToLibrary(movie);
  } catch (error) {
    console.error("Local storage'dan silme hatası:", error);
    alert('Kaldırılırken bir sorun oluştu.');
  }
}
