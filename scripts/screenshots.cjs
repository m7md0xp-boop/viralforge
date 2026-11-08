// Captures the README screenshots from the running dev server, with Electron (already a dev dependency).
//   1. npm run dev            (in one terminal)
//   2. npm run screenshots    (in another)
// Uses sample data and a fake AI reply, so no API key is needed and nothing is sent anywhere.
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const URL = process.env.VF_URL || 'http://localhost:5173';
const OUT = path.join(__dirname, '..', 'screenshots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const SAMPLE_PROFILE = {
  channelName: 'قناة الألعاب',
  channelUrl: 'https://www.youtube.com/@example',
  linktreeUrl: 'https://linktr.ee/example',
  discordUrl: 'https://discord.gg/example',
  style: 'energetic',
  onboarded: true
};

// Fake Gemini reply used for the "generated output" screenshot
const FAKE_REPLY = {
  videoTitles: [
    { title: 'نجوت 100 يوم في ماينكرافت هاردكور… وهذا ما حدث! (الحلقة 7)', score: 94, seo: 88, ctr: 91 },
    { title: 'بنيت أكبر قلعة في ماينكرافت بدون أي غش | الحلقة 7', score: 89, seo: 85, ctr: 84 },
    { title: 'أخطر ليلة في ماينكرافت هاردكور! كدت أخسر كل شيء', score: 86, seo: 80, ctr: 88 }
  ],
  description:
    'الليلة كانت الأصعب في سلسلتنا! في هذه الحلقة من ماينكرافت هاردكور واجهنا موجة وحوش لم نتوقعها، ' +
    'وبنينا أول جدار دفاعي حول القاعدة. شاهد حتى النهاية لتعرف هل نجونا أم لا.',
  hashtags: ['#ماينكرافت', '#Minecraft', '#هاردكور', '#العاب', '#gaming'],
  shortTitles: ['فزت بآخر ثانية في ماينكرافت! 😱', 'أسرع هروب من الوحوش في تاريخ القناة', 'هذه اللقطة ما توقعها أحد 🔥'],
  templates: ['🔴 بث هاردكور: هل ننجو حتى الفجر؟', 'ماينكرافت هاردكور مباشر الآن! 💀', 'ليلة الرعب 🔥'],
  twitch: { category: 'Minecraft', tags: ['Arabic', 'Hardcore', 'Survival', 'Gaming'] },
  kick: { category: 'Minecraft', tags: ['Arabic', 'Hardcore', 'Survival'] }
};

// Fake vision review for the Thumbnail Lab screenshot
const FAKE_REVIEW = {
  score: 84,
  face: { present: true, emotion: 'دهشة وخوف', score: 90 },
  text: { content: 'NIGHT 7', score: 78 },
  composition: 82,
  curiosity: 86,
  strengths: ['وجه كبير ومعبّر يلفت النظر', 'ألوان دافئة متباينة مع الخلفية'],
  improvements: ['كبّر النص قليلاً وأضف له ظلاً أقوى', 'قلّل التفاصيل في الخلفية خلف الوجه', 'جرّب لوناً أفتح للنص ليظهر في الوضع الفاتح']
};

// A sample thumbnail drawn in the page (no external image needed)
const DRAW_THUMBNAIL = `(async () => {
  const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 1280, 720); g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#b91c1c'); x.fillStyle = g; x.fillRect(0, 0, 1280, 720);
  x.fillStyle = 'rgba(16,185,129,0.35)'; x.beginPath(); x.arc(1080, 120, 220, 0, 7); x.fill();
  x.fillStyle = '#e0ac8c'; x.beginPath(); x.ellipse(360, 380, 200, 250, 0, 0, 7); x.fill();
  x.fillStyle = '#111'; x.beginPath(); x.arc(295, 330, 24, 0, 7); x.arc(425, 330, 24, 0, 7); x.fill();
  x.beginPath(); x.ellipse(360, 480, 52, 74, 0, 0, 7); x.fill();
  x.font = 'bold 150px Arial'; x.lineWidth = 16; x.strokeStyle = '#000'; x.fillStyle = '#facc15';
  x.strokeText('NIGHT 7', 640, 430); x.fillText('NIGHT 7', 640, 430);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const input = document.querySelector('main input[type=file]');
  const dt = new DataTransfer(); dt.items.add(new File([blob], 'thumbnail.png', { type: 'image/png' }));
  input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
})()`;

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({
    width: 1200,
    height: 860,
    show: false,
    webPreferences: { partition: `screens-${Date.now()}`, contextIsolation: true }
  });
  const js = (code) => win.webContents.executeJavaScript(code);
  const shot = async (name) => {
    await wait(600);
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(OUT, name), image.toPNG());
    console.log('saved', name);
  };
  const load = async () => {
    await win.loadURL(URL);
    await wait(1200);
  };

  // 1. Welcome screen (new user)
  await load();
  await shot('onboarding.png');

  // 2. Main interface
  await js(`localStorage.setItem('vf_channel_profile_v1', ${JSON.stringify(JSON.stringify(SAMPLE_PROFILE))});
            localStorage.setItem('gemini_api_key', 'sample-key'); localStorage.setItem('text_provider', 'gemini');`);
  await load();
  await shot('main-interface.png');

  // 3. Generated output (fake AI reply)
  await js(`(() => {
    const reply = ${JSON.stringify(JSON.stringify(FAKE_REPLY))};
    const review = ${JSON.stringify(JSON.stringify(FAKE_REVIEW))};
    // Text requests carry a response schema; the vision review (Thumbnail Lab) does not
    window.fetch = async (_url, init) => {
      const isVision = !JSON.parse(init.body).generationConfig?.responseSchema;
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: isVision ? review : reply }] } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true })); };
    set(document.getElementById('game-name'), 'Minecraft');
    set(document.getElementById('episode-number'), '7');
  })()`);
  await wait(300);
  await js(`[...document.querySelectorAll('main button')].find((b) => /توليد البيانات|Generate Metadata/.test(b.innerText)).click()`);
  await wait(1500);
  const found = await js(`(() => {
    const target = document.querySelector('textarea[rows="4"]');
    if (!target) return false;
    target.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -90);
    return true;
  })()`);
  if (!found) throw new Error('The generated output did not appear');
  await shot('features-generator.png');

  // Picks a studio, adds platforms, generates with the fake reply and captures a taller window
  const studioShot = async (index, platforms, details, name) => {
    await js(`window.scrollTo(0, 0); document.querySelectorAll('nav[role=tablist] button')[${index}].click()`);
    await wait(400);
    await js(`(() => {
      const names = ${JSON.stringify(platforms)};
      for (const n of names) {
        const b = [...document.querySelectorAll('main button')].find((x) => x.innerText.startsWith(n));
        if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
      }
      const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true })); };
      set(document.getElementById('game-name'), 'Minecraft');
      set(document.getElementById('episode-number'), ${JSON.stringify(details)});
    })()`);
    await wait(300);
    await js(`[...document.querySelectorAll('main button')].find((b) => /توليد البيانات|Generate Metadata/.test(b.innerText)).click()`);
    await wait(1500);
    win.setContentSize(1200, 1500);
    await wait(400);
    await js('window.scrollTo(0, 0)');
    await shot(name);
    win.setContentSize(1200, 860);
    await wait(300);
  };

  // 4. Shorts studio
  await studioShot(1, ['TikTok', 'X (Twitter)'], 'فزت بآخر ثانية بضربة واحدة', 'shorts-studio.png');

  // 5. Live studio
  await studioShot(2, ['Twitch', 'Kick', 'TikTok Live'], 'تحدي النجاة حتى الفجر', 'live-studio.png');

  const openView = (re) => js(`window.scrollTo(0, 0); [...document.querySelectorAll('header button')].find((b) => ${re}.test(b.getAttribute('title') || '')).click()`);

  // 6. Thumbnail Lab: local checks + vision review, then the YouTube preview
  await openView('/مختبر|Lab/');
  await wait(400);
  await js(DRAW_THUMBNAIL);
  await wait(1500);
  await js(`(() => {
    const i = document.getElementById('lab-title');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, 'نجوت ليلة كاملة في ماينكرافت هاردكور… وهذا ما حدث! (الحلقة 7)');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    [...document.querySelectorAll('main button')].find((b) => /تقييم بالذكاء|AI review/.test(b.innerText)).click();
  })()`);
  await wait(1800);
  win.setContentSize(1200, 1900);
  await wait(400);
  await js(`[...document.querySelectorAll('main h2')].pop().scrollIntoView({ block: 'start' }); window.scrollBy(0, 330)`);
  await shot('thumbnail-lab.png');
  win.setContentSize(1200, 860);
  await wait(300);
  await js(`[...document.querySelectorAll('main h3')].find((h) => /معاينة|preview/i.test(h.innerText)).scrollIntoView({ block: 'start' }); window.scrollBy(0, -20)`);
  await shot('youtube-preview.png');

  // 7. Library: the generations made above
  await openView('/المكتبة|Library/');
  await wait(1200); // the library loads from IndexedDB
  await js(`[...document.querySelectorAll('main button')].find((b) => /إضافة للمفضلة|Add to favourites/.test(b.getAttribute('title') || '')).click()`);
  await wait(600);
  await shot('library.png');

  // 8. Settings
  await openView('/مختبر|Lab/');
  await js(`window.scrollTo(0, 0); document.querySelector('header button[aria-label*="إعدادات"], header button[aria-label*="Settings"]').click()`);
  await shot('settings.png');

  win.destroy();
}

app.whenReady()
  .then(run)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => app.quit());
