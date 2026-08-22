import { api, HydrateClient } from "~/trpc/server";

import { MediaDetail } from "./_components/media-detail";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void api.media.byId.prefetch({ id });
  return (
    <HydrateClient>
      <MediaDetail id={id} />
    </HydrateClient>
  );
}
