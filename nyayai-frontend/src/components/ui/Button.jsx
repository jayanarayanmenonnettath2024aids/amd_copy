import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A reusable Button component with a smooth loading animation.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button text or elements
 * @param {boolean} props.loading - Whether the button is in a loading state
 * @param {string} props.variant - 'primary' or 'secondary' (default: 'primary')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.type - Button type ('button', 'submit', etc.)
 * @param {Function} props.onClick - Click handler
 */
const Button = ({
    children,
    loading = false,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button',
    onClick,
    ...props
}) => {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    const combinedClassName = `${baseClass} ${className} ${loading ? 'btn-loading' : ''}`.trim();

    return (
        <button
            type={type}
            className={combinedClassName}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            <div className="btn-content">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="btn-loader-container"
                        >
                            <div className="simple-round-loader"></div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </button>
    );
};

export default Button;
