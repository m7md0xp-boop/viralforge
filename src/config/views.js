import { PenSquare, Wand2, BookMarked, LayoutDashboard } from 'lucide-react';

// Main screens of the app, in navigation order (header on wide screens, bottom bar on phones)
export const VIEWS = [
  { id: 'create', icon: PenSquare, label: 'header.create' },
  { id: 'lab', icon: Wand2, label: 'header.lab' },
  { id: 'library', icon: BookMarked, label: 'header.library' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'header.dashboard' }
];
