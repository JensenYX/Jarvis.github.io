/* Content for the interactive blocks.
 *
 * Demo descriptions, notes and chapters come from the recordings themselves:
 * the ASR transcripts of tools/transcribe.py, checked against the captions
 * burned into each video. Numbers in RESULTS are copied from the tables of
 * the technical report, so the page and the PDF always agree. */

export const GROUPS = {
  audio: {
    name: "Jarvis-Audio",
    blurb: "the harness on a full-duplex speech model",
  },
  omni: {
    name: "Jarvis-Omni",
    blurb: "the harness on an audio-visual model that watches the screen",
  },
};

export const DEMOS = [
  {
    slug: "audio-daily-zh",
    group: "audio",
    title: "Everyday assistant",
    scenario: "Daily assistance",
    language: "Mandarin",
    duration: 229.4,
    tagline: "A game refined to v5, a code question and its follow-up, and one task cancelled while the rest keeps running.",
    summary:
      "A user plans an evening with friends. In one breath they ask for a web mini-game, tonight's weather in Shanghai and two tech stories, and they keep talking while all three run. The game changes four times, a code question gets a follow-up, and cancelling a countdown page touches nothing else. Every change lands on the task it was meant for.",
    watch: [
      "\u201cWait, make it two-player\u201d arrives while the first version is still being planned. The game is refined; the weather and the news keep running.",
      "Clarifying questions come back mid-flight (one phone or online? one shared score?) while the other tasks keep working.",
      "\u201cCancel the countdown page. Keep the game going.\u201d Exactly one card in the task panel turns grey.",
      "\u201cAdd a mute button, change nothing else\u201d produces version 5 of the game.",
    ],
    chapters: [
      [0, "Small talk first"],
      [24.8, "Three requests in one breath"],
      [41.9, "\u201cWait, make it two-player\u201d"],
      [101.2, "A countdown page, then cancel only it"],
      [119.8, "A code question and its follow-up"],
      [154.1, "\u201cAdd a mute button, change nothing else\u201d"],
      [194.0, "Recap: what's done, what's cancelled"],
    ],
    subs: true,
  },
  {
    slug: "audio-daily-en",
    group: "audio",
    title: "Game night",
    scenario: "Daily assistance",
    language: "English",
    duration: 313.6,
    tagline: "Four background tasks, four versions of a game, and a one-night budget that never overwrites the usual one.",
    summary:
      "The game-night script of Figure 1 in the report, recorded end to end. The user saves a few defaults, then asks for a game, the weather and two headlines at once, and keeps talking while the work runs. The game is refined as it is built, a Python question gets a follow-up, and \u201cfor tonight only, sixty dollars\u201d changes the snack plan without touching the usual forty in memory. A new session at the end still knows both defaults.",
    watch: [
      "Every card in the task panel carries its version. The game ends at v4, the snack plan at v2.",
      "\u201cFor tonight only, sixty dollars is fine. Keep forty as my usual limit.\u201d One sentence, two destinations: the task gets $60, memory keeps $40.",
      "\u201cCancel just the welcome sign. Keep everything else.\u201d One task is cancelled and nothing else moves.",
      "At 4:44 a fresh session opens. Jarvis answers from memory, and the memory panel shows each saved fact next to the sentence it came from.",
    ],
    chapters: [
      [0, "\u201cRemember this for future game nights\u201d"],
      [54.3, "Three requests in one breath"],
      [74.6, "Refining the game while it is built"],
      [153.0, "A Python question and its follow-up"],
      [183.4, "\u201cSixty tonight, forty as usual\u201d"],
      [213.4, "A new default, a sign, then cancel only the sign"],
      [284.0, "Next session: the defaults are still there"],
    ],
    subs: false,
    subsNote: "This recording already carries English captions.",
  },
  {
    slug: "audio-pvz",
    group: "audio",
    title: "Plants vs. Zombies co-pilot",
    scenario: "Playing alongside",
    language: "Mandarin",
    duration: 194.7,
    tagline: "Coaches the loadout, plays for five minutes on request, hands control back, and refuses to act on a lawn that isn't ready.",
    summary:
      "Jarvis-Audio plays alongside the user in a browser build of Plants vs. Zombies. It walks them through the menus, recommends plants and the first moves, takes over when asked to play for five minutes, and gives control back the moment the user says \u201cI'll take it from here.\u201d Every move goes through a game bridge that needs a short-lived grant tied to the current game state, so when the lawn is not ready for a hand-off it says so instead of acting.",
    watch: [
      "\u201cPlay it for me for five minutes\u201d hands the game to Jarvis; \u201cI'll take it from here\u201d takes it back at once.",
      "A hand-off requested while the user still holds the mouse is declined, with the reason, instead of acting on a stale state.",
      "Edits by grid position: \u201cDig up the Sunflower in column 1, row 1.\u201d",
      "The panel on the right is the companion: ask for advice, hand over one step, or take control back.",
    ],
    chapters: [
      [0, "Getting started: menus and the first level"],
      [29.0, "Which plants? Picking the loadout"],
      [63.0, "Coaching the first moves"],
      [83.7, "\u201cPlay it for me for five minutes\u201d"],
      [134.6, "\u201cI'll take it from here\u201d"],
      [144.2, "Not ready for a hand-off, and it says so"],
      [158.1, "Precise edits by grid position"],
    ],
    subs: true,
  },
  {
    slug: "audio-minecraft-1",
    group: "audio",
    title: "Minecraft-style sandbox: the stone shelter",
    scenario: "Playing alongside",
    language: "Mandarin",
    duration: 339.9,
    tagline: "Plans the trip, explains its choices, and keeps a promise: the four planks set aside at 1:45 fix the roof at 4:54.",
    summary:
      "In VoxeLibre, a Minecraft-like game on the Luanti engine, the user asks Jarvis to plan a trip to a stone shelter across the water. Jarvis gathers food first and explains why, picks the pickaxe over the sword, and acts through the game engine while the user takes the controls for short stretches. A constraint added early on, keep four planks for the shelter, survives every hand-off and is used, four planks exactly, when the roof turns out to have four gaps.",
    watch: [
      "\u201cWhy look for food first?\u201d The answer comes from the game state: hunger is at 8.",
      "\u201cDon't pave the path with the planks. Keep four to fix the shelter.\u201d The constraint holds for the rest of the session.",
      "Control passes back and forth (\u201cI'll do this short stretch\u201d, \u201cOK, your turn again\u201d), and Jarvis keeps the goal and the reserved materials across each hand-off.",
      "At the end it lists the inventory and what each item is for.",
    ],
    chapters: [
      [0, "\u201cYou plan it\u201d: a trip to the stone shelter"],
      [14.3, "Food first, and why"],
      [69.6, "Pickaxe or sword?"],
      [105.6, "\u201cKeep four planks for the shelter\u201d"],
      [132.1, "A route, a cleared path, a stone sword"],
      [224.1, "Taking turns at the controls"],
      [267.6, "Fixing the roof with the planks it kept"],
    ],
    subs: true,
  },
  {
    slug: "audio-minecraft-2",
    group: "audio",
    title: "Minecraft-style sandbox: the rematch",
    scenario: "Playing alongside",
    language: "Mandarin",
    duration: 236.5,
    tagline: "Retreats from a losing fight, says why, prepares, then takes over the rematch and wins.",
    summary:
      "Exploring ruins in VoxeLibre, the user asks Jarvis to watch for danger. Against a husk, Jarvis pulls back when health drops too fast and explains that bare hands were the problem. It heals, crafts the iron sword the user lets it choose, checks health and food before going back, and wins the rematch it fights on the user's behalf.",
    watch: [
      "\u201cIf we can't win, get us out.\u201d Jarvis retreats when health drops too fast, then explains why.",
      "Stone or iron sword? The user lets Jarvis choose; it picks iron and states the cost, both ingots.",
      "Before the rematch it reports health 20, hunger 20 and one bread left, read from the game.",
      "\u201cWhy did we win this time?\u201d Food, full health and an iron sword.",
    ],
    chapters: [
      [0, "\u201cWatch for danger\u201d"],
      [22.2, "A husk at the gate: fight, then retreat"],
      [54.0, "Why pull back?"],
      [106.6, "Stone or iron? Jarvis chooses"],
      [140.9, "A ready check before the rematch"],
      [169.3, "The rematch"],
      [194.2, "Why it worked this time"],
    ],
    subs: true,
  },
  {
    slug: "omni-cs2",
    group: "omni",
    title: "CS2 screen companion",
    scenario: "Watching the screen",
    language: "Mandarin",
    duration: 132.0,
    tagline: "Reads the HUD, calls the plays, praises a triple headshot unprompted and explains a death from the frames before it.",
    summary:
      "Jarvis-Omni watches a recorded CS2 match and talks it through with the player. It answers from what is on screen at that moment (armor, weapon, ammo, health, the round clock) and speaks up on its own when something happens. Every visual fact it relies on carries a validity window and is checked again before the answer is spoken.",
    watch: [
      "The line starting \u201cJev \u8bc6\u522b\u201d on the left is Jev-Omni's live reading of the HUD: alive, health, armor, weapon, ammo, money, score and clock.",
      "At 0:27 it speaks up unprompted: \u201cThree headshots in fifteen seconds.\u201d",
      "\u201cWas I too hasty?\u201d is answered from the frames before the death: \u201cYou were down to nineteen health and got finished off.\u201d",
      "The advice follows the screen: nine bullets left, so don't duel; nineteen health, so run.",
    ],
    chapters: [
      [0, "Reading the round from the HUD"],
      [18.3, "\u201cCan we hold the site?\u201d"],
      [27.2, "Unprompted: three headshots in 15 s"],
      [37.0, "Pistol round: where to hold"],
      [53.1, "Fight or fall back?"],
      [77.8, "\u201cWas I too hasty?\u201d"],
      [89.2, "Rifle round: short stairs and smokes"],
    ],
    subs: true,
  },
  {
    slug: "omni-lol",
    group: "omni",
    title: "League of Legends screen companion",
    scenario: "Watching the screen",
    language: "Mandarin",
    duration: 196.0,
    tagline: "Build advice, objective timing and \u201cnot yet\u201d calls, each grounded in the HUD at the moment it is spoken.",
    summary:
      "Jarvis-Omni follows a recorded League of Legends match from the player's side. Asked whether to push, fight or take an objective, it answers from the current health, kills, gold and clock, and says \u201cnot yet\u201d when the screen says so: 320 health is too little to take a tower, and Baron does not spawn until twenty minutes.",
    watch: [
      "On the left, \u201cJev \u8bc6\u522b\u201d is Jev-Omni's HUD reading (state, champion, level, health, clock, kills, gold, KDA), \u201cDeepSeek \u8981\u70b9\u201d is the background worker's summary, and \u201c\u4e8b\u4ef6\u201d flags events such as a kill.",
      "\u201cCan I push now?\u201d \u201cYou're at about 1,600 health.\u201d The reading on screen says 1608 / 1610.",
      "It reacts to kills and assists without being asked: \u201cNice! That kill was huge.\u201d",
      "Objective timing: \u201cNot yet. Baron doesn't spawn until 20 minutes.\u201d",
    ],
    chapters: [
      [0, "Reading the map: up 11 to 4"],
      [17.3, "\u201cCan I push now?\u201d"],
      [28.0, "What to buy"],
      [58.7, "Baron timing, and a \u201cnot yet\u201d"],
      [100.4, "After a death: protect the lead"],
      [147.9, "Unprompted praise, then dragon"],
      [169.4, "Orianna mid, and a final \u201chold off\u201d"],
    ],
    subs: true,
  },
];

/* Figure 1 of the report: the game-night session on the Task Ledger.
 * Times are seconds into the recorded session the figure was drawn from. The
 * English demo follows the same script in a separate recording, so `seek`
 * holds where each utterance starts in that video. */
export const SESSION = {
  span: [24, 272],
  ticks: [30, 60, 90, 120, 150, 180, 210, 240, 270],
  lanes: ["Game", "Weather", "News", "Snacks", "Python", "Welcome sign"],
  bars: [
    { lane: 0, from: 28.9, to: 50.2, label: "v1", ask: 42.8 },
    { lane: 0, from: 50.2, to: 69.2, label: "v2", ask: 60.2 },
    { lane: 0, from: 69.2, to: 130.5, label: "v3 builds the game", done: true },
    { lane: 0, from: 232.6, to: 261.3, label: "v4 light", done: true },
    { lane: 1, from: 28.9, to: 84.7, label: "v1 Shanghai, tonight", done: true },
    { lane: 2, from: 28.9, to: 101.4, label: "v1 two tech headlines", done: true },
    { lane: 3, from: 69.2, to: 123.7, label: "v1 usual $40 from memory", done: true },
    { lane: 3, from: 179.7, to: 215.0, label: "v2 $60 tonight", done: true },
    { lane: 4, from: 145.1, to: 155.5, label: "v1", done: true },
    { lane: 4, from: 161.8, to: 172.5, label: "v2", done: true },
    { lane: 5, from: 232.6, to: 240.1, label: "v1", cancelled: true },
  ],
  notes: [
    { lane: 0, at: 229.5, anchor: "end", text: "light theme saved as the new default", kind: "memory" },
    { lane: 3, at: 218, anchor: "start", text: "usual $40 kept", kind: "memory" },
    { lane: 5, at: 244, anchor: "start", text: "only the sign is cancelled", kind: "note" },
  ],
  utterances: [
    {
      at: 28.9,
      seek: 54.3,
      text: "Build a star collecting game, 60 seconds a round. Check Shanghai's weather for tonight, and find two technology headlines.",
      ops: [["new", "NEW game"], ["new", "NEW weather"], ["new", "NEW news"]],
    },
    {
      at: 50.2,
      seek: 74.6,
      text: "Same phone, please. Two players playing together.",
      ops: [["refine", "REFINE game v1"]],
    },
    {
      at: 69.2,
      seek: 91.4,
      text: "Use a shared score and let players respawn quickly. Also, make a snack plan using my usual budget.",
      ops: [["refine", "REFINE game v2"], ["new", "NEW snacks"]],
    },
    {
      at: 145.1,
      seek: 153.0,
      text: "I pasted a little Python example. Why do both lists change?",
      ops: [["new", "NEW python"]],
    },
    {
      at: 161.8,
      seek: 169.8,
      text: "What is the smallest fix to make the lists independent?",
      ops: [["refine", "REFINE python v1"]],
    },
    {
      at: 179.7,
      seek: 183.4,
      text: "For tonight, only sixty dollars is fine. Keep forty as my usual limit.",
      ops: [["refine", "REFINE snacks v1"], ["save", "SAVE usual budget"]],
    },
    {
      at: 232.6,
      seek: 213.4,
      text: "Use a light theme from now on. Remember that as my new default, and update this game too. Also, make a separate full-screen welcome sign for the door.",
      ops: [["save", "SAVE light theme"], ["refine", "REFINE game v3"], ["new", "NEW sign"]],
    },
    {
      at: 240.1,
      seek: 231.6,
      text: "Cancel just the welcome sign. Keep everything else.",
      ops: [["cancel", "CANCEL sign v1"]],
    },
  ],
};

/* ------------------------------------------------------------- results */

export const RESULTS = {
  // Table 2: same front model, admission path and back end; only the harness changes.
  paired: {
    models: ["Venus-Audio", "MiniCPM-o 4.5", "VoiceChat-11B"],
    metrics: {
      tau: {
        label: "\u03c4-Voice tasks solved",
        unit: "of 278",
        min: 0,
        max: 278,
        axis: ["0", "278 tasks"],
        decimals: 0,
        qaa: [29, 29, 2],
        jarvis: [187, 38, 33],
        note: "Tasks solved out of 278 airline, retail and telecom calls. A task counts only when the final database state and the required actions are exactly right.",
      },
      fdb3: {
        label: "FDB-v3 passes (exact)",
        unit: "of 100",
        min: 0,
        max: 100,
        axis: ["0", "100 recordings"],
        decimals: 0,
        qaa: [41, 40, 26],
        jarvis: [51, 50, 34],
        note: "Real recordings of multi-step tool requests with natural disfluencies, passes out of 100 under exact matching.",
      },
      fdb2: {
        label: "FDB-v2 task score",
        unit: "1 to 5",
        min: 1,
        max: 5,
        axis: ["1", "5"],
        decimals: 2,
        qaa: [2.57, 2.98, 2.44],
        jarvis: [3.36, 3.28, 2.84],
        note: "Mean task score over 300 task-and-pace pairs with an automated examiner: correction, entity tracking and safety.",
      },
    },
  },
  // Table 3: FDB-v3 Pass@1, published systems.
  fdb3Leaderboard: [
    { name: "Jarvis-Audio", value: 69.0, ours: true },
    { name: "GPT-Realtime", value: 60.0 },
    { name: "Gemini Live 3.1", value: 54.0 },
    { name: "Gemini Live 2.5", value: 49.0 },
    { name: "Venus-Audio", value: 48.0 },
    { name: "Cascaded (Whisper, GPT-4o, TTS)", value: 45.0 },
    { name: "Grok", value: 43.0 },
    { name: "Venus-Omni", value: 43.0 },
    { name: "Ultravox v0.7", value: 41.0 },
    { name: "Gander", value: 40.0 },
    { name: "VoiceChat-11B", value: 33.0 },
  ],
  // Table 4: tau-Voice macro average on the public leaderboard.
  tauLeaderboard: [
    { name: "GPT Live 1 with GPT-6 Astra", value: 81.72, proprietary: true },
    { name: "Pine Voice Preview", value: 75.38, proprietary: true },
    { name: "Jarvis-Audio (open 9B front)", value: 69.24, ours: true },
    { name: "Grok Voice Think Fast 1.0", value: 67.32 },
    { name: "Grok Voice Think Fast 2.0", value: 62.53 },
    { name: "Qwen3.5-Omni-Plus Realtime", value: 53.67 },
    { name: "Gemini 3.1 Flash Live (thinking high)", value: 43.85 },
    { name: "GPT-Realtime 2", value: 42.43 },
    { name: "Grok Voice Fast 1.0", value: 38.33 },
    { name: "GPT-Realtime 1.5", value: 35.27 },
    { name: "LiveKit cascaded pipeline", value: 31.2 },
    { name: "GPT-Realtime 1.0", value: 30.42 },
    { name: "Gemini 2.5 Flash Live", value: 25.77 },
  ],
  // Table 5: consistency under 80 race scripts x 3 runs.
  race: [
    { name: "Jarvis, full runtime", ok: 240, staleAudio: 0, staleTool: 0, falseDelivery: 0, ours: true },
    { name: "without result validity (I2)", ok: 168, staleAudio: 72, staleTool: 0, falseDelivery: 0 },
    { name: "without plan freshness (I3)", ok: 168, staleAudio: 72, staleTool: 72, falseDelivery: 0 },
    { name: "without playback receipts (I4)", ok: 204, staleAudio: 0, staleTool: 0, falseDelivery: 36 },
  ],
  // Table 6: JEV against general LLM controllers with the same options.
  controllers: [
    { name: "JEV", ours: true, median: 0.3, inTime: 524, fallback: 544, binding: 252, stopped: 150, stale: 4 },
    { name: "DeepSeek-V4-Flash", median: 1.57, inTime: 0, fallback: 465, binding: 220, stopped: 77, stale: 36 },
    { name: "Gemini 3.5 Flash", median: 3.14, inTime: 0, fallback: 456, binding: 160, stopped: 9, stale: 96 },
  ],
  // Table 7: ContextDialog spoken memory.
  memory: [
    { name: "QAA, default Markdown memory", score: 1.45, good: 6, tokens: 55 },
    { name: "Jarvis, JEV selection", score: 4.19, good: 61, tokens: 700, ours: true },
    { name: "Jarvis, hybrid dense and sparse retrieval", score: 4.41, good: 65, tokens: 1013, ours: true },
  ],
};
