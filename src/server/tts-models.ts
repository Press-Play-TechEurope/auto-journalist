/** fal.ai TTS endpoints the org can choose from. Order = dropdown order. */
export const TTS_MODELS = [
  {
    value: "fal-ai/elevenlabs/tts/multilingual-v2",
    label: "ElevenLabs Multilingual v2 (fal.ai)",
  },
  {
    value: "fal-ai/elevenlabs/tts/turbo-v2.5",
    label: "ElevenLabs Turbo v2.5 (fal.ai)",
  },
  {
    value: "fal-ai/elevenlabs/tts/eleven-v3",
    label: "ElevenLabs Eleven v3 (fal.ai)",
  },
  {
    value: "fal-ai/minimax/speech-02-hd",
    label: "MiniMax Speech-02 HD (fal.ai)",
  },
  {
    value: "fal-ai/minimax/speech-02-turbo",
    label: "MiniMax Speech-02 Turbo (fal.ai)",
  },
] as const;

export type TtsModel = (typeof TTS_MODELS)[number]["value"];
export const TTS_MODEL_VALUES = TTS_MODELS.map((m) => m.value) as [
  TtsModel,
  ...TtsModel[],
];

export function isTtsModel(value: string): value is TtsModel {
  return (TTS_MODEL_VALUES as readonly string[]).includes(value);
}
