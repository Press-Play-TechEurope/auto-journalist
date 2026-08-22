/**
 * Curated preset voices for ElevenLabs TTS (via fal.ai).
 * IDs are ElevenLabs premade voice names, which fal's `voice` input accepts
 * directly (it also accepts a raw ElevenLabs `voice_id`, e.g. for cloned
 * voices). See https://fal.ai/models/fal-ai/elevenlabs/tts/multilingual-v2/api
 *
 * Voices are independent of presenters: any voice can be paired with any face.
 */
export const VOICES = [
  {
    id: "Brian",
    label: "Brian",
    gender: "male",
    description: "Deep, warm, authoritative narrator",
  },
  {
    id: "Daniel",
    label: "Daniel",
    gender: "male",
    description: "Deep, steady British broadcaster",
  },
  {
    id: "George",
    label: "George",
    gender: "male",
    description: "Warm British storyteller",
  },
  {
    id: "Roger",
    label: "Roger",
    gender: "male",
    description: "Confident, laid-back American",
  },
  {
    id: "Eric",
    label: "Eric",
    gender: "male",
    description: "Friendly, conversational",
  },
  {
    id: "Liam",
    label: "Liam",
    gender: "male",
    description: "Young, energetic narrator",
  },
  {
    id: "Rachel",
    label: "Rachel",
    gender: "female",
    description: "Calm, composed American newsreader",
  },
  {
    id: "Sarah",
    label: "Sarah",
    gender: "female",
    description: "Soft, confident and clear",
  },
  {
    id: "Alice",
    label: "Alice",
    gender: "female",
    description: "Clear, engaging British",
  },
  {
    id: "Matilda",
    label: "Matilda",
    gender: "female",
    description: "Warm and friendly",
  },
  {
    id: "Lily",
    label: "Lily",
    gender: "female",
    description: "Warm, velvety British",
  },
  {
    id: "Aria",
    label: "Aria",
    gender: "female",
    description: "Expressive, mature American",
  },
  {
    id: "River",
    label: "River",
    gender: "neutral",
    description: "Relaxed, neutral and informative",
  },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];

export const DEFAULT_VOICE_ID: VoiceId = "Brian";

export function isVoiceId(id: string): id is VoiceId {
  return VOICES.some((v) => v.id === id);
}

export function voiceLabel(id: string) {
  return VOICES.find((v) => v.id === id)?.label ?? id;
}
