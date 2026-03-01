import React, { useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"
import { useTheme } from "../context/ThemeContext"

export const ToggleTheme = ({
    className,
    duration = 500,
    ...props
}) => {
    const { setTheme, theme } = useTheme()
    const containerRef = useRef(null)
    const isDark = theme === "dark"

    const handleToggle = useCallback(async () => {
        const newTheme = isDark ? "light" : "dark"
        if (!containerRef.current) return;

        if (!document.startViewTransition) {
            setTheme(newTheme)
            return
        }

        const rect = containerRef.current.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme)
            })
        })

        await transition.ready

        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [isDark, setTheme, duration])

    return (
        <div
            ref={containerRef}
            className={cn("flex items-center", className)}
            {...props}
        >
            <button
                onClick={handleToggle}
                className="premium-toggle"
                aria-label="Toggle theme"
                style={{ outline: 'none', border: 'none' }}
            >
                {/* Track Icons */}
                <div className="premium-toggle-inner-icons">
                    <Sun size={12} strokeWidth={2.5} />
                    <Moon size={12} strokeWidth={2.5} />
                </div>

                {/* Sliding Ball */}
                <motion.div
                    className="premium-toggle-ball"
                    animate={{ x: isDark ? 38 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={theme}
                            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex' }}
                        >
                            {isDark ? (
                                <Moon size={11} strokeWidth={3} fill="currentColor" />
                            ) : (
                                <Sun size={11} strokeWidth={3} fill="currentColor" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </button>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        ::view-transition-old(root),
                        ::view-transition-new(root) {
                            animation: none;
                            mix-blend-mode: normal;
                        }
                    `,
                }}
            />
        </div>
    )
}

export default ToggleTheme;
