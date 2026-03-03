import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useState } from "react";
import type { Step } from "../backend.d";
import { usePrayer, usePrayerSteps } from "../hooks/useQueries";

// Roman Urdu step names keyed by step number (16 steps for Ahle Sunnat wa Jama'at tareeqa)
const STEP_NAME_ROMAN: Record<string, string> = {
  "1": "Niyyat",
  "2": "Takbeer-e-Tahreema",
  "3": "Sana (Thana)",
  "4": "Ta'awwuz",
  "5": "Tasmiyah (Bismillah)",
  "6": "Surah Al-Fatiha",
  "7": "Surah ya Aayat",
  "8": "Ruku",
  "9": "Qawmah (Ruku se uthna)",
  "10": "Pehla Sajdah",
  "11": "Jalsa (Do Sajdon ke darmiyan)",
  "12": "Doosra Sajdah",
  "13": "Attahiyat (Qa'da Awwalah)",
  "14": "Darood Ibrahim",
  "15": "Dua Masura",
  "16": "Salaam",
};

// Roman Urdu rakaat range labels — handles new backend values + backward compat
const RAKAAT_RANGE_ROMAN: Record<string, string> = {
  "Har rakaat mein": "Har rakaat mein",
  "Sirf pehli rakaat mein": "Sirf pehli rakaat mein",
  "Pehli do rakaaton mein": "Pehli do rakaaton mein",
  "Do rakaaton ke baad (Qa'da Awwalah)": "Do rakaaton ke baad (Qa'da Awwalah)",
  "Aakhri qa'de mein (Qa'da Akhirah)": "Aakhri qa'de mein (Qa'da Akhirah)",
  "Namaaz ke aakhir mein": "Namaaz ke aakhir mein",
  // backward compat
  all: "Har rakaat mein",
  last_only: "Aakhri rakaat mein",
  "Sab rakaaton mein": "Har rakaat mein",
  "Pehli do rakaaton mein (backward)": "Pehli do rakaaton mein",
  "Do rakaaton ke baad": "Do rakaaton ke baad (Qa'da Awwalah)",
  "Aakhri rakaat mein": "Aakhri qa'de mein (Qa'da Akhirah)",
};

const PRAYER_META: Record<
  string,
  { arabic: string; icon: string; color: string }
> = {
  fajr: { arabic: "الفجر", icon: "🌅", color: "oklch(0.65 0.12 210)" },
  zuhr: { arabic: "الظهر", icon: "☀️", color: "oklch(0.76 0.13 82)" },
  asr: { arabic: "العصر", icon: "🌤️", color: "oklch(0.68 0.11 175)" },
  maghrib: { arabic: "المغرب", icon: "🌇", color: "oklch(0.72 0.14 55)" },
  isha: { arabic: "العشاء", icon: "🌙", color: "oklch(0.60 0.10 260)" },
};

function getPrayerMeta(id: string) {
  return (
    PRAYER_META[id.toLowerCase()] || {
      arabic: "",
      icon: "🕌",
      color: "oklch(0.76 0.13 82)",
    }
  );
}

// Returns Ahle Sunnat breakdown string for each prayer
function getPrayerBreakdown(id: string): string {
  switch (id.toLowerCase()) {
    case "fajr":
      return "2 Sunnat + 2 Farz";
    case "zuhr":
      return "4 Sunnat + 4 Farz + 2 Sunnat + 2 Nafil";
    case "asr":
      return "4 Sunnat + 4 Farz";
    case "maghrib":
      return "3 Farz + 2 Sunnat + 2 Nafil";
    case "isha":
      return "4 Sunnat + 4 Farz + 2 Sunnat + 3 Witr + 2 Nafil";
    default:
      return "";
  }
}

interface StepCardProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  direction: number;
}

function StepCard({ step, stepIndex, totalSteps, direction }: StepCardProps) {
  const stepName =
    STEP_NAME_ROMAN[step.stepNumber.toString()] || step.stepNameUrdu;
  const rakaatRangeDisplay =
    RAKAAT_RANGE_ROMAN[step.rakaatRange] || step.rakaatRange;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={`step-${step.stepNumber.toString()}`}
        data-ocid="step.panel"
        custom={direction}
        initial={{ opacity: 0, x: direction * 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -40 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="step-panel rounded-2xl p-6 md:p-8 space-y-5"
      >
        {/* Step header — name + step count badge */}
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className="text-[oklch(0.76_0.13_82)] border-[oklch(0.76_0.13_82_/_0.4)] bg-[oklch(0.76_0.13_82_/_0.08)] text-sm px-3 py-1 shrink-0"
          >
            {stepIndex + 1} / {totalSteps}
          </Badge>
          <p className="text-[oklch(0.82_0.15_80)] text-lg font-semibold text-right">
            {stepName}
          </p>
        </div>

        {/* Rakaat range — always shown as prominent info badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.76_0.13_82_/_0.25)]" />
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[oklch(0.76_0.13_82_/_0.4)] bg-[oklch(0.76_0.13_82_/_0.1)]">
            <Star
              className="h-3 w-3 text-[oklch(0.76_0.13_82)] fill-[oklch(0.76_0.13_82)]"
              aria-hidden="true"
            />
            <span className="text-[oklch(0.78_0.09_82)] text-xs font-medium">
              {rakaatRangeDisplay || "Har rakaat mein"}
            </span>
            <Star
              className="h-3 w-3 text-[oklch(0.76_0.13_82)] fill-[oklch(0.76_0.13_82)]"
              aria-hidden="true"
            />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.76_0.13_82_/_0.25)]" />
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.76_0.13_82_/_0.4)]" />
          <span className="text-[oklch(0.76_0.13_82_/_0.6)] text-lg">❋</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.76_0.13_82_/_0.4)]" />
        </div>

        {/* Arabic text — keep RTL */}
        {step.arabicText && (
          <div className="text-center py-4">
            <p
              className="text-[oklch(0.92_0.025_80)] leading-loose"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                fontFamily:
                  '"Scheherazade New", "Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif',
                direction: "rtl",
                textAlign: "center",
                lineHeight: 2.2,
                textShadow: "0 0 20px oklch(0.76 0.13 82 / 0.2)",
              }}
            >
              {step.arabicText}
            </p>
          </div>
        )}

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.76_0.13_82_/_0.2)]" />
          <span className="text-[oklch(0.76_0.13_82_/_0.4)] text-sm">✦</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.76_0.13_82_/_0.2)]" />
        </div>

        {/* Transliteration */}
        {step.urduTransliteration && (
          <div className="bg-[oklch(0.18_0.05_155_/_0.5)] rounded-xl px-5 py-4">
            <p
              className="text-[oklch(0.72_0.04_90)] text-center"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                lineHeight: 1.8,
              }}
            >
              {step.urduTransliteration}
            </p>
          </div>
        )}

        {/* Translation */}
        {step.urduTranslation && (
          <div className="px-5 py-3 border-l-2 border-[oklch(0.76_0.13_82_/_0.4)]">
            <p
              className="text-[oklch(0.60_0.035_90)] italic"
              style={{
                fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                lineHeight: 1.8,
              }}
            >
              Tarjuma: {step.urduTranslation}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function PrayerDetailPage() {
  const params = useParams({ from: "/prayer/$id" });
  const prayerId = params.id;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  const {
    data: prayer,
    isLoading: prayerLoading,
    isError: prayerError,
  } = usePrayer(prayerId);
  const {
    data: steps,
    isLoading: stepsLoading,
    isError: stepsError,
  } = usePrayerSteps(prayerId);

  const isLoading = prayerLoading || stepsLoading;
  const isError = prayerError || stepsError;

  const sortedSteps = steps
    ? [...steps].sort((a, b) => Number(a.stepNumber) - Number(b.stepNumber))
    : [];

  const totalSteps = sortedSteps.length;
  const currentStep = sortedSteps[currentStepIndex];

  // Reset step when prayer changes - prayerId is the correct dep here
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on prayerId change
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [prayerId]);

  const totalRakaat = prayer?.totalRakaat?.toString() ?? "?";

  function handleNext() {
    if (currentStepIndex < totalSteps - 1) {
      setSlideDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setSlideDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  const meta = getPrayerMeta(prayerId);
  const breakdown = getPrayerBreakdown(prayerId);
  const progressPercent =
    totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div
      data-ocid="prayer.page"
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/assets/generated/namaaz-bg-pattern.dim_800x800.png')`,
        backgroundSize: "400px 400px",
        backgroundRepeat: "repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.09_0.04_160_/_0.94)] via-[oklch(0.12_0.045_158_/_0.90)] to-[oklch(0.09_0.04_160_/_0.96)] pointer-events-none" />

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[oklch(0.76_0.13_82)] to-transparent opacity-70" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Navigation Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <Link to="/" data-ocid="nav.back_button">
            <Button
              variant="ghost"
              className="text-[oklch(0.72_0.06_82)] hover:text-[oklch(0.82_0.15_80)] hover:bg-[oklch(0.76_0.13_82_/_0.1)] gap-2 border border-[oklch(0.76_0.13_82_/_0.2)] rounded-xl px-4 py-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Wapas</span>
            </Button>
          </Link>

          {prayer && (
            <div className="text-center flex-1 px-4">
              <p
                className="text-[oklch(0.82_0.15_80)] text-2xl"
                style={{
                  fontFamily:
                    '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                  direction: "rtl",
                  lineHeight: 1.8,
                  textShadow: "0 0 12px oklch(0.76 0.13 82 / 0.3)",
                }}
              >
                {meta.arabic || prayer.name}
              </p>
              <p className="text-[oklch(0.62_0.04_90)] text-sm">
                {prayer.name}
              </p>
            </div>
          )}

          <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-full bg-[oklch(0.76_0.13_82_/_0.12)] border border-[oklch(0.76_0.13_82_/_0.3)]">
            {meta.icon}
          </div>
        </motion.header>

        {/* Loading State */}
        {isLoading && (
          <div data-ocid="step.loading_state" className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto rounded-xl bg-[oklch(0.22_0.055_155_/_0.6)]" />
            <Skeleton className="h-32 w-full rounded-2xl bg-[oklch(0.22_0.055_155_/_0.6)]" />
            <Skeleton className="h-48 w-full rounded-2xl bg-[oklch(0.22_0.055_155_/_0.6)]" />
            <Skeleton className="h-20 w-full rounded-xl bg-[oklch(0.22_0.055_155_/_0.4)]" />
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div
            data-ocid="step.error_state"
            className="text-center py-16 rounded-2xl border border-[oklch(0.577_0.245_27_/_0.4)] bg-[oklch(0.18_0.04_20_/_0.5)]"
          >
            <p className="text-[oklch(0.80_0.08_25)] text-lg mb-4">
              Namaaz ka tareeqa load nahi hua. Wapas jayen aur dobara koshish
              karein.
            </p>
            <Link to="/" data-ocid="nav.back_button">
              <Button
                variant="outline"
                className="text-[oklch(0.76_0.13_82)] border-[oklch(0.76_0.13_82_/_0.4)] hover:bg-[oklch(0.76_0.13_82_/_0.1)]"
              >
                Ghar Wapas
              </Button>
            </Link>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !isError && prayer && sortedSteps.length > 0 && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Intro Card — Ahle Sunnat wa Jama'at info */}
            <motion.div
              data-ocid="prayer.intro_card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border border-[oklch(0.76_0.13_82_/_0.35)] bg-gradient-to-br from-[oklch(0.16_0.055_155_/_0.7)] to-[oklch(0.13_0.04_158_/_0.8)] px-5 py-4 space-y-3"
            >
              {/* Arabic prayer name large */}
              <div className="text-center">
                <p
                  className="text-[oklch(0.85_0.15_80)] leading-relaxed"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    fontFamily:
                      '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                    direction: "rtl",
                    lineHeight: 2,
                    textShadow: "0 0 18px oklch(0.76 0.13 82 / 0.35)",
                  }}
                >
                  {meta.arabic || prayer.name}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.76_0.13_82_/_0.35)]" />
                <span className="text-[oklch(0.76_0.13_82_/_0.5)] text-sm">
                  ✦
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.76_0.13_82_/_0.35)]" />
              </div>

              {/* Breakdown + total */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[oklch(0.82_0.15_80)] border-[oklch(0.76_0.13_82_/_0.5)] bg-[oklch(0.76_0.13_82_/_0.1)] text-xs px-2.5 py-0.5"
                  >
                    {totalRakaat} Rakaat
                  </Badge>
                  {breakdown && (
                    <span className="text-[oklch(0.65_0.045_90)] text-xs">
                      {breakdown}
                    </span>
                  )}
                </div>

                {/* Maslak badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(0.76_0.13_82_/_0.12)] border border-[oklch(0.76_0.13_82_/_0.3)]">
                  <span className="text-[oklch(0.76_0.13_82)] text-xs">☪</span>
                  <span className="text-[oklch(0.72_0.08_82)] text-xs font-medium">
                    Ahle Sunnat wa Jama'at ka tareeqa
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Prayer Info Bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[oklch(0.18_0.055_155_/_0.6)] border border-[oklch(0.76_0.13_82_/_0.2)]">
              <div className="text-[oklch(0.70_0.04_90)] text-sm">
                {breakdown ? (
                  <span>
                    <span className="text-[oklch(0.76_0.13_82)] font-medium">
                      Rakaat:
                    </span>{" "}
                    {breakdown}
                  </span>
                ) : (
                  <>
                    <span className="text-[oklch(0.76_0.13_82)]">Farz:</span>{" "}
                    {prayer.fardRakaat.toString()}
                    {prayer.sunnahRakaat > 0n && (
                      <>
                        {" "}
                        &nbsp;
                        <span className="text-[oklch(0.76_0.13_82)]">
                          Sunnat:
                        </span>{" "}
                        {prayer.sunnahRakaat.toString()}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Step progress indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[oklch(0.76_0.13_82)] text-sm font-semibold">
                  Qadam {currentStepIndex + 1} / {totalSteps}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[oklch(0.55_0.04_90)]">
                <span>
                  Qadam {currentStepIndex + 1} / {totalSteps}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-1.5 bg-[oklch(0.22_0.055_155)] [&>div]:bg-[oklch(0.76_0.13_82)]"
              />
            </div>

            {/* Step Card */}
            {currentStep && (
              <StepCard
                step={currentStep}
                stepIndex={currentStepIndex}
                totalSteps={totalSteps}
                direction={slideDirection}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <Button
                data-ocid="step.prev_button"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                variant="outline"
                className="flex-1 h-12 text-[oklch(0.82_0.15_80)] border-[oklch(0.76_0.13_82_/_0.4)] bg-[oklch(0.76_0.13_82_/_0.08)] hover:bg-[oklch(0.76_0.13_82_/_0.18)] disabled:opacity-30 disabled:cursor-not-allowed gap-2 rounded-xl transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
                <span>Pichla</span>
              </Button>

              <div className="flex gap-1.5 items-center justify-center px-2">
                {sortedSteps.map((step, i) => (
                  <button
                    key={step.stepNumber.toString()}
                    type="button"
                    onClick={() => {
                      setSlideDirection(i > currentStepIndex ? 1 : -1);
                      setCurrentStepIndex(i);
                    }}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentStepIndex
                        ? "w-5 h-2 bg-[oklch(0.76_0.13_82)]"
                        : "w-2 h-2 bg-[oklch(0.76_0.13_82_/_0.3)] hover:bg-[oklch(0.76_0.13_82_/_0.5)]"
                    }`}
                    aria-label={`Qadam ${i + 1}`}
                  />
                ))}
              </div>

              <Button
                data-ocid="step.next_button"
                onClick={handleNext}
                disabled={currentStepIndex === totalSteps - 1}
                className="flex-1 h-12 bg-[oklch(0.76_0.13_82)] hover:bg-[oklch(0.82_0.15_80)] text-[oklch(0.12_0.038_160)] disabled:opacity-30 disabled:cursor-not-allowed gap-2 rounded-xl font-semibold transition-all duration-200 shadow-gold"
              >
                <span>Agla</span>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Completion Message */}
            <AnimatePresence>
              {currentStepIndex === totalSteps - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8 rounded-2xl bg-gradient-to-b from-[oklch(0.76_0.13_82_/_0.1)] to-[oklch(0.76_0.13_82_/_0.05)] border border-[oklch(0.76_0.13_82_/_0.35)] space-y-3"
                >
                  {/* Completion dua in Arabic */}
                  <p
                    className="text-[oklch(0.82_0.15_80)] text-2xl"
                    style={{
                      fontFamily:
                        '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                      direction: "rtl",
                      lineHeight: 2,
                    }}
                  >
                    اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ
                  </p>

                  <div className="flex items-center justify-center gap-2 px-6">
                    <div className="h-px flex-1 bg-[oklch(0.76_0.13_82_/_0.3)]" />
                    <span className="text-[oklch(0.76_0.13_82)] text-lg">
                      🤲
                    </span>
                    <div className="h-px flex-1 bg-[oklch(0.76_0.13_82_/_0.3)]" />
                  </div>

                  <p className="text-[oklch(0.82_0.15_80)] text-xl font-semibold px-4">
                    MashaAllah! Namaaz mukammal hui
                  </p>
                  <p className="text-[oklch(0.60_0.04_90)] text-sm px-6">
                    Allah Ta'ala aap ki namaaz qabool farmaye, Ameen
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 border-t border-[oklch(0.76_0.13_82_/_0.15)] mt-8">
        <p className="text-[oklch(0.40_0.03_90)] text-sm">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-[oklch(0.76_0.13_82)]">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.58_0.06_82)] hover:text-[oklch(0.76_0.13_82)] transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
