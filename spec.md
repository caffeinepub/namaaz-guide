# Namaaz Guide

## Current State
App mein 5 namazein hain (Fajr, Zuhr, Asr, Maghrib, Isha) lekin backend mein sirf 2 steps hain -- Takbeer-e-Tahreema aur Tashahud. Baqi tamam steps missing hain. Namaaz ka tareeqa Ahle Sunnat wa Jama'at ke mutabiq mukammal nahi hai.

## Requested Changes (Diff)

### Add
- Har namaaz ke liye mukammal steps (Ahle Sunnat wa Jama'at tareeqa):
  1. Niyyat (dil mein + zaban se)
  2. Takbeer-e-Tahreema -- "Allahu Akbar"
  3. Sana (Thana) -- "Subhanakallahumma..."
  4. Ta'awwuz -- "A'uzu billahi..."
  5. Tasmiyah (Bismillah)
  6. Surah Al-Fatiha -- mukammal Arabic text
  7. Surah (koi bhi chhoti surah, e.g. Surah Al-Ikhlas)
  8. Ruku -- "Subhana Rabbiyal Azeem" (3 baar)
  9. Qawmah (Ruku se uthna) -- "Sami'allahu liman hamidah / Rabbana lakal hamd"
  10. Pehla Sajdah -- "Subhana Rabbiyal A'la" (3 baar)
  11. Jalsa (Do Sajdon ke darmiyan) -- "Rabbighfirli"
  12. Doosra Sajdah -- "Subhana Rabbiyal A'la" (3 baar)
  13. (2 rakaat ke baad) Qa'da Awwalah -- Attahiyat
  14. (Aakhri qa'da mein) Attahiyat + Darood Ibrahim + Dua Masura
  15. Salaam -- "Assalamu Alaikum wa Rahmatullah" dono taraf
- Har namaaz ki rakaat structure alag alag (Sunnat, Farz, Witr etc.)
- Bismillah app title ke upar clearly dikhana (jo pehle se hai, confirm rakhen)

### Modify
- Backend `initialize()` function mein tamam 5 namazein ke mukammal steps add karna
- Har namaaz ke liye rakaat count درست karna:
  - Fajr: 2 Sunnat + 2 Farz = 4 total
  - Zuhr: 4 Sunnat + 4 Farz + 2 Sunnat + 2 Nafil = 12 total
  - Asr: 4 Sunnat + 4 Farz = 8 total
  - Maghrib: 3 Farz + 2 Sunnat + 2 Nafil = 7 total
  - Isha: 4 Sunnat + 4 Farz + 2 Sunnat + 3 Witr + 2 Nafil = 17 total
- Frontend step names Roman Urdu mein mukammal update karna
- rakaatRange field mein rakaat number clearly likhna

### Remove
- Incomplete/placeholder step data (purane 2 steps)

## Implementation Plan
1. Backend `main.mo` mein Fajr ke mukammal 15 steps likhna with Arabic text, transliteration, translation
2. Baqi 4 namazein (Zuhr, Asr, Maghrib, Isha) ke liye Fajr steps ko base bana ke steps share karna (Farz steps same hain, sirf rakaat count alag)
3. Frontend `PrayerDetailPage.tsx` mein `STEP_NAME_ROMAN` dictionary update karna -- tamam 15 steps ke Roman Urdu naam
4. `rakaatRange` labels update karna taake "Pehli 2 rakaaton mein", "Aakhri qa'da mein" wagera clearly dikhe
5. Namaaz complete hone par dua ka message update karna
