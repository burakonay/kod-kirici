// ════════════════════════════════════════════════
// HARFIYAT — Macera Modu Veri Tanımları
// 12 bölüm × seviyeler, modifier sözlüğü, tema havuzu regex'leri.
// Pure-data: DOM erişimi yok, fonksiyon yok. words.js sonrasında yüklenir.
// ════════════════════════════════════════════════

  const ADV_KEY_V2  = 'harfiyat_adv_v2';
  const ADV_KEY_OLD = 'harfiyat_adv';

  const MODIFIER_INFO = {
    none:            { icon: '·',  short: 'STANDART',       desc: 'Klasik kurallar. Joker, ipucu, normal süre.' },
    no_joker:        { icon: '🪞', short: 'YALNIZ AKIL',    desc: 'Joker yok — harf açtırma yok.' },
    no_hint:         { icon: '🤐', short: 'SESSİZ',         desc: 'İpucu yok — kategori söylenmez.' },
    blind_flight:    { icon: '🧠', short: 'KÖR UÇUŞ',      desc: 'Renkler 2.5 sn görünür, sonra kaybolur. Hatırla.' },
    broken_kbd:      { icon: '⌨',  short: 'KIRIK KLAVYE',   desc: '3 harf tuşu çatlamış — kelimede YOK ama yazılmaz.' },
    panic:           { icon: '⏱', short: 'PANİK',          desc: 'Her tahmin satırı için 15 sn. Süre dolarsa satır yanar.' },
    shadow:          { icon: '🌑', short: 'GÖLGE',          desc: 'Renkler son 3 hakta toplu açılır — körlemesine tahmin.' },
    contagious_lock: { icon: '🔗', short: 'BULAŞICI KİLİT', desc: 'Bulduğun yeşil harfler sonraki satıra kilitlenir.' },
    final:           { icon: '⚔',  short: 'FİNAL',          desc: 'Joker yok + ipucu yok + 5 hak + 2 dk süre.' },
  };

  // ─── Türkçe-uyumlu kelime sınırı eşleştirici ───
  // Standart \b ASCII bağımlı; "halı" aranırken "pahalıya"da false-positive verir.
  // Bu helper, Türkçe karakterleri (ç,ğ,ı,i,İ,ö,ş,ü,â,î,û) sınır olarak hariç tutar.
  const _TR_WORD_CHAR = "a-zA-ZçğıİöşüâîûÇĞIÖŞÜÂÎÛ";
  function _escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function _matchesAny(text, words) {
    if (!text) return false;
    // Türkçe locale lowercase — JS'in standart i flag'i İ↔i, I↔ı dönüşümlerinde
    // başarısız olur. Önce metni ve kelimeyi tr-TR ile lowercase'e indirgiyoruz.
    let lt;
    try { lt = text.toLocaleLowerCase('tr-TR'); }
    catch { lt = text.toLowerCase(); }
    for (const w of words) {
      let lw;
      try { lw = w.toLocaleLowerCase('tr-TR'); }
      catch { lw = w.toLowerCase(); }
      const esc = _escapeReg(lw);
      // Türkçe-uyumlu word boundary (önünde ve arkasında harf karakter olmayan)
      const re = new RegExp('(?<![' + _TR_WORD_CHAR + '])' + esc + '(?![' + _TR_WORD_CHAR + '])');
      if (re.test(lt)) return true;
    }
    return false;
  }

  // Her tema, kelime listesi. Her kelime tam sözcük (Türkçe word-boundary) ile aranır.
  const ADV_THEME_WORDS = {
    mutfak: ['yemek','mutfak','tatlı','çay','kahve','peynir','süt','yoğurt','ekmek','pasta','kek','hamur','tencere','tava','yağ','tuz','şeker','aşçı','aşçılık','fırın','kıyma','köfte','pilav','çorba','salata','kahvaltı','ızgara','kavur','kavurma','tabak','bardak','kaşık','çatal','bıçak','tepsi','sucuk','baharat','lokanta','garson','şef','kebap','simit','çörek','reçel','kavanoz','baklava','mantı','omlet','tatlısı','pişir','pişer','kahveli','tatlıcı'],
    meyve_sebze: ['meyve','sebze','salata','turşu','kuruyemiş','elma','muz','üzüm','kayısı','kiraz','incir','kavun','karpuz','portakal','çilek','marul','kereviz','ıspanak','biber','domates','salatalık','soğan','patates','fasulye','nohut','mantar','armut','şeftali','nar','limon','ananas','ceviz','fındık','bezelye','mercimek','kestane','salkım','bulgur','fıstık','vişne','kabak','pırasa','sarımsak','nane','maydanoz','roka','dereotu','fesleğen','barbunya','pirinç'],
    aile: ['anne','baba','kardeş','abla','abi','dede','amca','hala','teyze','dayı','yenge','oğul','aile','akraba','kuzen','nine','ata','ağabey','anneanne','babaanne','enişte','baldız','görümce','kaynana','gelin','damat','büyükanne','büyükbaba','kayınpeder','ailece','ailevi'],
    ev: ['masa','sandalye','dolap','yatak','kanepe','koltuk','raf','kapı','pencere','halı','perde','yastık','battaniye','çekmece','oda','salon','banyo','merdiven','anahtar','kilit','fincan','tabak','bardak','kova','sepet','tuvalet','ayna','mobilya','sehpa','televizyon','telefon','saat','lamba','abajur','antre','çarşaf','tabure','lavabo','terlik','çekyat','paravan','koridor','askı','makas','duvar','tavan','döşeme','soba','klima'],
    doga: ['ağaç','orman','çiçek','bitki','yaprak','kök','dal','toprak','deniz','nehir','göl','dağ','çöl','kıyı','yamaç','ada','tarla','bahçe','park','gökyüzü','bulut','güneş','ay','yıldız','rüzgar','yağmur','kar','fırtına','şimşek','dalga','kum','taş','tepe','vadi','şelale','kaynak','pınar','mevsim','ilkbahar','sonbahar','kış','hava','ırmak','akarsu','ekvator','ufuk','akar'],
    hayvanat: ['kedi','köpek','hayvan','kuş','balık','yılan','kurt','aslan','fil','fare','inek','koyun','tavşan','maymun','ördek','böcek','kelebek','arı','karınca','domuz','geyik','deve','eşek','öküz','keçi','tilki','ayı','kanat','pençe','yuva','yumurta','civciv','sürü','kümes','tavuk','horoz','kartal','baykuş','papağan','penguen','pelikan','kurbağa','ahtapot','leylek','balina','kaplan','kanguru','akbaba','hindi','palamut','sıçan','midilli','panda','öter'],
    sehir: ['araba','otobüs','uçak','gemi','tren','bisiklet','motosiklet','kamyon','taksi','metro','tramvay','durak','liman','istasyon','şehir','sokak','cadde','bina','apartman','mahalle','çarşı','market','dükkân','dükkan','alışveriş','hastane','okul','kafe','sinema','tiyatro','köprü','tünel','trafik','otopark','garaj','peron','kaptan','kasaba','marina','mağaza','banka','postane','kuyumcu','eczane','manav','dolmuş','bilet','minibüs'],
    insan: ['anne','baba','kardeş','aile','akraba','arkadaş','dost','göz','kulak','burun','ağız','dil','diş','kol','el','parmak','ayak','bacak','kalp','saç','cilt','kemik','kas','beyin','nefes','hasta','doktor','sağlık','deri','organ','hücre','ağabey','akıllı','açıkgöz','aceleci','akciğer','akyuvar','alerji','anatomi','bilek','solunum','nabız','damar','vücut','boğaz','dirsek','kalça','topuk'],
    duygu: ['mutlu','üzgün','kızgın','öfke','korku','sevinç','şaşırma','hayret','gurur','hüzün','sevgi','aşk','nefret','umut','hayal','cesaret','korkak','cesur','akıl','zeka','merak','huzur','stres','kaygı','endişe','coşku','panik','sabır','kıskanç','şüphe','niyet','amaç','hedef','tepki','sevda','hasret','gurbet','hoşnut','pişman','ihanet','vicdan','keder','özlem'],
    hobi: ['satranç','bulmaca','müzik','şarkı','enstrüman','gitar','piyano','davul','nota','sanat','resim','tablo','fotoğraf','film','sahne','dans','tiyatro','opera','bale','balerin','dama','ebru','atari','oyun','oyuncak'],
    spor: ['basket','korner','kaleci','stat','libero','hentbol','güreş','boks','tenis','futbol','smaç','penaltı','frikik','golcü','sporcu','kupa','madalya','jüri','şilt','yüzme','koşu','atlet','jokey','sürat','rekor','hakem','raket','halter','kros','maraton','derbi','final','servis','sayı','aerobik','yoga','fanatik','seyirci','tribün','saha','stadyum','ofsayt','plonjon','manşet','judo','karate','dövüş','asist','güreşçi','sörf','paten','poker','tavla','bilardo','maç','gol','takım','antrenman','jimnastik','olimpiyat','şampiyon'],
    efsane: ['efsane','kahraman','savaşçı','kale','kılıç','kalkan','zafer','destan','mit','cesaret','yolculuk','hazine','büyü','büyücü','ejder','ejderha','mağara','şato','prens','sultan','hükümdar','kraliçe','firavun','samuray','asker','gizem','sır','kayıp','abide','hakan','hisar','kıta','alperen','padişah','sancak'],
  };

  // Eski regex tabanlı filtreler korunuyor (geri uyumluluk için), ama
  // buildThemePools yeni word-boundary helper'ı kullanır.
  const ADV_THEME_FILTERS = {
    mutfak:    /(yemek|mutfak|tatlı|çay|kahve|peynir|süt|yoğurt|ekmek|pasta|kek|hamur|tencere|tava|yağ|tuz|şeker|aşçı|fırın|kıyma|köfte|pilav|çorba|kahve|gıda|kahvalt|ızgara|kavur|tabak|bardak|kaşık|çatal|bıçak|tepsi|içecek|sucuk|baharat|lokanta|garson|şef|kebap|simit|çörek|reçel|kavanoz|kavurma|baklava|mantı|omlet)/i,
    meyve_sebze: /(\b(?:meyve|sebze|salata|turşu|kuruyemiş)\b|elma|muz|üzüm|kayısı|kiraz|incir|kavun|karpuz|portakal|çilek|marul|kereviz|ıspanak|biber|domates|salatalık|soğan|patates|fasulye|nohut|mantar|armut|şeftali|nar|limon|ananas|ceviz|fındık|bezelye|mercimek|kestane|salkım|bulgur|fıstık|vişne|kabak|brokoli|enginar|pırasa|sarımsak|nane|maydanoz|roka|dereotu|fesleğen|barbunya|pirinç)/i,
    aile:      /(\b(?:anne|baba|kardeş|abla|abi|dede|amca|hala|teyze|dayı|yenge|oğul|aile|akraba|kuzen|nine|ata)\b|\baile|ağabey|anneanne|babaanne|enişte|baldız|görümce|kaynana|gelin|damat|büyükanne|büyükbaba|kayınpeder|ailece|ailevi|ahbap)/i,
    okul:      /(okul|kitap|kalem|defter|silgi|cetvel|öğren|öğretmen|öğrenci|ders|sınav|tahta|sıra|harita|matemati|test|not|teneffüs|sınıf|üniversite|akademi|diploma|mezun|ödev|imtihan|sözlük|kütüphane|raf|kağıt|yazı|bilim|deney|laboratuvar)/i,
    ev:        /(masa|sandalye|dolap|yatak|kanepe|koltuk|raf|kapı|pencere|halı|perde|yastık|battaniye|çekmece|oda|salon|mutfak|banyo|merdiven|anahtar|kilit|fincan|tabak|bardak|kova|sepet|tuvalet|ayna|mobilya|abajur|sehpa|televizyon|telefon|bilgisayar|saat)/i,
    doga:      /(ağaç|orman|çiçek|bitki|yaprak|kök|dal|toprak|kayalar|çakıl|deniz|nehir|göl|dağ|çöl|köy|kıyı|yamaç|ada|tarla|bahçe|park|sokak|köprü|gökyüzü|bulut|güneş|ay|yıldız|rüzgar|yağmur|kar|fırtına|şimşek|gökkuşağı|akar|dalga|kum|taş|kaya|tepe|vadi|şelale|kaynak|pınar|mevsim|ilkbahar|yaz|sonbahar|kış|yapra|odun|kömür)/i,
    hayvanat:  /(kedi|köpek|hayvan|kuş|balık|yılan|kurt|aslan|fil|fare|inek|koyun|tavşan|maymun|ördek|böcek|kelebek|arı|karınca|domuz|geyik|deve|eşek|öküz|keçi|tilki|ayı|kuyruk|tüy|gaga|kanat|pençe|yuva|miyav|havlar|öter|yumurta|civciv|sürü|kümes|tavuk|horoz|kümes|kartal|baykuş|papağan|penguen|pelikan|kurbağa|ahtapot)/i,
    sehir:     /(araba|otobüs|uçak|gemi|tren|bisiklet|motosiklet|kamyon|taksi|metro|tramvay|durak|liman|havaalanı|istasyon|şehir|sokak|cadde|bina|apartman|mahalle|park|çarşı|market|dükkân|dükkan|alışveriş|hastane|okul|kafe|sinema|tiyatro|bahçe|köprü|tünel|trafik|işaret|otopark|garaj)/i,
    insan:     /(anne|baba|kardeş|abla|abi|dede|anneanne|babaanne|eş|çocuk|bebek|kuzen|aile|akraba|amca|hala|teyze|dayı|yenge|oğul|kız|misafir|komşu|arkadaş|dost|göz|kulak|burun|ağız|dil|diş|kol|el|parmak|ayak|bacak|kalp|saç|cilt|kemik|kas|beyin|nefes|hasta|doktor|sağlık|kollar|deri)/i,
    duygu:     /(mutlu|üzgün|kızgın|öfke|korku|sevinç|şaşırma|hayret|gurur|hüzün|sevgi|aşk|nefret|umut|hayal|cesaret|korkak|cesur|akıl|zeka|merak|huzur|stres|kaygı|endişe|coşku|panik|sabır|kıskanç|şüphe|niyet|amaç|hedef|tepki|düşün|hatır|unutma|öz güven|özgürlük|barış)/i,
    hobi:      /(satranç|bulmaca|müzik|şarkı|enstrüman|gitar|piyano|davul|nota|sanat|resim|tablo|fotoğraf|film|sahne|dans|tiyatro|opera|bale|balerin|dama|ebru|atari|oyun|oyuncak)/i,
    spor:      /(basket|korner|kaleci|stat|libero|hentbol|güreş|boks|tenis|futbol|smaç|penaltı|frikik|golcü|sporcu|kupa|madalya|jüri|altın|bronz|şilt|yüzme|koşu|atlet|jokey|sürat|rekor|hakem|raket|halter|kros|maraton|derbi|final|kale|servis|sayı|aerobik|yoga|fanatik|seyirci|tribün|saha|stadyum|iniş|vuruş|ofsayt|plonjon|aksiyon|manşet|judo|karate|dövüş|asist|güreşçi|sörf|paten|poker|tavla|bilardo|maç|gol|takım|antrenman|jimnastik|olimpiyat|şampiyon)/i,
    efsane:    /(efsane|kahraman|savaşçı|kale|kılıç|kalkan|zafer|destan|mit|cesaret|yolculuk|hazine|büyü|büyücü|ejder|ejderha|mağara|şato|prens|sultan|hükümdar|kraliçe|firavun|samuray|asker|ordusu|maceraperest|cesur|gizem|sır|kayıp)/i,
  };

  const ADV_CHAPTERS = [
    // BÖLÜM 1: EV (3 seviye)
    { id: 1, name: 'EV', theme: 'ev', biome: 'forest', icon: '🏠', levels: [
      { kind: 'normal', modifier: 'none',            wordLen: 4, maxGuesses: 6, time: null, word: 'masa' },
      { kind: 'normal', modifier: 'none',            wordLen: 5, maxGuesses: 6, time: null, word: 'dolap' },
      { kind: 'final',  modifier: 'final',           wordLen: 5, maxGuesses: 5, time: 120,  word: 'lamba' },
    ]},
    // BÖLÜM 2: MUTFAK (5 seviye)
    { id: 2, name: 'MUTFAK', theme: 'mutfak', biome: 'forest', icon: '🍳', levels: [
      { kind: 'normal', modifier: 'none',            wordLen: 4, maxGuesses: 6, time: null, word: 'kova' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 5, maxGuesses: 6, time: null, word: 'şeker' },
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 5, maxGuesses: 6, time: null, word: 'salça' },
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 6, maxGuesses: 6, time: null, word: 'mantar' },
      { kind: 'final',  modifier: 'final',           wordLen: 6, maxGuesses: 5, time: 120,  word: 'fincan' },
    ]},
    // BÖLÜM 3: MEYVE & SEBZE (4 seviye) — YENİ
    { id: 3, name: 'MEYVE & SEBZE', theme: 'meyve_sebze', biome: 'forest', icon: '🍎', levels: [
      { kind: 'normal', modifier: 'none',            wordLen: 4, maxGuesses: 6, time: null, word: 'elma' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 5, maxGuesses: 6, time: null, word: 'armut' },
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 6, maxGuesses: 6, time: null, word: 'mantar' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'kestane' },
    ]},
    // BÖLÜM 4: OKUL HAYATI (4 seviye)
    { id: 4, name: 'OKUL HAYATI', theme: 'okul', biome: 'forest', icon: '🎓', levels: [
      { kind: 'normal', modifier: 'no_hint',         wordLen: 5, maxGuesses: 6, time: null, word: 'kalem' },
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 5, maxGuesses: 6, time: null, word: 'kitap' },
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 6, maxGuesses: 6, time: null, word: 'sözlük' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'akademi' },
    ]},
    // BÖLÜM 5: DOĞA (6 seviye — bol havuz)
    { id: 5, name: 'DOĞA', theme: 'doga', biome: 'river', icon: '🌿', levels: [
      { kind: 'normal', modifier: 'none',            wordLen: 4, maxGuesses: 6, time: null, word: 'ufuk' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 5, maxGuesses: 6, time: null, word: 'deniz' },
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 5, maxGuesses: 6, time: null, word: 'orman' },
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 6, maxGuesses: 6, time: null, word: 'kumsal' },
      { kind: 'normal', modifier: 'panic',           wordLen: 6, maxGuesses: 6, time: null, word: 'volkan' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'gökyüzü' },
    ]},
    // BÖLÜM 6: HAYVANAT (5 seviye)
    { id: 6, name: 'HAYVANAT', theme: 'hayvanat', biome: 'river', icon: '🐾', levels: [
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 4, maxGuesses: 6, time: null, word: 'kedi' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 5, maxGuesses: 6, time: null, word: 'aslan' },
      { kind: 'normal', modifier: 'no_joker',        wordLen: 6, maxGuesses: 6, time: null, word: 'kartal' },
      { kind: 'normal', modifier: 'panic',           wordLen: 6, maxGuesses: 6, time: null, word: 'maymun' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'penguen' },
    ]},
    // BÖLÜM 7: ŞEHİR (4 seviye)
    { id: 7, name: 'ŞEHİR', theme: 'sehir', biome: 'river', icon: '🏙', levels: [
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 5, maxGuesses: 6, time: null, word: 'sokak' },
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 6, maxGuesses: 6, time: null, word: 'sinema' },
      { kind: 'normal', modifier: 'panic',           wordLen: 6, maxGuesses: 6, time: null, word: 'devlet' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'mahalle' },
    ]},
    // BÖLÜM 8: AİLE (3 seviye) — YENİ
    { id: 8, name: 'AİLE', theme: 'aile', biome: 'river', icon: '👨‍👩‍👧', levels: [
      { kind: 'normal', modifier: 'no_hint',         wordLen: 4, maxGuesses: 6, time: null, word: 'baba' },
      { kind: 'normal', modifier: 'shadow',          wordLen: 6, maxGuesses: 6, time: null, word: 'akraba' },
      { kind: 'final',  modifier: 'final',           wordLen: 6, maxGuesses: 5, time: 120,  word: 'ağabey' },
    ]},
    // BÖLÜM 9: İNSAN (5 seviye)
    { id: 9, name: 'İNSAN', theme: 'insan', biome: 'ruins', icon: '👤', levels: [
      { kind: 'normal', modifier: 'no_hint',         wordLen: 4, maxGuesses: 6, time: null, word: 'deri' },
      { kind: 'normal', modifier: 'shadow',          wordLen: 5, maxGuesses: 6, time: null, word: 'beyin' },
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 6, maxGuesses: 6, time: null, word: 'doktor' },
      { kind: 'normal', modifier: 'contagious_lock', wordLen: 7, maxGuesses: 6, time: null, word: 'iskelet' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'akciğer' },
    ]},
    // BÖLÜM 10: DUYGULAR (4 seviye)
    { id: 10, name: 'DUYGULAR', theme: 'duygu', biome: 'ruins', icon: '💭', levels: [
      { kind: 'normal', modifier: 'shadow',          wordLen: 5, maxGuesses: 6, time: null, word: 'sevgi' },
      { kind: 'normal', modifier: 'panic',           wordLen: 6, maxGuesses: 6, time: null, word: 'hayret' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 6, maxGuesses: 6, time: null, word: 'pişman' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'cesaret' },
    ]},
    // BÖLÜM 11: SANAT (4 seviye) — müzik/resim/tiyatro
    { id: 11, name: 'SANAT', theme: 'hobi', biome: 'ruins', icon: '🎨', levels: [
      { kind: 'normal', modifier: 'no_joker',        wordLen: 5, maxGuesses: 6, time: null, word: 'tablo' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 6, maxGuesses: 6, time: null, word: 'oyuncu' },
      { kind: 'normal', modifier: 'shadow',          wordLen: 7, maxGuesses: 6, time: null, word: 'satranç' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'tiyatro' },
    ]},
    // BÖLÜM 12: SPOR (4 seviye) — YENİ
    { id: 12, name: 'SPOR', theme: 'spor', biome: 'ruins', icon: '⚽', levels: [
      { kind: 'normal', modifier: 'broken_kbd',      wordLen: 4, maxGuesses: 6, time: null, word: 'koşu' },
      { kind: 'normal', modifier: 'blind_flight',    wordLen: 5, maxGuesses: 6, time: null, word: 'hakem' },
      { kind: 'normal', modifier: 'panic',           wordLen: 6, maxGuesses: 6, time: null, word: 'futbol' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 120,  word: 'maraton' },
    ]},
    // BÖLÜM 13: EFSANE (3 seviye)
    { id: 13, name: 'EFSANE', theme: 'efsane', biome: 'ruins', icon: '⚔️', levels: [
      { kind: 'normal', modifier: 'shadow',          wordLen: 6, maxGuesses: 6, time: null, word: 'mağara' },
      { kind: 'normal', modifier: 'panic',           wordLen: 7, maxGuesses: 6, time: null, word: 'samuray' },
      { kind: 'final',  modifier: 'final',           wordLen: 7, maxGuesses: 5, time: 90,   word: 'ejderha' },
    ]},
  ];

  const ADV_TOTAL_LEVELS = ADV_CHAPTERS.reduce((s, c) => s + c.levels.length, 0);
