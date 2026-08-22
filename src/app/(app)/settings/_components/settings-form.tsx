"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PresenterPicker } from "~/components/presenter-picker";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "~/components/ui/combobox";
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
import { VoicePicker } from "~/components/voice-picker";
import {
  DEFAULT_SUBTITLE_LANGUAGE,
  isSubtitleLanguage,
  SUBTITLE_LANGUAGES,
  type SubtitleLanguage,
  type SubtitleLanguageEntry,
} from "~/server/subtitle-languages";
import {
  DEFAULT_SUBTITLE_PRESET,
  isSubtitlePreset,
  SUBTITLE_PRESETS,
  type SubtitlePreset,
} from "~/server/subtitle-presets";
import { isTtsModel, TTS_MODELS, type TtsModel } from "~/server/tts-models";
import { PROVIDER_LABEL, providerForModel } from "~/server/voices";
import { api } from "~/trpc/react";

export function SettingsForm() {
  const utils = api.useUtils();
  const config = api.config.get.useQuery();

  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [targetSeconds, setTargetSeconds] = useState(45);
  const [defaultPresenterId, setDefaultPresenterId] = useState<
    string | undefined
  >();
  const [defaultVoiceId, setDefaultVoiceId] = useState<string | undefined>();
  const [ttsModel, setTtsModel] = useState<TtsModel>(TTS_MODELS[0].value);
  const [subtitlePreset, setSubtitlePreset] = useState<SubtitlePreset>(
    DEFAULT_SUBTITLE_PRESET,
  );
  const [subtitleLanguage, setSubtitleLanguage] = useState<SubtitleLanguage>(
    DEFAULT_SUBTITLE_LANGUAGE,
  );
  const provider = providerForModel(ttsModel);

  useEffect(() => {
    if (!config.data) return;
    setBrandName(config.data.brandName);
    setTone(config.data.tone);
    setTargetSeconds(config.data.targetSeconds);
    setDefaultPresenterId(config.data.defaultPresenterId ?? undefined);
    setDefaultVoiceId(config.data.defaultVoiceId);
    setTtsModel(
      isTtsModel(config.data.ttsModel)
        ? config.data.ttsModel
        : TTS_MODELS[0].value,
    );
    setSubtitlePreset(
      isSubtitlePreset(config.data.subtitlePreset)
        ? config.data.subtitlePreset
        : DEFAULT_SUBTITLE_PRESET,
    );
    setSubtitleLanguage(
      isSubtitleLanguage(config.data.subtitleLanguage)
        ? config.data.subtitleLanguage
        : DEFAULT_SUBTITLE_LANGUAGE,
    );
  }, [config.data]);

  const update = api.config.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      void utils.config.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!config.data) return <Skeleton className="h-96 rounded-xl" />;
  const canSave = !!defaultVoiceId && !update.isPending;

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
          defaultVoiceId: defaultVoiceId!,
          ttsModel,
          subtitlePreset,
          subtitleLanguage,
        });
      }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Org-wide defaults used for every generated video.
          </p>
        </div>
        <Button type="submit" className="ml-auto" disabled={!canSave}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defaults</CardTitle>
            <CardDescription>
              Pre-selected when generating a video. Presenter and voice are
              independent — mix and match per video.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default presenter</Label>
              <PresenterPicker
                value={defaultPresenterId}
                onChange={setDefaultPresenterId}
              />
            </div>
            <div className="space-y-2">
              <Label>Text-to-speech model</Label>
              <Select
                items={TTS_MODELS}
                value={ttsModel}
                onValueChange={(v) => {
                  const next = String(v);
                  if (isTtsModel(next)) setTtsModel(next);
                }}
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
              <p className="text-muted-foreground text-xs">
                Determines which voices are available everywhere.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Default voice</Label>
              <VoicePicker
                value={defaultVoiceId}
                onChange={setDefaultVoiceId}
                provider={provider}
              />
              <p className="text-muted-foreground text-xs">
                Showing {PROVIDER_LABEL[provider]} voices.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subtitles</CardTitle>
            <CardDescription>
              Style and language for veed/subtitles when it auto-transcribes
              and burns captions into the final video.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Subtitle preset</Label>
              <Select
                items={SUBTITLE_PRESETS}
                value={subtitlePreset}
                onValueChange={(v) => {
                  const next = String(v);
                  if (isSubtitlePreset(next)) setSubtitlePreset(next);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBTITLE_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}{" "}
                      {p.tier === "dynamic" ? (
                        <span className="text-muted-foreground ml-1 text-xs">
                          (2× rate)
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Basic presets cost 1×, dynamic presets cost 2× — both auto-
                transcribe the audio and burn captions into the MP4.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Source language</Label>
              <Combobox<SubtitleLanguageEntry>
                items={SUBTITLE_LANGUAGES}
                value={
                  SUBTITLE_LANGUAGES.find((l) => l.value === subtitleLanguage) ??
                  null
                }
                onValueChange={(v: SubtitleLanguageEntry | null) => {
                  if (!v) return;
                  if (isSubtitleLanguage(v.value)) setSubtitleLanguage(v.value);
                }}
                itemToStringLabel={(l: SubtitleLanguageEntry) => l.label}
                isItemEqualToValue={(a, b) => a.value === b.value}
              >
                <ComboboxTrigger className="w-full" aria-label="Source language">
                  <ComboboxValue placeholder="Select language…">
                    {(l: SubtitleLanguageEntry | null) => (
                      <span>{l?.label}</span>
                    )}
                  </ComboboxValue>
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput
                    placeholder="Search languages…"
                    autoFocus
                  />
                  <ComboboxEmpty>No language matches.</ComboboxEmpty>
                  <ComboboxList>
                    {(l: SubtitleLanguageEntry) => (
                      <ComboboxItem key={l.value} value={l}>
                        <span className="flex-1 truncate">{l.label}</span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {l.value}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <p className="text-muted-foreground text-xs">
                Should match the source audio (not the desired output language) —
                improves transcription accuracy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
