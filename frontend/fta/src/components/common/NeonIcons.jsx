import React from 'react';

/**
 * High-fidelity Neon Soccer Ball Icon
 * Matches the glowing hexagon pattern from the reference image.
 * Color: Cyan/Blue
 */
export const NeonBall = ({ size = 42 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#00f2ff" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 4px #00f2ff)' }} />
        {/* Soccer ball pattern lines */}
        <path d="M12 7.5L9.5 9.5M12 7.5L14.5 9.5M12 7.5V4.5M9.5 9.5L10.5 13M9.5 9.5L6.5 9M14.5 9.5L13.5 13M14.5 9.5L17.5 9M10.5 13L12 15.5M10.5 13L7.5 14M13.5 13L12 15.5M13.5 13L16.5 14M12 15.5V18.5M6.5 9L4 12M17.5 9L20 12M7.5 14L4.5 16M16.5 14L19.5 16"
            stroke="#00f2ff" strokeWidth="0.8" opacity="0.8" />
        {/* Small subtle fills for depth */}
        <circle cx="12" cy="12" r="2" fill="#00f2ff" fillOpacity="0.1" />
    </svg>
);

/**
 * High-fidelity Neon Football Boot Icon
 * Elongated side profile with studs, matching the reference image.
 * Color: Purple/Magenta
 */
export const NeonBoot = ({ size = 42 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M3 16.5C3 16.5 4 10.5 8 8.5C12 6.5 18 7.5 20 10.5C21 12.5 21 15.5 19 16.5H3Z"
            stroke="#bc13fe"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 4px #bc13fe)' }}
        />
        {/* Studs */}
        <path d="M5 16.5V18M9 16.8V18.3M13 16.8V18.3M17 16.5V18" stroke="#bc13fe" strokeWidth="1.5" strokeLinecap="round" />
        {/* Laces detail */}
        <path d="M10 9L11 7.5M12 9.5L13 8" stroke="#bc13fe" strokeWidth="0.8" opacity="0.6" />
    </svg>
);

/**
 * High-fidelity Neon Medical Cross Icon
 * Thick red neon cross matching the reference image.
 * Color: Red
 */
export const NeonCross = ({ size = 42 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M8.5 4H15.5V8.5H20V15.5H15.5V20H8.5V15.5H4V8.5H8.5V4Z"
            fill="#ff3131"
            style={{ filter: 'drop-shadow(0 0 8px #ff3131)' }}
        />
        {/* Inner detail line */}
        <path d="M10 8.5H14V10M10 14H14V15.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
);
