import Config from '../core/Config.js';

/**
 * MatrixModel - Handles matrix operations and generation
 * Stateless methods for matrix manipulation and analysis
 */
class MatrixModel {
    /**
     * Make a matrix skew-symmetric (A^T = -A)
     * @param {Array<Array<number>>} A - Matrix to modify in-place
     * @returns {Array<Array<number>>} The modified matrix
     */
    static makeSkewSymmetric(A) {
        const n = A.length;
        for (let i = 0; i < n; i++) {
            A[i][i] = 0;
            for (let j = i + 1; j < n; j++) {
                const v = 0.5 * (A[i][j] - A[j][i]);  // skew part
                A[i][j] = v;
                A[j][i] = -v;
            }
        }
        return A;
    }

    /**
     * Check if a matrix is skew-symmetric
     * @param {Array<Array<number>>} A - Matrix to check
     * @param {number} tolerance - Numerical tolerance
     * @returns {boolean} True if matrix is skew-symmetric
     */
    static isSkewSymmetric(A, tolerance = Config.TOLERANCES.skewSymmetryCheck) {
        const n = A.length;
        for (let i = 0; i < n; i++) {
            // Check diagonal elements are zero
            if (Math.abs(A[i][i]) > tolerance) {
                return false;
            }
            // Check A[i][j] = -A[j][i]
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(A[i][j] + A[j][i]) > tolerance) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Generate a random matrix with specified properties
     * @param {number} n - Matrix size
     * @param {number} density - Connection probability [0,1]
     * @param {number} scale - Interaction strength scale
     * @param {object} options - Additional options
     * @returns {Array<Array<number>>} Generated matrix
     */
    static generateRandomMatrix(n, density = 0.4, scale = 1.0, options = {}) {
        const {
            isSkewSymmetric = false,
            zeroDiagonal = false,
            negativeDiagonal = false
        } = options;

        const matrix = Array.from({length: n}, () => Array(n).fill(0));

        if (isSkewSymmetric) {
            // Generate skew-symmetric matrix
            for (let i = 0; i < n; i++) {
                matrix[i][i] = 0;
                for (let j = i + 1; j < n; j++) {
                    if (Math.random() < density) {
                        const value = (Math.random() * 2 - 1) * scale;
                        matrix[i][j] = value;
                        matrix[j][i] = -value;
                    }
                }
            }
        } else {
            // Generate general matrix
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j && Math.random() < density) {
                        matrix[i][j] = (Math.random() * 2 - 1) * scale;
                    }
                }

                // Handle diagonal
                if (zeroDiagonal) {
                    matrix[i][i] = 0;
                } else if (negativeDiagonal) {
                    const base = Math.max(scale * 0.15, 0.05);
                    const spread = Math.max(scale * 0.5, 0.1);
                    matrix[i][i] = -(Math.random() * spread + base);
                }
            }
        }

        return matrix;
    }

    /**
     * Generate zero cycle matrix (complex specialized generation)
     * @param {number} n - Matrix size
     * @param {number} density - Connection probability
     * @param {number} scale - Interaction scale
     * @param {object} options - Generation options
     * @returns {object} {matrix, diag} where matrix is the generated matrix and diag is the cycle diagonal
     */
    static generateZeroCycleMatrix(n, density, scale, options = {}) {
        const { zeroDiagonal = true } = options;

        // This is a placeholder for the complex zero-cycle generation
        // For now, we'll create a skew-symmetric matrix as an approximation
        const matrix = MatrixModel.generateRandomMatrix(n, density, scale, {
            isSkewSymmetric: true,
            zeroDiagonal: true
        });

        // Generate a diagonal vector for cycle analysis
        const diag = Array.from({length: n}, () => Math.random() * 2 - 1);

        return { matrix, diag };
    }

    /**
     * Compute zero cycle residual for diagnostics
     * @param {Array<Array<number>>} matrix - The matrix
     * @param {Array<number>} diag - Diagonal vector
     * @returns {object} Residual statistics
     */
    static computeZeroCycleResidual(matrix, diag) {
        const n = matrix.length;
        
        if (!diag || diag.length !== n) {
            return { maxResidual: 0, meanResidual: 0, residuals: [] };
        }

        const residuals = [];
        
        // Compute A^T * D + D * A for each element
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                // (A^T * D)[i][j] + (D * A)[i][j] = A[j][i] * diag[j] + diag[i] * A[i][j]
                const residual = matrix[j][i] * diag[j] + diag[i] * matrix[i][j];
                residuals.push(Math.abs(residual));
            }
        }

        const maxResidual = Math.max(...residuals);
        const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;

        return {
            maxResidual,
            meanResidual,
            residuals,
            isValid: maxResidual < Config.TOLERANCES.matrixElement * 10
        };
    }

    /**
     * Create renderable links from matrix
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @param {number} tolerance - Minimum value to consider as a link
     * @returns {Array<object>} Array of link objects {source, target, value}
     */
    static renderableLinks(matrix, tolerance = Config.TOLERANCES.matrixElement) {
        const n = matrix.length;
        const links = [];

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && Math.abs(matrix[i][j]) > tolerance) {
                    links.push({
                        source: i,
                        target: j,
                        value: matrix[i][j]
                    });
                }
            }
        }

        return links;
    }

    /**
     * Matrix multiplication: C = A * B
     * @param {Array<Array<number>>} A - First matrix
     * @param {Array<Array<number>>} B - Second matrix
     * @returns {Array<Array<number>>} Product matrix
     */
    static multiply(A, B) {
        const rowsA = A.length;
        const colsA = A[0].length;
        const colsB = B[0].length;

        if (colsA !== B.length) {
            throw new Error('Matrix dimensions incompatible for multiplication');
        }

        const C = Array.from({length: rowsA}, () => Array(colsB).fill(0));

        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }

        return C;
    }

    /**
     * Matrix transpose
     * @param {Array<Array<number>>} A - Matrix to transpose
     * @returns {Array<Array<number>>} Transposed matrix
     */
    static transpose(A) {
        const rows = A.length;
        const cols = A[0].length;
        const AT = Array.from({length: cols}, () => Array(rows));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                AT[j][i] = A[i][j];
            }
        }

        return AT;
    }

    /**
     * Create diagonal matrix from vector
     * @param {Array<number>} diag - Diagonal values
     * @returns {Array<Array<number>>} Diagonal matrix
     */
    static diagonal(diag) {
        const n = diag.length;
        const D = Array.from({length: n}, () => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            D[i][i] = diag[i];
        }

        return D;
    }

    /**
     * Matrix addition: C = A + B
     * @param {Array<Array<number>>} A - First matrix
     * @param {Array<Array<number>>} B - Second matrix
     * @returns {Array<Array<number>>} Sum matrix
     */
    static add(A, B) {
        const rows = A.length;
        const cols = A[0].length;
        
        if (B.length !== rows || B[0].length !== cols) {
            throw new Error('Matrix dimensions must match for addition');
        }

        const C = Array.from({length: rows}, () => Array(cols));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                C[i][j] = A[i][j] + B[i][j];
            }
        }

        return C;
    }

    /**
     * Matrix subtraction: C = A - B
     * @param {Array<Array<number>>} A - First matrix
     * @param {Array<Array<number>>} B - Second matrix
     * @returns {Array<Array<number>>} Difference matrix
     */
    static subtract(A, B) {
        const rows = A.length;
        const cols = A[0].length;
        
        if (B.length !== rows || B[0].length !== cols) {
            throw new Error('Matrix dimensions must match for subtraction');
        }

        const C = Array.from({length: rows}, () => Array(cols));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                C[i][j] = A[i][j] - B[i][j];
            }
        }

        return C;
    }

    /**
     * Scalar multiplication: B = α * A
     * @param {Array<Array<number>>} A - Matrix
     * @param {number} scalar - Scalar value
     * @returns {Array<Array<number>>} Scaled matrix
     */
    static scale(A, scalar) {
        return A.map(row => row.map(val => val * scalar));
    }

    /**
     * Matrix norm (Frobenius norm)
     * @param {Array<Array<number>>} A - Matrix
     * @returns {number} Frobenius norm
     */
    static norm(A) {
        let sum = 0;
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < A[i].length; j++) {
                sum += A[i][j] * A[i][j];
            }
        }
        return Math.sqrt(sum);
    }

    /**
     * Check if matrix is symmetric
     * @param {Array<Array<number>>} A - Matrix to check
     * @param {number} tolerance - Numerical tolerance
     * @returns {boolean} True if symmetric
     */
    static isSymmetric(A, tolerance = Config.TOLERANCES.skewSymmetryCheck) {
        const n = A.length;
        for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
                if (Math.abs(A[i][j] - A[j][i]) > tolerance) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Get matrix properties for analysis
     * @param {Array<Array<number>>} A - Matrix to analyze
     * @returns {object} Matrix properties
     */
    static getProperties(A) {
        const n = A.length;
        const tolerance = Config.TOLERANCES.skewSymmetryCheck;

        return {
            size: n,
            norm: MatrixModel.norm(A),
            isSymmetric: MatrixModel.isSymmetric(A, tolerance),
            isSkewSymmetric: MatrixModel.isSkewSymmetric(A, tolerance),
            nonzeroElements: A.flat().filter(x => Math.abs(x) > Config.TOLERANCES.matrixElement).length,
            density: A.flat().filter(x => Math.abs(x) > Config.TOLERANCES.matrixElement).length / (n * n),
            diagonalSum: A.reduce((sum, row, i) => sum + row[i], 0),
            maxElement: Math.max(...A.flat().map(Math.abs)),
            minElement: Math.min(...A.flat().map(Math.abs))
        };
    }
}

export default MatrixModel;