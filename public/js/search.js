/* ===== PART 3: search.html (?q=3:2 və ya ?q=həmd), 20-20 sonsuz scroll ===== */
(async()=>{
  const q=(new URLSearchParams(location.search).get('q')||'').trim(), LIMIT=20;
  $('#q').value=q; $('#term').textContent=q;
  const list=$('#ayahList'), sentinel=$('#sentinel');
  let offset=0,total=null,busy=false;

  async function more(){
    if(busy||(total!==null&&offset>=total)) return; busy=true;
    const r=await api.search(q,document.documentElement.lang,offset,LIMIT);
    total=r.total; r.items.forEach(a=>renderAyah(a,list)); offset+=r.items.length;
    $('#none').hidden=total>0; $('#total').textContent=total?`(${total})`:'';
    sentinel.hidden=offset>=total; busy=false; setLang(document.documentElement.lang);
  }
  async function reset(){list.innerHTML='';offset=0;total=null;await more()}
  new IntersectionObserver(e=>{if(e[0].isIntersecting)more()},{rootMargin:'600px'}).observe(sentinel);
  $('#moreBtn').addEventListener('click',more);
  await reset();
  $('#lang').addEventListener('change',reset);
})();
