# ARS-ELITE Telegram bot (prepared, not deployed)
Route: POST /tg/<TG_WEBHOOK_SECRET> (also checks header X-Telegram-Bot-Api-Secret-Token). Returns 503 until TELEGRAM_BOT_TOKEN and TG_WEBHOOK_SECRET are set.
Env: TELEGRAM_BOT_TOKEN, TG_WEBHOOK_SECRET (random 32+ chars, A-Z a-z 0-9 _ -), TG_CHANNEL_ID (@arselite), TG_OWNER_ID (numeric id of @AIA_369, recommended), TG_OWNER_USERNAME (default AIA_369), TG_BOT_USERNAME (optional).
Activate: set env on Render, deploy, then
  curl -s "https://api.telegram.org/bot$TOKEN/setWebhook" -d url="https://<gateway>/tg/$SECRET" -d secret_token="$SECRET" -d 'allowed_updates=["message","callback_query"]' -d drop_pending_updates=true
BotFather: /setprivacy -> Disable (to see replies to channel posts in the discussion group). Add bot to the discussion group; add bot as channel admin with "Post messages" only.
Tests: node --test test/
