import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useActor } from "../hooks/useActor";
import { useAllPrayers } from "../hooks/useQueries";

// Prayer display data — Arabic names and Roman Urdu metadata
const PRAYER_META: Record<
  string,
  { arabic: string; romanName: string; time: string; icon: string }
> = {
  fajr: {
    arabic: "الفجر",
    romanName: "Fajr",
    time: "Subah",
    icon: "🌅",
  },
  zuhr: {
    arabic: "الظهر",
    romanName: "Zuhr",
    time: "Dopahar",
    icon: "☀️",
  },
  asr: {
    arabic: "العصر",
    romanName: "Asr",
    time: "Sham se pehle",
    icon: "🌤️",
  },
  maghrib: {
    arabic: "المغرب",
    romanName: "Maghrib",
    time: "Ghurub-e-aftab",
    icon: "🌇",
  },
  isha: {
    arabic: "العشاء",
    romanName: "Isha",
    time: "Raat",
    icon: "🌙",
  },
};

function getPrayerMeta(prayerId: string) {
  const key = prayerId.toLowerCase();
  return (
    PRAYER_META[key] || {
      arabic: "",
      romanName: prayerId,
      time: "",
      icon: "🕌",
    }
  );
}

const CARD_COLORS = [
  "from-[oklch(0.22_0.07_195)] to-[oklch(0.17_0.05_170)]",
  "from-[oklch(0.22_0.06_145)] to-[oklch(0.17_0.04_155)]",
  "from-[oklch(0.22_0.07_170)] to-[oklch(0.17_0.05_185)]",
  "from-[oklch(0.22_0.065_150)] to-[oklch(0.17_0.04_160)]",
  "from-[oklch(0.20_0.06_160)] to-[oklch(0.15_0.04_155)]",
];

export default function HomePage() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const initMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers"] });
    },
  });

  const { data: prayers, isLoading, isError } = useAllPrayers();

  const { mutate: runInit, isPending: initPending } = initMutation;

  // Initialize and load prayers
  useEffect(() => {
    if (actor && !actorFetching && !initPending) {
      runInit();
    }
  }, [actor, actorFetching, initPending, runInit]);

  const isPageLoading = actorFetching || isLoading || initPending;

  return (
    <div
      data-ocid="home.page"
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/assets/generated/namaaz-bg-pattern.dim_800x800.png')`,
        backgroundSize: "400px 400px",
        backgroundRepeat: "repeat",
      }}
    >
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.04_160_/_0.92)] via-[oklch(0.13_0.045_158_/_0.88)] to-[oklch(0.10_0.04_160_/_0.95)] pointer-events-none" />

      {/* Decorative geometric ornament top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[oklch(0.76_0.13_82)] to-transparent opacity-60" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-14"
        >
          {/* Bismillah — Arabic, keep RTL */}
          <p
            className="text-[oklch(0.76_0.13_82)] text-3xl mb-6 animate-pulse-gold"
            style={{
              fontFamily:
                '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
              direction: "rtl",
              lineHeight: 2,
            }}
          >
            بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِیۡمِ
          </p>

          {/* App Title */}
          <h1
            className="text-5xl font-display font-bold text-[oklch(0.90_0.025_80)] mb-2 tracking-wide"
            style={{
              textShadow: "0 0 30px oklch(0.76 0.13 82 / 0.35)",
            }}
          >
            Namaaz Guide
          </h1>

          {/* Gold ornament divider */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[oklch(0.76_0.13_82_/_0.7)]" />
            <span className="text-[oklch(0.76_0.13_82)] text-xl">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[oklch(0.76_0.13_82_/_0.7)]" />
          </div>

          <p className="text-[oklch(0.72_0.04_90)] text-xl">
            Roz ki paanch namazoun ka mukammal tareeqa
          </p>
        </motion.header>

        {/* Loading State */}
        {isPageLoading && (
          <div data-ocid="home.loading_state" className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-28 w-full rounded-xl bg-[oklch(0.22_0.055_155_/_0.6)]"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isPageLoading && (
          <div
            data-ocid="home.error_state"
            className="text-center py-12 rounded-xl border border-[oklch(0.577_0.245_27_/_0.4)] bg-[oklch(0.18_0.04_20_/_0.5)]"
          >
            <p className="text-[oklch(0.80_0.08_25)] text-lg">
              Data load karne mein kharabi. Dobara koshish karein.
            </p>
          </div>
        )}

        {/* Prayer Cards */}
        {!isPageLoading && !isError && prayers && (
          <motion.main
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="space-y-4"
          >
            {prayers.map((prayer, index) => {
              const meta = getPrayerMeta(prayer.id);
              const cardGradient = CARD_COLORS[index % CARD_COLORS.length];
              const ocidIndex = index + 1;

              return (
                <motion.div
                  key={prayer.id}
                  data-ocid={`prayer.item.${ocidIndex}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  }}
                  whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/prayer/$id"
                    params={{ id: prayer.id }}
                    className="block"
                    data-ocid={`prayer.item.${ocidIndex}`}
                  >
                    <div
                      className={`prayer-card-glow rounded-2xl bg-gradient-to-br ${cardGradient} p-5 cursor-pointer transition-all duration-300`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[oklch(0.76_0.13_82_/_0.15)] border border-[oklch(0.76_0.13_82_/_0.3)]">
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Arabic name — keep RTL */}
                          <p
                            className="text-[oklch(0.82_0.15_80)] text-2xl font-bold leading-tight"
                            style={{
                              fontFamily:
                                '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                              textShadow: "0 0 12px oklch(0.76 0.13 82 / 0.3)",
                              direction: "rtl",
                            }}
                          >
                            {meta.arabic}
                          </p>
                          {/* Roman name + time */}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[oklch(0.85_0.025_80)] text-base font-medium">
                              {meta.romanName}
                            </span>
                            <span className="text-[oklch(0.55_0.04_90)] text-xs">
                              •
                            </span>
                            <span className="text-[oklch(0.62_0.04_90)] text-sm">
                              {meta.time}
                            </span>
                          </div>
                        </div>

                        {/* Rakaat info */}
                        <div className="flex-shrink-0 text-left flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="text-[oklch(0.82_0.15_80)] border-[oklch(0.76_0.13_82_/_0.5)] bg-[oklch(0.76_0.13_82_/_0.1)] text-xs px-2 py-0.5"
                          >
                            {prayer.totalRakaat.toString()} Rakaat
                          </Badge>
                          <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-[oklch(0.60_0.04_90)] text-xs">
                              Farz: {prayer.fardRakaat.toString()}
                            </span>
                            {prayer.sunnahRakaat > 0n && (
                              <span className="text-[oklch(0.55_0.04_90)] text-xs">
                                Sunnat: {prayer.sunnahRakaat.toString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.main>
        )}

        {/* Empty state */}
        {!isPageLoading && !isError && (!prayers || prayers.length === 0) && (
          <div
            data-ocid="home.empty_state"
            className="text-center py-16 rounded-2xl border border-[oklch(0.76_0.13_82_/_0.2)] bg-[oklch(0.18_0.05_155_/_0.5)]"
          >
            <p className="text-[oklch(0.65_0.04_90)] text-lg">
              Koi namaaz dastiyab nahi. Dobara load karein.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-[oklch(0.76_0.13_82_/_0.15)]">
        <p className="text-[oklch(0.45_0.03_90)] text-sm">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-[oklch(0.76_0.13_82)]">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.65_0.06_82)] hover:text-[oklch(0.76_0.13_82)] transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
