import Config from './Config.js';
import EventBus from './EventBus.js';

/**
 * AppState - Manages the canonical application state
 * Handles state validation, persistence, and change notifications
 */
class AppState {
    constructor(eventBus = null) {
        this.eventBus = eventBus || new EventBus();
        this.initializeState();
        this._snapshots = [];
        this._maxSnapshots = 10;
    }

    /**
     * Initialize state with default values
     */
    initializeState() {
        // Simulation parameters
        this.n = Config.SIMULATION.defaultNodes;
        this.time = 0;
        this.dt = Config.ANIMATION.defaultDt;
        this.speedMultiplier = Config.ANIMATION.defaultSpeedMultiplier;

        // Population state
        this.x = [];
        this.epsilon = [];
        this.extinct = [];
        this.history = [];

        // Matrix and graph structure  
        this.a = [];
        this.nodes = [];
        this.links = [];
        this.zeroCycleDiagonal = null;

        // Simulation flags
        this.flags = {
            isSkewSymmetric: false,
            isZeroCycle: false,
            isPaused: false
        };

        // UI preferences
        this.ui = {
            connectionProbability: Config.SIMULATION.defaultConnectionProb,
            interactionRange: Config.SIMULATION.defaultInteractionRange,
            extinctionThreshold: Config.SIMULATION.defaultExtinctionThreshold
        };

        // Analysis state
        this.analysis = {
            hamiltonianInitial: null,
            eigenvalues: null,
            jacobianEigenvalues: null
        };

        // Animation state
        this.animation = {
            animationId: null,
            isRunning: false
        };
    }

    /**
     * Validate state consistency
     * @returns {object} Validation result with isValid flag and errors
     */
    validate() {
        const errors = [];

        // Basic numeric validation
        if (!Number.isInteger(this.n) || this.n < 1 || this.n > 100) {
            errors.push('n must be an integer between 1 and 100');
        }

        if (!Number.isFinite(this.time) || this.time < 0) {
            errors.push('time must be a non-negative finite number');
        }

        if (!Number.isFinite(this.dt) || this.dt <= 0) {
            errors.push('dt must be a positive finite number');
        }

        // Array length consistency
        if (this.x.length !== this.n) {
            errors.push(`x array length (${this.x.length}) must match n (${this.n})`);
        }

        if (this.epsilon.length !== this.n) {
            errors.push(`epsilon array length (${this.epsilon.length}) must match n (${this.n})`);
        }

        if (this.extinct.length !== this.n) {
            errors.push(`extinct array length (${this.extinct.length}) must match n (${this.n})`);
        }

        if (this.history.length !== this.n) {
            errors.push(`history array length (${this.history.length}) must match n (${this.n})`);
        }

        // Matrix validation
        if (this.a.length !== this.n) {
            errors.push(`matrix A row count (${this.a.length}) must match n (${this.n})`);
        } else {
            for (let i = 0; i < this.n; i++) {
                if (!Array.isArray(this.a[i]) || this.a[i].length !== this.n) {
                    errors.push(`matrix A row ${i} must be an array of length ${this.n}`);
                    break;
                }
            }
        }

        // Population state validation
        for (let i = 0; i < this.x.length; i++) {
            if (!Number.isFinite(this.x[i]) || this.x[i] < 0) {
                errors.push(`x[${i}] must be a non-negative finite number`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Update n and resize all dependent arrays
     * @param {number} newN - New number of nodes
     */
    setN(newN) {
        if (!Number.isInteger(newN) || newN < 1 || newN > 100) {
            throw new Error('n must be an integer between 1 and 100');
        }

        const oldN = this.n;
        this.n = newN;

        // Resize arrays
        this.resizeArrays();

        this.eventBus.emit(EventBus.Events.STATE_CHANGED, {
            type: 'n_changed',
            oldValue: oldN,
            newValue: newN
        });
    }

    /**
     * Resize all arrays to match current n
     */
    resizeArrays() {
        // Resize or initialize x
        if (this.x.length < this.n) {
            while (this.x.length < this.n) {
                this.x.push(Math.random() * 0.5 + 0.1);
            }
        } else {
            this.x.length = this.n;
        }

        // Resize or initialize epsilon
        if (this.epsilon.length < this.n) {
            while (this.epsilon.length < this.n) {
                this.epsilon.push((Math.random() - 0.5) * 0.5);
            }
        } else {
            this.epsilon.length = this.n;
        }

        // Resize or initialize extinct
        if (this.extinct.length < this.n) {
            while (this.extinct.length < this.n) {
                this.extinct.push(false);
            }
        } else {
            this.extinct.length = this.n;
        }

        // Resize or initialize history
        if (this.history.length < this.n) {
            while (this.history.length < this.n) {
                this.history.push([{time: this.time, value: this.x[this.history.length] || 0}]);
            }
        } else {
            this.history.length = this.n;
        }

        // Resize matrix A
        this.a.length = this.n;
        for (let i = 0; i < this.n; i++) {
            if (!this.a[i]) {
                this.a[i] = [];
            }
            this.a[i].length = this.n;
            // Fill with zeros if extending
            for (let j = 0; j < this.n; j++) {
                if (this.a[i][j] === undefined) {
                    this.a[i][j] = 0;
                }
            }
        }
    }

    /**
     * Initialize populations with random values
     */
    initializePopulations() {
        const min = Config.SIMULATION.initPopulationMin;
        const max = Config.SIMULATION.initPopulationMax;
        
        for (let i = 0; i < this.n; i++) {
            this.x[i] = Math.random() * (max - min) + min;
            this.extinct[i] = false;
        }

        this.resetHistory();
        
        this.eventBus.emit(EventBus.Events.STATE_CHANGED, {
            type: 'populations_initialized'
        });
    }

    /**
     * Initialize epsilon values with random values
     */
    initializeEpsilon() {
        const range = Config.SIMULATION.initEpsilonRange;
        
        for (let i = 0; i < this.n; i++) {
            this.epsilon[i] = (Math.random() - 0.5) * range;
        }

        this.eventBus.emit(EventBus.Events.STATE_CHANGED, {
            type: 'epsilon_initialized'
        });
    }

    /**
     * Reset history arrays
     */
    resetHistory() {
        this.time = 0;
        for (let i = 0; i < this.n; i++) {
            this.history[i] = [{time: 0, value: this.x[i]}];
        }
    }

    /**
     * Add current state to history
     */
    recordHistory() {
        for (let i = 0; i < this.n; i++) {
            this.history[i].push({time: this.time, value: this.x[i]});
            
            // Keep history size manageable
            if (this.history[i].length > Config.ANIMATION.maxHistoryPoints) {
                this.history[i].shift();
            }
        }
    }

    /**
     * Create a snapshot of current state
     * @param {string} name - Optional name for the snapshot
     * @returns {object} Snapshot object
     */
    createSnapshot(name = null) {
        const snapshot = {
            timestamp: Date.now(),
            name: name || `Snapshot ${this._snapshots.length + 1}`,
            state: {
                n: this.n,
                time: this.time,
                dt: this.dt,
                speedMultiplier: this.speedMultiplier,
                x: [...this.x],
                epsilon: [...this.epsilon],
                extinct: [...this.extinct],
                history: this.history.map(h => [...h]),
                a: this.a.map(row => [...row]),
                nodes: this.nodes.map(node => ({...node})),
                links: this.links.map(link => ({...link})),
                zeroCycleDiagonal: this.zeroCycleDiagonal ? [...this.zeroCycleDiagonal] : null,
                flags: {...this.flags},
                ui: {...this.ui},
                analysis: {...this.analysis}
            }
        };

        this._snapshots.push(snapshot);

        // Keep only the most recent snapshots
        if (this._snapshots.length > this._maxSnapshots) {
            this._snapshots.shift();
        }

        return snapshot;
    }

    /**
     * Restore state from a snapshot
     * @param {object} snapshot - Snapshot object to restore
     */
    restoreSnapshot(snapshot) {
        if (!snapshot || !snapshot.state) {
            throw new Error('Invalid snapshot');
        }

        const state = snapshot.state;
        
        // Restore all state properties
        this.n = state.n;
        this.time = state.time;
        this.dt = state.dt;
        this.speedMultiplier = state.speedMultiplier;
        this.x = [...state.x];
        this.epsilon = [...state.epsilon];
        this.extinct = [...state.extinct];
        this.history = state.history.map(h => [...h]);
        this.a = state.a.map(row => [...row]);
        this.nodes = state.nodes.map(node => ({...node}));
        this.links = state.links.map(link => ({...link}));
        this.zeroCycleDiagonal = state.zeroCycleDiagonal ? [...state.zeroCycleDiagonal] : null;
        this.flags = {...state.flags};
        this.ui = {...state.ui};
        this.analysis = {...state.analysis};

        // Validate restored state
        const validation = this.validate();
        if (!validation.isValid) {
            console.warn('Restored state validation failed:', validation.errors);
        }

        this.eventBus.emit(EventBus.Events.STATE_CHANGED, {
            type: 'snapshot_restored',
            snapshot: snapshot.name
        });
    }

    /**
     * Get list of available snapshots
     * @returns {Array} Array of snapshot metadata
     */
    getSnapshots() {
        return this._snapshots.map(s => ({
            timestamp: s.timestamp,
            name: s.name
        }));
    }

    /**
     * Clear all snapshots
     */
    clearSnapshots() {
        this._snapshots = [];
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.animation.isRunning = false;
        if (this.animation.animationId) {
            cancelAnimationFrame(this.animation.animationId);
            this.animation.animationId = null;
        }

        this.initializeState();
        
        this.eventBus.emit(EventBus.Events.SIMULATION_RESET);
    }

    /**
     * Get current state as a plain object (for debugging/serialization)
     * @returns {object} Current state
     */
    toObject() {
        return {
            n: this.n,
            time: this.time,
            dt: this.dt,
            speedMultiplier: this.speedMultiplier,
            x: [...this.x],
            epsilon: [...this.epsilon],
            extinct: [...this.extinct],
            historyLength: this.history.map(h => h.length),
            matrixA: this.a.map(row => [...row]),
            nodeCount: this.nodes.length,
            linkCount: this.links.length,
            flags: {...this.flags},
            ui: {...this.ui},
            analysis: {...this.analysis},
            validation: this.validate()
        };
    }
}

export default AppState;