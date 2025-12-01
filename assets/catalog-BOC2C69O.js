import{o as S}from"./theme-DEMsBgzz.js";const h={},d=document.querySelector(".catalog-dropdown-filter"),m=d.querySelector(".selected");m.querySelector(".arrow");const y=d.querySelector(".options"),v=d.querySelectorAll(".option");m.addEventListener("click",()=>{const e=d.classList.toggle("open");y.style.display=e?"block":"none"});v.forEach(e=>{e.addEventListener("click",()=>{m.childNodes[0].textContent=e.textContent,v.forEach(t=>t.classList.remove("selected")),e.classList.add("selected"),d.classList.remove("open"),y.style.display="none",c=e.dataset.value})});document.addEventListener("click",e=>{d.contains(e.target)||(d.classList.remove("open"),y.style.display="none")});const M="aaf24ac7ab7c5211361a71263e777bb9",f="https://api.themoviedb.org/3",_="https://image.tmdb.org/t/p/w500",k=document.querySelector(".catalog-movie-items"),L=document.querySelector(".catalog-search input"),$=document.querySelector(".search-icon"),x=document.querySelectorAll(".catalog-dropdown-filter .option"),A=document.querySelector(".clear-button"),o=document.querySelector(".catalog-pages .catalog-pages-list");let c=null,r=1,i=1;async function q(){if(!(Object.keys(h).length>0))try{(await axios.get(`${f}/genre/movie/list`,{params:{api_key:M,language:"en-US"}})).data.genres.forEach(t=>{h[t.id]=t.name})}catch(e){console.error("Türler yüklenemedi:",e)}}function w(e,t=!1){const a=e/2,s=Math.floor(a),n=a-s>=.5,l=5-s-(n?1:0);let p="";for(let u=0;u<s;u++)p+='<li><svg class="star-svg"><use href="./img/sprite.svg#full-star"></use></svg></li>';n&&(p+='<li><svg class="star-svg"><use href="./img/sprite.svg#half-star"></use></svg></li>');for(let u=0;u<l;u++)p+='<li><svg class="star-svg"><use href="./img/sprite.svg#empty-star"></use></svg></li>';return p}function H(e){k.innerHTML="",e.forEach(t=>{t.poster_path&&k.insertAdjacentHTML("beforeend",T(t))}),window.scrollTo({top:0,behavior:"smooth"})}function T(e){const t=e.poster_path?`${_}${e.poster_path}`:"./img/Modal-Example.jpg",a=e.release_date?e.release_date.slice(0,4):"Rating not Found",s=e.genre_ids&&e.genre_ids.length>0?e.genre_ids.map(l=>h[l]).filter(Boolean).join(", "):"Genre not Found",n=w(e.vote_average);return`
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
              <span class="card-genre">${s}</span> |
              <span class="card-year">${a}</span>
            </p>
            <ul class="card-rating">
              ${n}
            </ul>
          </div>
        </section>
      </li>
    `}function P(e,t){i=e>24?24:e,r=t,o.innerHTML="",o.insertAdjacentHTML("beforeend",`
        <li>
            <button type="button" class="catalog-page-btn prev-btn" ${r===1?"disabled":""}>
                <svg>
                    <use href="./img/sprite.svg#back-arrow-${r===1?"passive":"active"}-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `);const a=5;let s=Math.max(1,r-Math.floor(a/2)),n=Math.min(i,s+a-1);n-s+1<a&&(s=Math.max(1,n-a+1)),s>1&&(o.insertAdjacentHTML("beforeend",b(1,r)),s>2&&o.insertAdjacentHTML("beforeend",`
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `));for(let l=s;l<=n;l++)o.insertAdjacentHTML("beforeend",b(l,r));n<i&&(n<i-1&&o.insertAdjacentHTML("beforeend",`
                <li>
                    <button type="button" class="catalog-page-btn dots-btn" disabled>
                        <svg><use href="./img/sprite.svg#dots-dark-mobile"></use></svg>
                    </button>
                </li>
            `),o.insertAdjacentHTML("beforeend",b(i,r))),o.insertAdjacentHTML("beforeend",`
        <li>
            <button type="button" class="catalog-page-btn next-btn" ${r===i?"disabled":""}>
                <svg>
                    <use href="./img/sprite.svg#forward-arrow-${r===i?"passive":"active"}-dark-mobile"></use>
                </svg>
            </button>
        </li>
    `),j()}function b(e,t){const a=e===t;return`
        <li>
            <button type="button" class="catalog-page-btn page-number-btn ${a?"active":""}" data-page="${e}">
                <svg>
                    <use href="./img/sprite.svg#${a?"button-active-dark-mobile":"button-passive-dark-mobile"}"></use>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="${a?"white":"currentColor"}">${e.toString().padStart(2,"0")}</text>
                </svg>
            </button>
        </li>
    `}function j(){o.querySelectorAll(".catalog-page-btn").forEach(t=>{t.removeEventListener("click",E),t.addEventListener("click",E)})}function E(e){const t=e.currentTarget,a=t.classList.contains("prev-btn"),s=t.classList.contains("next-btn");if(a&&r>1)g(r-1);else if(s&&r<i)g(r+1);else if(t.classList.contains("page-number-btn")){const n=parseInt(t.dataset.page);n!==r&&g(n)}}async function g(e=1){await q();const t=L.value.trim();let a="",s={api_key:M,language:"en-US",page:e};t?(a=`${f}/search/movie`,s.query=t,c&&(s.primary_release_year=c)):c?(a=`${f}/discover/movie`,s.sort_by="popularity.desc",s.primary_release_year=c):a=`${f}/movie/popular`;try{const n=await axios.get(a,{params:s});H(n.data.results),P(n.data.total_pages,n.data.page)}catch(n){console.error("Film isteği hatası:",n)}}document.addEventListener("click",e=>{const t=e.target.closest(".catalog-movie-item");t!=null&&t.dataset.movieId&&S(t.dataset.movieId)});$.addEventListener("click",()=>{g(1)});x.forEach(e=>{e.addEventListener("click",()=>{c=e.dataset.value})});A.addEventListener("click",()=>{L.value="",c=null,m.childNodes[0].textContent="Year",v.forEach(t=>t.classList.remove("selected"));const e=Array.from(v).find(t=>t.dataset.value===void 0||t.textContent.trim()==="Year");e&&e.classList.add("selected"),g(1)});L.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),$.click())});g(1);
//# sourceMappingURL=catalog-BOC2C69O.js.map
