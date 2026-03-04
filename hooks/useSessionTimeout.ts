import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionTimeoutOptions {
    timeoutMinutes?: number;       // Total inactivity time before logout (default: 15)
    warningMinutes?: number;       // Minutes before timeout to show warning (default: 1)
    onWarning?: () => void;        // Called when warning period starts
    onTimeout?: () => void;        // Called when session times out
    enabled?: boolean;             // Enable/disable the timeout (default: true)
}

interface UseSessionTimeoutReturn {
    isWarningVisible: boolean;
    remainingSeconds: number;
    extendSession: () => void;
    logout: () => void;
}

/**
 * Hook to manage admin session timeout with activity tracking
 * Tracks mouse, keyboard, touch, and scroll events
 */
export function useSessionTimeout({
    timeoutMinutes = 15,
    warningMinutes = 1,
    onWarning,
    onTimeout,
    enabled = true,
}: UseSessionTimeoutOptions = {}): UseSessionTimeoutReturn {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;
    const warningThreshold = timeoutMs - warningMs;

    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(timeoutMinutes * 60);

    const lastActivityRef = useRef<number>(Date.now());
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIdRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer on user activity
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setIsWarningVisible(false);
        setRemainingSeconds(timeoutMinutes * 60);
    }, [timeoutMinutes]);

    // Extend session (called from warning modal)
    const extendSession = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    // Manual logout
    const logout = useCallback(() => {
        if (onTimeout) {
            onTimeout();
        }
    }, [onTimeout]);

    // Check for timeout
    const checkTimeout = useCallback(() => {
        if (!enabled) return;

        const now = Date.now();
        const elapsed = now - lastActivityRef.current;

        if (elapsed >= timeoutMs) {
            // Session timed out
            setIsWarningVisible(false);
            if (onTimeout) {
                onTimeout();
            }
        } else if (elapsed >= warningThreshold) {
            // In warning period
            if (!isWarningVisible) {
                setIsWarningVisible(true);
                if (onWarning) {
                    onWarning();
                }
            }
            // Update countdown
            const remaining = Math.ceil((timeoutMs - elapsed) / 1000);
            setRemainingSeconds(remaining);
        } else {
            setIsWarningVisible(false);
            setRemainingSeconds(Math.ceil((timeoutMs - elapsed) / 1000));
        }
    }, [enabled, timeoutMs, warningThreshold, isWarningVisible, onWarning, onTimeout]);

    // Set up activity listeners
    useEffect(() => {
        if (!enabled) return;

        const activityEvents = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Throttle activity updates to avoid excessive resets
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttledActivity = () => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    handleActivity();
                    throttleTimeout = null;
                }, 1000); // Throttle to once per second
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, throttledActivity, { passive: true });
        });

        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, throttledActivity);
            });
            if (throttleTimeout) {
                clearTimeout(throttleTimeout);
            }
        };
    }, [enabled, resetTimer]);

    // Check for timeout periodically
    useEffect(() => {
        if (!enabled) return;

        // Check every second when warning is visible, otherwise every 10 seconds
        const interval = isWarningVisible ? 1000 : 10000;

        timeoutIdRef.current = setInterval(checkTimeout, interval);

        return () => {
            if (timeoutIdRef.current) {
                clearInterval(timeoutIdRef.current);
            }
        };
    }, [enabled, isWarningVisible, checkTimeout]);

    // Initialize remaining seconds
    useEffect(() => {
        setRemainingSeconds(timeoutMinutes * 60);
    }, [timeoutMinutes]);

    return {
        isWarningVisible,
        remainingSeconds,
        extendSession,
        logout,
    };
}

export default useSessionTimeout;
