import React from 'react';

export const NeonBoot = ({ size = 32, style }) => {
    // Neon Magenta/Purple
    const color = '#bc13fe';
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                filter: `drop-shadow(0 0 3px ${color})`,
                ...style
            }}
        >
            <path
                d="M4 14C4 10 4.5 8 7 6H11C15 6 17.5 9 18.5 12C19 13 18.5 15 17 15H4V14Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M4 15V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 15H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 15V17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 15V17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 15V17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 6L6 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 6L8 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 6L10 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};
