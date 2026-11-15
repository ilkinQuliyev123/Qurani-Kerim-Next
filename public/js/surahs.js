/* ===== PART 2 JS: surə siyahısı + modal (data: GET /api/surahs, SQL-dən) ===== */

/* Modal üçün tərcümə açarları (main.js-dəki I18N-ə əlavə) */
Object.assign(I18N.az,{filter:'Surə axtar',ayahs:'ayə',noSurah:'Belə surə tapılmadı'});
Object.assign(I18N.en,{filter:'Find a surah',ayahs:'verses',noSurah:'No surah found'});
Object.assign(I18N.ru,{filter:'Найти суру',ayahs:'аятов',noSurah:'Сура не найдена'});
Object.assign(I18N.tr,{filter:'Sure ara',ayahs:'ayet',noSurah:'Sure bulunamadı'});

let _surahs;
async function loadSurahs(){ return _surahs??=await http('/api/surahs'); }

const norm=s=>s.toLowerCase().replace(/ə/g,'e').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ç/g,'c').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ğ/g,'g').replace(/[-\s]/g,'');

(async()=>{
  const modal=$('#surahModal'), list=$('#surahList'), filter=$('#surahFilter'), empty=$('#surahEmpty');
  const surahs=await loadSurahs();

  list.innerHTML=surahs.map(s=>`<li data-k="${norm(s.name)} ${s.n}"><a href="/surah/${s.n}">
    <span class="no">${s.n}</span><span class="name">${s.name}</span>
    <span class="cnt"><b>${s.count}</b> <span data-i18n="ayahs"></span></span></a></li>`).join('');
  setLang(document.documentElement.lang); // yeni elementlərə tərcümə tətbiq et

  $('#surahBtn').addEventListener('click',()=>{modal.showModal();filter.value='';filter.dispatchEvent(new Event('input'));list.scrollTop=0;filter.focus()});
  $('#surahClose').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close()}); // kənara klik

  filter.addEventListener('input',()=>{
    const q=norm(filter.value); let shown=0;
    $$('#surahList li').forEach(li=>{const ok=li.dataset.k.includes(q);li.hidden=!ok;shown+=ok});
    empty.hidden=shown>0;
  });
})();
