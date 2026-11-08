import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_TEMPLATE, PRESET_TEMPLATES, STORAGE_KEY } from '../config/templates';

// Removes lines that point at the developer's own channel, saved by older versions in every user's template
export const stripLegacyLinks = (text) =>
  typeof text === 'string' ? text.split('\n').filter((l) => !/youtube\.com\/@izeroxp/i.test(l)).join('\n') : text;

const loadTemplate = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? DEFAULT_TEMPLATE : stripLegacyLinks(saved);
  } catch {
    return DEFAULT_TEMPLATE;
  }
};

// The long-video description template: edit, save, and apply a preset.
export function useTemplateManager({ t, showToast }) {
  const [template, setTemplate] = useState(loadTemplate);
  const [isEditing, setIsEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const timer = useRef(null);

  const persist = useCallback((text) => {
    try {
      localStorage.setItem(STORAGE_KEY, text);
      setJustSaved(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.warn('Failed to save the template', err);
    }
  }, []);

  // Saves the cleaned template once, so the developer links removed on load do not come back
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null && stripLegacyLinks(saved) !== saved) localStorage.setItem(STORAGE_KEY, stripLegacyLinks(saved));
    } catch {
      // Storage unavailable: nothing to clean
    }
    return () => clearTimeout(timer.current);
  }, []);

  const save = () => {
    persist(template);
    setIsEditing(false);
  };

  const toggleEdit = () => (isEditing ? save() : setIsEditing(true));

  const applyPreset = (id) => {
    const preset = PRESET_TEMPLATES.find((p) => p.id === id);
    if (!preset) return;
    setTemplate(preset.text);
    persist(preset.text);
    showToast(t('template.presetLoaded'), 'success');
  };

  return { template, setTemplate, isEditing, justSaved, save, toggleEdit, applyPreset };
}
