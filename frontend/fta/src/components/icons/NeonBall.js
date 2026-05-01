import React from 'react';

export const NeonBall = ({ size = 32, style }) => {
    // Neon Cyan
    const color = '#00f2ff';
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                // Subtle glow, not "too much"
                filter: `drop-shadow(0 0 3px ${color})`,
                ...style
            }}
        >
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
            <path
                d="M12 15.5L8.5 13V9L12 6.5L15.5 9V13L12 15.5Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M8.5 9L5.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15.5 9L18.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15.5 13L18.5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 13L5.5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 6.5V3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 15.5V18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};
