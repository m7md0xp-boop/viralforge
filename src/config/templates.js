import { USER_CONFIG } from './userConfig';

export const STORAGE_KEY = 'yt_creator_template';

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'gemini', free: true },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', free: true },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', provider: 'gemini', free: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', provider: 'gemini', free: true },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'gemini', free: false },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'gemini', free: false },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'groq', free: true },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'groq', free: true },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', provider: 'groq', free: true },
  { id: 'openrouter/free', name: 'OpenRouter Free Router', provider: 'openrouter', free: true }
];


export const DEFAULT_TEMPLATE = `🎮 Welcome to {game} - Episode {episode}!

In today's video, we are jumping back into {game} for another epic adventure!

Drop a LIKE and SUBSCRIBE if you enjoy the video!

📺 Check out {channel_name} and subscribe:
🔗 {channel_link}

⏱️ Timestamps:
00:00 - Introduction
01:30 - {game} Gameplay
10:00 - Highlights
15:00 - Outro & Next Episode

#gaming #{game}`;

export const PRESET_TEMPLATES = [
  {
    id: 'roblox-challenge',
    name: {
      ar: 'قالب روبلوكس وتحديات الألعاب',
      en: 'Roblox & Gaming Challenges'
    },
    text: `بسم الله الرحمن الرحيم، سبحان الله وبحمده، سبحان الله العظيم. 🤍

في الحلقة {episode} من ماب "{game}" في روبلوكس.. رجعنا بتحدي أقوى وأسرع! ⛳😱 صرنا نجمع كميات أكبر ونحمل الكور بأسرع وقت ممكن عشان نفتح مناطق الـ Yards المتقدمة ونحطم أرقام قياسية جديدة! 🔥🚀

📺 لا تنسون تشيكون على قناة المبدع {channel_name} وتدعمونه بالاشتراك:
🔗 {channel_link}

🔔 اشترك بالقناة وفعل جرس التنبيهات عشان ما يفوتك أي جديد:
${USER_CONFIG.channelUrl}?sub_confirmation=1

👍 لا تنسى اللايك إذا عجبك المقطع!

#Roblox #روبلوكس #{game} #gaming`
  },
  {
    id: 'gameplay-walkthrough',
    name: {
      ar: 'قالب تختيم ومغامرات ألعاب',
      en: 'Gameplay & Walkthrough'
    },
    text: `🎮 مرحباً بكم في الحلقة {episode} من تختيم لعبة {game}!

في هذه الحلقة نستكمل رحلتنا ونواجه تحديات جديدة ومثيرة! شاركوني رأيكم في التعليقات.

👍 إذا عجبك المقطع لا تنسى تضغط لايك وتشترك بالقناة وتفعل جرس التنبيهات 🔔

━━━━━━━━━━━━━━━
📺 لا تنسون تشيكون على قناة {channel_name} وتدعمونه بالاشتراك:
🔗 {channel_link}

🌐 جميع حساباتي وروابط البث:
🔗 {linktree_link}

💬 سيرفر الديسكورد:
🔗 {discord_link}
━━━━━━━━━━━━━━━
#{game} #تختيم #العاب`
  },
  {
    id: 'default-template',
    name: {
      ar: 'القالب الإنجليزي الافتراضي',
      en: 'Default English Template'
    },
    text: DEFAULT_TEMPLATE
  }
];
