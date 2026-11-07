import { USER_CONFIG } from './userConfig';

export const STORAGE_KEY = 'yt_creator_template';


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
