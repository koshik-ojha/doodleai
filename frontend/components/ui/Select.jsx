"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const variantStyles = {
  dark: {
    trigger:
      "w-full bg-[#1c1c1c] border border-gray-700/30 rounded-lg px-4 py-2.5 text-sm text-white flex items-center justify-between cursor-pointer focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
    dropdown:
      "absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-lg overflow-hidden",
    option:
      "px-4 py-2 text-sm text-white hover:bg-violet-500/20 cursor-pointer",
  },
  light: {
    trigger:
      "w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 flex items-center justify-between cursor-pointer",
    dropdown:
      "absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",
    option:
      "px-3 py-2 text-xs text-gray-800 hover:bg-violet-100 cursor-pointer",
  },
};

const labelStyles = {
  dark: "text-sm text-gray-400 font-medium",
  light: "text-xs text-gray-500 font-medium",
};

export default function CustomSelect({
  label,
  options = [],
  variant = "dark",
  value,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const styles = variantStyles[variant];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    const selectedValue = typeof opt === "string" ? opt : opt.value;
    onChange?.({ target: { value: selectedValue } });
    setOpen(false);
  };

  const selectedLabel = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className={`block mb-1.5 ${labelStyles[variant]}`}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <div
          className={`${styles.trigger} ${className}`}
          onClick={() => setOpen(!open)}
        >
          <span>
            {selectedLabel
              ? typeof selectedLabel === "string"
                ? selectedLabel
                : selectedLabel.label
              : "Select option"}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              open ? "rotate-180" : ""
            } ${variant === "dark" ? "text-gray-400" : "text-gray-500"}`}
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className={styles.dropdown}>
            {options.map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value;
              const label = typeof opt === "string" ? opt : opt.label;

              return (
                <div
                  key={val}
                  className={styles.option}
                  onClick={() => handleSelect(opt)}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}