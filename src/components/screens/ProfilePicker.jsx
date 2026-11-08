import { useEffect, useState } from 'react';
import { UserPlus, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { listProfiles, createProfile, openProfile } from '../../services/profiles';
import { useI18n } from '../../i18n/useI18n';

// Shown first in the desktop app. Picking a profile opens its own isolated workspace.
export default function ProfilePicker() {
  const { t, dir, toggleLanguage } = useI18n();
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listProfiles().then(setProfiles);
  }, []);

  const open = async (id) => {
    setBusy(true);
    setError('');
    try {
      await openProfile(id);
    } catch (err) {
      setError(String(err?.message || err));
      setBusy(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      const profile = await createProfile(name);
      await openProfile(profile.id);
    } catch (err) {
      setError(String(err?.message || err));
      setBusy(false);
    }
  };

  return (
    <div dir={dir} className="font-arabic min-h-screen bg-[#07090e] text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold">{t('common.appTitle')}</h1>
            <p className="text-xs text-gray-400">{t('picker.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('header.toggleLanguage')}
            title={t('header.toggleLanguage')}
            className="min-h-[36px] min-w-[36px] px-2 rounded-lg border border-white/10 text-sm font-bold text-gray-300 hover:text-purple-300 shrink-0"
          >
            {t('header.languageButton')}
          </button>
        </div>

        {profiles.length > 0 && (
          <div className="space-y-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => open(p.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-200 disabled:opacity-50"
              >
                <span className="font-semibold truncate">{p.name}</span>
                <LogIn className="w-4 h-4 text-purple-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        <form onSubmit={create} className="space-y-2 pt-2 border-t border-white/10">
          <label htmlFor="new-profile" className="text-xs font-semibold text-gray-300">{t('picker.newUser')}</label>
          <div className="flex gap-2">
            <input
              id="new-profile"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={t('picker.newUserPlaceholder')}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="px-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:brightness-110 transition"
            >
              <UserPlus className="w-4 h-4" />
              {t('picker.create')}
            </button>
          </div>
        </form>

        {error && (
          <div role="alert" className="flex items-start gap-2 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
