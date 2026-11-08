// The three studios. Each one has its own inputs and its own results.
export const STUDIOS = {
  video: {
    label: { ar: 'استوديو الفيديو الطويل', en: 'Long video studio' },
    short: { ar: 'فيديو طويل', en: 'Long video' },
    blurb: { ar: 'عناوين يوتيوب، وصف بقالبك وروابطك، وصورة مصغرة', en: 'YouTube titles, a description with your template, and a thumbnail' },
    detailsLabel: { ar: 'رقم الحلقة / الجزء', en: 'Episode / part' },
    detailsPlaceholder: { ar: 'مثال: 01، الجزء 5', en: 'e.g. 01, Part 5' }
  },
  short: {
    label: { ar: 'استوديو الشورتس', en: 'Shorts studio' },
    short: { ar: 'شورتس وريلز', en: 'Shorts & Reels' },
    blurb: { ar: 'عنوان للشورتس، ووصف قصير بعدّاد لكل منصة، وهاشتاقات', en: 'A Shorts title, a short caption with per-platform counters, and hashtags' },
    detailsLabel: { ar: 'ماذا يحدث في المقطع؟ (اختياري)', en: 'What happens in the clip? (optional)' },
    detailsPlaceholder: { ar: 'مثال: فزت بآخر ثانية بضربة واحدة', en: 'e.g. I won with one hit in the last second' }
  },
  live: {
    label: { ar: 'استوديو البث المباشر', en: 'Live studio' },
    short: { ar: 'بث مباشر', en: 'Live stream' },
    blurb: { ar: 'عناوين بث بعدّاد لكل منصة، وفئة ووسوم لـ Twitch و Kick', en: 'Stream titles with per-platform counters, plus a category and tags for Twitch and Kick' },
    detailsLabel: { ar: 'فكرة البث (اختياري)', en: 'Stream idea (optional)' },
    detailsPlaceholder: { ar: 'مثال: تحدي إنهاء اللعبة بدون موت', en: 'e.g. Beat the game without dying' }
  }
};
