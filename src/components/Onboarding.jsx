import { useState } from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { CHANNEL_STYLES, normalizeUrl } from '../services/channelProfile';

const T = {
  ar: {
    welcomeTitle: 'أهلاً بك في ViralForge',
    welcomeText: 'عرّفنا على قناتك مرة واحدة. نستخدم هذه البيانات لتعبئة روابطك في الأوصاف تلقائياً، وتبقى محفوظة على جهازك فقط.',
    editTitle: 'بيانات قناتي',
    editText: 'تُستخدم هذه البيانات لتعبئة متغيرات القالب مثل {channel_link} و {discord_link}.',
    channelName: 'اسم القناة',
    channelNamePh: 'مثال: قناة الألعاب',
    channelUrl: 'رابط القناة',
    linktreeUrl: 'رابط حساباتك (Linktree أو غيره)',
    discordUrl: 'رابط سيرفر الديسكورد',
    optional: 'اختياري',
    style: 'أسلوب الكتابة',
    invalidUrl: 'الرابط غير صالح. استخدم رابطاً يبدأ بـ https://',
    nameRequired: 'اكتب اسم القناة.',
    start: 'ابدأ',
    save: 'حفظ',
    skip: 'تخطّي الآن',
    close: 'إغلاق'
  },
  en: {
    welcomeTitle: 'Welcome to ViralForge',
    welcomeText: 'Tell us about your channel once. We use it to fill your links into descriptions, and it stays on this device only.',
    editTitle: 'My channel',
    editText: 'These values fill template placeholders such as {channel_link} and {discord_link}.',
    channelName: 'Channel name',
    channelNamePh: 'e.g. My Gaming Channel',
    channelUrl: 'Channel link',
    linktreeUrl: 'All your links (Linktree or similar)',
    discordUrl: 'Discord server link',
    optional: 'optional',
    style: 'Writing style',
    invalidUrl: 'This link is not valid. Use a link that starts with https://',
    nameRequired: 'Enter your channel name.',
    start: 'Get started',
    save: 'Save',
    skip: 'Skip for now',
    close: 'Close'
  }
};

const URL_FIELDS = [
  { key: 'channelUrl', placeholder: 'https://www.youtube.com/@yourchannel' },
  { key: 'linktreeUrl', placeholder: 'https://linktr.ee/yourname' },
  { key: 'discordUrl', placeholder: 'https://discord.gg/invite' }
];

const inputClass =
  'w-full min-h-[44px] px-3 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500';

// Welcome screen (mode "welcome") for a new user, and the same form to edit the channel later (mode "edit").
// `onSave(profile)` receives the raw values; the caller sanitizes and stores them.
export default function Onboarding({ lang, mode = 'welcome', initial, onSave, onClose }) {
  const isAr = lang === 'ar';
  const tx = T[isAr ? 'ar' : 'en'];
  const [form, setForm] = useState(() => ({
    channelName: initial?.channelName || '',
    channelUrl: initial?.channelUrl || '',
    linktreeUrl: initial?.linktreeUrl || '',
    discordUrl: initial?.discordUrl || '',
    style: initial?.style || 'energetic'
  }));
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.channelName.trim()) next.channelName = tx.nameRequired;
    for (const { key } of URL_FIELDS) {
      if (form[key].trim() && !normalizeUrl(form[key])) next[key] = tx.invalidUrl;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...form, onboarded: true });
  };

  const isWelcome = mode === 'welcome';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <form
        onSubmit={submit}
        noValidate
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#151922] border border-gray-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-lg font-bold text-gray-100">
                {isWelcome ? tx.welcomeTitle : tx.editTitle}
              </h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{isWelcome ? tx.welcomeText : tx.editText}</p>
            </div>
          </div>
          {!isWelcome && (
            <button
              type="button"
              onClick={onClose}
              aria-label={tx.close}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ob-channelName" className="text-sm font-medium text-gray-300">
            {tx.channelName}
          </label>
          <input
            id="ob-channelName"
            value={form.channelName}
            onChange={set('channelName')}
            maxLength={80}
            placeholder={tx.channelNamePh}
            className={inputClass}
            autoFocus
          />
          {errors.channelName && <p className="text-xs text-red-400">{errors.channelName}</p>}
        </div>

        {URL_FIELDS.map(({ key, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label htmlFor={`ob-${key}`} className="text-sm font-medium text-gray-300">
              {tx[key]} <span className="text-xs text-gray-500">({tx.optional})</span>
            </label>
            <input
              id={`ob-${key}`}
              type="url"
              dir="ltr"
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className={inputClass}
              autoComplete="off"
            />
            {errors[key] && <p className="text-xs text-red-400">{errors[key]}</p>}
          </div>
        ))}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-300 mb-2">{tx.style}</legend>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CHANNEL_STYLES).map(([id, s]) => {
              const active = form.style === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setForm((f) => ({ ...f, style: id }))}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-sm border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  {active && <Check className="w-4 h-4" />}
                  {s.label[isAr ? 'ar' : 'en']}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          {isWelcome && (
            <button
              type="button"
              onClick={() => onSave({ ...form, onboarded: true })}
              className="min-h-[44px] flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              {tx.skip}
            </button>
          )}
          <button
            type="submit"
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 cursor-pointer"
          >
            {isWelcome ? tx.start : tx.save}
          </button>
        </div>
      </form>
    </div>
  );
}
