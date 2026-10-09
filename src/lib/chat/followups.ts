/**
 * Static topic → follow-up suggestions shown after each assistant answer.
 * Keyword-matched, no LLM call. Client-safe (no server-only imports).
 */

const FOLLOW_UPS: Record<string, string[]> = {
  experience: [
    "What is his current role?",
    "How many years of experience does he have?",
    "What kind of roles is he looking for?",
  ],
  projects: [
    "Which project should I look at first?",
    "Show me the Gurukul project",
    "What technologies does he use?",
  ],
  gurukul: ["Show me another project", "What tech is Gurukul built with?", "Is Gurukul live?"],
  skills: [
    "What databases does he work with?",
    "Does he know Rust?",
    "What is his strongest tech stack?",
  ],
  availability: [
    "Is he open to remote work?",
    "What is his notice period?",
    "How soon can he join?",
  ],
  contact: [
    "Can I send Pritam a message from here?",
    "Where can I find his resume?",
    "Is he open to freelance work?",
  ],
  education: [
    "Where did he study?",
    "Does he have any certifications?",
    "What are his key achievements?",
  ],
};

const TOPIC_RULES: [RegExp, string][] = [
  [/\b(experience|years|career|journey|worked before)\b/i, "experience"],
  [/\bgurukul\b/i, "gurukul"],
  [/\b(project|built|portfolio|case study)\b/i, "projects"],
  [/\b(skill|stack|tech|technolog|database|framework|language|rust)\b/i, "skills"],
  [/\b(available|availability|hire|hiring|notice|join|remote|freelance)\b/i, "availability"],
  [/\b(contact|email|reach|message|resume|cv|phone)\b/i, "contact"],
  [/\b(educat|degree|college|school|certif|achievement)\b/i, "education"],
];

const GENERIC_FOLLOW_UPS = [
  "What is his tech stack?",
  "Is he available to hire?",
  "How can I get in touch?",
];

const MAX_SUGGESTIONS = 3;

/**
 * Picks up to 3 follow-up questions for the latest exchange.
 * `exclude` (questions the visitor already asked) is never repeated.
 */
export function getFollowUps(conversation: string, exclude: string[] = []): string[] {
  const picked: string[] = [];

  const add = (question: string) => {
    if (picked.length >= MAX_SUGGESTIONS) return;
    if (exclude.includes(question)) return;
    if (picked.includes(question)) return;
    picked.push(question);
  };

  for (const [pattern, topic] of TOPIC_RULES) {
    if (!pattern.test(conversation)) continue;
    for (const question of FOLLOW_UPS[topic] ?? []) {
      add(question);
      if (picked.length >= MAX_SUGGESTIONS) break;
    }
    if (picked.length >= MAX_SUGGESTIONS) break;
  }

  if (picked.length === 0) {
    for (const question of GENERIC_FOLLOW_UPS) add(question);
  }

  return picked;
}
