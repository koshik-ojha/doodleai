"use client";

import { ChevronDown } from "lucide-react";

const variantStyles = {
  dark: "w-full bg-[#1c1c1c] border border-gray-700/30 rounded-lg px-4 py-2.5 text-sm text-white outline-none appearance-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer",
  light: "w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none appearance-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 transition-all cursor-pointer",
};

const labelStyles = {
  dark: "text-sm text-gray-400 font-medium",
  light: "text-xs text-gray-500 font-medium",
};

export default function Select({
  label,
  options = [],
  variant = "dark",
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1.5 ${labelStyles[variant]}`}>{label}</label>
      )}
      <div className="relative">
        <select className={`${variantStyles[variant]} ${className}`} {...props}>
          {options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt} className="bg-[#1c1c1c] text-white">
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value} className="bg-[#1c1c1c] text-white">
                {opt.label}
              </option>
            )
          )}
        </select>
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            variant === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </div>
    </div>
  );
}
