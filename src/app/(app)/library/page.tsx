import { api, HydrateClient } from "~/trpc/server";

import { LibraryGrid } from "./_components/library-grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Library" };

export default async function LibraryPage() {
  void api.media.list.prefetch();
  return (
    <HydrateClient>
      <LibraryGrid />
    </HydrateClient>
  );
}
