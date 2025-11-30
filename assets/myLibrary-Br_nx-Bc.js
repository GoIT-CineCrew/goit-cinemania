import{o as k}from"./modal-D8toTW-r.js";const g={},E="aaf24ac7ab7c5211361a71263e777bb9",r=document.querySelector(".library-dropdown-filter"),u=r.querySelector(".selected"),y=r.querySelector(".options"),L=r.querySelectorAll(".option");let p=null;u.addEventListener("click",()=>{r.classList.toggle("open"),y.style.display=r.classList.contains("open")?"block":"none"});document.querySelectorAll(".library-dropdown-filter .option").forEach(t=>{t.addEventListener("click",()=>{u.childNodes[0].textContent=t.textContent,p={romance:10749,detective:9648,thriller:53,action:28,documentary:99,horror:27}[t.dataset.value]||null,r.classList.remove("open"),y.style.display="none",m()})});document.addEventListener("click",t=>{r.contains(t.target)||(r.classList.remove("open"),y.style.display="none")});async function _(){if(!(Object.keys(g).length>0))try{(await axios.get("https://api.themoviedb.org/3/genre/movie/list",{params:{api_key:E,language:"en-US"}})).data.genres.forEach(n=>{g[n.id]=n.name})}catch(t){console.error("Türler yüklenemedi:",t)}}function q(t){const n=(t||0)/2,e=Math.floor(n),s=n-e>=.5?1:0,c=5-e-s;let o="";for(let l=0;l<e;l++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>';s&&(o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>');for(let l=0;l<c;l++)o+='<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>';return o}L.forEach(t=>{t.addEventListener("click",()=>{u.childNodes[0].textContent=t.textContent,L.forEach(s=>s.classList.remove("selected")),t.classList.add("selected"),r.classList.remove("open"),y.style.display="none";const n=t.dataset.value;p={romance:10749,detective:9648,thriller:53,action:28,documentary:99,horror:27}[n]??null,m()})});async function m(){await _();let t=JSON.parse(localStorage.getItem("myMovieLibrary"))||"[]";const n=document.querySelector(".library-movie-items");if(t.length===0){document.querySelector(".library-content").style.display="none",document.querySelector(".library-content-empty").style.display="block";return}document.querySelector(".library-content").style.display="block",document.querySelector(".library-content-empty").style.display="none",n.innerHTML="",t.forEach(e=>{var h,f,b;let s=[];const c=e.title||"Unknown",o=e.poster_path?`https://image.tmdb.org/t/p/w300${e.poster_path}`:"./img/placeholder.jpg",l=e.vote_average??"N/A";if(e.genre_ids?s=e.genre_ids:e.genres?s=e.genres.map(a=>a.id):e.genre_names&&(s=e.genre_names.map(a=>{const v=Object.entries(g).find(([w,S])=>S===a);return v?Number(v[0]):null}).filter(Boolean)),p&&!s.includes(p))return;let d="Unknown";(h=e.genres)!=null&&h.length?d=e.genres.map(a=>a.name).join(", "):(f=e.genre_names)!=null&&f.length?d=e.genre_names.join(", "):(b=e.genre_ids)!=null&&b.length&&(d=e.genre_ids.map(a=>g[a]).filter(Boolean).join(", "));const i=document.createElement("li");i.classList.add("library-movie-item"),i.dataset.movieId=e.id,i.style.cursor="pointer",i.innerHTML=`
      <section class="card">
        <img
          class="card-image"
          src="${o}"
          alt="${c}"
          loading="lazy"
        />
        <div class="card-content">
          <h2 class="card-title">${c}</h2>
          <p class="card-info">
            <span class="card-genre">${d}</span>
          </p>
          <ul class="card-rating">
            ${q(l)}
          </ul>
        </div>
      </section>
    `,n.appendChild(i)})}document.addEventListener("click",t=>{const n=t.target.closest(".library-movie-item");n&&n.dataset.movieId&&k(n.dataset.movieId)});m();
//# sourceMappingURL=myLibrary-Br_nx-Bc.js.map
