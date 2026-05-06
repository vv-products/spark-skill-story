// Sementa Studio — task type catalog & seed content

export type Family = "Foundation" | "Knowledge Check" | "Simulation" | "Performance" | "Real-Life" | "Reflection";
export type AgeGroup = "Explorer" | "Builder" | "Leader";
export type Status = "Draft" | "In Review" | "Published";
export type Character = "Maya" | "Leo" | "Dash" | "Pip";

export const FAMILY_COLOR: Record<Family, string> = {
  "Foundation": "#1565C0",
  "Knowledge Check": "#2E7D32",
  "Simulation": "#6A1B9A",
  "Performance": "#BF360C",
  "Real-Life": "#00695C",
  "Reflection": "#37474F",
};

export type TaskTypeDef = {
  id: string;
  code: string;
  name: string;
  emoji: string;
  family: Family;
  description: string;
  xp: number;
  ages: AgeGroup[];
};

export const TASK_TYPES: TaskTypeDef[] = [
  { id: "T01", code: "T01", name: "Story Video", emoji: "📹", family: "Foundation", description: "The anchor video. Characters model the lesson.", xp: 5, ages: ["Explorer","Builder","Leader"] },
  { id: "T02", code: "T02", name: "Micro Clip", emoji: "⚡", family: "Foundation", description: "15–30 sec reinforcement. One idea, one image.", xp: 3, ages: ["Explorer","Builder","Leader"] },
  { id: "T03", code: "T03", name: "Drag & Drop Sort", emoji: "🗂️", family: "Knowledge Check", description: "Sort items into categories. Tactile and fun.", xp: 10, ages: ["Explorer","Builder"] },
  { id: "T04", code: "T04", name: "Rapid Fire Tap", emoji: "⚡", family: "Knowledge Check", description: "True/False speed game. Game-show energy.", xp: 10, ages: ["Explorer","Builder","Leader"] },
  { id: "T05", code: "T05", name: "Scenario Card Flip", emoji: "🃏", family: "Knowledge Check", description: "Flip cards, judge situations. No time pressure.", xp: 10, ages: ["Explorer","Builder","Leader"] },
  { id: "T06", code: "T06", name: "Body Map Tap", emoji: "🫀", family: "Knowledge Check", description: "Tap where you feel it. Somatic awareness.", xp: 8, ages: ["Explorer","Builder","Leader"] },
  { id: "T07", code: "T07", name: "Branching Story", emoji: "🌿", family: "Simulation", description: "Choose a path. See the consequence.", xp: 15, ages: ["Explorer","Builder","Leader"] },
  { id: "T08", code: "T08", name: "Role-Play AI Chat", emoji: "🤖", family: "Simulation", description: "Talk to an AI character. Practise real conversations.", xp: 20, ages: ["Builder","Leader"] },
  { id: "T09", code: "T09", name: "Guided Experience", emoji: "🧘", family: "Simulation", description: "Immersive audio-visual mindfulness.", xp: 12, ages: ["Explorer","Builder","Leader"] },
  { id: "T10", code: "T10", name: "Voice Recording", emoji: "🎙️", family: "Performance", description: "Child speaks their answer. High ownership.", xp: 15, ages: ["Explorer","Builder","Leader"] },
  { id: "T11", code: "T11", name: "Drawing / Collage", emoji: "🎨", family: "Performance", description: "Draw or stamp a creative response.", xp: 12, ages: ["Explorer","Builder"] },
  { id: "T12", code: "T12", name: "Build & Arrange", emoji: "🔧", family: "Performance", description: "Assemble a personal kit, map, or plan.", xp: 15, ages: ["Builder","Leader"] },
  { id: "T13", code: "T13", name: "Real-Life Mission", emoji: "🌍", family: "Real-Life", description: "Offline action. Highest XP. Behaviour change.", xp: 25, ages: ["Explorer","Builder","Leader"] },
  { id: "T14", code: "T14", name: "Open Reflection", emoji: "✍️", family: "Reflection", description: "One prompt. Child answers in their own words.", xp: 10, ages: ["Explorer","Builder","Leader"] },
  { id: "T15", code: "T15", name: "Self-Rating Scale", emoji: "📊", family: "Reflection", description: "Child rates their own skill. Tracks growth.", xp: 8, ages: ["Builder","Leader"] },
];

export const TASK_BY_CODE: Record<string, TaskTypeDef> = Object.fromEntries(TASK_TYPES.map(t => [t.code, t]));

// ---------- Hierarchy ----------
export type Layer = {
  id: string;
  taskCode: string;
  preview: string;
  fields: Record<string, any>;
};

export type Class = {
  id: string;
  number: number;
  title: string;
  status: Status;
  layers: Layer[];
  storyRecapUrl?: string;
  characterFocus?: Character[];
  emotionTag?: string;
  heroImageUrl?: string | null;
};

export type Module = {
  id: string;
  name: string;
  status: Status;
  ages: AgeGroup[];
  classes: Class[];
};

export type Topic = {
  id: string;
  name: string;
  ages: AgeGroup[];
  modules: Module[];
};

export type Pillar = {
  id: string;
  name: string;
  emoji: string;
  topics: Topic[];
};

const emptyClasses = (start: number): Class[] =>
  Array.from({ length: 11 - start }, (_, i) => ({
    id: `cls-empty-${start + i}`,
    number: start + i,
    title: "",
    status: "Draft" as Status,
    layers: [],
  }));

export const SEED_PILLARS: Pillar[] = [
  {
    id: "inner", name: "The Inner World", emoji: "🧠",
    topics: [
      {
        id: "self-eq", name: "Self-Awareness & EQ", ages: ["Explorer","Builder","Leader"],
        modules: [
          {
            id: "meet-emotions", name: "Meet Your Emotions", status: "In Review", ages: ["Explorer"],
            classes: [
              { id: "c1", number: 1, title: "The Fair Appears", status: "Published",
                characterFocus: ["Maya","Leo"], emotionTag: "Curiosity",
                layers: [
                  { id: "l1a", taskCode: "T01", preview: "Welcome to the Emotion Fair", fields: { videoUrl: "https://cdn.sementa.app/v/fair-appears.mp4", durationSec: 90, characterFocus: ["Maya","Leo"], skipAllowed: false } },
                  { id: "l1b", taskCode: "T03", preview: "Sort the feelings into the 4 main jars", fields: { items: [{ label: "A warm hug", bucket: "Happy" }, { label: "Lost toy", bucket: "Sad" }], buckets: [{ label: "Happy", colour: "#F5A623" }, { label: "Sad", colour: "#1565C0" }], partialCredit: true, hintAfter: 2, shuffle: true } },
                  { id: "l1c", taskCode: "T13", preview: "Spot 3 feelings around your house today", fields: { title: "Feeling Detective", instruction: "Watch for 3 different feelings in your family today.", missionType: "Observe", windowDays: 1, parentNotice: "Your child is hunting for feelings today!", verifyForBonus: true } },
                  { id: "l1d", taskCode: "T14", preview: "Which feeling did you notice the most?", fields: { prompt: "Which feeling did you notice the most today?", inputType: "Both", journalLabel: "First Fair Visit" } },
                ],
              },
              { id: "c2", number: 2, title: "The Happy Stall", status: "Published",
                characterFocus: ["Dash","Leo"], emotionTag: "Joy",
                layers: [
                  { id: "l2a", taskCode: "T01", preview: "Dash discovers the Happy Stall", fields: { videoUrl: "https://cdn.sementa.app/v/happy-stall.mp4", durationSec: 75, characterFocus: ["Dash"], skipAllowed: false } },
                  { id: "l2b", taskCode: "T04", preview: "True or False — what makes happy GROW?",
                    fields: {
                      questions: [
                        { prompt: "Sharing happy feelings makes them grow.", correct: "True", options: ["True","False"] },
                        { prompt: "Bragging is the same as celebrating.", correct: "False", options: ["True","False"] },
                        { prompt: "Jumping with a friend doubles the joy.", correct: "True", options: ["True","False"] },
                      ],
                      timeLimitSec: 5,
                      speedBonusSec: 2,
                      shuffle: true,
                    },
                  },
                  { id: "l2c", taskCode: "T07", preview: "Dash wins 1st place — what should he do?", fields: { setupClipUrl: "https://cdn.sementa.app/v/dash-wins.mp4", decisionPrompt: "Dash is bursting with joy. What should he do?", options: [{ label: "Run in shouting", isOptimal: false }, { label: "Find Leo and celebrate together", isOptimal: true }], showAllPaths: true } },
                  { id: "l2d", taskCode: "T11", preview: "Draw what made YOU happy this week", fields: { prompt: "Draw what made you happy this week.", voiceLayer: true, parentLabel: "My Happy Moment" } },
                ],
              },
              { id: "c3", number: 3, title: "The Sad Corner", status: "In Review",
                layers: [
                  { id: "l3a", taskCode: "T01", preview: "Maya finds the Sad Corner", fields: {} },
                  { id: "l3b", taskCode: "T05", preview: "Helpful or not helpful when a friend is sad?", fields: {} },
                  { id: "l3c", taskCode: "T10", preview: "What would you say to a sad friend?", fields: {} },
                  { id: "l3d", taskCode: "T13", preview: "Comfort someone this week", fields: {} },
                  { id: "l3e", taskCode: "T14", preview: "When did sadness visit you?", fields: {} },
                ],
              },
              { id: "c4", number: 4, title: "The Fear House", status: "Draft",
                layers: [
                  { id: "l4a", taskCode: "T01", preview: "Pip enters the Fear House", fields: {} },
                  { id: "l4b", taskCode: "T09", preview: "A 2-minute calm-breathing journey", fields: {} },
                  { id: "l4c", taskCode: "T03", preview: "Helpful fears vs unhelpful fears", fields: {} },
                ],
              },
              ...emptyClasses(5),
            ],
          },
          { id: "spot-feelings", name: "Spot Your Feelings", status: "Draft", ages: ["Explorer"], classes: emptyClasses(1) },
          { id: "name-it", name: "Name It to Tame It", status: "Draft", ages: ["Explorer"], classes: emptyClasses(1) },
          { id: "feelings-friends", name: "Feelings Have Friends", status: "Draft", ages: ["Explorer"], classes: emptyClasses(1) },
          { id: "feelings-change", name: "Feelings Change", status: "Draft", ages: ["Explorer"], classes: emptyClasses(1) },
        ],
      },
      { id: "self-talk", name: "Inner Voice & Self-Talk", ages: ["Builder","Leader"], modules: [] },
      { id: "values", name: "Values & Identity", ages: ["Builder","Leader"], modules: [] },
      { id: "growth", name: "Growth Mindset", ages: ["Explorer","Builder","Leader"], modules: [] },
      { id: "purpose", name: "Purpose & Meaning", ages: ["Leader"], modules: [] },
    ],
  },
  { id: "social", name: "The Social World", emoji: "🗣️", topics: [
    { id: "empathy", name: "Empathy", ages: ["Explorer","Builder","Leader"], modules: [] },
    { id: "friendships", name: "Friendships", ages: ["Explorer","Builder"], modules: [] },
    { id: "conflict", name: "Conflict & Repair", ages: ["Builder","Leader"], modules: [] },
    { id: "communication", name: "Real Communication", ages: ["Builder","Leader"], modules: [] },
    { id: "boundaries", name: "Boundaries", ages: ["Builder","Leader"], modules: [] },
  ]},
  { id: "action", name: "The Action World", emoji: "⚡", topics: [
    { id: "courage", name: "Courage", ages: ["Explorer","Builder","Leader"], modules: [] },
    { id: "focus", name: "Focus & Discipline", ages: ["Builder","Leader"], modules: [] },
    { id: "habits", name: "Habits That Stick", ages: ["Builder","Leader"], modules: [] },
    { id: "decision", name: "Decision Making", ages: ["Builder","Leader"], modules: [] },
    { id: "leadership", name: "Leading Yourself", ages: ["Leader"], modules: [] },
  ]},
  { id: "real", name: "The Real World", emoji: "🌍", topics: [
    { id: "money", name: "Money Sense", ages: ["Builder","Leader"], modules: [] },
    { id: "media", name: "Media & Attention", ages: ["Builder","Leader"], modules: [] },
    { id: "body", name: "Body & Energy", ages: ["Explorer","Builder","Leader"], modules: [] },
    { id: "world", name: "Understanding the World", ages: ["Builder","Leader"], modules: [] },
    { id: "future", name: "Future-Self Skills", ages: ["Leader"], modules: [] },
  ]},
];

export const RECENT_ACTIVITY = [
  { who: "Sofia Martín", what: "Published 'The Happy Stall'", when: "12 min ago", status: "Published" as Status },
  { who: "Marcus Lee", what: "Edited Layer 3 in 'The Sad Corner'", when: "47 min ago", status: "In Review" as Status },
  { who: "Aisha Khan", what: "Added T09 Guided Experience to 'The Fear House'", when: "2h ago", status: "Draft" as Status },
  { who: "Sofia Martín", what: "Reordered layers in 'The Fair Appears'", when: "3h ago", status: "Published" as Status },
  { who: "Diego Romero", what: "Created module 'Spot Your Feelings'", when: "5h ago", status: "Draft" as Status },
  { who: "Marcus Lee", what: "Updated character focus on Class 02", when: "Yesterday", status: "Published" as Status },
  { who: "Aisha Khan", what: "Submitted 'The Sad Corner' for review", when: "Yesterday", status: "In Review" as Status },
  { who: "Sofia Martín", what: "Added Topic 'Empathy' under Social World", when: "2d ago", status: "Draft" as Status },
  { who: "Diego Romero", what: "Edited transcript on Story Video", when: "3d ago", status: "Published" as Status },
  { who: "Marcus Lee", what: "Created Pillar overview note", when: "4d ago", status: "Draft" as Status },
];
