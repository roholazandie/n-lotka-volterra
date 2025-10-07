import Config from '../core/Config.js';

/**
 * JacobianAndEigen - Handles eigenvalue computation and Jacobian analysis
 * Wraps numeric.js and provides analysis utilities for LV systems
 */
class JacobianAndEigen {
    /**
     * Compute eigenvalues using numeric.js
     * @param {Array<Array<number>>} matrix - Matrix to analyze
     * @returns {object} Eigenvalue data with real/imaginary parts
     */
    static computeEigenvalues(matrix) {
        try {
            if (!matrix || matrix.length === 0) {
                throw new Error('Matrix not initialized');
            }

            // Use numeric.js eigenvalue computation
            const eigenResult = numeric.eig(matrix);

            if (!eigenResult || !eigenResult.lambda) {
                throw new Error('Eigenvalue computation failed');
            }

            return JacobianAndEigen.parseEigenResult(eigenResult);

        } catch (error) {
            console.warn('Eigenvalue computation error:', error.message);
            return {
                values: [],
                realParts: [],
                imagParts: [],
                magnitudes: [],
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * Parse eigenvalue result from numeric.js
     * @param {object} eigenResult - Result from numeric.eig()
     * @returns {object} Parsed eigenvalue data
     */
    static parseEigenResult(eigenResult) {
        const values = [];
        const realParts = [];
        const imagParts = [];
        const magnitudes = [];

        if (eigenResult.lambda.x && eigenResult.lambda.y) {
            // Complex eigenvalues
            for (let i = 0; i < eigenResult.lambda.x.length; i++) {
                const real = eigenResult.lambda.x[i] || 0;
                const imag = eigenResult.lambda.y[i] || 0;
                
                values.push({ real, imag, index: i + 1 });
                realParts.push(real);
                imagParts.push(imag);
                magnitudes.push(Math.sqrt(real * real + imag * imag));
            }
        } else if (Array.isArray(eigenResult.lambda)) {
            // All real eigenvalues
            eigenResult.lambda.forEach((ev, i) => {
                const real = ev || 0;
                const imag = 0;
                
                values.push({ real, imag, index: i + 1 });
                realParts.push(real);
                imagParts.push(imag);
                magnitudes.push(Math.abs(real));
            });
        } else {
            throw new Error('Unexpected eigenvalue format');
        }

        return {
            values,
            realParts,
            imagParts,
            magnitudes,
            isValid: true,
            error: null
        };
    }

    /**
     * Analyze eigenvalue distribution for LV systems
     * @param {object} eigenData - Parsed eigenvalue data
     * @returns {object} Analysis results
     */
    static analyzeEigenvalues(eigenData) {
        if (!eigenData.isValid) {
            return {
                isValid: false,
                error: eigenData.error
            };
        }

        const { realParts, imagParts, magnitudes } = eigenData;
        const tolerance = Config.TOLERANCES.eigenvalueImag;

        // Count real vs complex eigenvalues
        const realCount = imagParts.filter(imag => Math.abs(imag) < tolerance).length;
        const complexCount = eigenData.values.length - realCount;

        // Stability analysis
        const maxRealPart = Math.max(...realParts);
        const minRealPart = Math.min(...realParts);
        const maxMagnitude = Math.max(...magnitudes);

        // Check for center-type behavior (purely imaginary eigenvalues)
        const purlyImaginaryCount = realParts.filter(real => Math.abs(real) < tolerance).length;
        const isPossibleCenter = purlyImaginaryCount > 0 && maxRealPart < tolerance;

        // Classify stability
        let stabilityType = 'unknown';
        if (maxRealPart < -tolerance) {
            stabilityType = 'stable';
        } else if (minRealPart > tolerance) {
            stabilityType = 'unstable';
        } else if (isPossibleCenter) {
            stabilityType = 'center';
        } else {
            stabilityType = 'marginal';
        }

        return {
            isValid: true,
            totalCount: eigenData.values.length,
            realCount,
            complexCount,
            purlyImaginaryCount,
            maxRealPart,
            minRealPart,
            maxMagnitude,
            stabilityType,
            isPossibleCenter,
            isStable: stabilityType === 'stable',
            isUnstable: stabilityType === 'unstable',
            isCenter: stabilityType === 'center'
        };
    }

    /**
     * Compute Jacobian matrix for current state
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} eps - Linear terms
     * @param {Array<Array<number>>} A - Interaction matrix
     * @returns {Array<Array<number>>} Jacobian matrix
     */
    static computeJacobian(x, eps, A) {
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
     * Compare eigenvalues of matrix A vs Jacobian J(x)
     * @param {Array<Array<number>>} A - Interaction matrix
     * @param {Array<number>} x - Current populations
     * @param {Array<number>} eps - Linear terms
     * @returns {object} Comparison data
     */
    static compareMatrixVsJacobian(A, x, eps) {
        const matrixEigen = JacobianAndEigen.computeEigenvalues(A);
        const jacobian = JacobianAndEigen.computeJacobian(x, eps, A);
        const jacobianEigen = JacobianAndEigen.computeEigenvalues(jacobian);

        const matrixAnalysis = JacobianAndEigen.analyzeEigenvalues(matrixEigen);
        const jacobianAnalysis = JacobianAndEigen.analyzeEigenvalues(jacobianEigen);

        return {
            matrix: {
                eigenvalues: matrixEigen,
                analysis: matrixAnalysis
            },
            jacobian: {
                matrix: jacobian,
                eigenvalues: jacobianEigen,
                analysis: jacobianAnalysis
            },
            comparison: {
                stabilityChange: matrixAnalysis.stabilityType !== jacobianAnalysis.stabilityType,
                matrixStability: matrixAnalysis.stabilityType,
                jacobianStability: jacobianAnalysis.stabilityType
            }
        };
    }

    /**
     * Format eigenvalue for display
     * @param {object} eigenvalue - Eigenvalue with real/imag parts
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted string
     */
    static formatEigenvalue(eigenvalue, decimals = 4) {
        return Config.formatComplex(eigenvalue.real, eigenvalue.imag, decimals);
    }

    /**
     * Sort eigenvalues by magnitude (descending)
     * @param {Array<object>} eigenvalues - Array of eigenvalue objects
     * @returns {Array<object>} Sorted eigenvalues
     */
    static sortByMagnitude(eigenvalues) {
        return eigenvalues.slice().sort((a, b) => {
            const magA = Math.sqrt(a.real * a.real + a.imag * a.imag);
            const magB = Math.sqrt(b.real * b.real + b.imag * b.imag);
            return magB - magA; // Descending order
        });
    }

    /**
     * Sort eigenvalues by real part (descending)
     * @param {Array<object>} eigenvalues - Array of eigenvalue objects
     * @returns {Array<object>} Sorted eigenvalues
     */
    static sortByRealPart(eigenvalues) {
        return eigenvalues.slice().sort((a, b) => b.real - a.real);
    }

    /**
     * Get eigenvalues suitable for visualization
     * @param {Array<Array<number>>} matrix - Matrix to analyze
     * @param {string} sortBy - Sort criterion: 'magnitude' or 'real'
     * @returns {object} Visualization-ready eigenvalue data
     */
    static getVisualizationData(matrix, sortBy = 'magnitude') {
        const eigenData = JacobianAndEigen.computeEigenvalues(matrix);
        
        if (!eigenData.isValid) {
            return eigenData;
        }

        const analysis = JacobianAndEigen.analyzeEigenvalues(eigenData);
        
        // Sort eigenvalues
        let sortedValues;
        if (sortBy === 'magnitude') {
            sortedValues = JacobianAndEigen.sortByMagnitude(eigenData.values);
        } else {
            sortedValues = JacobianAndEigen.sortByRealPart(eigenData.values);
        }

        // Calculate plotting domain
        const realValues = eigenData.realParts;
        const imagValues = eigenData.imagParts;
        const maxReal = Math.max(...realValues, 0.1);
        const minReal = Math.min(...realValues, -0.1);
        const maxImag = Math.max(...imagValues, 0.1);
        const minImag = Math.min(...imagValues, -0.1);

        const maxAbsReal = Math.max(Math.abs(maxReal), Math.abs(minReal));
        const maxAbsImag = Math.max(Math.abs(maxImag), Math.abs(minImag));
        const plotRange = Math.max(maxAbsReal, maxAbsImag) * 1.2;

        return {
            ...eigenData,
            analysis,
            sortedValues,
            plotDomain: {
                real: [-plotRange, plotRange],
                imag: [-plotRange, plotRange],
                maxRange: plotRange
            }
        };
    }

    /**
     * Generate eigenvalue colors for visualization
     * @param {Array<object>} eigenvalues - Eigenvalue objects
     * @returns {Array<string>} Color strings
     */
    static generateColors(eigenvalues) {
        return eigenvalues.map(ev => {
            return Config.getComplexColor(ev.real, ev.imag);
        });
    }

    /**
     * Detect oscillatory behavior from eigenvalues
     * @param {object} eigenData - Eigenvalue data
     * @param {number} tolerance - Tolerance for detecting purely imaginary eigenvalues
     * @returns {object} Oscillation analysis
     */
    static detectOscillations(eigenData, tolerance = Config.TOLERANCES.eigenvalueImag) {
        if (!eigenData.isValid) {
            return { hasOscillations: false, reason: 'Invalid eigenvalue data' };
        }

        const { realParts, imagParts } = eigenData;
        
        // Count purely imaginary eigenvalues (real part ≈ 0)
        const imaginaryCount = realParts.filter(real => Math.abs(real) < tolerance).length;
        
        // Check for complex conjugate pairs
        const complexPairs = [];
        for (let i = 0; i < eigenData.values.length; i++) {
            const ev1 = eigenData.values[i];
            if (Math.abs(ev1.imag) > tolerance) {
                // Look for conjugate
                for (let j = i + 1; j < eigenData.values.length; j++) {
                    const ev2 = eigenData.values[j];
                    if (Math.abs(ev1.real - ev2.real) < tolerance && 
                        Math.abs(ev1.imag + ev2.imag) < tolerance) {
                        complexPairs.push([i, j]);
                        break;
                    }
                }
            }
        }

        const hasOscillations = imaginaryCount >= 2 || complexPairs.length > 0;
        
        return {
            hasOscillations,
            imaginaryCount,
            complexPairs: complexPairs.length,
            dominantFrequency: hasOscillations ? 
                Math.max(...imagParts.map(Math.abs)) / (2 * Math.PI) : 0,
            isNeutralOscillator: imaginaryCount > 0 && Math.max(...realParts.map(Math.abs)) < tolerance
        };
    }
}

export default JacobianAndEigen;