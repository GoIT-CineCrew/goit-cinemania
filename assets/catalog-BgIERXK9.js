import{o as S}from"./modal-C75sch9z.js";const g={},y="aaf24ac7ab7c5211361a71263e777bb9",d="https://api.themoviedb.org/3",_="https://image.tmdb.org/t/p/w500",v=document.querySelector(".catalog-movie-items"),f=document.querySelector(".catalog-search input"),L=document.querySelector(".search-icon"),E=document.querySelector(".clear-button"),b=document.querySelector(".catalog-pages");document.querySelectorAll(".catalog-page-btn");const r=document.querySelector(".catalog-dropdown-filter"),m=r.querySelector(".selected"),h=r.querySelector(".options"),u=r.querySelectorAll(".option");let c=null,l=1;async function k(){if(!(Object.keys(g).length>0))try{(await axios.get(`${d}/genre/movie/list`,{params:{api_key:y,language:"en-US"}})).data.genres.forEach(t=>{g[t.id]=t.name})}catch(e){console.error("Türler yüklenemedi:",e)}}function q(e){const t=(e||0)/2,s=Math.floor(t),a=t%1>=.5?1:0,n=5-s-a;let o="";for(let i=0;i<s;i++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>';a&&(o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>');for(let i=0;i<n;i++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>';return o}function w(e){const t=e.release_date?e.release_date.slice(0,4):"N/A",s=e.genre_ids&&e.genre_ids.length>0?e.genre_ids.map(o=>g[o]).filter(Boolean).join(", "):"Unknown",a=e.poster_path?`${_}${e.poster_path}`:"./img/no-poster.jpg",n=q(e.vote_average);return`
      <li class="catalog-movie-item" data-movie-id="${e.id}">
        <section class="card" style="cursor: pointer;">
          <img
            class="card-image"
            src="${a}"
            alt="${e.title}"
            loading="lazy"
          />
          <div class="card-content">
            <h2 class="card-title">${e.title}</h2>
            <p class="card-info">
              <span class="card-genre">${s}</span> |
              <span class="card-year">${t}</span>
            </p>
            <ul class="card-rating">${n}</ul>
          </div>
        </section>
      </li>
    `}function x(e){v.innerHTML="",e.forEach(t=>{t.poster_path&&v.insertAdjacentHTML("beforeend",w(t))}),window.scrollTo({top:0,behavior:"smooth"})}function $(e){document.querySelectorAll(".catalog-page-btn").forEach(s=>{s.classList.remove("active");const a=s.textContent.trim().replace(/^0+/,"");parseInt(a)===e&&s.classList.add("active")}),l=e}async function p(e=1){await k();const t=f.value.trim();let s="",a={api_key:y,language:"en-US",page:e};t?(s=`${d}/search/movie`,a.query=t,c&&(a.primary_release_year=c)):c?(s=`${d}/discover/movie`,a.sort_by="popularity.desc",a.primary_release_year=c):s=`${d}/movie/popular`;try{const n=await axios.get(s,{params:a});x(n.data.results),$(e)}catch(n){console.error("Film isteği hatası:",n)}}m.addEventListener("click",()=>{const e=r.classList.toggle("open");h.style.display=e?"block":"none"});u.forEach(e=>{e.addEventListener("click",()=>{m.childNodes[0].textContent=e.textContent,u.forEach(t=>t.classList.remove("selected")),e.classList.add("selected"),r.classList.remove("open"),h.style.display="none",c=e.dataset.value})});document.addEventListener("click",e=>{r.contains(e.target)||(r.classList.remove("open"),h.style.display="none")});L.addEventListener("click",()=>{p(1)});f.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),L.click())});E.addEventListener("click",()=>{f.value="",c=null,m.childNodes[0].textContent="Year",u.forEach(t=>t.classList.remove("selected"));const e=Array.from(u).find(t=>t.dataset.value===void 0||t.textContent.trim()==="2025");e&&e.classList.add("selected"),p(1)});b.addEventListener("click",e=>{const t=e.target.closest(".catalog-page-btn");if(!t)return;let s=l;const a=t.textContent.trim().replace(/^0+/,"");if(t.classList.contains("prev-btn"))s=Math.max(1,l-1);else if(t.classList.contains("next-btn"))s=l+1;else{const n=parseInt(a);isNaN(n)||(s=n)}s!==l&&p(s)});document.addEventListener("click",e=>{const t=e.target.closest(".catalog-movie-item");t&&t.dataset.movieId&&S(t.dataset.movieId)});p(1);
//# sourceMappingURL=catalog-BgIERXK9.js.map
