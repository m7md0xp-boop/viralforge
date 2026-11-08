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
    window.fetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: reply }] } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
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

  // 6. Settings
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
