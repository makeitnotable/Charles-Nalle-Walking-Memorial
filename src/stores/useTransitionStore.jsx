import { create } from 'zustand';

// Define the Zustand store
export const useTransitionStore = create((set, get) => ({
    isTransitioning: false,
    setIsTransitioning: (value) => set({ isTransitioning: value }),
    overlayRef: null,
    setOverlayRef: (ref) => set({ overlayRef: ref }),

    // Setup transition timeline with overlay component
    // callback: function to execute during transition (usually navigation)
    // text: optional text to display during transition (defaults to "Charles Nalle")
    play: (callback, text = null) => {
        const { setIsTransitioning, overlayRef } = get();

        if (!overlayRef || !overlayRef.animate) {
            console.warn('TransitionOverlay not ready, falling back to immediate navigation');
            if (callback) callback();
            return;
        }

        setIsTransitioning(true);

        // Trigger the overlay's internal animation with optional custom text
        // The overlay will handle: slide in -> hold -> navigate -> slide out
        overlayRef.animate(() => {
            // This callback runs during the hold phase
            if (callback) callback();

            // Reset transitioning state after the full animation completes
            // Total duration: 0.6s (slide in) + 1.0s (hold) + 0.6s (slide out) = 2.2s
            setTimeout(() => {
                setIsTransitioning(false);
            }, 2200);
        }, text);
    },

    // Function to handle route changes (optional, can be managed outside the store)
    // You might want to call window.scrollTo(0, 0) in your routing logic instead.
    handleRouteChange: () => {
        window.scrollTo(0, 0);
    }
}));

// Custom hook to use the transition state and actions
// This remains conceptually similar, but now uses the Zustand store directly.
export const useTransition = useTransitionStore;

// Example of how to use handleRouteChange if kept in the store
// This useEffect would typically live in a component that monitors location changes,
// like your main App or Router component.
/*
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTransitionStore } from './path/to/TransitionContext';

function App() {
    const location = useLocation();
    const handleRouteChange = useTransitionStore(state => state.handleRouteChange);

    useEffect(() => {
        handleRouteChange();
    }, [location, handleRouteChange]);

    // ... rest of your app component
}
*/ 