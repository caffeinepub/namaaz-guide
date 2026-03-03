import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Migration "migration";
import Text "mo:core/Text";

// Add migration with-clause before actor keyword
(with migration = Migration.run)
actor {
  type Prayer = {
    id : Text;
    name : Text;
    totalRakaat : Nat;
    fardRakaat : Nat;
    sunnahRakaat : Nat;
    steps : [Step];
  };

  type Step = {
    stepNumber : Nat;
    rakaatRange : Text;
    stepNameUrdu : Text;
    arabicText : Text;
    urduTransliteration : Text;
    urduTranslation : Text;
  };

  let prayers = Map.empty<Text, Prayer>();
  var initialized = false;

  func createStandardSteps() : [Step] {
    [
      // Step 1: Niyyat
      {
        stepNumber = 1;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "نیّت";
        arabicText = "نَوَيْتُ أَنْ أُصَلِّيَ";
        urduTransliteration = "Nawaytu an usalli -- namaaz ki niyyat karna";
        urduTranslation = "Dil mein niyyat karo ke main yeh namaaz ada kar raha/rahi hoon -- zaban se kehna mustahab hai";
      },
      // Step 2: Takbeer-e-Tahreema
      {
        stepNumber = 2;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "تکبیرِ تحریمہ";
        arabicText = "اَللهُ أَكْبَرُ";
        urduTransliteration = "Allahu Akbar";
        urduTranslation = "Allah sab se bada hai -- yeh keh kar namaaz shuru karo, haath naaf ke neeche baandh lo";
      },
      // Step 3: Sana (Thana)
      {
        stepNumber = 3;
        rakaatRange = "Sirf pehli rakaat mein";
        stepNameUrdu = "ثَنَاء";
        arabicText = "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ";
        urduTransliteration = "Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghairuk";
        urduTranslation = "Aye Allah! Tu paak hai, teri taarif karta hoon, tera naam barkat wala hai, teri shaan buland hai aur tere siwa koi ma'bood nahi";
      },
      // Step 4: Ta'awwuz
      {
        stepNumber = 4;
        rakaatRange = "Sirf pehli rakaat mein";
        stepNameUrdu = "تَعَوُّذ";
        arabicText = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ";
        urduTransliteration = "A'uzu billahi minash shaytanir rajeem";
        urduTranslation = "Main Allah ki panah maangta/maangti hoon shaitan-e-rajeem se";
      },
      // Step 5: Tasmiyah (Bismillah)
      {
        stepNumber = 5;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "بِسْمِ اللّٰه";
        arabicText = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
        urduTransliteration = "Bismillahir rahmanir raheem";
        urduTranslation = "Allah ke naam se shuru karta/karti hoon jo bada meharban, nihayat rehm wala hai";
      },
      // Step 6: Surah Al-Fatiha
      {
        stepNumber = 6;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "سُورَۃُ الفَاتِحَۃ";
        arabicText = "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ";
        urduTransliteration = "Alhamdu lillahi rabbil 'alamin. Ar-rahmanir rahim. Maliki yawmid din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas siratal mustaqim. Siratal lazina an'amta 'alayhim ghayril maghdubi 'alayhim wa lad dallin.";
        urduTranslation = "Tamam taarif Allah hi ke liye hai jo tamam jahanon ka parwardigar hai. Bada meharban, nihayat rehm wala. Roz-e-Jazaa ka maalik. Hum sirf teri ibadat karte hain aur sirf tujhi se madad maangti hai. Hamen seedha raasta dikha. Un logon ka raasta jin par tune inaam kiya, na un ka jo ghazab ke mustahiq hue aur na un ka jo gumraah hue.";
      },
      // Step 7: Surah ya Aayat
      {
        stepNumber = 7;
        rakaatRange = "Pehli do rakaaton mein";
        stepNameUrdu = "سُورَۃ یا آیات";
        arabicText = "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ";
        urduTransliteration = "Qul huwal lahu ahad. Allahus samad. Lam yalid wa lam yulad. Wa lam yakul lahu kufuwan ahad.";
        urduTranslation = "Kaho ke woh Allah aik hai. Allah be-niyaz hai. Na us ne kisi ko janam diya aur na woh kisi se paida hua. Aur koi bhi us ka hamsar nahi. (Koi bhi chhoti surah parh sakte hain)";
      },
      // Step 8: Ruku
      {
        stepNumber = 8;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "رُکُوع";
        arabicText = "سُبْحَانَ رَبِّيَ الْعَظِيمِ";
        urduTransliteration = "Subhana rabbiyal 'azeem (3 baar ya 5 ya 7 -- taak adad)";
        urduTranslation = "Paak hai mera parwardigar jo azmat wala hai -- ruku mein kamar jhukao, ghutne pakdo, teen baar parhna sunnat hai";
      },
      // Step 9: Qawmah (Ruku se uthna)
      {
        stepNumber = 9;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "قَوْمَہ";
        arabicText = "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا لَكَ الْحَمْدُ";
        urduTransliteration = "Sami'allahu liman hamidah -- Rabbana lakal hamd";
        urduTranslation = "Allah ne us ki sun li jis ne us ki taarif ki -- Aye hamare Rabb! Teri hi taarif hai -- seedha khar ho jao";
      },
      // Step 10: Pehla Sajdah
      {
        stepNumber = 10;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "پہلا سَجْدَہ";
        arabicText = "سُبْحَانَ رَبِّيَ الْأَعْلَى";
        urduTransliteration = "Subhana rabbiyal a'la (3 baar ya 5 ya 7 -- taak adad)";
        urduTranslation = "Paak hai mera parwardigar jo sab se buland hai -- maatha, naak, dono haath, dono ghutne, dono paaon ke angoothe zameen par rakho";
      },
      // Step 11: Jalsa (Do Sajdon ke darmiyan baith'na)
      {
        stepNumber = 11;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "جَلْسَہ";
        arabicText = "رَبِّ اغْفِرْ لِي";
        urduTransliteration = "Rabbighfirli";
        urduTranslation = "Aye mere Rabb! Mujhe maaf farma -- do sajdon ke darmiyan seedha beth jaao";
      },
      // Step 12: Doosra Sajdah
      {
        stepNumber = 12;
        rakaatRange = "Har rakaat mein";
        stepNameUrdu = "دُوسرا سَجْدَہ";
        arabicText = "سُبْحَانَ رَبِّيَ الْأَعْلَى";
        urduTransliteration = "Subhana rabbiyal a'la (3 baar)";
        urduTranslation = "Paak hai mera parwardigar jo sab se buland hai -- doosra sajda bhi isi tarah ada karo";
      },
      // Step 13: Qa'da Awwalah -- Attahiyat
      {
        stepNumber = 13;
        rakaatRange = "Do rakaaton ke baad (Qa'da Awwalah)";
        stepNameUrdu = "اَلتَّحِیَّات (قَعدَہ اَوَّلٰی)";
        arabicText = "اَلتَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ، اَلسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ، اَلسَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ";
        urduTransliteration = "Attahiyyatu lillahi wassalawatu wattayyibat. Assalamu 'alayka ayyuhan nabiyyu wa rahmatullahi wa barakatuh. Assalamu 'alayna wa 'ala 'ibadillahis salihin. Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.";
        urduTranslation = "Tamam zubani, badani aur maali ibaadatein Allah ke liye hain. Aye Nabi! Aap par salaam ho aur Allah ki rehmat aur barkatein hon. Hum par aur Allah ke tamam neek bandon par salaam ho. Main gawahi deta/deti hoon ke Allah ke siwa koi ma'bood nahi aur Muhammad (SAW) Allah ke bande aur rasool hain.";
      },
      // Step 14: Darood Ibrahim (Qa'da Akhirah mein)
      {
        stepNumber = 14;
        rakaatRange = "Aakhri qa'de mein (Qa'da Akhirah)";
        stepNameUrdu = "دُرُود اِبراہیم";
        arabicText = "اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَّعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَّجِيدٌ ۝ اَللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَّعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَّجِيدٌ";
        urduTransliteration = "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin kama sallayta 'ala Ibrahima wa 'ala ali Ibrahima innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammadin kama barakta 'ala Ibrahima wa 'ala ali Ibrahima innaka Hamidun Majid.";
        urduTranslation = "Aye Allah! Rehmat bhej Hazrat Muhammad (SAW) par aur unke aal par jis tarah tune rehmat bheji Hazrat Ibrahim (AS) par. Beshak tu taarif ke laayiq aur bari shaan wala hai. Aye Allah! Barkat naazil farma Hazrat Muhammad (SAW) par aur unke aal par jis tarah tune barkat naazil farmayi Hazrat Ibrahim (AS) par.";
      },
      // Step 15: Dua Masura (Qa'da Akhirah mein)
      {
        stepNumber = 15;
        rakaatRange = "Aakhri qa'de mein (Qa'da Akhirah)";
        stepNameUrdu = "دُعَائے مَاثُورَہ";
        arabicText = "اَللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَّلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِّنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ";
        urduTransliteration = "Allahumma inni zalamtu nafsi zulman kathiran wa la yaghfiruzu zunuba illa anta faghfirli maghfiratan min 'indika warhamni innaka antal ghafurur rahim.";
        urduTranslation = "Aye Allah! Maine apne aap par bahut zulm kiya aur gunaah koi nahi bakhshta siwa tere. Pas mujhe apni taraf se bakhsh de aur mujh par rehm farma. Beshak tu hi bakhshne wala, meharban hai.";
      },
      // Step 16: Salaam
      {
        stepNumber = 16;
        rakaatRange = "Namaaz ke aakhir mein";
        stepNameUrdu = "سَلَام";
        arabicText = "اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ";
        urduTransliteration = "Assalamu 'alaykum wa rahmatullah (pehle daayen taraf, phir baayen taraf)";
        urduTranslation = "Tum par salaam ho aur Allah ki rehmat ho -- pehle daayi taraf munh phero phir bayi taraf, is se namaaz mukammal hoti hai";
      },
    ];
  };

  public shared ({ caller }) func initialize() : async () {
    if (initialized) {
      Runtime.trap("Initialization already completed.");
    };

    let standardSteps = createStandardSteps();

    let fajr : Prayer = {
      id = "fajr";
      name = "فجر";
      totalRakaat = 4;
      fardRakaat = 2;
      sunnahRakaat = 2;
      steps = standardSteps;
    };

    let zuhr : Prayer = {
      id = "zuhr";
      name = "ظہر";
      totalRakaat = 12;
      fardRakaat = 4;
      sunnahRakaat = 8;
      steps = standardSteps;
    };

    let asr : Prayer = {
      id = "asr";
      name = "عصر";
      totalRakaat = 8;
      fardRakaat = 4;
      sunnahRakaat = 4;
      steps = standardSteps;
    };

    let maghrib : Prayer = {
      id = "maghrib";
      name = "مغرب";
      totalRakaat = 7;
      fardRakaat = 3;
      sunnahRakaat = 4;
      steps = standardSteps;
    };

    let isha : Prayer = {
      id = "isha";
      name = "عشاء";
      totalRakaat = 17;
      fardRakaat = 4;
      sunnahRakaat = 6;
      steps = standardSteps;
    };

    prayers.add("fajr", fajr);
    prayers.add("zuhr", zuhr);
    prayers.add("asr", asr);
    prayers.add("maghrib", maghrib);
    prayers.add("isha", isha);

    initialized := true;
  };

  public query ({ caller }) func getPrayer(prayerId : Text) : async ?Prayer {
    prayers.get(prayerId);
  };

  public query ({ caller }) func getAllPrayers() : async [Prayer] {
    prayers.values().toArray();
  };

  public query ({ caller }) func getPrayerSteps(prayerId : Text) : async [Step] {
    switch (prayers.get(prayerId)) {
      case (null) { Runtime.trap("Prayer not found") };
      case (?prayer) { prayer.steps };
    };
  };
};
