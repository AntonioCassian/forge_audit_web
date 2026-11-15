import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
const ACTIVITY_KEY = 'forgeaudit:lastActivity';

interface UseIdleTimerOptions {
  timeoutMs: number;
  onIdle: () => void;
  enabled?: boolean;
}

/**
 * Dispara onIdle após `timeoutMs` sem interação.
 * - A última atividade fica em localStorage, então várias abas compartilham o mesmo relógio.
 * - A checagem é feita por timestamp (a cada 1s), não por um único setTimeout: assim abas em
 *   segundo plano ou o computador em suspensão não "estendem" a sessão por timers atrasados.
 */
export function useIdleTimer({ timeoutMs, onIdle, enabled = true }: UseIdleTimerOptions): void {
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    let lastWrite = 0;
    let fallbackLast = Date.now();

    const markActivity = () => {
      const now = Date.now();
      if (now - lastWrite < 1000) return; // limita escritas no storage
      lastWrite = now;
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {
        /* storage indisponível: a checagem usa o fallback local */
      }
    };

    const readLast = (): number => {
      const stored = Number(localStorage.getItem(ACTIVITY_KEY));
      return Number.isFinite(stored) && stored > 0 ? stored : fallbackLast;
    };

    const onAny = () => {
      fallbackLast = Date.now();
      markActivity();
    };

    markActivity();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onAny, { passive: true }));

    let fired = false;
    const check = () => {
      if (fired) return;
      if (Date.now() - readLast() >= timeoutMs) {
        fired = true;
        onIdleRef.current();
      }
    };
    const interval = window.setInterval(check, 1000);
    document.addEventListener('visibilitychange', check);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onAny));
    };
  }, [enabled, timeoutMs]);
}
