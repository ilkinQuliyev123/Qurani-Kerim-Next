/* ===== PART 6: Admin panel — ayələr SQL-də (C#: AdminApiController, yalnız Admin rolu) =====
   Yükləmə sırası: main.js → surahs.js → admin.js */
const PAGE=20;
const adminApi={
  list:(surah,q,page)=>http(`/api/admin/ayahs?surah=${surah}&q=${encodeURIComponent(q)}&page=${page}`),
  get:id=>http(`/api/admin/ayahs/${id}`),
  next:surah=>http(`/api/admin/ayahs/next/${surah}`),
  save:a=>a.id?http(`/api/admin/ayahs/${a.id}`,{method:'PUT',body:a}):http('/api/admin/ayahs',{method:'POST',body:a}),
  del:id=>http(`/api/admin/ayahs/${id}`,{method:'DELETE'})
};

let surahs=[], surah=1, q='', page=1, total=0, cur=null, lang='az';
const $tb=$('#tbody'), dlg=$('#editor'), toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200)};
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function load(){
  const r=await adminApi.list(surah,q,page); total=r.total; const pages=Math.max(1,Math.ceil(total/PAGE));
  if(page>pages){page=pages;return load()}
  $tb.innerHTML=r.items.map(a=>`<tr data-id="${a.id}">
    <td><b>${a.ref}</b></td><td class="ar" lang="ar">${esc2(a.arabic)}</td><td class="tr">${esc2(a.tr.az||'')}</td><td class="tr">${esc2(a.tr.tr||'')}</td>
    <td><button class="btn" data-edit>Redaktə</button></td></tr>`).join('');
  $('#none').hidden=total>0; $('#pinfo').textContent=`${page} / ${pages}  (${total} ayə)`;
  $('#prev').disabled=page<=1; $('#next').disabled=page>=pages;
}

/* --- Redaktə pəncərəsi --- */
function drawLang(){
  $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.l===lang));
  $('#fTr').value=cur.tr[lang]||'';
  $('#fWords').innerHTML=cur.words.map((w,i)=>`<tr data-i="${i}">
    <td><input class="field" dir="rtl" lang="ar" data-k="ar" value="${esc2(w.ar)}"></td>
    <td><input class="field" data-k="lat" value="${esc2(w.lat)}"></td>
    <td><input class="field" data-k="mean" value="${esc2(w.mean[lang]||'')}"></td>
    <td><button type="button" class="icon-btn" data-del aria-label="Sözü sil">✕</button></td></tr>`).join('');
}
function openEdit(a){
  cur=JSON.parse(JSON.stringify(a)); cur.tr??={}; lang='az';
  $('#eTitle').textContent=a.id?`Ayə ${a.ref}`:'Yeni ayə'; $('#numRow').hidden=!!a.id; $('#eDel').hidden=!a.id;
  $('#fNum').value=a.num||''; $('#fAr').value=cur.arabic; $('#eErr').textContent=''; drawLang(); dlg.showModal();
}
$('#addAyah').addEventListener('click',async()=>openEdit({surah,num:await adminApi.next(surah),arabic:'',tr:{},words:[]}));
$('#fNum').addEventListener('input',e=>cur.num=+e.target.value);
$('#eDel').addEventListener('click',async()=>{if(!confirm(`${cur.ref} silinsin?`))return;await adminApi.del(cur.id);dlg.close();toast('Silindi');load()});
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b){lang=b.dataset.l;drawLang()}});
$('#fAr').addEventListener('input',e=>cur.arabic=e.target.value);
$('#fTr').addEventListener('input',e=>cur.tr[lang]=e.target.value);
$('#fWords').addEventListener('input',e=>{const i=+e.target.closest('tr').dataset.i,k=e.target.dataset.k;k==='mean'?cur.words[i].mean[lang]=e.target.value:cur.words[i][k]=e.target.value});
$('#fWords').addEventListener('click',e=>{if(e.target.closest('[data-del]')){cur.words.splice(+e.target.closest('tr').dataset.i,1);drawLang()}});
$('#addWord').addEventListener('click',()=>{cur.words.push({ar:'',lat:'',mean:{az:'',en:'',ru:'',tr:''}});drawLang()});
$('#eCancel').addEventListener('click',()=>dlg.close());
$('#eSave').addEventListener('click',async()=>{
  if(!cur.arabic.trim()) return $('#eErr').textContent='Ərəbcə mətn boş ola bilməz';
  if(!(cur.tr.az||'').trim()) return $('#eErr').textContent='Azərbaycanca tərcümə məcburidir';
  if(cur.words.some(w=>!w.ar.trim()||!w.lat.trim())) return $('#eErr').textContent='Hər sözün ərəbcəsi və oxunuşu dolu olmalıdır';
  try{await adminApi.save(cur)}catch(x){return $('#eErr').textContent=x.data?.err||'Xəta'}
  dlg.close(); toast('Yadda saxlandı (SQL)'); _surahs=null; load();
});
$tb.addEventListener('click',async e=>{if(e.target.closest('[data-edit]'))openEdit(await adminApi.get(e.target.closest('tr').dataset.id))});

/* --- Toolbar --- */
let tm; $('#aq').addEventListener('input',e=>{clearTimeout(tm);tm=setTimeout(()=>{q=e.target.value;page=1;load()},250)}); // canlı axtarış (debounce)
$('#surahSel').addEventListener('change',e=>{surah=+e.target.value;page=1;load()});
$('#prev').addEventListener('click',()=>{page--;load()}); $('#next').addEventListener('click',()=>{page++;load()});

(async()=>{
  surahs=await loadSurahs();
  $('#surahSel').innerHTML=surahs.map(s=>`<option value="${s.n}">${s.n}. ${s.name} (${s.count})</option>`).join('');
  await load();
})();

/* onclick/onsubmit əvəzinə */
$('#eCancel2')?.addEventListener('click',()=>dlg.close());
$('#editor form')?.addEventListener('submit',e=>e.preventDefault());
