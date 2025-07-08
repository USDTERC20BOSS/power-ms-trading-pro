// 1. أضف هذا في بداية الملف (تحت imports)
const API_BASE_URL = 'https://power-ms-trading-pro-1.onrender.com';

// 2. في دالة activate:
const res = await fetch(`${API_BASE_URL}/activate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ activation_code: activationCode })
});

// 3. في دالة fetchSettings:
const res = await fetch(`${API_BASE_URL}/get_settings`);

// 4. في دالة updateSettings:
const res = await fetch(`${API_BASE_URL}/update_settings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, settings })
});

// 5. في دالة updateBotStatus:
const res = await fetch(`${API_BASE_URL}/bot_status`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status })
});

// 6. في دالة fetchBalance:
const res = await fetch(`${API_BASE_URL}/binance_balance`);