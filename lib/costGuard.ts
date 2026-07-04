export type SpendStore = {
  get(day: string): number;
  add(day: string, usd: number): void;
};

/**
 * Daily spend circuit breaker. Pure and injectable (store + clock) so it is
 * fully testable; Phase 3 wires `store` to a Supabase `spend_ledger` table.
 * `capUsd` comes from env DAILY_SPEND_CAP_USD (default 20).
 */
export function makeCostGuard(store: SpendStore, capUsd: number, now: () => Date) {
  const today = () => now().toISOString().slice(0, 10);
  return {
    canSpend(estUsd: number): boolean {
      return store.get(today()) + estUsd <= capUsd;
    },
    record(usd: number): void {
      store.add(today(), usd);
    },
    spentToday(): number {
      return store.get(today());
    },
  };
}
