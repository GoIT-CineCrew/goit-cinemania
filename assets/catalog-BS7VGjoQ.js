import{o as S}from"./header-Dq3ZsvbK.js";const m={},d=document.querySelector(".catalog-dropdown-filter"),v=d.querySelector(".selected");v.querySelector(".arrow");const h=d.querySelector(".options"),f=d.querySelectorAll(".option");v.addEventListener("click",()=>{const e=d.classList.toggle("open");h.style.display=e?"block":"none"});f.forEach(e=>{e.addEventListener("click",()=>{v.childNodes[0].textContent=e.textContent,f.forEach(t=>t.classList.remove("selected")),e.classList.add("selected"),d.classList.remove("open"),h.style.display="none",l=e.dataset.value})});document.addEventListener("click",e=>{d.contains(e.target)||(d.classList.remove("open"),h.style.display="none")});const M="aaf24ac7ab7c5211361a71263e777bb9",p="https://api.themoviedb.org/3",$="https://image.tmdb.org/t/p/w500",L=document.querySelector(".catalog-movie-items"),y=document.querySelector(".catalog-search input"),E=document.querySelector(".search-icon"),_=document.querySelectorAll(".catalog-dropdown-filter .option"),w=document.querySelector(".clear-button"),i=document.querySelector(".catalog-pages .catalog-pages-list");let l=null,r=1,c=1;async function x(){if(!(Object.keys(m).length>0))try{(await axios.get(`${p}/genre/movie/list`,{params:{api_key:M,language:"en-US"}})).data.genres.forEach(t=>{m[t.id]=t.name})}catch(e){console.error("Türler yüklenemedi:",e)}}function A(e){const t=e/2,s=Math.floor(t),a=t%1>=.5?1:0,n=5-s-a;let o="";for(let u=0;u<s;u++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>';a&&(o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>');for(let u=0;u<n;u++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>';return o}function q(e){L.innerHTML="",e.forEach(t=>{t.poster_path&&L.insertAdjacentHTML("beforeend",T(t))}),window.scrollTo({top:0,behavior:"smooth"})}function T(e){const t=e.poster_path?`${$}${e.poster_path}`:"./img/Modal-Example.jpg",s=e.release_date?e.release_date.slice(0,4):"Rating not Found",a=e.genre_ids&&e.genre_ids.length>0?e.genre_ids.map(o=>m[o]).filter(Boolean).join(", "):"Genre not Found",n=A(e.vote_average);return`
      <li class="catalog-movie-item" data-movie-id="${e.id}">
        <section class="card" style="cursor: pointer;">
          <img
            class="card-image"
            src="${t}"
            alt="${e.title}"
            loading="lazy"
          />
          <div class="card-content">
            <h2 class="card-title">${e.title}</h2>
            <p class="card-info">
              <span class="card-genre">${a}</span> |
              <span class="card-year">${s}</span>
            </p>
            <ul class="card-rating">
              ${n}
            </ul>
          </div>
        </section>
      </li>
    `}function H(e,t){c=e>24?24:e,r=t,i.innerHTML="",i.insertAdjacentHTML("beforeend",`
        <li>
            <button type="button" class="catalog-page-btn prev-btn" ${r===1?"disabled":""}>
                <svg>
                    <use href="./img/sprite.svg#back-arrow-${r===1?"passive":"active"}-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `);const s=5;let a=Math.max(1,r-Math.floor(s/2)),n=Math.min(c,a+s-1);n-a+1<s&&(a=Math.max(1,n-s+1)),a>1&&(i.insertAdjacentHTML("beforeend",b(1,r)),a>2&&i.insertAdjacentHTML("beforeend",`
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `));for(let o=a;o<=n;o++)i.insertAdjacentHTML("beforeend",b(o,r));n<c&&(n<c-1&&i.insertAdjacentHTML("beforeend",`
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `),i.insertAdjacentHTML("beforeend",b(c,r))),i.insertAdjacentHTML("beforeend",`
        <li>
            <button type="button" class="catalog-page-btn next-btn" ${r===c?"disabled":""}>
                <svg>
                    <use href="./img/sprite.svg#forward-arrow-${r===c?"passive":"active"}-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `),P()}function b(e,t){const s=e===t;return`
        <li>
            <button type="button" class="catalog-page-btn page-number-btn ${s?"active":""}" data-page="${e}">
                <svg>
                    <use href="./img/sprite.svg#${s?"button-active-dark-mobile":"button-passive-dark-mobile"}"></use>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="${s?"white":"currentColor"}">${e.toString().padStart(2,"0")}</text>
                </svg>
            </button>
        </li>
    `}function P(){i.querySelectorAll(".catalog-page-btn").forEach(t=>{t.removeEventListener("click",k),t.addEventListener("click",k)})}function k(e){const t=e.currentTarget,s=t.classList.contains("prev-btn"),a=t.classList.contains("next-btn");if(s&&r>1)g(r-1);else if(a&&r<c)g(r+1);else if(t.classList.contains("page-number-btn")){const n=parseInt(t.dataset.page);n!==r&&g(n)}}async function g(e=1){await x();const t=y.value.trim();let s="",a={api_key:M,language:"en-US",page:e};t?(s=`${p}/search/movie`,a.query=t,l&&(a.primary_release_year=l)):l?(s=`${p}/discover/movie`,a.sort_by="popularity.desc",a.primary_release_year=l):s=`${p}/movie/popular`;try{const n=await axios.get(s,{params:a});q(n.data.results),H(n.data.total_pages,n.data.page)}catch(n){console.error("Film isteği hatası:",n)}}document.addEventListener("click",e=>{const t=e.target.closest(".catalog-movie-item");t!=null&&t.dataset.movieId&&S(t.dataset.movieId)});E.addEventListener("click",()=>{g(1)});_.forEach(e=>{e.addEventListener("click",()=>{l=e.dataset.value})});w.addEventListener("click",()=>{y.value="",l=null,v.childNodes[0].textContent="Year",f.forEach(t=>t.classList.remove("selected"));const e=Array.from(f).find(t=>t.dataset.value===void 0||t.textContent.trim()==="Year");e&&e.classList.add("selected"),g(1)});y.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),E.click())});g(1);
//# sourceMappingURL=catalog-BS7VGjoQ.js.map
