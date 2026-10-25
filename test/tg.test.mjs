import test from "node:test"; import assert from "node:assert/strict";
import { createTg, langOf, SENSITIVE } from "../tg.mjs";
function mk(extra = {}, model = "Ответ о проекте.") {
  const calls = [];
  const fetchFn = async (url, o) => { const b = JSON.parse(o.body); calls.push({ url, b });
    if (url.includes("x.ai")) return { ok: true, json: async () => ({ choices: [{ message: { content: model } }] }) };
    if (url.endsWith("/getMe")) return { ok: true, json: async () => ({ ok: true, result: { id: 99, username: "arselite_bot" } }) };
    return { ok: true, json: async () => ({ ok: true }) }; };
  const env = { TELEGRAM_BOT_TOKEN: "T", TG_WEBHOOK_SECRET: "s3cret", XAI_API_KEY: "X", TG_CHANNEL_ID: "@arselite", ...extra };
  return { tg: createTg({ env, fetchFn, prompt: "FACTS" }), calls, sent: () => calls.filter(c => c.url.endsWith("/sendMessage")), xai: () => calls.filter(c => c.url.includes("x.ai")) };
}
const user = (o = {}) => ({ id: 1, is_bot: false, language_code: "ru", username: "alice", ...o });
const dm = (text, from = user()) => ({ message: { message_id: 1, chat: { id: 1, type: "private" }, from, text } });
const grp = (text, extra = {}) => ({ message: { message_id: 5, chat: { id: -100, type: "supergroup" }, from: user(), text, ...extra } });

test("language detection", () => {
  assert.equal(langOf({ language_code: "en" }, "Что это?"), "ru");
  assert.equal(langOf({ language_code: "ru" }, "What is it?"), "en");
  assert.equal(langOf({ language_code: "uk" }, "?"), "ru");
  assert.equal(langOf({ language_code: "de" }, "?"), "en");
});
test("DM answered via Grok with guard + tagged input, plain text", async () => {
  const m = mk(); await m.tg.handleUpdate(dm("Что такое АРС-ЭЛИТ?"));
  const x = m.xai()[0].b; assert.match(x.messages[0].content, /FACTS/); assert.match(x.messages[0].content, /прототип/);
  assert.match(x.messages.at(-1).content, /^<user_message>.*<\/user_message>$/);
  const s = m.sent()[0].b; assert.equal(s.text, "Ответ о проекте."); assert.equal(s.parse_mode, undefined);
});
test("markdown stripped from model output", async () => { const m = mk({}, "**Жирно** _текст_"); await m.tg.handleUpdate(dm("вопрос")); assert.equal(m.sent()[0].b.text, "Жирно текст"); });
test("bots, auto-forwards and channel senders ignored", async () => {
  const m = mk();
  await m.tg.handleUpdate(dm("hi", user({ is_bot: true })));
  await m.tg.handleUpdate(grp("post", { is_automatic_forward: true }));
  await m.tg.handleUpdate(grp("x", { sender_chat: { id: -1 } }));
  assert.equal(m.sent().length, 0); assert.equal(m.xai().length, 0);
});
test("group: silent unless mentioned or replying to channel post / bot", async () => {
  const m = mk();
  await m.tg.handleUpdate(grp("просто болтаем")); assert.equal(m.sent().length, 0);
  await m.tg.handleUpdate(grp("@arselite_bot что это?")); assert.equal(m.sent().length, 1);
  assert.doesNotMatch(m.xai()[0].b.messages.at(-1).content, /@arselite_bot/);
  await m.tg.handleUpdate(grp("а цена?", { reply_to_message: { is_automatic_forward: true } })); assert.equal(m.sent().length, 2);
  await m.tg.handleUpdate(grp("уточню", { reply_to_message: { from: { id: 99 } } })); assert.equal(m.sent().length, 3);
  await m.tg.handleUpdate(grp("ответ Пете", { reply_to_message: { from: { id: 7 } } })); assert.equal(m.sent().length, 3);
});
test("sensitive data refused without reaching model", async () => {
  for (const t of ["мой пароль qwerty", "card 4111 1111 1111 1111", "My API key is abc"]) {
    const m = mk(); await m.tg.handleUpdate(dm(t)); assert.equal(m.xai().length, 0); assert.match(m.sent()[0].b.text, /не присылайте|do not send/);
  }
  assert.ok(!SENSITIVE.some(r => r.test("Сколько стоит тариф Signature?")));
});
test("rate limit per user", async () => {
  const m = mk(); for (let i = 0; i < 10; i++) await m.tg.handleUpdate(dm("вопрос " + i));
  assert.equal(m.xai().length, 8); assert.match(m.sent().at(-1).b.text, /много вопросов/);
  await m.tg.handleUpdate(dm("вопрос", user({ id: 2 }))); assert.equal(m.xai().length, 9);
});
test("/post: non-owner ignored, owner gets draft with confirm, publish only on owner click", async () => {
  const m = mk();
  await m.tg.handleUpdate(dm("/post привет")); assert.equal(m.sent().length, 0);
  await m.tg.handleUpdate(dm("/post анонс канала", user({ username: "AIA_369", id: 42 })));
  const d = m.sent()[0].b; assert.match(d.text, /Опубликовать в канале\?/); assert.notEqual(d.chat_id, "@arselite");
  const cb = d.reply_markup.inline_keyboard[0][0].callback_data;
  await m.tg.handleUpdate({ callback_query: { id: "q", data: cb, from: user(), message: { chat: { id: 1 } } } });
  assert.equal(m.sent().filter(s => s.b.chat_id === "@arselite").length, 0);
  await m.tg.handleUpdate({ callback_query: { id: "q", data: cb, from: user({ username: "AIA_369", id: 42 }), message: { chat: { id: 42 } } } });
  assert.equal(m.sent().filter(s => s.b.chat_id === "@arselite").length, 1);
  await m.tg.handleUpdate({ callback_query: { id: "q", data: cb, from: user({ username: "AIA_369", id: 42 }), message: { chat: { id: 42 } } } });
  assert.equal(m.sent().filter(s => s.b.chat_id === "@arselite").length, 1, "draft single-use");
});
test("TG_OWNER_ID overrides username (spoof-proof)", () => {
  const m = mk({ TG_OWNER_ID: "42" });
  assert.equal(m.tg.isOwner({ id: 5, username: "AIA_369" }), false); assert.equal(m.tg.isOwner({ id: 42 }), true);
});
test("webhook route: inert without token, checks path + header secret", async () => {
  const run = async (env, url, hdr) => { const { tg } = mk(env); let code; const req = { url, headers: hdr, async *[Symbol.asyncIterator]() { yield '{"update_id":1}'; } };
    await tg.route(req, {}, (_r, c) => { code = c; }); return code; };
  assert.equal(await run({ TELEGRAM_BOT_TOKEN: "" }, "/tg/s3cret", { "x-telegram-bot-api-secret-token": "s3cret" }), 503);
  assert.equal(await run({}, "/tg/wrong", { "x-telegram-bot-api-secret-token": "s3cret" }), 404);
  assert.equal(await run({}, "/tg/s3cret", {}), 404);
  assert.equal(await run({}, "/tg/s3cret", { "x-telegram-bot-api-secret-token": "s3cret" }), 200);
});
