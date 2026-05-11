// MCQ data for the Emotions quiz missions. Each variant has 10 questions.

export type MCQ = {
  q: string;
  options: string[];
  answer: number; // index of correct option
  explain?: string;
};

export const SELF_PACED_QUIZ: MCQ[] = [
  {
    q: "You finally finish a really hard puzzle. What do you feel?",
    options: ["Bored", "Proud", "Scared", "Jealous"],
    answer: 1,
    explain: "Proud — that warm 'I did it!' feeling after working hard.",
  },
  {
    q: "Your tummy gets jumpy before standing up to speak in class. That's…",
    options: ["Anger", "Hunger", "Nervous", "Sleepy"],
    answer: 2,
    explain: "Nervous feelings often show up as jumpy or fluttery in your body.",
  },
  {
    q: "Your friend gets the toy you wanted. The squeezy feeling inside is…",
    options: ["Jealous", "Proud", "Calm", "Surprised"],
    answer: 0,
    explain: "Jealousy — wanting what someone else has.",
  },
  {
    q: "You drop something fragile and feel your face go hot. That's likely…",
    options: ["Joy", "Embarrassed", "Sleepy", "Brave"],
    answer: 1,
  },
  {
    q: "When someone shares with you and you feel warm inside, that's…",
    options: ["Grateful", "Bored", "Angry", "Scared"],
    answer: 0,
  },
  {
    q: "A best way to calm a big angry feeling is…",
    options: ["Yell at someone", "Throw a toy", "Take 3 slow breaths", "Hide forever"],
    answer: 2,
    explain: "Slow breathing helps your body settle when feelings get big.",
  },
  {
    q: "Feeling small and unsure about trying something new is…",
    options: ["Confident", "Shy", "Angry", "Sleepy"],
    answer: 1,
  },
  {
    q: "Your friend looks sad. The kindest first step is…",
    options: ["Tell them to cheer up", "Ignore them", "Ask 'Are you okay?'", "Take their toy"],
    answer: 2,
  },
  {
    q: "Butterflies + smile before your birthday party = ",
    options: ["Excited", "Bored", "Sad", "Angry"],
    answer: 0,
  },
  {
    q: "When emotions feel too big, who can help?",
    options: ["Nobody", "A trusted grown-up", "My pillow only", "I should hide them"],
    answer: 1,
    explain: "Talking to a trusted adult helps make big feelings smaller.",
  },
];

export const QUICK_FIRE_QUIZ: MCQ[] = [
  { q: "😊 = ?", options: ["Happy", "Sad", "Angry", "Tired"], answer: 0 },
  { q: "😢 = ?", options: ["Excited", "Sad", "Brave", "Calm"], answer: 1 },
  { q: "😠 = ?", options: ["Sleepy", "Proud", "Angry", "Shy"], answer: 2 },
  { q: "😨 = ?", options: ["Scared", "Bored", "Happy", "Cool"], answer: 0 },
  { q: "Opposite of HAPPY?", options: ["Glad", "Sad", "Joyful", "Cheery"], answer: 1 },
  { q: "Opposite of CALM?", options: ["Quiet", "Still", "Frantic", "Peaceful"], answer: 2 },
  { q: "🥳 most fits…", options: ["Bored", "Excited", "Lonely", "Sleepy"], answer: 1 },
  { q: "Heart races, palms sweat. You feel…", options: ["Calm", "Sleepy", "Nervous", "Bored"], answer: 2 },
  { q: "You did your best. You feel…", options: ["Proud", "Jealous", "Angry", "Tired"], answer: 0 },
  { q: "Big yawn, heavy eyes = ?", options: ["Excited", "Sleepy", "Shy", "Brave"], answer: 1 },
];
