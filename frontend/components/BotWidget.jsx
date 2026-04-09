import * as React from "react";

const SvgIcon = ({ size = 80, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 80 80"
    className={className}
    {...props}
  >
    <g clipPath="url(#clip0_1_376)">
      <path
        stroke="#8B5CF6"
        strokeWidth="1.2"
        d="M40 79c21.54 0 39-17.46 39-39S61.54 1 40 1 1 18.46 1 40s17.46 39 39 39Z"
        opacity="0.3"
      ></path>
      <path
        stroke="#8B5CF6"
        strokeWidth="0.6"
        d="M40 75c19.33 0 35-15.67 35-35S59.33 5 40 5 5 20.67 5 40s15.67 35 35 35Z"
        opacity="0.15"
      ></path>
      <path
        fill="url(#paint0_linear_1_376)"
        d="M40 72c17.673 0 32-14.327 32-32S57.673 8 40 8 8 22.327 8 40s14.327 32 32 32"
      ></path>
      <path
        fill="#fff"
        d="M40 49c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15"
        opacity="0.96"
      ></path>
      <path
        fill="#7C3AED"
        d="M34 32.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6M46 32.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6"
      ></path>
      <path
        fill="#fff"
        d="M35 29.8a1 1 0 1 0 0-2 1 1 0 0 0 0 2M47 29.8a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
        opacity="0.9"
      ></path>
      <path
        stroke="#7C3AED"
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M34 37q6 5 12 0"
      ></path>
      <path
        stroke="#DDD6FE"
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M40 19v-6"
      ></path>
      <path
        fill="#EDE9FE"
        d="M40 13.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6"
      ></path>
      <path
        fill="#A78BFA"
        d="M40 14.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8"
      ></path>
      <path
        fill="#fff"
        fillOpacity="0.45"
        d="M27 30a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0zM57 30a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0z"
      ></path>
      <path
        fill="#fff"
        fillOpacity="0.2"
        d="M50 51H30a8 8 0 1 0 0 16h20a8 8 0 1 0 0-16"
      ></path>
      <path fill="#fff" fillOpacity="0.2" d="m28 51-5 10 9-10"></path>
      <path
        fill="#fff"
        d="M31 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4"
        opacity="0.9"
      ></path>
      <path
        fill="#fff"
        d="M40 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4"
        opacity="0.6"
      ></path>
      <path
        fill="#fff"
        d="M49 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4"
        opacity="0.3"
      ></path>
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_1_376"
        x1="8"
        x2="94.4"
        y1="8"
        y2="94.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6"></stop>
        <stop offset="1" stopColor="#6D28D9"></stop>
      </linearGradient>
      <clipPath id="clip0_1_376">
        <path fill="#fff" d="M0 0h80v80H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

const BotWidget = () => (
  <div className="relative inline-flex items-center justify-center">
    {/* Outer pulse ring */}
    <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
    {/* Inner glow ring */}
    <span className="absolute inset-1 rounded-full bg-purple-500/10 animate-pulse" />
    {/* Bot icon with gentle float animation */}
    <div
      className="relative"
      style={{ animation: "botFloat 3s ease-in-out infinite" }}
    >
      <SvgIcon size={80} />
    </div>
    <style>{`
      @keyframes botFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-6px); }
      }
    `}</style>
  </div>
);

export { SvgIcon };
export default BotWidget;
