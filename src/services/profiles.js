// Per-user workspaces (desktop app only). Each profile has its own storage and its own encrypted keys.
// In the browser build there is a single workspace and these calls do nothing.
const api = () => (typeof window !== 'undefined' && window.desktop && window.desktop.profiles) || null;

export const hasProfiles = () => Boolean(api());

export async function listProfiles() {
  const a = api();
  if (!a) return [];
  try {
    return (await a.list()) || [];
  } catch (err) {
    console.warn('Failed to list profiles', err);
    return [];
  }
}

export async function getCurrentProfile() {
  const a = api();
  if (!a) return null;
  try {
    return (await a.current()) || null;
  } catch {
    return null;
  }
}

export async function createProfile(name) {
  return api().create(name);
}

export async function openProfile(id) {
  return api().open(id);
}

export async function openProfilePicker() {
  const a = api();
  if (a) await a.openPicker();
}
