/* Ana səhifə: "Surələrə bax" düyməsi və dil dəyişəndə günün ayəsini seçilmiş dildə yenidən yüklə (server cookie-dən oxuyur) */
$('#browseBtn')?.addEventListener('click',()=>$('#surahBtn').click());
$('#lang').addEventListener('change',()=>location.reload());
