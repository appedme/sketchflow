// Performance optimization utilities
export const PERFORMANCE_CONFIG = {
    // Cache TTL in milliseconds
    CACHE_TTL: {
        FILE_DATA: 5 * 60 * 1000, // 5 minutes
        PROJECT_DATA: 10 * 60 * 1000, // 10 minutes
        USER_DATA: 15 * 60 * 1000, // 15 minutes
    },
    
    // Debounce delays
    DEBOUNCE: {
        AUTO_SAVE: 2000, // 2 seconds
        SEARCH: 300, // 300ms
        RESIZE: 100, // 100ms
    },
    
    // Bundle splitting
    LAZY_LOAD_THRESHOLD: 1000, // 1 second
    
    // Memory management
    MAX_CACHE_SIZE: 50, // Maximum cached items
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Performance monitoring
export const trackPerformance = (name: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
        const start = performance.now();
        fn();
        const end = performance.now();
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    } else {
        fn();
    }
};

// Memory cleanup utility
export const cleanupMemory = () => {
    if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
    }
};
