import { create } from 'zustand';
import { useLocation } from 'react-router';
import gsap from 'gsap';

// Define the Zustand store
export const useTransitionStore = create((set, get) => ({
    isTransitioning: false,
    setIsTransitioning: (value) => set({ isTransitioning: value }),

    // Setup transition timeline
    play: (callback) => {
        const { setIsTransitioning } = get();
        setIsTransitioning(true);

        // Fade out
        gsap.to('#page-content', {
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            onComplete: () => {
                if (callback) callback();

                // Fade in (delayed slightly)
                gsap.to('#page-content', {
                    opacity: 1,
                    duration: 0.7,
                    delay: 0.1,
                    ease: 'power3.in',
                    onComplete: () => {
                        setIsTransitioning(false);
                    }
                });
            }
        });
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