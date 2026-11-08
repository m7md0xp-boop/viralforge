export default function ToggleSwitch({ label, note, checked, onChange }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className="min-h-[44px] flex flex-col justify-between gap-2 p-3 rounded-lg bg-[#0d0f14]/80 border border-gray-700/60 hover:border-purple-500/50 cursor-pointer transition-colors select-none focus:outline-none focus:ring-1 focus:ring-purple-500"
    >
      <div className="flex items-center justify-between gap-2.5 w-full">
        <span className="text-xs sm:text-sm font-medium text-gray-200 leading-tight">
          {label}
        </span>
        <div
          dir="ltr"
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
            checked ? 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.35)]' : 'bg-gray-700'
          }`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      {note && (
        <p className="text-xs text-gray-400 leading-relaxed">
          {note}
        </p>
      )}
    </div>
  );
}
