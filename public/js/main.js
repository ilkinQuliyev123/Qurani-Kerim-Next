/* ===== PART 1 JS: tema, dil ===== */
const I18N = {
  az:{surahs:'Surələr',wishlist:'Bəyəndiklərim',notes:'Qeydlərim',search:'Axtar: 3:2 və ya söz',login:'Daxil ol',register:'Qeydiyyat',word:'Ərəbcə söz',latin:'Oxunuşu',meaning:'Mənası',footer:'Qurani-Kərim — oxu, düşün, yadda saxla'},
  en:{surahs:'Surahs',wishlist:'Favorites',notes:'My notes',search:'Search: 3:2 or a word',login:'Log in',register:'Sign up',word:'Arabic word',latin:'Reading',meaning:'Meaning',footer:'The Holy Quran — read, reflect, remember'},
  ru:{surahs:'Суры',wishlist:'Избранное',notes:'Мои заметки',search:'Поиск: 3:2 или слово',login:'Войти',register:'Регистрация',word:'Арабское слово',latin:'Чтение',meaning:'Значение',footer:'Священный Коран — читай, размышляй, помни'},
  tr:{surahs:'Sureler',wishlist:'Favorilerim',notes:'Notlarım',search:'Ara: 3:2 veya kelime',login:'Giriş yap',register:'Kayıt ol',word:'Arapça kelime',latin:'Okunuşu',meaning:'Anlamı',footer:'Kur’ân-ı Kerîm — oku, düşün, hatırla'}
};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const safe=(f)=>{try{return f()}catch{}};

/* Əlavə açarlar (MVC versiyası) */
Object.assign(I18N.az,{daily:'Günün ayəsi',browse:'Surələrə bax',logout:'Çıxış',comments:'Şərhlər',cmPh:'Şərh yaz…',send:'Göndər',noCm:'Hələ şərh yoxdur',loginToCm:'Şərh yazmaq üçün daxil ol'});
Object.assign(I18N.en,{daily:'Verse of the day',browse:'Browse surahs',logout:'Log out',comments:'Comments',cmPh:'Write a comment…',send:'Send',noCm:'No comments yet',loginToCm:'Log in to comment'});
Object.assign(I18N.ru,{daily:'Аят дня',browse:'Список сур',logout:'Выйти',comments:'Комментарии',cmPh:'Напишите комментарий…',send:'Отправить',noCm:'Комментариев пока нет',loginToCm:'Войдите, чтобы комментировать'});
Object.assign(I18N.tr,{daily:'Günün ayeti',browse:'Surelere göz at',logout:'Çıkış',comments:'Yorumlar',cmPh:'Yorum yaz…',send:'Gönder',noCm:'Henüz yorum yok',loginToCm:'Yorum yazmak için giriş yap'});

/* Backend (C#) ilə əlaqə: JSON fetch köməkçisi. 401 → login səhifəsi */
async function http(url,opt={}){
  const r=await fetch(url,{credentials:'same-origin',...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})},body:opt.body&&JSON.stringify(opt.body)});
  if(r.status===401){location.href='/login';throw new Error('401')}
  const t=await r.text(), d=t?JSON.parse(t):null;
  if(!r.ok) throw Object.assign(new Error(d?.err||r.status),{data:d});
  return d;
}
const authed=document.body.dataset.auth==='1';

/* Dil */
function setLang(l){
  document.documentElement.lang=l;
  $$('[data-i18n]').forEach(e=>{const v=I18N[l][e.dataset.i18n];if(v!=null)e.textContent=v});
  $$('[data-i18n-ph]').forEach(e=>{const v=I18N[l][e.dataset.i18nPh];if(v!=null)e.placeholder=v});
  safe(()=>localStorage.setItem('lang',l)); document.cookie=`lang=${l};path=/;max-age=31536000`;
  $('#lang').value=l;
}
$('#lang').addEventListener('change',e=>setLang(e.target.value));
setLang(safe(()=>localStorage.getItem('lang'))||'az');

/* Tema */
function setTheme(t){document.documentElement.dataset.theme=t;safe(()=>localStorage.setItem('theme',t))}
setTheme(safe(()=>localStorage.getItem('theme'))||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
$('#themeBtn').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
