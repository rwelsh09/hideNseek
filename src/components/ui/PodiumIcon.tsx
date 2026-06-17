import React from 'react';

export const Podium = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M22 20H2" />
      <path d="M8 16V20" />
      <path d="M16 16V20" />
      <path d="M4 16H20L19 7H5L4 16Z" />
      <path d="M5 7L7 3H17L19 7" />
    </svg>
  );
};
