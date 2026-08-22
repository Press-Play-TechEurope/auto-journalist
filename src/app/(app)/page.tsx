import { api, HydrateClient } from "~/trpc/server";

import { Feed } from "./_components/feed";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  void api.article.feed.prefetch({});
  void api.source.list.prefetch();
  void api.folder.list.prefetch();
  void api.presenter.list.prefetch();
  void api.config.get.prefetch();
  return (
    <HydrateClient>
      <Feed />
    </HydrateClient>
  );
}
