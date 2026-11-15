/* ===== PART 3: surah.html məntiqi (səhifə ?n=2 ilə açılır) ===== */
(async()=>{
  const pg=$('#surahPage'), n=+pg.dataset.n, s={count:+pg.dataset.count}, BATCH=20; // Razor modeldən
  let loaded=0, busy=false;
  const list=$('#ayahList'), sentinel=$('#sentinel');

  async function loadMore(upTo=0){ // həmişə 20-20 gətirir; #a150 kimi keçiddə də 20-20 sorğu göndərir
    if(busy) return; busy=true;
    do{
      const to=Math.min(s.count,loaded+BATCH);
      if(to<=loaded) break;
      (await api.ayahs(n,loaded+1,to,document.documentElement.lang)).forEach(a=>renderAyah(a,list));
      loaded=to;
    }while(loaded<upTo);
    busy=false; setLang(document.documentElement.lang);
    sentinel.hidden=loaded>=s.count;
  }
  /* sonsuz scroll */
  new IntersectionObserver(e=>{if(e[0].isIntersecting)loadMore()},{rootMargin:'600px'}).observe(sentinel);
  $('#moreBtn').addEventListener('click',()=>loadMore());

  /* #a25 ilə gələndə həmin ayəyə qədər yüklə və ora sürüş */
  const target=+(location.hash.match(/^#a(\d+)$/)?.[1]||0);
  await loadMore(target);
  if(target) $(`#a${target}`)?.scrollIntoView({block:'center'});

  /* dil dəyişəndə tərcümələr yenilənsin */
  $('#lang').addEventListener('change',async()=>{const k=loaded;list.innerHTML='';loaded=0;await loadMore(k)});
})();
