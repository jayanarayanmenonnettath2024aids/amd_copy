"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TabsContext = React.createContext({
    value: "",
    onValueChange: () => { },
    updateIndicator: () => { },
    indicatorStyle: {},
    registerTabTrigger: () => { },
    registerTabsList: () => { },
});

const Tabs = React.forwardRef(
    ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue || "");
        const [indicatorStyle, setIndicatorStyle] = React.useState({});
        const tabsListRef = React.useRef(null);
        const tabTriggerRefs = React.useRef(new Map());

        const controlled = value !== undefined;
        const currentValue = controlled ? value : internalValue;

        const registerTabsList = React.useCallback((element) => {
            tabsListRef.current = element;
        }, []);

        const registerTabTrigger = React.useCallback((value, element) => {
            if (element) {
                tabTriggerRefs.current.set(value, element);
            } else {
                tabTriggerRefs.current.delete(value);
            }
        }, []);

        const updateIndicator = React.useCallback(() => {
            if (tabsListRef.current && currentValue) {
                const activeTab = tabTriggerRefs.current.get(currentValue);
                if (activeTab) {
                    const tabRect = activeTab.getBoundingClientRect();
                    const listRect = tabsListRef.current.getBoundingClientRect();
                    setIndicatorStyle({
                        left: `${tabRect.left - listRect.left}px`,
                        width: `${tabRect.width}px`,
                        height: `${tabRect.height}px`,
                        top: `${tabRect.top - listRect.top}px`,
                    });
                }
            }
        }, [currentValue]);

        React.useEffect(() => {
            updateIndicator();
            window.addEventListener("resize", updateIndicator);
            return () => window.removeEventListener("resize", updateIndicator);
        }, [updateIndicator]);

        const handleValueChange = React.useCallback(
            (newValue) => {
                if (!controlled) setInternalValue(newValue);
                onValueChange?.(newValue);
            },
            [controlled, onValueChange]
        );

        return (
            <TabsContext.Provider
                value={{
                    value: currentValue,
                    onValueChange: handleValueChange,
                    updateIndicator,
                    indicatorStyle,
                    registerTabTrigger,
                    registerTabsList,
                }}
            >
                <div ref={ref} className={cn("w-full", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        );
    }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(
    ({ className, ...props }, ref) => {
        const { indicatorStyle, registerTabsList } = React.useContext(TabsContext);

        return (
            <div
                ref={(el) => {
                    if (typeof ref === "function") ref(el);
                    else if (ref) ref.current = el;
                    registerTabsList(el);
                }}
                className={cn(
                    "relative inline-flex h-9 items-center justify-center rounded-full bg-muted p-1 text-primary",
                    className
                )}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(8px)',
                }}
                {...props}
            >
                <motion.div
                    layout
                    className="tabs-bg-indicator absolute rounded-full bg-gradient-tabs"
                    style={{
                        ...indicatorStyle,
                        position: "absolute",
                        borderRadius: "9999px",
                        zIndex: 0,
                        background: 'var(--primary)',
                        boxShadow: '0 4px 12px var(--primary-glow)',
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                {props.children}
            </div>
        );
    }
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, registerTabTrigger, updateIndicator } =
        React.useContext(TabsContext);
    const isActive = selectedValue === value;
    const triggerRef = React.useRef(null);

    React.useEffect(() => {
        registerTabTrigger(value, triggerRef.current);
        return () => registerTabTrigger(value, null);
    }, [value, registerTabTrigger]);

    React.useEffect(() => {
        if (isActive) updateIndicator();
    }, [isActive, updateIndicator]);

    return (
        <button
            ref={(el) => {
                if (typeof ref === "function") ref(el);
                else if (ref) ref.current = el;
                triggerRef.current = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
            data-value={value}
            className={cn(
                `relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full
         px-4 py-1.5 text-sm font-bold transition-colors duration-300
         focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50`,
                isActive ? "text-white" : "text-muted hover:text-primary/80",
                className
            )}
            onClick={() => onValueChange(value)}
            {...props}
        />
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(
    ({ className, value, ...props }, ref) => {
        const { value: selectedValue, updateIndicator } = React.useContext(TabsContext);
        const isActive = selectedValue === value;
        const contentRef = React.useRef(null);

        React.useEffect(() => {
            if (!isActive || !contentRef.current) return;

            const observer = new ResizeObserver(() => {
                updateIndicator();
            });

            observer.observe(contentRef.current);

            return () => observer.disconnect();
        }, [isActive, updateIndicator]);

        return (
            <AnimatePresence mode="wait">
                {isActive && (
                    <div
                        key={value}
                        ref={(el) => {
                            contentRef.current = el;
                            if (typeof ref === "function") ref(el);
                            else if (ref) ref.current = el;
                        }}
                        role="tabpanel"
                        data-state="active"
                        data-value={value}
                        className={cn(
                            "mt-2 ring-offset-background focus-visible:outline-none mx-auto w-full",
                            className
                        )}
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                        {...props}
                    />
                )}
            </AnimatePresence>
        );
    }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
