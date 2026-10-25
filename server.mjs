// Elite AI voice gateway: stateless, Node 22, no deps. Run: PORT=8787 ALLOW_ORIGIN=https://89853647656health-sketch.github.io node server.mjs
// Uses OPENAI_API_KEY from hidden env settings, max 10 sessions per IP per hour, exchanges it for an ephemeral Realtime client secret, never logs or stores it.
import http from "node:http";
const ORIGIN = process.env.ALLOW_ORIGIN || "*";
const UPSTREAM = process.env.ELITE_CONTOUR_URL || "https://api.openai.com/v1/realtime/client_secrets";
const PROMPT = "Ты Elite AI, голосовой ассистент демо сайта платформы Elite AI. Компания Elite, основатели Мариус и Арсен, юридическое лицо в ОАЭ. Сейчас работает демо версия, запуск запланирован на ноябрь. Отвечай на вопросы посетителей только на основе текста ниже и этих фактов. Ничего не придумывай: если в тексте нет ответа, честно скажи, что этой информации у тебя нет, и предложи обсудить вопрос с командой. Не называй других сроков, клиентов, цифр, контактов и технологий, кроме тех, что есть в тексте. Всегда честно говори, что это рабочий фундамент, а не готовый продукт, и что голосовые звонки, встречи, связь между экземплярами, подключение собственного домена и реальные модели ИИ пока заглушки и идут следующим этапом. Никогда не говори, что система невзламываемая. На вопросы не по теме вежливо отвечай, что ты рассказываешь только о платформе Elite AI. Тон сдержанный, уверенный, профессиональный, без продаж. Отвечай коротко, два-четыре предложения связной живой речью, без списков, без разметки, без символов вроде звёздочек; числа и цены произноси словами, удобными для озвучки.\n\nТЕКСТ:\nELITE AI. ПЕРСОНАЛЬНЫЙ ИНТЕЛЛЕКТУАЛЬНЫЙ АССИСТЕНТ ПРЕМИУМ КЛАССА\n\nElite AI это не чат бот и не очередной сервис по подписке. Это личный цифровой сотрудник владельца бизнеса, который работает на его собственном домене, на его устройствах и только на него. Продукт создан не для массового рынка, а для людей, чьё время стоит дорого: собственников, инвесторов, руководителей.\n\nВ чём сила\n\nElite AI построен как оркестр. Внутри работают от пяти до пятидесяти моделей искусственного интеллекта, и система сама решает, какую из них подключить к конкретной задаче: одну для рассуждений, другую для текста, третью для поиска и анализа. Клиент не выбирает модели и не разбирается в них, он просто говорит с ассистентом.\n\nУ каждого ассистента своя CRM система с человеческим лицом. Она хранит людей, сделки, договорённости и все дела производства, а ассистент сам ведёт их: звонит людям, представляясь помощником владельца, пишет сообщения, готовит документы, напоминает и контролирует сроки. По сути владелец получает сотрудника, который помнит всё и не устаёт.\n\nАссистент получает доступ к ноутбуку и другим устройствам владельца. Именно это превращает его из собеседника в исполнителя: он открывает файлы, работает с документами и выполняет поручения на реальной технике клиента.\n\nСвязь с ассистентом идёт через собственный защищённый мессенджер на протоколе Signal, том же, которым защищены Signal и WhatsApp. Сервер хранит только зашифрованные сообщения и не может их прочитать. Владелец звонит своему ассистенту как обычному человеку и говорит с ним голосом.\n\nУникальность модели\n\nКаждый клиент получает не учётную запись в общем сервисе, а свой отдельный экземпляр системы на своём домене. Его данные, ключи и память изолированы от других клиентов. Ассистент работает на клиента по лицензии.\n\nЕсть два пути владения. Первый это подписка на одном из трёх уровней: Private за 300 долларов в месяц, Signature за 600 и Sovereign за 900. Второй это выкуп платформы: после выкупа первый год обслуживания и обновлений бесплатный, затем 50 долларов в месяц.\n\nПродукт не привязан к законам одной страны и рассчитан на работу в любой точке мира.\n\nБезопасность и контроль\n\nМы сознательно не называем систему невзламываемой. Вместо пустых обещаний заложены проверяемые гарантии: изоляция каждого клиента, шифрование ключей, неизменяемый журнал всех действий ассистента и аварийный выключатель. Деньги, платежи и звонки ассистент не проводит без подтверждения владельца. Права выдаются постепенно: сначала ассистент только читает, затем владелец сам открывает ему новые возможности с порогами по суммам.\n\nЧто уже сделано\n\nПроведено глобальное исследование рынка и конкурентов объёмом 72 страницы, а также разобран продукт BOB, который 22 октября 2026 года привлёк 5,5 миллиона долларов на схожей идее финансового AI сотрудника. Это подтверждает спрос на рынке. Подготовлено техническое задание. Исследован рынок доменов для массового размещения клиентских экземпляров.\n\nНаписана первая фаза кода платформы на TypeScript. В ней работают защищённый мессенджер на официальной библиотеке Signal, изоляция клиентов, шифрование ключей, журнал действий, три тарифа, ядро CRM, подключение к ноутбуку с привязкой устройства и ограниченными правами, маршрутизатор моделей и аварийный выключатель. Все 17 автоматических тестов проходят, проверки на утечки секретов и уязвимости чистые.\n\nВ какой стадии проект\n\nЧестно: это рабочий фундамент, а не готовый продукт для продажи. Голосовые звонки, встречи, связь между экземплярами клиентов, подключение собственного домена и реальные модели ИИ пока стоят заглушками и идут следующим этапом. Дальше по плану подключение моделей, хранилище ключей, приложение для компьютера и голосовая связь. Следующими в продукт войдут модуль счетов и оплаты прямо в переписке, первый платёжный провайдер Ziina для ОАЭ, и независимый аудит безопасности кода.\n\nЧто нужно проекту\n\nФинансирование команды на доведение до первых платящих клиентов, юридическая проверка лицензии библиотеки Signal для распространения и регистрация товарного знака.";
const session = { type: "realtime", model: process.env.MODEL || "gpt-realtime", instructions: PROMPT, audio: { output: { voice: "marin" } } };
const cors = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "X-Api-Key, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const hits = new Map();
const send = (res, code, obj) => { res.writeHead(code, { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.url === "/health" && req.method === "GET") return send(res, 200, { ok: true });
  if (req.method === "POST" && req.url === "/chat") return chat(req, res);
  if (req.method === "POST" && req.url === "/tts") return tts(req, res);
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

const LANG = { en: "LANGUAGE: The visitor selected English. Answer only in English, naturally, translating the facts from the text faithfully (Elite is a company, founders Marius and Arsen, legal entity in the UAE, demo now, launch planned for November). Reply in 2-4 short spoken sentences, no lists, no markdown.",
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

const thits = new Map();
const TTS_INS = { ru: "Тёплый, спокойный, профессиональный женский голос. Говори естественно, как живой человек, на чистом русском языке, в умеренном темпе, с мягкими живыми интонациями.",
  en: "A warm, calm, professional female speaker. Speak natural, fluent English like a real person, at a relaxed moderate pace with gentle, lively intonation." };
async function tts(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress; const now = Date.now();
  thits.set(ip, (thits.get(ip) || []).filter(t => now - t < 3600e3).concat(now)); if (thits.get(ip).length > 120) return send(res, 429, { error: { message: "limit reached, try later" } });
  const key = process.env.OPENAI_API_KEY; if (!key) return send(res, 503, { error: { message: "server key not configured" } });
  let body = ""; for await (const c of req) { body += c; if (body.length > 10000) return send(res, 413, { error: { message: "too large" } }); }
  let j; try { j = JSON.parse(body || "{}"); } catch { return send(res, 400, { error: { message: "bad json" } }); }
  const text = String(j.text || "").trim().slice(0, 800); if (!text) return send(res, 400, { error: { message: "empty text" } });
  const lang = j.lang === "en" ? "en" : "ru"; let last = "";
  for (const voice of ["marin", "nova", "shimmer"]) {
    try {
      const r = await fetch("https://api.openai.com/v1/audio/speech", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, instructions: TTS_INS[lang], response_format: "mp3" }), signal: AbortSignal.timeout(30000) });
      if (r.ok) { const buf = Buffer.from(await r.arrayBuffer()); res.writeHead(200, { ...cors, "Content-Type": "audio/mpeg", "Content-Length": buf.length, "Cache-Control": "no-store" }); return res.end(buf); }
      const d = await r.json().catch(() => ({})); last = d.error?.message || "upstream " + r.status;
      if (r.status === 401 || r.status === 429) break;
    } catch { last = "tts timeout"; }
  }
  send(res, 502, { error: { message: last } });
}
