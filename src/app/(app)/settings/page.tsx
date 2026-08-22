import { api, HydrateClient } from "~/trpc/server";

import { SettingsForm } from "./_components/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  void api.config.get.prefetch();
  void api.presenter.list.prefetch();
  return (
    <HydrateClient>
      <SettingsForm />
    </HydrateClient>
  );
}
