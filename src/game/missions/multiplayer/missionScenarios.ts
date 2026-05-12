// Shared scenario / emoji pools for multiplayer-only missions.

export const EMOTION_TARGETS = [
  { label: "Joy",        emoji: "😊", color: "bg-amber-400 text-amber-900" },
  { label: "Sad",        emoji: "😢", color: "bg-sky-400 text-sky-900" },
  { label: "Angry",      emoji: "😠", color: "bg-red-500 text-white" },
  { label: "Scared",     emoji: "😨", color: "bg-violet-500 text-white" },
  { label: "Surprised",  emoji: "😲", color: "bg-pink-400 text-pink-900" },
  { label: "Proud",      emoji: "🥳", color: "bg-fuchsia-500 text-white" },
  { label: "Calm",       emoji: "😌", color: "bg-emerald-400 text-emerald-900" },
  { label: "Jealous",    emoji: "😒", color: "bg-lime-500 text-lime-900" },
  { label: "Grateful",   emoji: "🙏", color: "bg-teal-400 text-teal-900" },
  { label: "Bored",      emoji: "😑", color: "bg-stone-400 text-stone-900" },
];

export type MoodScenario = { prompt: string; bestAnswers: string[] };
export const MOOD_SCENARIOS: MoodScenario[] = [
  { prompt: "Your friend lends you their favourite toy.",          bestAnswers: ["Grateful", "Joy"] },
  { prompt: "You forget your lines on stage.",                     bestAnswers: ["Scared", "Sad"] },
  { prompt: "Your team wins the school sports day.",               bestAnswers: ["Proud", "Joy"] },
  { prompt: "Someone takes the seat you wanted.",                  bestAnswers: ["Angry", "Jealous"] },
  { prompt: "You see a huge double rainbow after the rain.",       bestAnswers: ["Surprised", "Joy"] },
  { prompt: "It's quiet reading time and the room smells of rain.",bestAnswers: ["Calm", "Bored"] },
  { prompt: "Your sibling broke your favourite drawing.",          bestAnswers: ["Sad", "Angry"] },
  { prompt: "The internet keeps cutting during your show.",        bestAnswers: ["Bored", "Angry"] },
];
