# QVAC Get Well Soon Message Writer

Enter a name and their situation, and an on-device AI writes a caring get-well-soon message. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32037

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

Enter the recipient's name and their situation (situation is optional — it defaults to "feeling under the weather"). The server sends the model a short system prompt plus two few-shot examples covering different situations (surgery recovery, the flu) so it learns to reference the situation with empathy. The streamed reply is checked for refusal phrases and for at least a loose keyword overlap with the situation you typed, so the message doesn't drift onto an unrelated context. If it looks unusable, a caring deterministic template fills in the name and situation instead.

**Example**

- Input: name `Priya`, situation `recovering from knee surgery`
- Output: "Dear Priya, I was so sorry to hear about your knee surgery, and I hope the recovery is going smoothly. Please rest up, take it slow, and know that I'm sending you strength and healing thoughts. Can't wait to see you back on your feet soon!"

## License

MIT
