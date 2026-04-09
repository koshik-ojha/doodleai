"use client";

const variantStyles = {
  dark: "w-full bg-gray-800/20 border border-gray-700/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all",
  light: "w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 resize-none transition-all",
};

const labelStyles = {
  dark: "text-sm text-gray-400 font-medium",
  light: "text-xs text-gray-500 font-medium",
};

export default function Textarea({
  label,
  variant = "dark",
  rows = 3,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1.5 ${labelStyles[variant]}`}>{label}</label>
      )}
      <textarea
        rows={rows}
        className={`${variantStyles[variant]} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
