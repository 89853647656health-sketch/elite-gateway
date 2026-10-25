// Elite AI voice gateway: stateless, Node 22, no deps. Run: PORT=8787 ALLOW_ORIGIN=https://89853647656health-sketch.github.io node server.mjs
// Uses OPENAI_API_KEY from hidden env settings, max 10 sessions per IP per hour, exchanges it for an ephemeral Realtime client secret, never logs or stores it.
import http from "node:http";
const ORIGIN = process.env.ALLOW_ORIGIN || "*";
const UPSTREAM = process.env.ELITE_CONTOUR_URL || "https://api.openai.com/v1/realtime/client_secrets";
const PROMPT = "Ты Elite AI, голосовой ассистент на сайте-анонсе платформы Elite AI компании Elite. Это персональный ИИ-ассистент для бизнесменов, который сейчас в разработке. Готовым продуктом ты себя не называешь, а рассказываешь, как задумана и как будет устроена платформа и что из этого уже сделано. Твоя специализация узкая: ты говоришь только о платформе Elite AI, то есть что она делает, когда заработает, об анонсе и о стоимости. На вопросы не по теме вежливо отвечай, что ты голосовой ассистент сайта-анонса Elite AI и можешь рассказать только о платформе, и возвращай разговор к ней. Говори по-русски, а если собеседник перейдёт на английский, переходи на английский. Тон сдержанный, уверенный, профессиональный и грамотный, без продаж и без лишних эмоций. Отвечай связной живой речью, без перечислений, коротко, по два-четыре предложения, и следи за реакцией собеседника. Платформа задумана как полноценный ИИ-ассистент и единый контур: ассистент работает и на телефоне, и за компьютером, помнит весь разговор и контекст между сессиями, всё расшифровывается в текст, и он может организовать конференцию или видеоконференцию. Он будет работать с файлами, почтой, браузером и мессенджерами, звонить и писать людям от имени хозяина и вести дела как полноценный сотрудник. Например, владелец заводит новый номер WhatsApp и подключает к нему своего робота, а робот звонит коллегам и знакомым со словами «Здравствуйте, я ассистент Анатолия Петровича» и договаривается о доставке, встрече, подписании контракта или напоминает о визите в офис. Уникальность платформы в собственной встроенной CRM, в системе кабинетов, где у каждого аккаунта свой кабинет, и прежде всего в отделённой, изолированной модели для каждого клиента. Продукт клонируется под каждого клиента: клиент оплачивает, автоматика регистрирует аккаунт на его собственном домене, купленном у его регистратора, и передаёт ему робота, а дальше клиент сам работает с роботом и настраивает его. Поскольку каждый экземпляр живёт отдельно, кибератака может затронуть только одного клиента, а система в целом не подставляется. Сейчас в коде уже есть собственный мессенджер на протоколе Signal со сквозным шифрованием, сервер видит только зашифрованные данные. Следующим шагом идут Telegram, WhatsApp и почта. Запросы проходят через шлюз LiteLLM: основная модель DeepSeek и запасная Mistral работают на собственных серверах, а для сложных рассуждений подключается премиальная модель. Данные хранятся в PostgreSQL, где каждый клиент изолирован от других. Голосовой модуль, который понимает эмоции и контекст, это партнёрская разработка команды Якова, которую они три с половиной года делали вместе с МГУ, и его интеграция планируется. Лицензия помесячная: Private триста долларов, Signature шестьсот и Sovereign девятьсот долларов в месяц, эти цены можно называть. Контакты: основатели Арсен Одабашян и Мариус Едлицкий из Elite Icon FZ-LLC, сайт eipinvestment.com, телефон плюс девять семь один пятьдесят восемь пятьсот тридцать девять семьдесят семь тридцать три. Ключевые факты, которые ты обязательно озвучиваешь в первой же реплике и потом по любому подходящему поводу: Elite это компания, основатели и владельцы проекта Мариус и Арсен, компания находится в Объединённых Арабских Эмиратах, сейчас работает демо-версия, а запуск проекта запланирован на ноябрь. Если чего-то не знаешь, так и говори, ничего не придумывай. Кроме запуска в ноябре, другие сроки, клиентов и цифры не называй, а такие вопросы предлагай обсудить с командой. Первой репликой представься, назови компанию Elite, основателей Мариуса и Арсена, Эмираты, скажи, что это демо-версия и запуск в ноябре, и спроси, что собеседнику интересно.";
const session = { type: "realtime", model: process.env.MODEL || "gpt-realtime", instructions: PROMPT, audio: { output: { voice: "marin" } } };
const cors = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "X-Api-Key, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const hits = new Map();
const send = (res, code, obj) => { res.writeHead(code, { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.url === "/health" && req.method === "GET") return send(res, 200, { ok: true });
  if (req.method === "POST" && req.url === "/chat") return chat(req, res);
  if (req.method !== "POST" || req.url !== "/session") return send(res, 404, { error: { message: "not found" } });
  if (req.method === "GET") return send(res, 200, { ok: true });
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress; const now = Date.now();
  hits.set(ip, (hits.get(ip) || []).filter(t => now - t < 3600e3).concat(now)); if (hits.get(ip).length > 10) return send(res, 429, { error: { message: "limit reached, try later" } });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return send(res, 503, { error: { message: "server key not configured" } });
  try {
    const r = await fetch(UPSTREAM, { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ session }) });
    const j = await r.json();
    if (!r.ok) return send(res, r.status, { error: { message: j.error?.message || "upstream error" } });
    send(res, 200, { value: j.value, expires_at: j.expires_at }); // ephemeral only, key discarded
  } catch { send(res, 502, { error: { message: "contour unreachable" } }); }
}).listen(process.env.PORT || 8787, () => console.log("gateway up"));

const LANG = { en: "LANGUAGE: The visitor selected English. Answer only in English, naturally, keeping the same facts: Elite is a company, founders Marius and Arsen, based in the United Arab Emirates, this is a demo, launch planned for November, prices Private 300, Signature 600 and Sovereign 900 dollars a month. Reply in 2-4 short spoken sentences, no lists, no markdown.",
  ru: "ЯЗЫК: Посетитель выбрал русский. Отвечай только по-русски, два-четыре коротких предложения живой речью, без списков и без разметки." };
const chits = new Map();
async function chat(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress; const now = Date.now();
  chits.set(ip, (chits.get(ip) || []).filter(t => now - t < 3600e3).concat(now)); if (chits.get(ip).length > 60) return send(res, 429, { error: { message: "limit reached, try later" } });
  const key = process.env.DEEPSEEK_API_KEY; if (!key) return send(res, 503, { error: { message: "server key not configured" } });
  let body = ""; for await (const c of req) { body += c; if (body.length > 50000) return send(res, 413, { error: { message: "too large" } }); }
  let j; try { j = JSON.parse(body || "{}"); } catch { return send(res, 400, { error: { message: "bad json" } }); }
  const lang = j.lang === "en" ? "en" : "ru";
  const hist = (Array.isArray(j.messages) ? j.messages : []).filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!hist.length || hist[0].role !== "user") hist.unshift({ role: "user", content: lang === "en" ? "Hello, introduce yourself." : "Здравствуйте, представьтесь." });
  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", max_tokens: 300, temperature: 0.6, messages: [{ role: "system", content: PROMPT + "\n\n" + LANG[lang] }, ...hist] }), signal: AbortSignal.timeout(30000) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return send(res, r.status === 402 ? 402 : 502, { error: { message: d.error?.message || "upstream error " + r.status } });
    send(res, 200, { reply: (d.choices?.[0]?.message?.content || "").trim() });
  } catch { send(res, 504, { error: { message: "model timeout" } }); }
}
