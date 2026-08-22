"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PresenterPicker } from "~/components/presenter-picker";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { voiceLabel } from "~/server/voices";
import { api } from "~/trpc/react";

const TTS_MODELS = [
  {
    value: "fal-ai/minimax/speech-02-hd",
    label: "MiniMax Speech-02 HD (fal.ai)",
  },
  {
    value: "fal-ai/minimax/speech-02-turbo",
    label: "MiniMax Speech-02 Turbo (fal.ai)",
  },
];

export function SettingsForm() {
  const utils = api.useUtils();
  const config = api.config.get.useQuery();
  const presenters = api.presenter.list.useQuery();

  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [targetSeconds, setTargetSeconds] = useState(45);
  const [defaultPresenterId, setDefaultPresenterId] = useState<
    string | undefined
  >();
  const [ttsModel, setTtsModel] = useState(TTS_MODELS[0]!.value);

  useEffect(() => {
    if (!config.data) return;
    setBrandName(config.data.brandName);
    setTone(config.data.tone);
    setTargetSeconds(config.data.targetSeconds);
    setDefaultPresenterId(config.data.defaultPresenterId ?? undefined);
    setTtsModel(config.data.ttsModel);
  }, [config.data]);

  const update = api.config.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      void utils.config.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!config.data) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate({
          brandName,
          tone,
          targetSeconds,
          defaultPresenterId: defaultPresenterId ?? null,
          ttsModel,
        });
      }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Org-wide defaults used for every generated video.
          </p>
        </div>
        <Button type="submit" className="ml-auto" disabled={update.isPending}>
          <Save data-icon="inline-start" /> Save
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brand & voice</CardTitle>
            <CardDescription>Fed into the script prompt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand name</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone & style instructions</Label>
              <Textarea
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetSeconds">Target length (seconds)</Label>
                <Input
                  id="targetSeconds"
                  type="number"
                  min={15}
                  max={180}
                  value={targetSeconds}
                  onChange={(e) => setTargetSeconds(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Text-to-speech model</Label>
                <Select
                  items={TTS_MODELS}
                  value={ttsModel}
                  onValueChange={(v) => v && setTtsModel(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TTS_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default presenter</CardTitle>
            <CardDescription>
              Pre-selected when generating; each presenter has a default voice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PresenterPicker
              value={defaultPresenterId}
              onChange={setDefaultPresenterId}
            />
            <ul className="text-muted-foreground space-y-1 text-sm">
              {presenters.data?.map((p) => (
                <li key={p.id}>
                  <span className="text-foreground font-medium">{p.name}</span>{" "}
                  — {p.bio} Voice: {voiceLabel(p.voiceId)}.
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
