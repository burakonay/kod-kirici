# KOD KIRICI — Proje Bağlamı

## Oyun Nedir?
Türkçe kelime tahmin oyunu (4-7 harf). Lingo'dan ilham alır:
- **İlk harf verilmez**
- **6 tahmin hakkı** (sabit, yarışma modunda)
- **3 joker** — rastgele bir harfi açar
- **İpucu sistemi** — coin harcayarak kategori ipucu alınır

## Tek Dosya
`index.html` — tüm HTML, CSS, JS bu dosyadadır. **Yeni dosya oluşturma.**

## Tasarım Sistemi
| Değişken | Değer | Kullanım |
|---|---|---|
| `--bg-deep` | `#01012b` | Ana arka plan |
| `--neon-pink` | `#ff2a6d` | Joker, hata, kaybet, GİR butonu |
| `--neon-cyan` | `#05d9e8` | Çerçeve, başlık, butonlar |
| `--neon-green` | `#00ff9f` | Doğru harf + doğru konum |
| `--neon-yellow` | `#f5c400` | Doğru harf + yanlış konum |
| Başlık fontu | Orbitron | `var(--font-head)` |
| Metin fontu | Rajdhani | `var(--font-body)` |

## Türkçe Özel Kurallar
- `turkishLower()` kullan — JS native `.toLowerCase()` `İ→i`, `I→ı` yanlış yapar
- `[...str].length` kullan — `.length` Türkçe karakterlerde hatalı sayar
- Kelime karşılaştırmalarında her zaman normalize edilmiş lowercase kullan

## Tile Durumları
```
.tile.correct        → neon yeşil  (doğru harf, doğru konum)
.tile.present        → neon sarı   (doğru harf, yanlış konum)
.tile.absent         → koyu gri    (kelimede yok)
.tile.joker-revealed → neon pembe  (joker ile açıldı)
```

## Kelime Listeleri
Dört ayrı array, startup'ta `[...w].length === N` filtresi geçer:
- `WORDS4` — 4 harfli (~80 kelime)
- `WORDS5` — 5 harfli (~150 kelime)
- `WORDS6` — 6 harfli kelimeler
- `WORDS7` — 7 harfli kelimeler

Yeni kelime: ilgili array'e lowercase ekle.

## Oyun Modları (Setup Ekranı)

### 🎯 DENEME MODU
- Harf sayısı seçilebilir (4/5/6/7, çoklu seçim)
- Tahmin hakkı özelleştirilebilir
- Süre özelleştirilebilir (∞ dahil)
- **Puanlama KAPALI** → PUAN/REKOR ekranda gizlenir
- `currentSetupMode = 'practice'`

### 🏆 YARIŞMA MODU
- Tüm uzunluklar (4+5+6+7), sabit süre (`calcSeconds([4,5,6,7])`)
- Tahmin hakkı sabit: 6
- **Puanlama AKTİF** → `STATE.isCompetitionMode = true`
- Rekor localStorage'a kaydedilir
- `currentSetupMode = 'competition'`

```js
startGame(lengths, isCompetition)
// isCompetition=true → yarışma, false → deneme
```

## STATE Yapısı
```js
STATE = {
  targetWord,           // aktif kelime (lowercase)
  guesses[],            // gönderilen tahminler
  currentInput[],       // yazılmakta olan satır
  currentRow,           // 0–(maxRows-1)
  maxRows,              // tahmin hakkı (baseMaxRows'dan kopyalanır)
  baseMaxRows,          // setup'tan gelen değer
  wordLen,              // aktif kelimenin harf sayısı
  jokerCount,           // 3'ten başlar
  revealedPositions[],  // jokerle açılan konum indeksleri
  letterStates{},       // klavye renklendirme {harf: 'correct'|'present'|'absent'}
  isAnimating,          // submit sırasında true → input engelle
  score,                // anlık puan (sadece yarışma)
  bestScore,            // localStorage'dan rekor
  timerTotal,           // toplam süre (saniye)
  timerLeft,            // kalan süre
  timerInterval,        // setInterval referansı
  timerUnlimited,       // true → süre yok
  timerPaused,          // overlay açıkken true
  currentLengthIdx,     // ACTIVE_LENGTHS içindeki sıra
  canContinue,          // kelime kazanılınca devam butonu
  coins,                // mevcut coin
  hintUsed,             // bu kelimede ipucu kullanıldı mı
  isCompetitionMode,    // true → yarışma, false → deneme
  firstCorrect,         // puan duplicate önlemi (Set)
  firstPresent,         // puan duplicate önlemi (Set)
}
```

## Aktif Kelime Yönetimi
```js
let ACTIVE_WORDS   = [];  // seçili uzunlukların kelime havuzu
let ACTIVE_LENGTHS = [];  // örn. [4,5,6,7]
```
`initRound()` → `ACTIVE_LENGTHS[STATE.currentLengthIdx]` uzunluğundan kelime seçer.
Kelime kazanılınca `currentLengthIdx++`, tüm uzunluklar bitince `endChallenge()`.

## Puanlama (sadece yarışma modunda)
- Doğru konum (correct): **+10 puan** (tekrar sayılmaz, `firstCorrect` Set ile)
- Yanlış konum (present): **+1 puan** (harf başına bir kez, `firstPresent` Set ile)
- Joker pozisyonlar puan almaz
- Kelime kazanıldığında bonus: `Math.max(1, 7 - attemptCount) * 10`
  - 1. tahminde: 60p, 6. tahminde: 10p
- `awardTilePoints()` başında `if (!STATE.isCompetitionMode) return;` koruması var

## İpucu & Coin Sistemi
```js
const HINT_COST = 25;   // ipucu coin maliyeti
const AD_REWARD = 50;   // reklam izleme ödülü
const COINS_KEY = 'kodkirici_coins';  // localStorage key
```
- Oyun 25 coin ile başlar
- Her kelimede **1 kez** ipucu kullanılabilir (`STATE.hintUsed`)
- Coin yetmiyorsa reklam overlay'i açılır → izlenince +50 coin
- İpucu → `WORD_CATS[targetWord]` içindeki espirili açıklamayı toast'ta gösterir

## WORD_CATS
```js
const WORD_CATS = { "kelime": "😀 Espirili açıklama", ... }
```
~350+ kelime için espirili Türkçe ipucu açıklamaları. Tüm kelimeler kapsanmıştır.
Yeni kelime eklerken buraya da ekle.

## Klavye
**Q düzeni** (Türkçe):
```js
KB_ROWS = [
  ['q','w','e','r','t','y','u','ı','o','p','ğ','ü'],
  ['a','s','d','f','g','h','j','k','l','ş','i'],
  ['enter','z','x','c','v','b','n','m','ö','ç','backspace']
]
```
- `#keyboard` → `position: fixed; bottom: 0` (mobilde sabit)
- GİR butonu: `background: #ff2a6d` (dolu pembe)
- Klavye renklendirmede `PRIORITY = {correct:3, present:2, absent:1}` — yüksek öncelik düşüğü ezmez

## Animasyon Zinciri
Submit → flip-out (150ms) → renk uygula → flip-in (150ms) → stagger: her tile +300ms → toplam ~1800ms → win/loss kontrol

## Mobil / PWA
- `body { position: fixed; width: 100%; }` → iOS scroll fix
- `#app { overflow-y: scroll; -webkit-overflow-scrolling: touch; }` → kaydırılabilir tahmin alanı
- `#keyboard { position: fixed; bottom: 0; }` → klavye sabit
- `#joker-bar` ve `#header` sabit, sadece `#app` kaydırılır
- Dinamik tile boyutu: `renderBoard()` içinde `window.innerWidth` ve `wordLen`'e göre JS ile hesaplanır
- CSS değişkenleri: `--tile-size`, `--tile-gap`, `--key-height`
- `viewport-fit=cover`, `env(safe-area-inset-bottom)` → iPhone çentik desteği
- PWA: `manifest.json`, apple-touch-icon, standalone display

## localStorage Keys
```
kodkirici_coins   → coin miktarı
kodkirici_theme   → 'light' | 'dark'
kodkirici_sound   → 'on' | 'off'
kodkirici_best    → { score, bestScore }
```

## Sık Yapılacak Değişiklikler
- **Yeni kelime**: `WORDS4/5/6/7` array'ine + `WORD_CATS`'e ekle
- **Yarışma süresi**: `calcSeconds()` fonksiyonunu düzenle
- **Coin/hint maliyeti**: `HINT_COST`, `AD_REWARD` sabitlerini değiştir
- **Joker sayısı**: `STATE.jokerCount = 3` + HTML'deki `joker-0/1/2` butonları
- **Renk**: `:root` CSS değişkenleri
- **Puan formülü**: `awardTilePoints()` ve `endGame()` içindeki bonus hesabı
