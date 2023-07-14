import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { type NextRequest } from "next/server";
import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

// export API handler
export default function handler(req: NextRequest) {
  return fetchRequestHandler({
    req,
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
    responseMeta({ paths, errors, type }) {
      const allPublic = paths && paths.every((path) => path.includes("videos"));
      // checking that no procedures errored
      const allOk = errors.length === 0;
      // checking we're doing a query request
      const isQuery = type === "query";
      // FIXME: the docs suggest to also check for ctx?.res, but we're not passing it, dk if we should
      if (allPublic && allOk && isQuery) {
        // cache request for 1 day + revalidate once every 2 minutes
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        const TWO_MINUTES_IN_SECONDS = 60 * 2;
        return {
          headers: {
            "cache-control": `s-maxage=${TWO_MINUTES_IN_SECONDS}, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
          },
        };
      }
      return {};
    },
  });
}

export const config = {
  runtime: "edge",
};
