import { QueryClient } from "@tanstack/react-query";

// Single shared client for the galaxy app. Entitlement is the only thing we
// fetch from the server, and a stale 401 should not be retried into a storm —
// the galaxy works fully offline on the free default, so we fail quietly.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
