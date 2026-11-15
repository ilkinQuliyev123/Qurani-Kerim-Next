/* ===== PART 4: wishlist + qeydlər — data SQL-dən (C#: UserApiController) =====
   Yükləmə sırası: main.js → surahs.js → ayah.js → user.js → səhifənin öz js-i */
const split=r=>r.split(':').map(Number);
const L0=()=>document.documentElement.lang;
Object.assign(api,{
  wishlist:(offset=0,limit=20)=>http(`/api/wishlist?offset=${offset}&limit=${limit}&lang=${L0()}`),
  toggleWishlist:id=>http(`/api/wishlist/${id}`,{method:'POST'}),
  notes:(offset=0,limit=20)=>http(`/api/notes?offset=${offset}&limit=${limit}`),
  addNote:(ref,text)=>http('/api/notes',{method:'POST',body:{ref,text}}),
  updateNote:(id,text)=>http(`/api/notes/${id}`,{method:'PUT',body:{text}}),
  deleteNote:id=>http(`/api/notes/${id}`,{method:'DELETE'})
});
Object.assign(I18N.az,{wTitle:'Bəyəndiyim ayələr',noWish:'Hələ ayə bəyənməmisən',noWishHint:'Ayənin üzərindəki ♥ düyməsinə bas, burada görünsün.',browse:'Surələrə bax',
  nTitle:'Hisslərim və qeydlərim',refPh:'Ayə: 3:2',notePh:'Bu ayə sənə nə hiss etdirdi?',save:'Yadda saxla',edit:'Dəyiş',del:'Sil',cancel:'Ləğv et',
  delQ:'Qeyd silinsin?',delHint:'Bu əməliyyatı geri qaytarmaq olmur.',noNotes:'Hələ qeyd yoxdur. İlk hissini yaz.',badRef:'Ayəni 3:2 formatında yaz',emptyNote:'Qeydi boş qoyma'});
Object.assign(I18N.en,{wTitle:'My favorite verses',noWish:'No favorites yet',noWishHint:'Tap ♥ on a verse and it will appear here.',browse:'Browse surahs',
  nTitle:'My feelings and notes',refPh:'Verse: 3:2',notePh:'What did this verse make you feel?',save:'Save',edit:'Edit',del:'Delete',cancel:'Cancel',
  delQ:'Delete this note?',delHint:'This cannot be undone.',noNotes:'No notes yet. Write your first reflection.',badRef:'Enter the verse as 3:2',emptyNote:'The note is empty'});
Object.assign(I18N.ru,{wTitle:'Избранные аяты',noWish:'Пока нет избранного',noWishHint:'Нажмите ♥ на аяте, и он появится здесь.',browse:'Открыть суры',
  nTitle:'Мои чувства и заметки',refPh:'Аят: 3:2',notePh:'Что вы почувствовали, читая этот аят?',save:'Сохранить',edit:'Изменить',del:'Удалить',cancel:'Отмена',
  delQ:'Удалить заметку?',delHint:'Это действие нельзя отменить.',noNotes:'Заметок пока нет. Запишите первое чувство.',badRef:'Введите аят в формате 3:2',emptyNote:'Заметка пуста'});
Object.assign(I18N.tr,{wTitle:'Beğendiğim ayetler',noWish:'Henüz favori yok',noWishHint:'Bir ayetteki ♥ düğmesine bas, burada görünsün.',browse:'Surelere bak',
  nTitle:'Hislerim ve notlarım',refPh:'Ayet: 3:2',notePh:'Bu ayet sana ne hissettirdi?',save:'Kaydet',edit:'Düzenle',del:'Sil',cancel:'İptal',
  delQ:'Not silinsin mi?',delHint:'Bu işlem geri alınamaz.',noNotes:'Henüz not yok. İlk hissini yaz.',badRef:'Ayeti 3:2 biçiminde yaz',emptyNote:'Not boş'});
