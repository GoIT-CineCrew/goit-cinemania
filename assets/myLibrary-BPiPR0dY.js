import{o as b}from"./modal-DSgPRClB.js";const d={},L="aaf24ac7ab7c5211361a71263e777bb9";let y=null;const o=document.querySelector(".library-dropdown-filter"),u=o.querySelector(".selected"),l=o.querySelector(".options");u.addEventListener("click",()=>{const r=o.classList.toggle("open");l.style.display=r?"block":"none"});document.addEventListener("click",r=>{o.contains(r.target)||(o.classList.remove("open"),l.style.display="none")});async function v(){const r=localStorage.getItem("tmdbGenresIdToName");if(r){Object.assign(d,JSON.parse(r));return}try{const t=await axios.get("https://api.themoviedb.org/3/genre/movie/list",{params:{api_key:L,language:"en-US"}}),s={};t.data.genres.forEach(e=>{s[e.id]=e.name}),Object.assign(d,s),localStorage.setItem("tmdbGenresIdToName",JSON.stringify(s))}catch(t){console.error("Türler yüklenemedi:",t)}}function S(){const r=localStorage.getItem("myMovieLibrary");if(!r)return[];const t=JSON.parse(r),s=new Set;return t.forEach(e=>{let n=[];Array.isArray(e.genre_ids)?n=e.genre_ids:Array.isArray(e.genres)&&(n=e.genres.map(a=>a.id)),n.forEach(a=>{d[a]&&s.add(a)})}),Array.from(s)}function A(){const r=S();l.innerHTML="";const t=document.createElement("div");t.classList.add("option","selected"),t.textContent="All Genres",t.dataset.value="",l.appendChild(t),r.forEach(s=>{const e=d[s];if(e){const n=document.createElement("div");n.classList.add("option"),n.textContent=e,n.dataset.value=s,l.appendChild(n)}}),E()}function E(){const r=document.querySelectorAll(".library-dropdown-filter .option");r.forEach(t=>{t.addEventListener("click",()=>{u.childNodes[0].textContent=t.textContent,r.forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),o.classList.remove("open"),l.style.display="none",y=t.dataset.value?Number(t.dataset.value):null,f()})})}document.addEventListener("DOMContentLoaded",async()=>{await v(),A(),f()});function f(){const r=document.querySelector(".library-movie-items");let t=JSON.parse(localStorage.getItem("myMovieLibrary"))||[];if(t.length===0){document.querySelector(".library-content").style.display="none",document.querySelector(".library-content-empty").style.display="block";return}let s=t;if(y&&(s=t.filter(e=>{let n=[];return Array.isArray(e.genre_ids)?n=e.genre_ids:Array.isArray(e.genres)&&(n=e.genres.map(a=>a.id)),n.includes(y)})),r.innerHTML="",s.length===0){r.innerHTML="<p class='no-results'>Seçilen türe ait film bulunmamaktadır.</p>";return}s.forEach(e=>{const n=e.title||"Unknown",a=e.poster_path?`https://image.tmdb.org/t/p/w300${e.poster_path}`:"./img/placeholder.jpg",i=e.vote_average??"N/A",m=e.release_date?e.release_date.slice(0,4):"N/A";let g=[];Array.isArray(e.genre_ids)?g=e.genre_ids:Array.isArray(e.genres)&&(g=e.genres.map(p=>p.id));const h=g.map(p=>d[p]).filter(Boolean).join(", "),c=document.createElement("li");c.classList.add("library-movie-item"),c.dataset.movieId=e.id,c.style.cursor="pointer",c.innerHTML=`
            <section class="card">
                <img
                    class="card-image"
                    src="${a}"
                    alt="${n}"
                    loading="lazy"
                />
                <div class="card-content">
                    <h2 class="card-title">${n}</h2>
                    <p class="card-info">
                        <span class="card-genre">${h}</span>
                       
                        | <span class="card-year">${m}</span>
                       
                    </p>
                    <ul class="card-rating">
                        ${I(i)}
                    </ul>
                </div>
            </section>
        `,r.appendChild(c)})}function I(r){const t=r/2,s=Math.floor(t),e=t%1>=.5?1:0,n=5-s-e;let a="";for(let i=0;i<s;i++)a+='<li><svg width="14" height="14"><use href="./img/sprite.svg#full-star"></use></svg></li>';e&&(a+='<li><svg width="14" height="14"><use href="./img/sprite.svg#half-star"></use></svg></li>');for(let i=0;i<n;i++)a+='<li><svg width="14" height="14"><use href="./img/sprite.svg#empty-star"></use></svg></li>';return a}document.addEventListener("click",r=>{const t=r.target.closest(".library-movie-item");t!=null&&t.dataset.movieId&&b(t.dataset.movieId)});
//# sourceMappingURL=myLibrary-BPiPR0dY.js.map
