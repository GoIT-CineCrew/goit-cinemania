import config from '../config.js'; // SENİN CONFIG DOSYAN

const { TMDB_API_KEY, TMDB_BASE_URL } = config;

async function setLibraryHeroBackground() {
  const heroElement = document.querySelector('.library-hero-bg');
  if (!heroElement) {
    console.log('library-hero-bg bulunamadı');
    return;
  }

  try {
    // 1. Kütüphaneyi al
    const raw = localStorage.getItem('myMovieLibrary');
    if (!raw) {
      console.log('Kütüphane yok – fallback kullanılıyor');
      return;
    }

    const library = JSON.parse(raw);
    if (!Array.isArray(library) || library.length === 0) {
      console.log('Kütüphane boş – fallback kullanılıyor');
      return;
    }

    // 2. Rastgele film seç (sadece ID olabilir)
    const randomItem = library[Math.floor(Math.random() * library.length)];
    const movieId = typeof randomItem === 'number' ? randomItem : randomItem.id;

    if (!movieId) {
      console.log('Geçerli ID yok');
      return;
    }

    console.log('Kütüphaneden seçilen film ID:', movieId);

    // 3. SENİN CONFIG’İNLE API’DEN TAM FİLM BİLGİSİNİ ÇEK
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );

    if (!res.ok) {
      console.log('API hatası:', res.status);
      return;
    }

    const movie = await res.json();

    // 4. Backdrop varsa → arka plan yap (senin hero.js ile aynı yapı)
    const backdropPath = movie?.backdrop_path;
    if (backdropPath) {
      const imageUrl = `https://image.tmdb.org/t/p/w1920${backdropPath}`;
      heroElement.style.backgroundImage = `url('${imageUrl}')`;
      heroElement.style.backgroundSize = 'cover';
      heroElement.style.backgroundPosition = 'center';
      heroElement.style.backgroundRepeat = 'no-repeat';
      console.log('Library hero yüklendi:', movie.title);
    } else {
      console.log('Backdrop yok:', movie.title);
    }
  } catch (error) {
    console.error('Library hero görseli yüklenemedi:', error);
  }
}

// HEMEN ÇALIŞTIR (partial olduğu için DOMContentLoaded beklemeye gerek yok)
setLibraryHeroBackground();
