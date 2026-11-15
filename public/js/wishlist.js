/* ===== PART 4: wishlist.html (20-20 sonsuz scroll) ===== */
(async()=>{
  const list=$('#ayahList'), empty=$('#empty'), sentinel=$('#sentinel');
  const LIMIT=20;
  let offset=0, total=null, busy=false;

  async function more(){
    if(busy || (total!==null && offset>=total)) return;
    busy=true;
    const r=await api.wishlist(offset, LIMIT);
    total=r.total;
    r.items.forEach(a=>{
      const el=renderAyah(a,list);
      $('.fav',el).addEventListener('click',()=>{ // ayah.js SQL-dən silir, burada kartı gizlədirik
        el.classList.add('leaving');
        setTimeout(()=>{
          el.remove();
          total--;
          offset--;
          empty.hidden=list.children.length>0;
          sentinel.hidden=offset>=total;
        },350);
      });
    });
    offset+=r.items.length;
    empty.hidden=total>0;
    sentinel.hidden=offset>=total;
    busy=false;
    setLang(document.documentElement.lang);
  }

  async function reset(){
    list.innerHTML=''; offset=0; total=null;
    await more();
  }

  new IntersectionObserver(e=>{if(e[0].isIntersecting)more()},{rootMargin:'600px'}).observe(sentinel);
  $('#moreBtn').addEventListener('click',more);

  await reset();
  $('#lang').addEventListener('change',reset);
})();

/* Server komponentdə onclick olmur: düymələr burada bağlanır */
$('#browseBtn')?.addEventListener('click',()=>$('#surahBtn').click());
