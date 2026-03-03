import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Prayer, Step } from "../backend.d";
import { useActor } from "./useActor";

export function useInitialize() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers"] });
    },
  });
}

export function useAllPrayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Prayer[]>({
    queryKey: ["prayers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPrayers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrayer(prayerId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Prayer>({
    queryKey: ["prayer", prayerId],
    queryFn: async (): Promise<Prayer> => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getPrayer(prayerId);
      if (!result) throw new Error("Prayer not found");
      return result;
    },
    enabled: !!actor && !isFetching && !!prayerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrayerSteps(prayerId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Step[]>({
    queryKey: ["prayer-steps", prayerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPrayerSteps(prayerId);
    },
    enabled: !!actor && !isFetching && !!prayerId,
    staleTime: 5 * 60 * 1000,
  });
}
