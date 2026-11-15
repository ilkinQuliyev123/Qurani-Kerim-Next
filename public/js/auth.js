/* ===== PART 5: login və register (DUMMY) =====
   Yükləmə sırası: main.js → auth.js. Parol yoxlaması, sessiya və rollar backenddə (Identity) olacaq.
   Backend hazır olanda yalnız api.login / api.register içi fetch ilə əvəz olunur. */
const api={ // C#: AccountController → SQL-də istifadəçi, parol hash, cookie sessiya
  login:(email,password,remember)=>http('/api/auth/login',{method:'POST',body:{email,password,remember}}),
  register:(name,email,password)=>http('/api/auth/register',{method:'POST',body:{name,email,password}})
};

Object.assign(I18N.az,{loginTitle:'Xoş gəldin',regTitle:'Hesab yarat',email:'Email',password:'Parol',confirm:'Parolu təkrarla',username:'İstifadəçi adı',
  remember:'Məni xatırla',noAcc:'Hesabın yoxdur?',haveAcc:'Artıq hesabın var?',errEmail:'Email düzgün deyil',errPw:'Parol ən azı 8 simvol olmalıdır',
  errMatch:'Parollar eyni deyil',errName:'Ad ən azı 3 simvol olmalıdır',wrongCred:'Email və ya parol səhvdir',emailTaken:'Bu email artıq qeydiyyatdadır',show:'Göstər',hide:'Gizlət'});
Object.assign(I18N.en,{loginTitle:'Welcome back',regTitle:'Create an account',email:'Email',password:'Password',confirm:'Repeat password',username:'Username',
  remember:'Remember me',noAcc:'No account yet?',haveAcc:'Already have an account?',errEmail:'Enter a valid email',errPw:'Password must be at least 8 characters',
  errMatch:'Passwords do not match',errName:'Name must be at least 3 characters',wrongCred:'Wrong email or password',emailTaken:'This email is already registered',show:'Show',hide:'Hide'});
Object.assign(I18N.ru,{loginTitle:'С возвращением',regTitle:'Создать аккаунт',email:'Email',password:'Пароль',confirm:'Повторите пароль',username:'Имя пользователя',
  remember:'Запомнить меня',noAcc:'Нет аккаунта?',haveAcc:'Уже есть аккаунт?',errEmail:'Введите корректный email',errPw:'Пароль — не менее 8 символов',
  errMatch:'Пароли не совпадают',errName:'Имя — не менее 3 символов',wrongCred:'Неверный email или пароль',emailTaken:'Этот email уже зарегистрирован',show:'Показать',hide:'Скрыть'});
Object.assign(I18N.tr,{loginTitle:'Hoş geldin',regTitle:'Hesap oluştur',email:'E-posta',password:'Parola',confirm:'Parolayı tekrarla',username:'Kullanıcı adı',
  remember:'Beni hatırla',noAcc:'Hesabın yok mu?',haveAcc:'Zaten hesabın var mı?',errEmail:'Geçerli bir e-posta gir',errPw:'Parola en az 8 karakter olmalı',
  errMatch:'Parolalar aynı değil',errName:'Ad en az 3 karakter olmalı',wrongCred:'E-posta veya parola hatalı',emailTaken:'Bu e-posta zaten kayıtlı',show:'Göster',hide:'Gizle'});

const T=k=>I18N[document.documentElement.lang][k];
const form=$('#authForm'), isReg=form.id==='authForm'&&!!form.confirm;
const showErr=(input,key)=>{ // hər sahənin altında xəta
  const box=$(`[data-err="${input.name}"]`); box.dataset.key=key||''; box.textContent=key?T(key):'';
  input.setAttribute('aria-invalid',!!key); return !key;};
const relabel=()=>$$('[data-err]').forEach(b=>b.textContent=b.dataset.key?T(b.dataset.key):'');
$('#lang').addEventListener('change',relabel);

/* parolu göstər/gizlət */
$$('.pw__eye').forEach(b=>b.addEventListener('click',()=>{
  const i=b.previousElementSibling, show=i.type==='password'; i.type=show?'text':'password';
  b.setAttribute('data-i18n',show?'hide':'show'); b.textContent=T(show?'hide':'show');}));

/* parol gücü (yalnız qeydiyyatda) */
form.password.addEventListener('input',()=>{
  const v=form.password.value, sc=[v.length>=8,/[A-Z]/.test(v),/\d/.test(v),/[^\w\s]/.test(v)].filter(Boolean).length;
  const bar=$('#strength'); if(bar) bar.style.setProperty('--w',`${sc*25}%`);});

form.addEventListener('submit',async e=>{
  e.preventDefault(); const f=form, email=f.email.value.trim(), pw=f.password.value;
  let ok=true;
  if(isReg) ok=showErr(f.username,f.username.value.trim().length<3?'errName':'')&&ok;
  ok=showErr(f.email,/^\S+@\S+\.\S+$/.test(email)?'':'errEmail')&&ok;
  ok=showErr(f.password,pw.length<8?'errPw':'')&&ok;
  if(isReg) ok=showErr(f.confirm,f.confirm.value!==pw?'errMatch':'')&&ok;
  if(!ok) return;

  const btn=$('button[type=submit]',f); btn.disabled=true;
  const r=isReg?await api.register(f.username.value.trim(),email,pw):await api.login(email,pw,f.remember?.checked);
  btn.disabled=false;
  if(!r.ok){ showErr(isReg?f.email:f.password,r.err); return; }
  location.href='/';
});
setLang(document.documentElement.lang);
