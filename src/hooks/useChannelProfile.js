import { useState } from 'react';
import { loadChannelProfile, saveChannelProfile } from '../services/channelProfile';

// The user's channel (name, links, style). A new user sees the welcome screen until it is saved or skipped.
export function useChannelProfile() {
  const [profile, setProfile] = useState(loadChannelProfile);
  const [editorOpen, setEditorOpen] = useState(false);

  return {
    profile,
    // Welcome screen for a new user, or the editor opened from the header / template card
    dialogMode: !profile.onboarded ? 'welcome' : editorOpen ? 'edit' : null,
    openEditor: () => setEditorOpen(true),
    closeEditor: () => setEditorOpen(false),
    save: (values) => {
      setProfile(saveChannelProfile(values));
      setEditorOpen(false);
    }
  };
}
