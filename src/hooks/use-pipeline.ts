"use client";

import { useEffect } from "react";

import { isTerminal } from "~/components/status-badge";
import { api } from "~/trpc/react";
import { type MediaStatus } from "../../generated/prisma";

/**
 * Drives a media item through the pipeline from the browser: while the item
 * isn't terminal, repeatedly call `media.advance` (one bounded step per call).
 */
export function usePipelineDriver(
  item: { id: string; status: MediaStatus } | null | undefined,
) {
  const utils = api.useUtils();
  const advance = api.media.advance.useMutation({
    onSuccess: (data) => {
      utils.media.byId.setData({ id: data.id }, data);
      void utils.media.list.invalidate();
      if (isTerminal(data.status)) void utils.article.feed.invalidate();
    },
  });
  const { mutate, isPending } = advance;
  const id = item?.id;
  const status = item?.status;

  useEffect(() => {
    if (!id || !status || isTerminal(status) || isPending) return;
    const delay =
      status === "GENERATING_VIDEO" || status === "GENERATING_SUBTITLES"
        ? 4000
        : 1200;
    const t = setTimeout(() => mutate({ id }), delay);
    return () => clearTimeout(t);
  }, [id, status, isPending, mutate]);

  return advance;
}
