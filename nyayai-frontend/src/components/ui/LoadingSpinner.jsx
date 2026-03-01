import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 20, color = "currentColor" }) => {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="3"
                strokeOpacity="0.2"
            />
            <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.03902 16.4512"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </motion.svg>
    );
};

export default LoadingSpinner;
