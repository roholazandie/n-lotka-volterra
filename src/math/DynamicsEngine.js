import Config from '../core/Config.js';

/**
 * DynamicsEngine - Implements Lotka-Volterra dynamics and related computations
 * Handles time stepping, equilibrium calculations, and Hamiltonian analysis
 */
class DynamicsEngine {
    /**
     * Compute derivatives for Lotka-Volterra system
     * dx_i/dt = x_i * (ε_i + Σ_j A_ij * x_j)
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} epsilon - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {Array<number>} Time derivatives
     */
    static computeDerivatives(x, epsilon, A) {
        const n = x.length;
        const dxdt = Array(n).fill(0);
        
        for (let i = 0; i < n; i++) {
            let sum = epsilon[i];
            for (let k = 0; k < n; k++) {
                sum += A[i][k] * x[k];
            }
            dxdt[i] = x[i] * sum;
        }
        
        return dxdt;
    }

    /**
     * Perform one integration step using Euler method
     * @param {object} state - Current state object
     * @returns {number} Maximum change in populations
     */
    static step(state) {
        const threshold = state.ui.extinctionThreshold;
        const dxdt = DynamicsEngine.computeDerivatives(state.x, state.epsilon, state.a);
        let maxChange = 0;

        const effectiveDt = state.dt * state.speedMultiplier;

        for (let i = 0; i < state.n; i++) {
            if (!state.extinct[i]) {
                // Update population
                state.x[i] += dxdt[i] * effectiveDt;
                
                // Enforce positive populations
                if (state.x[i] < 0.0001) {
                    state.x[i] = 0.0001;
                }
                
                // Prevent explosion
                if (state.x[i] > 1000) {
                    state.x[i] = 1000;
                }

                // Check for extinction
                if (state.x[i] < threshold) {
                    state.extinct[i] = true;
                    state.x[i] = 0;
                }

                maxChange = Math.max(maxChange, Math.abs(dxdt[i]));
            }
        }

        // Update time
        state.time += effectiveDt;

        // Record history at regular intervals
        if (Math.floor(state.time * 10) > Math.floor((state.time - effectiveDt) * 10)) {
            for (let i = 0; i < state.n; i++) {
                state.history[i].push({time: state.time, value: state.x[i]});
                
                // Keep history manageable
                if (state.history[i].length > Config.ANIMATION.maxHistoryPoints) {
                    state.history[i].shift();
                }
            }
        }

        return maxChange;
    }

    /**
     * Set up oscillation equilibrium conditions
     * Choose x* > 0 and set ε = -A * x*
     * @param {Array<Array<number>>} A - Interaction matrix (should be skew-symmetric)
     * @param {Array<number>} xStar - Optional equilibrium point
     * @returns {object} {xStar, eps} equilibrium data
     */
    static setOscillationEquilibrium(A, xStar = null) {
        const n = A.length;
        
        // Choose a positive equilibrium if not provided
        if (!xStar) {
            const min = Config.SIMULATION.oscillationEquilibriumMin;
            const max = Config.SIMULATION.oscillationEquilibriumMax;
            xStar = Array.from({length: n}, () => Math.random() * (max - min) + min);
        }
        
        // Ensure all components are positive
        for (let i = 0; i < n; i++) {
            if (xStar[i] <= 0) {
                xStar[i] = Config.SIMULATION.oscillationEquilibriumMin;
            }
        }

        // Compute ε = -A * x*
        const eps = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let s = 0;
            for (let j = 0; j < n; j++) {
                s += A[i][j] * xStar[j];
            }
            eps[i] = -s;
        }

        return { xStar, eps };
    }

    /**
     * Initialize populations near equilibrium with small perturbations
     * @param {Array<number>} xStar - Equilibrium point
     * @param {number} perturbation - Perturbation magnitude
     * @returns {Array<number>} Perturbed initial conditions
     */
    static perturbEquilibrium(xStar, perturbation = Config.SIMULATION.oscillationPerturbation) {
        return xStar.map(x => x * (1 + perturbation * (Math.random() - 0.5)));
    }

    /**
     * Compute Hamiltonian for Lotka-Volterra system
     * H(x) = Σ_i ε_i * ln(x_i) + (1/2) * x^T * A * x
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {number} Hamiltonian value
     */
    static hamiltonian(x, eps, A) {
        const n = x.length;
        let H = 0;

        // Linear part: Σ ε_i * ln(x_i)
        for (let i = 0; i < n; i++) {
            H += eps[i] * Math.log(Math.max(x[i], Config.TOLERANCES.hamiltonianPrecision));
        }

        // Quadratic part: (1/2) * x^T * A * x
        let quad = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                quad += 0.5 * A[i][j] * x[i] * x[j];
            }
        }

        return H + quad;
    }

    /**
     * Compute current Jacobian matrix for linearization
     * J(x) = diag(x) * A + diag(ε + A*x) * I
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {Array<Array<number>>} Jacobian matrix
     */
    static currentJacobian(x, eps, A) {
        const n = A.length;
        
        // Compute A * x
        const Ax = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let s = 0;
            for (let j = 0; j < n; j++) {
                s += A[i][j] * x[j];
            }
            Ax[i] = s;
        }

        // Build Jacobian: J = diag(x) * A + diag(ε + A*x) * I
        const J = Array.from({length: n}, () => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                J[i][j] = x[i] * A[i][j]; // diag(x) * A term
            }
            J[i][i] += (eps[i] + Ax[i]); // diag(ε + A*x) term on diagonal
        }

        return J;
    }

    /**
     * Check if current state is near equilibrium
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @param {number} tolerance - Equilibrium tolerance
     * @returns {boolean} True if near equilibrium
     */
    static isNearEquilibrium(x, eps, A, tolerance = Config.ANIMATION.convergenceThreshold) {
        const dxdt = DynamicsEngine.computeDerivatives(x, eps, A);
        const maxDerivative = Math.max(...dxdt.map(Math.abs));
        return maxDerivative < tolerance;
    }

    /**
     * Find fixed points using Newton's method (simple implementation)
     * @param {Array<number>} initialGuess - Starting point
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @param {object} options - Solver options
     * @returns {object} {x, converged, iterations} solution data
     */
    static findFixedPoint(initialGuess, eps, A, options = {}) {
        const {
            maxIterations = 50,
            tolerance = 1e-8,
            stepSize = 0.1
        } = options;

        let x = [...initialGuess];
        let converged = false;
        let iterations = 0;

        for (let iter = 0; iter < maxIterations; iter++) {
            const dxdt = DynamicsEngine.computeDerivatives(x, eps, A);
            const maxError = Math.max(...dxdt.map(Math.abs));

            if (maxError < tolerance) {
                converged = true;
                break;
            }

            // Simple gradient descent step
            for (let i = 0; i < x.length; i++) {
                x[i] -= stepSize * dxdt[i];
                x[i] = Math.max(x[i], 1e-6); // Keep positive
            }

            iterations++;
        }

        return {
            x,
            converged,
            iterations,
            residual: converged ? DynamicsEngine.computeDerivatives(x, eps, A) : null
        };
    }

    /**
     * Analyze stability at a fixed point
     * @param {Array<number>} x - Fixed point
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {object} Stability analysis
     */
    static analyzeStability(x, eps, A) {
        const J = DynamicsEngine.currentJacobian(x, eps, A);
        
        // This would use eigenvalue computation in practice
        // For now, return basic stability metrics
        
        const diagonal = J.map((row, i) => row[i]);
        const maxDiagonal = Math.max(...diagonal);
        const minDiagonal = Math.min(...diagonal);
        
        return {
            jacobian: J,
            diagonalElements: diagonal,
            maxDiagonal,
            minDiagonal,
            // Rough stability indication based on diagonal dominance
            likelyStable: maxDiagonal < 0,
            likelyUnstable: minDiagonal > 0
        };
    }

    /**
     * Validate system parameters
     * @param {Array<number>} x - Populations
     * @param {Array<number>} eps - Linear terms  
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {object} Validation result
     */
    static validateSystem(x, eps, A) {
        const errors = [];
        const warnings = [];

        // Check dimensions
        const n = x.length;
        if (eps.length !== n) {
            errors.push('Dimension mismatch: epsilon and x arrays');
        }
        if (A.length !== n || A.some(row => row.length !== n)) {
            errors.push('Dimension mismatch: matrix A and x array');
        }

        // Check for negative populations
        if (x.some(val => val < 0)) {
            warnings.push('Negative population values detected');
        }

        // Check for very large values
        if (x.some(val => val > 1000)) {
            warnings.push('Very large population values detected');
        }

        // Check matrix properties
        const maxElement = Math.max(...A.flat().map(Math.abs));
        if (maxElement > 100) {
            warnings.push('Very large matrix elements detected');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            systemSize: n,
            populationRange: [Math.min(...x), Math.max(...x)],
            epsilonRange: [Math.min(...eps), Math.max(...eps)],
            matrixRange: [Math.min(...A.flat()), Math.max(...A.flat())]
        };
    }
}

export default DynamicsEngine;