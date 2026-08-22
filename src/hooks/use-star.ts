"use client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";

type FeedPage = RouterOutputs["article"]["feed"];

/**
 * Star / unstar an article. Optimistically flips `starredAt` in every cached
 * feed page (all folder/source/search combinations) so the star reacts
 * instantly, then refetches to settle the "Starred" view and its count.
 */
export function useStar() {
  const utils = api.useUtils();
  const queryClient = useQueryClient();
  const feedKey = getQueryKey(api.article.feed);

  const mutation = api.article.setStarred.useMutation({
    onMutate: async ({ id, starred }) => {
      await queryClient.cancelQueries({ queryKey: feedKey });
      const starredAt = starred ? new Date() : null;
      const patchPage = (p: FeedPage): FeedPage => ({
        ...p,
        items: p.items.map((a) => (a.id === id ? { ...a, starredAt } : a)),
      });
      // The key prefix matches both the infinite query the feed uses and the
      // plain `feed` query prefetched on the server, so handle either shape.
      queryClient.setQueriesData<FeedPage | InfiniteData<FeedPage>>(
        { queryKey: feedKey },
        (data) =>
          !data
            ? data
            : "pages" in data
              ? { ...data, pages: data.pages.map(patchPage) }
              : patchPage(data),
      );
      utils.article.starredCount.setData(undefined, (n) =>
        n === undefined ? n : Math.max(0, n + (starred ? 1 : -1)),
      );
    },
    onError: (e) => toast.error(e.message),
    onSettled: () => {
      void utils.article.feed.invalidate();
      void utils.article.starredCount.invalidate();
    },
  });

  const toggle = (article: { id: string; starredAt: Date | null }) =>
    mutation.mutate({ id: article.id, starred: !article.starredAt });

  return { toggle, isPending: mutation.isPending };
}
