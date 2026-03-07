// src/components/icons/Home.tsx  (or House.tsx, Building.tsx — choose a good name)
import React from "react";

interface HomeIconProps {
  size?: number | string;
  className?: string;
}

const HomeIcon: React.FC<HomeIconProps> = ({
  size = 40,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M0 2C0 0.895431 0.895431 0 2 0H38C39.1046 0 40 0.895431 40 2V38C40 39.1046 39.1046 40 38 40H2C0.895431 40 0 39.1046 0 38V2Z"
        fill="white"
        fillOpacity="0.1"
      />
      <path
        d="M22 30V26C22 25.4696 21.7893 24.9609 21.4142 24.5858C21.0391 24.2107 20.5304 24 20 24C19.4696 24 18.9609 24.2107 18.5858 24.5858C18.2107 24.9609 18 25.4696 18 26V30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 18L29.447 19.724C29.6131 19.807 29.7528 19.9346 29.8504 20.0925C29.9481 20.2504 29.9999 20.4323 30 20.618V28C30 28.5304 29.7893 29.0391 29.4142 29.4142C29.0391 29.7893 28.5304 30 28 30H12C11.4696 30 10.9609 29.7893 10.5858 29.4142C10.2107 29.0391 10 28.5304 10 28V20.618C10.0001 20.4323 10.0519 20.2504 10.1496 20.0925C10.2472 19.9346 10.3869 19.807 10.553 19.724L14 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 13V30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 14L19.106 10.447C19.3836 10.3083 19.6897 10.2361 20 10.2361C20.3103 10.2361 20.6164 10.3083 20.894 10.447L28 14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 13V30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19C21.1046 19 22 18.1046 22 17C22 15.8954 21.1046 15 20 15C18.8954 15 18 15.8954 18 17C18 18.1046 18.8954 19 20 19Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HomeIcon;
