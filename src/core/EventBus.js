/**
 * EventBus - Simple publish/subscribe system for decoupling components
 * Allows components to communicate without direct references
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
        this.debugMode = false;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @param {object} context - Optional context for callback
     * @returns {function} Unsubscribe function
     */
    on(event, callback, context = null) {
        if (typeof event !== 'string' || typeof callback !== 'function') {
            throw new Error('EventBus.on: event must be string, callback must be function');
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const listener = { callback, context };
        this.listeners.get(event).push(listener);

        if (this.debugMode) {
            console.log(`EventBus: Subscribed to '${event}' (${this.listeners.get(event).length} total)`);
        }

        // Return unsubscribe function
        return () => this.off(event, callback, context);
    }

    /**
     * Subscribe to an event only once
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @param {object} context - Optional context for callback
     * @returns {function} Unsubscribe function
     */
    once(event, callback, context = null) {
        const unsubscribe = this.on(event, function(...args) {
            unsubscribe(); // Remove listener after first call
            callback.apply(context || this, args);
        }, context);

        return unsubscribe;
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function to remove
     * @param {object} context - Optional context (must match subscription)
     */
    off(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            return;
        }

        const eventListeners = this.listeners.get(event);
        const index = eventListeners.findIndex(listener => 
            listener.callback === callback && listener.context === context
        );

        if (index !== -1) {
            eventListeners.splice(index, 1);
            
            if (this.debugMode) {
                console.log(`EventBus: Unsubscribed from '${event}' (${eventListeners.length} remaining)`);
            }

            // Clean up empty event arrays
            if (eventListeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Remove all listeners for an event, or all events if no event specified
     * @param {string} event - Optional event name
     */
    clear(event = null) {
        if (event) {
            if (this.listeners.has(event)) {
                const count = this.listeners.get(event).length;
                this.listeners.delete(event);
                
                if (this.debugMode) {
                    console.log(`EventBus: Cleared ${count} listeners for '${event}'`);
                }
            }
        } else {
            const totalEvents = this.listeners.size;
            this.listeners.clear();
            
            if (this.debugMode) {
                console.log(`EventBus: Cleared all listeners (${totalEvents} events)`);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} payload - Data to send to listeners
     * @returns {number} Number of listeners notified
     */
    emit(event, payload = null) {
        if (!this.listeners.has(event)) {
            if (this.debugMode) {
                console.log(`EventBus: No listeners for '${event}'`);
            }
            return 0;
        }

        const eventListeners = this.listeners.get(event);
        let notified = 0;

        if (this.debugMode) {
            console.log(`EventBus: Emitting '${event}' to ${eventListeners.length} listeners`, payload);
        }

        // Create a copy of listeners to avoid issues if listeners modify the array
        const listenersCopy = [...eventListeners];

        for (const listener of listenersCopy) {
            try {
                listener.callback.call(listener.context, payload, event);
                notified++;
            } catch (error) {
                console.error(`EventBus: Error in listener for '${event}':`, error);
                // Continue with other listeners even if one fails
            }
        }

        return notified;
    }

    /**
     * Check if there are any listeners for an event
     * @param {string} event - Event name
     * @returns {boolean} True if there are listeners
     */
    hasListeners(event) {
        return this.listeners.has(event) && this.listeners.get(event).length > 0;
    }

    /**
     * Get the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }

    /**
     * Get all event names that have listeners
     * @returns {string[]} Array of event names
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = Boolean(enabled);
        if (this.debugMode) {
            console.log('EventBus: Debug mode enabled');
        }
    }

    /**
     * Get debug information about the event bus
     * @returns {object} Debug information
     */
    getDebugInfo() {
        const info = {
            totalEvents: this.listeners.size,
            events: {}
        };

        for (const [event, listeners] of this.listeners) {
            info.events[event] = listeners.length;
        }

        return info;
    }
}

// Common event names used throughout the application
EventBus.Events = {
    // State changes
    STATE_CHANGED: 'state:changed',
    SIMULATION_RESET: 'simulation:reset',
    SIMULATION_STARTED: 'simulation:started',
    SIMULATION_PAUSED: 'simulation:paused',
    SIMULATION_STEP: 'simulation:step',
    
    // Matrix changes
    MATRIX_UPDATED: 'matrix:updated',
    MATRIX_GENERATED: 'matrix:generated',
    
    // UI events
    CONTROLS_CHANGED: 'controls:changed',
    VISUALIZATION_UPDATE: 'visualization:update',
    
    // Analysis events
    EIGENVALUES_COMPUTED: 'analysis:eigenvalues',
    HAMILTONIAN_COMPUTED: 'analysis:hamiltonian',
    CYCLES_ANALYZED: 'analysis:cycles'
};

export default EventBus;