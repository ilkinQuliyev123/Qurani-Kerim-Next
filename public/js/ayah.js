/* ===== PART 3: ortaq ayə modulu (surah.html və search.html istifadə edir) =====
   Yüklənmə sırası: main.js → surahs.js → ayah.js → səhifənin öz js-i
   DİQQƏT: main.js-dən köhnə "Wishlist ♥" və "Sehirli toz" bloklarını SİL, onlar artıq bu faylda. */

/* --- Backend API (C#: QuranApiController) --- */
const api={
  ayahs:(surah,from,to,lang)=>http(`/api/surahs/${surah}/ayahs?from=${from}&to=${to}&lang=${lang}`),
  search:(q,lang,offset=0,limit=20)=>http(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}&offset=${offset}&limit=${limit}`),
  commentaries:(s,n)=>http(`/api/surahs/${s}/ayahs/${n}/commentaries`),
  comments:id=>http(`/api/ayahs/${id}/comments`),
  addComment:(id,text)=>http(`/api/ayahs/${id}/comments`,{method:'POST',body:{text}}),
  delComment:id=>http(`/api/comments/${id}`,{method:'DELETE'})
};

/* --- Ayə kartı --- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function renderAyah(a,container){
  const el=document.createElement('article');
  el.className='ayah'; el.id=`a${a.num}`; el.dataset.id=a.id; el.dataset.surah=a.surah; el.dataset.num=a.num;
  el.innerHTML=`
    <div class="ayah__bar">
      <a class="ayah__no" href="/surah/${a.surah}#a${a.num}">${a.ref}</a>
      <div class="ayah__acts">
        <button class="icon-btn tf" aria-label="Commentary" title="Təfsir">📖</button>
        <button class="icon-btn cm" aria-label="Comments">💬 <small>${a.comments}</small></button>
        <button class="icon-btn fav${a.fav?' on':''}" aria-label="Wishlist">♥</button>
        <button class="icon-btn" aria-label="Note">✎</button>
      </div>
    </div>
    <p class="ayah__ar" lang="ar">${esc(a.arabic)}</p>
    ${a.words.length?`<table class="words">
      <thead><tr><th data-i18n="word"></th><th data-i18n="latin"></th><th data-i18n="meaning"></th></tr></thead>
      <tbody>${a.words.map(w=>`<tr><td lang="ar">${esc(w.ar)}</td><td>${esc(w.lat)}</td><td>${esc(w.mean)}</td></tr>`).join('')}</tbody>
    </table>`:''}
    <p class="ayah__tr">${esc(a.translation)}</p>`;
  initDust(el);
  container.appendChild(el);
  return el;
}

/* --- Sehirli toz (hər kart üçün) --- */
function initDust(card){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let t;
  card.addEventListener('mouseenter',()=>{t=setInterval(()=>{
    const p=document.createElement('i'),s=2+Math.random()*4;
    p.className='dust';
    p.style.cssText=`--s:${s}px;--t:${1.6+Math.random()*1.6}s;--dx:${(Math.random()-.5)*50}px;--dy:${60+Math.random()*90}px;left:${Math.random()*100}%;top:${Math.random()*25}%`;
    card.appendChild(p); setTimeout(()=>p.remove(),3500);
  },90)});
  card.addEventListener('mouseleave',()=>clearInterval(t));
}


/* --- Yeni tərcümə açarları --- */
Object.assign(I18N.az,{prev:'Əvvəlki surə',next:'Növbəti surə',more:'Daha çox ayə',results:'Axtarış nəticəsi',none:'Heç nə tapılmadı. 3:2 və ya ərəbcə/azərbaycanca söz yoxla.',bismillah:'Rəhman və Rəhim Allahın adı ilə'});
Object.assign(I18N.en,{prev:'Previous surah',next:'Next surah',more:'Load more verses',results:'Search results',none:'Nothing found. Try 3:2 or a word.',bismillah:'In the name of God, the Most Gracious, the Most Merciful'});
Object.assign(I18N.ru,{prev:'Предыдущая сура',next:'Следующая сура',more:'Показать ещё',results:'Результаты поиска',none:'Ничего не найдено. Попробуйте 3:2 или слово.',bismillah:'Во имя Аллаха, Милостивого, Милосердного'});
Object.assign(I18N.tr,{prev:'Önceki sure',next:'Sonraki sure',more:'Daha fazla ayet',results:'Arama sonuçları',none:'Bulunamadı. 3:2 veya bir kelime dene.',bismillah:'Rahman ve Rahim olan Allah’ın adıyla'});

/* --- Təfsir / şərhlər (WorkFlowy-dən): 📖 düyməsi müəllif-müəllif açılan siyahı göstərir --- */
document.addEventListener('click',async e=>{
  const b=e.target.closest('.ayah .tf'); if(!b) return;
  const card=b.closest('.ayah'); let box=$('.tafsir',card);
  if(box){box.remove();return}
  box=document.createElement('div'); box.className='tafsir'; box.textContent='…'; card.appendChild(box);
  try{
    const list=await api.commentaries(card.dataset.surah,card.dataset.num);
    box.innerHTML=list.length?list.map(c=>`<details><summary>${esc(c.title||'—')}</summary><p>${esc(c.text)}</p></details>`).join(''):'<p class="none">—</p>';
  }catch{box.remove()}
});

/* --- Şərhlər (SQL-də saxlanır): 💬 düyməsi kartın altında paneli açır --- */
document.addEventListener('click',async e=>{
  const b=e.target.closest('.ayah .cm'); if(!b) return;
  const card=b.closest('.ayah'), id=card.dataset.id; let box=$('.cmts',card);
  if(box){box.remove();return}
  box=document.createElement('div'); box.className='cmts'; card.appendChild(box);
  const T=k=>I18N[document.documentElement.lang][k], cnt=$('small',b);
  async function draw(){
    const list=await api.comments(id); cnt.textContent=list.length;
    box.innerHTML=`<h4>${T('comments')}</h4>
      ${authed?`<form class="cmts__f"><textarea class="field" maxlength="1000" placeholder="${T('cmPh')}"></textarea><button class="btn btn--solid">${T('send')}</button></form>`
              :`<p><a href="/login">${T('loginToCm')}</a></p>`}
      ${list.length?list.map(c=>`<div class="cmt"><b>${esc(c.user)}</b> <time>${new Date(c.date).toLocaleString(document.documentElement.lang)}</time>
        ${c.mine||document.body.dataset.admin?`<button class="icon-btn" data-cdel="${c.id}" aria-label="Delete">✕</button>`:''}<p>${esc(c.text)}</p></div>`).join('')
        :`<p class="none">${T('noCm')}</p>`}`;
    $('form',box)?.addEventListener('submit',async ev=>{ev.preventDefault();const t=$('textarea',box).value.trim();if(t){await api.addComment(id,t);draw()}});
  }
  box.addEventListener('click',async ev=>{const d=ev.target.closest('[data-cdel]');if(d){await api.delComment(d.dataset.cdel);draw()}});
  draw();
});

/* ♥ və ✎ düymələri bütün səhifələrdə — bəyənmə SQL-də saxlanır */
document.addEventListener('click',async e=>{
  const card=e.target.closest('.ayah:not(.note)'); if(!card) return;
  const fav=e.target.closest('.fav'), note=e.target.closest('[aria-label="Note"]');
  if((fav||note)&&!authed){location.href='/login';return}
  if(fav){const r=await http(`/api/wishlist/${card.dataset.id}`,{method:'POST'});fav.classList.toggle('on',r.on)}
  if(note) location.href=`/notes?ref=${$('.ayah__no',card).textContent.trim()}`;
});
