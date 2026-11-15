# Təfsir tərcüməsi (Copilot üçün tapşırıq)

`translate/in/` qovluğunda `000.json`, `001.json`, ... faylları var. Hər fayl `[{"id": "...", "tr": "Türkcə mətn"}, ...]` massividir.

Hər giriş faylı üçün `translate/out/` qovluğunda **eyni adlı** fayl yarat:

```json
[{"id": "<eyni id>", "az": "...", "ru": "...", "en": "..."}]
```

Qaydalar:
- Mətnin hamısını tam tərcümə et, qısaltma və ya buraxma.
- Sətir keçidlərini (`\n`), ərəb sözlərini, ayə istinadlarını (məs. 2/255) və `[*]` işarələrini olduğu kimi saxla.
- `az` Azərbaycan dili, `ru` rus dili, `en` ingilis dili olsun.
- Elementlərin sayı və sırası giriş faylı ilə eyni olsun, `id` dəyişməsin.
- Etibarlı UTF-8 JSON yaz (dırnaq və sətir keçidlərini düzgün escape et).

Hazır olandan sonra terminalda: `npm run tr:merge` (yoxlayır və `data/commentary-i18n.json`-a birləşdirir).
