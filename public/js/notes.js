/* ===== PART 4: notes.html (20-20 sonsuz scroll) ===== */
(async()=>{
  const list=$('#noteList'), form=$('#noteForm'), err=$('#formErr'), dlg=$('#confirm'), sentinel=$('#sentinel');
  const LIMIT=20;
  let offset=0, total=null, busy=false, delId=null;
  const L=()=>document.documentElement.lang, T=k=>I18N[L()][k];

  async function noteCard(n){
    const [s,v]=split(n.ref), a={arabic:n.arabic};
    const el=document.createElement('article'); el.className='ayah note'; el.dataset.id=n.id;
    el.innerHTML=`
      <div class="ayah__bar">
        <a class="ayah__no" href="/surah/${s}#a${v}">${n.ref}</a>
        <time class="note__date">${new Date(n.date).toLocaleDateString(L())}</time>
      </div>
      <p class="note__ar" lang="ar">${esc(a.arabic)}</p>
      <p class="note__text">${esc(n.text)}</p>
      <div class="note__acts">
        <button class="btn" data-act="edit">${T('edit')}</button>
        <button class="btn" data-act="del">${T('del')}</button>
      </div>`;
    initDust(el); return el;
  }

  async function more(){
    if(busy || (total!==null && offset>=total)) return;
    busy=true;
    const r=await api.notes(offset, LIMIT);
    total=r.total;
    for(const n of r.items){
      list.appendChild(await noteCard(n));
    }
    offset+=r.items.length;
    $('#noNotes').hidden=total>0;
    sentinel.hidden=offset>=total;
    busy=false;
    setLang(L());
  }

  async function reset(){
    list.innerHTML=''; offset=0; total=null;
    await more();
  }

  new IntersectionObserver(e=>{if(e[0].isIntersecting)more()},{rootMargin:'600px'}).observe(sentinel);
  $('#moreBtn').addEventListener('click',more);

  /* Yeni qeyd (frontda yoxlama; backend də təkrar yoxlayacaq) */
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const ref=form.ref.value.trim().replace(/\s/g,''), text=form.text.value.trim();
    if(!/^\d{1,3}:\d{1,3}$/.test(ref)) return err.textContent=T('badRef');
    if(!text) return err.textContent=T('emptyNote');
    err.textContent='';
    try{await api.addNote(ref,text)}catch(x){return err.textContent=T(x.data?.err||'badRef')}
    form.text.value='';
    await reset();
  });
  const pre=new URLSearchParams(location.search).get('ref'); if(pre){form.ref.value=pre;form.text.focus()}

  /* Dəyiş / Sil */
  list.addEventListener('click',async e=>{
    const b=e.target.closest('[data-act]'); if(!b) return;
    const card=b.closest('.note'), id=+card.dataset.id, p=$('.note__text',card);
    if(b.dataset.act==='del'){delId=id;dlg.showModal();return}
    if(b.dataset.act==='edit'){
      const ta=document.createElement('textarea'); ta.className='field'; ta.value=p.textContent; p.replaceWith(ta); ta.focus();
      $('.note__acts',card).innerHTML=`<button class="btn btn--solid" data-act="save">${T('save')}</button><button class="btn" data-act="cancel">${T('cancel')}</button>`;
    }
    if(b.dataset.act==='save'){const t=$('textarea',card).value.trim(); if(t){await api.updateNote(id,t);await reset()}}
    if(b.dataset.act==='cancel') await reset();
  });
  $('#yes').addEventListener('click',async()=>{await api.deleteNote(delId);dlg.close();await reset()});
  $('#no').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});

  await reset();
  $('#lang').addEventListener('change',async()=>{await reset();setLang(L())});
})();
