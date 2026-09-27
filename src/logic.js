// QVAC Get Well Soon Message Writer — core logic.
// completion() writes a caring get-well-soon message for a named person,
// optionally referencing their situation (surgery, flu, injury, etc.).

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 500) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

// Lightweight keyword-overlap grounding check: when a situation was given,
// require at least one shared token so the message doesn't drift onto an
// unrelated context.
function isGrounded(situation, text) {
  if (!situation || situation.trim().length === 0) return true;
  const words = situation
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function fallback(name, situation) {
  const who = name || "there";
  const extra = situation && situation.trim().length > 0
    ? ` I heard about ${situation.trim()}, and I've been thinking of you.`
    : "";
  return (
    `Dear ${who}, I hope you're taking it easy and feeling a little better every day.${extra} ` +
    `Sending you warm thoughts and wishing you a smooth, speedy recovery. Take all the time you need to rest and heal!`
  );
}

function stripWrap(text) {
  return text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

export async function generate(modelId, name, situation) {
  const situationDesc = situation && situation.length > 0 ? situation : "feeling under the weather";

  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You write caring, gentle get-well-soon messages. Given the recipient's name and their situation " +
          "(illness, injury, surgery, etc.), write one short warm message (2-4 sentences) addressed to that person by name, " +
          "that references their situation with empathy. Reply with ONLY the message, no preamble, no explanation.",
      },
      { role: "user", content: "Name: Priya\nSituation: recovering from knee surgery" },
      {
        role: "assistant",
        content:
          "Dear Priya, I was so sorry to hear about your knee surgery, and I hope the recovery is going smoothly. " +
          "Please rest up, take it slow, and know that I'm sending you strength and healing thoughts. " +
          "Can't wait to see you back on your feet soon!",
      },
      { role: "user", content: "Name: Tom\nSituation: down with the flu" },
      {
        role: "assistant",
        content:
          "Dear Tom, I heard you're battling the flu and I hope you're resting up and staying hydrated. " +
          "Wishing you a fast and comfortable recovery — feel better soon!",
      },
      { role: "user", content: `Name: ${name}\nSituation: ${situationDesc}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.8, maxTokens: 150 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = stripWrap(text);

  const message = (looksUnusable(text) || !isGrounded(situation, text))
    ? fallback(name, situation)
    : text;
  return { message };
}
