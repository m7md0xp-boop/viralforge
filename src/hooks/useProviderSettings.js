import { useState } from 'react';
import { findAnyProvider, getImageProvider, getProvider } from '../config/aiProviders';
import { getActiveProviderId, setActiveProviderId } from '../services/ai';
import { getActiveImageProviderId, setActiveImageProviderId } from '../services/imageGeneration';
import { hasDesktopSecrets, revealSecret, setSecret } from '../services/secrets';

// One provider field in the Settings dialog: the chosen provider, its key and the show/hide toggle
function useProviderField(getById) {
  const [providerId, setProviderId] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [show, setShow] = useState(false);

  // Loads the saved key for the chosen provider into the field, so it stays visible
  const load = async (id) => {
    setProviderId(id);
    setKeyValue(await revealSecret(getById(id).keyName));
    setShow(false);
  };

  return { providerId, keyValue, show, setKeyValue, setShow, load, provider: () => getById(providerId) };
}

// The Settings dialog: text and image providers with their API keys.
export function useProviderSettings({ t, showToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const text = useProviderField(getProvider);
  const image = useProviderField(getImageProvider);

  const open = async () => {
    await Promise.all([text.load(getActiveProviderId()), image.load(getActiveImageProviderId())]);
    setIsOpen(true);
  };

  const saveFailed = (err) => showToast(`${t('settings.keySaveFailed')} ${String(err?.message || err)}`, 'error');

  const save = async () => {
    const textProvider = text.provider();
    const imageProvider = image.provider();
    try {
      // Desktop: an empty field keeps the saved key (use Clear to remove it). Browser: empty clears it.
      const value = text.keyValue.trim();
      if (value || !hasDesktopSecrets()) await setSecret(textProvider.keyName, value);
      // Gemini text and Gemini image share one key: it is saved once, from the text field
      if (imageProvider.keyName !== textProvider.keyName) {
        const imageValue = image.keyValue.trim();
        if (imageValue || !hasDesktopSecrets()) await setSecret(imageProvider.keyName, imageValue);
      }
    } catch (err) {
      // The desktop app refuses to store a key it cannot encrypt: the dialog stays open so nothing is lost
      saveFailed(err);
      return;
    }
    setActiveProviderId(text.providerId);
    setActiveImageProviderId(image.providerId);
    showToast(t('settings.keysSaved'), 'success');
    setIsOpen(false);
  };

  const clearKey = async (providerId) => {
    const keyName = findAnyProvider(providerId).keyName;
    try {
      await setSecret(keyName, '');
    } catch (err) {
      saveFailed(err);
      return;
    }
    // A shared key (Gemini) is cleared in both fields
    if (text.provider().keyName === keyName) text.setKeyValue('');
    if (image.provider().keyName === keyName) image.setKeyValue('');
    showToast(t('settings.keyCleared'), 'success');
  };

  return { isOpen, open, close: () => setIsOpen(false), text, image, save, clearKey };
}
