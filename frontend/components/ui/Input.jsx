"use client";

import { forwardRef, useState } from "react";

const variantStyles = {
  dark: {
    base: "w-full bg-gray-100 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-700/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all",
    focus: "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
    size: "px-4 py-2.5 text-sm",
    label: "text-gray-700 dark:text-gray-400 font-medium text-sm",
  },
  light: {
    base: "w-full bg-gray-100 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-700/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all",
    focus: "focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30",
    size: "px-3 py-1.5 text-xs",
    label: "text-gray-600 dark:text-gray-400 font-medium text-xs",
  },
  auth: {
    base: "w-full bg-gray-100 dark:bg-zinc-800/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none transition-all duration-200",
    focus: "",
    size: "px-4 py-3 pl-11 text-sm",
    label: "text-gray-700 dark:text-zinc-400 font-medium text-sm",
  },
};

const focusColorMap = {
  violet: { border: "border-violet-500", shadow: "shadow-violet-500/25" },
  blue: { border: "border-blue-500", shadow: "shadow-blue-500/25" },
  purple: { border: "border-purple-500", shadow: "shadow-purple-500/25" },
};

const Input = forwardRef(function Input(
  {
    label,
    error,
    variant = "dark",
    icon: Icon,
    rightElement,
    focusColor = "blue",
    className = "",
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const v = variantStyles[variant];
  const fc = focusColorMap[focusColor];

  const authBorder = variant === "auth"
    ? focused
      ? `${fc.border} shadow-lg ${fc.shadow}`
      : "border-gray-300 dark:border-zinc-700/50"
    : "";

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1.5 ${v.label}`}>{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <Icon size={variant === "light" ? 14 : 16} />
          </div>
        )}
        <input
          ref={ref}
          className={[
            v.base,
            variant !== "auth" ? v.focus : "",
            v.size,
            authBorder,
            Icon ? (variant === "light" ? "pl-8" : "pl-10") : "",
            rightElement ? "pr-10" : "",
            className,
          ].filter(Boolean).join(" ")}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

export default Input;

