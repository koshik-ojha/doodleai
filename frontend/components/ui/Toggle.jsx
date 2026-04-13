"use client";

export default function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700/20 rounded-lg">
      {(label || description) && (
        <div>
          {label && <p className="text-gray-900 dark:text-white font-medium text-sm">{label}</p>}
          {description && <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{description}</p>}
        </div>
      )}
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
      </label>
    </div>
  );
}

