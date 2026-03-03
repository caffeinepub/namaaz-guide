import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

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

  public shared ({ caller }) func initialize() : async () {
    if (prayers.isEmpty()) {
      let fajr : Prayer = {
        id = "fajr";
        name = "فجر";
        totalRakaat = 4;
        fardRakaat = 2;
        sunnahRakaat = 2;
        steps = [
          {
            stepNumber = 1;
            rakaatRange = "all";
            stepNameUrdu = "تکبیر تحریمہ";
            arabicText = "الله أكبر";
            urduTransliteration = "Allahu Akbar";
            urduTranslation = "الله سب سے بڑا ہے";
          },
          {
            stepNumber = 14;
            rakaatRange = "last_only";
            stepNameUrdu = "تشہّد";
            arabicText = "اتاھیات، درود پاک، ربنا آتنا";
            urduTransliteration = "Attahiyat...";
            urduTranslation = "سلام پھیری سے پہلے تشہد پڑھنا";
          },
        ];
      };

      let zuhr : Prayer = {
        id = "zuhr";
        name = "ظہر";
        totalRakaat = 12;
        fardRakaat = 4;
        sunnahRakaat = 8;
        steps = fajr.steps;
      };

      let asr : Prayer = {
        id = "asr";
        name = "عصر";
        totalRakaat = 8;
        fardRakaat = 4;
        sunnahRakaat = 4;
        steps = fajr.steps;
      };

      let maghrib : Prayer = {
        id = "maghrib";
        name = "مغرب";
        totalRakaat = 7;
        fardRakaat = 3;
        sunnahRakaat = 4;
        steps = fajr.steps;
      };

      let isha : Prayer = {
        id = "isha";
        name = "عشاء";
        totalRakaat = 17;
        fardRakaat = 4;
        sunnahRakaat = 6;
        steps = fajr.steps;
      };

      prayers.add("fajr", fajr);
      prayers.add("zuhr", zuhr);
      prayers.add("asr", asr);
      prayers.add("maghrib", maghrib);
      prayers.add("isha", isha);
    };
  };

  public query ({ caller }) func getPrayer(prayerId : Text) : async Prayer {
    switch (prayers.get(prayerId)) {
      case (null) { Runtime.trap("Prayer not found") };
      case (?prayer) { prayer };
    };
  };

  public query ({ caller }) func getAllPrayers() : async [Prayer] {
    prayers.values().toArray();
  };

  public query ({ caller }) func getPrayerSteps(prayerId : Text) : async [Step] {
    switch (prayers.get(prayerId)) {
      case (null) { Runtime.trap("Prayer not found") };
      case (?prayer) {
        prayer.steps;
      };
    };
  };
};
