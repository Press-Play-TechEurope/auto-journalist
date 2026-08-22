/**
 * Curated preset voices for MiniMax speech-02 (via fal.ai).
 * IDs are MiniMax system voice ids; see https://fal.ai/models/fal-ai/minimax/speech-02-hd/api
 */
export const VOICES = [
  { id: "Wise_Woman", label: "Wise Woman", gender: "female" },
  { id: "Calm_Woman", label: "Calm Woman", gender: "female" },
  { id: "Friendly_Person", label: "Friendly Person", gender: "neutral" },
  { id: "Deep_Voice_Man", label: "Deep Voice Man", gender: "male" },
  { id: "Patient_Man", label: "Patient Man", gender: "male" },
  { id: "Determined_Man", label: "Determined Man", gender: "male" },
  { id: "Elegant_Man", label: "Elegant Man", gender: "male" },
  { id: "Casual_Guy", label: "Casual Guy", gender: "male" },
  { id: "Inspirational_girl", label: "Inspirational Girl", gender: "female" },
  { id: "Lively_Girl", label: "Lively Girl", gender: "female" },
  { id: "Lovely_Girl", label: "Lovely Girl", gender: "female" },
  { id: "Imposing_Manner", label: "Imposing Manner", gender: "male" },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];

export const DEFAULT_VOICE_ID: VoiceId = "Wise_Woman";

export function voiceLabel(id: string) {
  return VOICES.find((v) => v.id === id)?.label ?? id;
}
