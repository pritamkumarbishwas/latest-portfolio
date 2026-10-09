import { buildSystemPrompt } from "@/lib/chat/prompt";
import { chatbotKnowledge, portfolio } from "@/lib/chat/schemas";

const prompt = buildSystemPrompt();
const phone = portfolio.contact.phone;
const phoneDigits = phone.replace(/\D/g, "");
const leaksPhone =
  prompt.includes(phone) ||
  (phoneDigits.length >= 6 && prompt.replace(/\D/g, "").includes(phoneDigits));

const words = prompt.trim().split(/\s+/).length;
const tokensByChars = Math.ceil(prompt.length / 4);
const tokensByWords = Math.ceil(words * 1.3);

console.log("System prompt report");
console.log("====================");
console.log(`characters:              ${prompt.length}`);
console.log(`words:                   ${words}`);
console.log(`approx tokens (chars/4): ${tokensByChars}`);
console.log(`approx tokens (words×1.3): ${tokensByWords}`);
console.log(`faq entries:             ${chatbotKnowledge.faq.length}`);
console.log(`suggested questions:     ${chatbotKnowledge.suggestedQuestions.length}`);
console.log(`phone in source data:    ${phone}`);
console.log(
  leaksPhone
    ? "phone in prompt:         YES — LEAK DETECTED"
    : "phone in prompt:         no (confirmed absent)",
);

if (leaksPhone) {
  process.exitCode = 1;
}
