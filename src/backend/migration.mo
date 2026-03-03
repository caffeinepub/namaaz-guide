import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type Step = {
    stepNumber : Nat;
    rakaatRange : Text;
    stepNameUrdu : Text;
    arabicText : Text;
    urduTransliteration : Text;
    urduTranslation : Text;
  };

  type Prayer = {
    id : Text;
    name : Text;
    totalRakaat : Nat;
    fardRakaat : Nat;
    sunnahRakaat : Nat;
    steps : [Step];
  };

  type OldActor = {
    prayers : Map.Map<Text, Prayer>;
  };

  type NewActor = {
    prayers : Map.Map<Text, Prayer>;
    initialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    { prayers = old.prayers; initialized = false };
  };
};
