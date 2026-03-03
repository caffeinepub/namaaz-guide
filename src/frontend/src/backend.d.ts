import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prayer {
    id: string;
    fardRakaat: bigint;
    sunnahRakaat: bigint;
    name: string;
    totalRakaat: bigint;
    steps: Array<Step>;
}
export interface Step {
    stepNameUrdu: string;
    urduTranslation: string;
    urduTransliteration: string;
    stepNumber: bigint;
    arabicText: string;
    rakaatRange: string;
}
export interface backendInterface {
    getAllPrayers(): Promise<Array<Prayer>>;
    getPrayer(prayerId: string): Promise<Prayer>;
    getPrayerSteps(prayerId: string): Promise<Array<Step>>;
    initialize(): Promise<void>;
}
