// Description templates. Placeholders are filled with the user's own values before display:
//   {ai_description}  the text written by the AI (hook + what happens in the video)
//   {game} {episode}  from the input fields
//   {channel_name} {channel_link} {subscribe_link} {linktree_link} {discord_link}  from the channel profile
// A line whose link placeholder is empty is removed, so keep each label and its link on the same line.
// Hashtags are added after the template by the app (3-5 for YouTube), so templates should not contain them.
// Preset names are translated in src/i18n/locales ("presets.<id>").
export const STORAGE_KEY = 'yt_creator_template';

export const DEFAULT_TEMPLATE = `{ai_description}

👍 Drop a LIKE and SUBSCRIBE if you enjoyed {game}!
🔔 Subscribe to {channel_name}: {subscribe_link}

🌐 All my links: {linktree_link}
💬 Discord: {discord_link}

⏱️ Timestamps:
00:00 - Introduction
01:30 - {game} Gameplay
10:00 - Highlights`;

export const PRESET_TEMPLATES = [
  {
    id: 'gaming-challenge-ar',
    text: `{ai_description}

🔥 الحلقة {episode} من {game}، لا تفوّتون التحدي القادم!

🔔 اشترك في قناة {channel_name} وفعّل جرس التنبيهات: {subscribe_link}
👍 لا تنسى اللايك إذا عجبك المقطع!

🌐 جميع حساباتي: {linktree_link}
💬 سيرفر الديسكورد: {discord_link}`
  },
  {
    id: 'gameplay-walkthrough',
    text: `🎮 مرحباً بكم في الحلقة {episode} من تختيم لعبة {game}!

{ai_description}

👍 إذا عجبك المقطع اضغط لايك واشترك بالقناة وفعّل جرس التنبيهات 🔔
━━━━━━━━━━━━━━━
📺 قناة {channel_name}: {channel_link}
🌐 جميع حساباتي وروابط البث: {linktree_link}
💬 سيرفر الديسكورد: {discord_link}
━━━━━━━━━━━━━━━`
  },
  {
    id: 'default-template',
    text: DEFAULT_TEMPLATE
  }
];
