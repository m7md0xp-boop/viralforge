import { useCallback, useEffect, useRef, useState } from 'react';

// Web Speech API. Chrome sends the audio to Google's speech service, which the desktop app (Electron)
// cannot use, so there voice input is reported as unsupported and the microphone button is hidden.
const getRecognition = () =>
  typeof window !== 'undefined' && !window.desktop && (window.SpeechRecognition || window.webkitSpeechRecognition);

const ERROR_KEYS = {
  'not-allowed': 'voice.notAllowed',
  'service-not-allowed': 'voice.notAllowed',
  'no-speech': 'voice.noSpeech',
  'audio-capture': 'voice.audioCapture',
  network: 'voice.network'
};

// Dictation for the chat studio. `onText(text)` receives each finished phrase.
export function useVoiceInput({ lang, t, showToast, onText }) {
  const Recognition = getRecognition();
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef(null);

  useEffect(() => () => recognition.current?.abort?.(), []);

  const toggle = useCallback(() => {
    if (!Recognition) {
      showToast(t('voice.notSupported'), 'error');
      return;
    }
    if (isRecording) {
      recognition.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const rec = new Recognition();
      recognition.current = rec;
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      rec.continuous = true;
      rec.interimResults = false;
      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) text += event.results[i][0].transcript;
        }
        if (text.trim()) onText(text.trim());
      };
      rec.onerror = (e) => {
        setIsRecording(false);
        if (e?.error === 'aborted') return; // stopped by the user
        showToast(t(ERROR_KEYS[e?.error] || 'voice.notSupported'), 'error');
      };
      rec.start();
    } catch (err) {
      console.warn('Failed to start speech recognition', err);
      setIsRecording(false);
      showToast(t('voice.notSupported'), 'error');
    }
  }, [Recognition, isRecording, lang, t, showToast, onText]);

  return { supported: Boolean(Recognition), isRecording, toggle };
}
