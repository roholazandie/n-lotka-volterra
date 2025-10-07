import Config from '../core/Config.js';

/**
 * CycleAnalyzer - Analyzes cycles in interaction networks
 * Pure functions for cycle detection, parity analysis, and cycle classification
 */
class CycleAnalyzer {
    /**
     * Sample cycles from an adjacency matrix
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @param {object} options - Sampling options
     * @returns {Array<Array<number>>} Array of cycles (as node sequences)
     */
    static sampleCyclesFromMatrix(matrix, options = {}) {
        const {
            maxCycleLength = 6,
            maxCycles = 100,
            tolerance = Config.TOLERANCES.matrixElement,
            includeLength2 = true
        } = options;

        const n = matrix.length;
        const cycles = [];
        
        // Build adjacency list for efficient traversal
        const adjList = CycleAnalyzer.buildAdjacencyList(matrix, tolerance);
        
        // Find cycles starting from each node
        for (let start = 0; start < n && cycles.length < maxCycles; start++) {
            const visited = new Set();
            const path = [start];
            
            CycleAnalyzer.findCyclesFromNode(
                start, start, adjList, visited, path, cycles, 
                maxCycleLength, maxCycles, includeLength2
            );
        }

        // Remove duplicate cycles and canonicalize
        return CycleAnalyzer.canonicalizeCycles(cycles);
    }

    /**
     * Build adjacency list from matrix
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @param {number} tolerance - Minimum edge weight
     * @returns {Array<Array<object>>} Adjacency list with weights
     */
    static buildAdjacencyList(matrix, tolerance) {
        const n = matrix.length;
        const adjList = Array.from({length: n}, () => []);
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && Math.abs(matrix[i][j]) > tolerance) {
                    adjList[i].push({
                        node: j,
                        weight: matrix[i][j]
                    });
                }
            }
        }
        
        return adjList;
    }

    /**
     * Recursively find cycles from a starting node
     * @param {number} current - Current node
     * @param {number} start - Starting node
     * @param {Array<Array<object>>} adjList - Adjacency list
     * @param {Set<number>} visited - Visited nodes
     * @param {Array<number>} path - Current path
     * @param {Array<Array<number>>} cycles - Found cycles
     * @param {number} maxLength - Maximum cycle length
     * @param {number} maxCycles - Maximum number of cycles
     * @param {boolean} includeLength2 - Include 2-cycles
     */
    static findCyclesFromNode(current, start, adjList, visited, path, cycles, maxLength, maxCycles, includeLength2) {
        if (cycles.length >= maxCycles) return;
        
        visited.add(current);
        
        for (const edge of adjList[current]) {
            const next = edge.node;
            
            if (next === start && path.length >= (includeLength2 ? 2 : 3)) {
                // Found a cycle
                cycles.push([...path]);
            } else if (!visited.has(next) && path.length < maxLength) {
                // Continue search
                path.push(next);
                CycleAnalyzer.findCyclesFromNode(
                    next, start, adjList, visited, path, cycles, 
                    maxLength, maxCycles, includeLength2
                );
                path.pop();
            }
        }
        
        visited.delete(current);
    }

    /**
     * Remove duplicate cycles and return canonical forms
     * @param {Array<Array<number>>} cycles - Array of cycles
     * @returns {Array<Array<number>>} Canonical unique cycles
     */
    static canonicalizeCycles(cycles) {
        const uniqueCycles = new Map();
        
        for (const cycle of cycles) {
            const canonical = CycleAnalyzer.canonicalCycleKey(cycle);
            if (!uniqueCycles.has(canonical)) {
                uniqueCycles.set(canonical, cycle);
            }
        }
        
        return Array.from(uniqueCycles.values());
    }

    /**
     * Generate canonical key for a cycle (rotation and reflection invariant)
     * @param {Array<number>} cycle - Cycle as array of nodes
     * @returns {string} Canonical key
     */
    static canonicalCycleKey(cycle) {
        if (cycle.length === 0) return '';
        
        // Try all rotations and reflections
        const rotations = [];
        
        // All rotations
        for (let i = 0; i < cycle.length; i++) {
            const rotated = cycle.slice(i).concat(cycle.slice(0, i));
            rotations.push(rotated.join(','));
        }
        
        // All rotations of reverse
        const reversed = [...cycle].reverse();
        for (let i = 0; i < reversed.length; i++) {
            const rotated = reversed.slice(i).concat(reversed.slice(0, i));
            rotations.push(rotated.join(','));
        }
        
        // Return lexicographically smallest
        return rotations.sort()[0];
    }

    /**
     * Analyze parity (even/odd cycle lengths) in a set of cycles
     * @param {Array<Array<number>>} cycles - Array of cycles
     * @returns {object} Parity analysis results
     */
    static analyzeCycleParity(cycles) {
        const evenCycles = [];
        const oddCycles = [];
        const lengthDistribution = new Map();
        
        for (const cycle of cycles) {
            const length = cycle.length;
            
            // Update length distribution
            lengthDistribution.set(length, (lengthDistribution.get(length) || 0) + 1);
            
            // Classify by parity
            if (length % 2 === 0) {
                evenCycles.push(cycle);
            } else {
                oddCycles.push(cycle);
            }
        }
        
        const totalCycles = cycles.length;
        const evenCount = evenCycles.length;
        const oddCount = oddCycles.length;
        
        return {
            totalCycles,
            evenCount,
            oddCount,
            evenRatio: totalCycles > 0 ? evenCount / totalCycles : 0,
            oddRatio: totalCycles > 0 ? oddCount / totalCycles : 0,
            lengthDistribution: Object.fromEntries(lengthDistribution),
            evenCycles,
            oddCycles,
            hasEvenCycles: evenCount > 0,
            hasOddCycles: oddCount > 0,
            isEvenDominated: evenCount > oddCount,
            isOddDominated: oddCount > evenCount
        };
    }

    /**
     * Compute cycle weights (product of edge weights)
     * @param {Array<Array<number>>} cycles - Array of cycles
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @returns {Array<object>} Cycles with computed weights
     */
    static computeCycleWeights(cycles, matrix) {
        return cycles.map(cycle => {
            let weight = 1;
            let isValid = true;
            
            for (let i = 0; i < cycle.length; i++) {
                const from = cycle[i];
                const to = cycle[(i + 1) % cycle.length];
                const edgeWeight = matrix[from][to];
                
                if (Math.abs(edgeWeight) < Config.TOLERANCES.matrixElement) {
                    isValid = false;
                    break;
                }
                
                weight *= edgeWeight;
            }
            
            return {
                cycle,
                weight: isValid ? weight : 0,
                isValid,
                length: cycle.length,
                isEven: cycle.length % 2 === 0
            };
        });
    }

    /**
     * Classify cycles based on their properties
     * @param {Array<Array<number>>} cycles - Array of cycles
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @returns {object} Cycle classification
     */
    static classifyCycles(cycles, matrix) {
        const weightedCycles = CycleAnalyzer.computeCycleWeights(cycles, matrix);
        const parityAnalysis = CycleAnalyzer.analyzeCycleParity(cycles);
        
        // Classify by weight sign
        const positiveCycles = weightedCycles.filter(c => c.weight > 0);
        const negativeCycles = weightedCycles.filter(c => c.weight < 0);
        const zeroCycles = weightedCycles.filter(c => c.weight === 0);
        
        // Stability implications
        const hasNegativeFeedback = negativeCycles.some(c => c.isEven);
        const hasPositiveFeedback = positiveCycles.some(c => c.isEven);
        const hasOddNegative = negativeCycles.some(c => !c.isEven);
        
        return {
            ...parityAnalysis,
            weightedCycles,
            positiveCycles: positiveCycles.length,
            negativeCycles: negativeCycles.length,
            zeroCycles: zeroCycles.length,
            hasNegativeFeedback,
            hasPositiveFeedback,
            hasOddNegative,
            stabilityIndicators: {
                likelyStable: hasNegativeFeedback && !hasPositiveFeedback,
                likelyUnstable: hasPositiveFeedback && !hasNegativeFeedback,
                mixed: hasNegativeFeedback && hasPositiveFeedback
            }
        };
    }

    /**
     * Find specific cycle patterns (e.g., triangles, squares)
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @param {number} targetLength - Target cycle length
     * @returns {Array<Array<number>>} Cycles of specific length
     */
    static findCyclesOfLength(matrix, targetLength) {
        const allCycles = CycleAnalyzer.sampleCyclesFromMatrix(matrix, {
            maxCycleLength: targetLength,
            includeLength2: targetLength === 2
        });
        
        return allCycles.filter(cycle => cycle.length === targetLength);
    }

    /**
     * Analyze motif frequency (3-cycles, 4-cycles, etc.)
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @param {number} maxLength - Maximum motif length to analyze
     * @returns {object} Motif frequency analysis
     */
    static analyzeMotifFrequency(matrix, maxLength = 4) {
        const motifCounts = {};
        const motifExamples = {};
        
        for (let length = 2; length <= maxLength; length++) {
            const cycles = CycleAnalyzer.findCyclesOfLength(matrix, length);
            motifCounts[length] = cycles.length;
            motifExamples[length] = cycles.slice(0, 5); // Keep first 5 as examples
        }
        
        const totalMotifs = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
        
        return {
            motifCounts,
            motifExamples,
            totalMotifs,
            hasTriangles: motifCounts[3] > 0,
            hasSquares: motifCounts[4] > 0,
            triangleRatio: totalMotifs > 0 ? motifCounts[3] / totalMotifs : 0,
            squareRatio: totalMotifs > 0 ? motifCounts[4] / totalMotifs : 0
        };
    }

    /**
     * Check zero-cycle condition: A^T * D + D * A = 0
     * @param {Array<Array<number>>} matrix - Matrix A
     * @param {Array<number>} diagonal - Diagonal vector D
     * @returns {object} Zero-cycle validation
     */
    static validateZeroCycleCondition(matrix, diagonal) {
        const n = matrix.length;
        
        if (!diagonal || diagonal.length !== n) {
            return {
                isValid: false,
                error: 'Diagonal vector dimension mismatch',
                maxResidual: Infinity
            };
        }
        
        const residuals = [];
        
        // Compute A^T * D + D * A
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                // (A^T * D)[i][j] + (D * A)[i][j] = A[j][i] * D[j] + D[i] * A[i][j]
                const residual = matrix[j][i] * diagonal[j] + diagonal[i] * matrix[i][j];
                residuals.push(Math.abs(residual));
            }
        }
        
        const maxResidual = Math.max(...residuals);
        const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
        const tolerance = Config.TOLERANCES.matrixElement * 10;
        
        return {
            isValid: maxResidual < tolerance,
            maxResidual,
            meanResidual,
            tolerance,
            residuals,
            satisfiesCondition: maxResidual < tolerance
        };
    }

    /**
     * Generate cycle-based graph diagnostics
     * @param {Array<Array<number>>} matrix - Adjacency matrix
     * @returns {object} Comprehensive cycle analysis
     */
    static generateCycleDiagnostics(matrix) {
        const cycles = CycleAnalyzer.sampleCyclesFromMatrix(matrix);
        const classification = CycleAnalyzer.classifyCycles(cycles, matrix);
        const motifAnalysis = CycleAnalyzer.analyzeMotifFrequency(matrix);
        
        // Network properties
        const n = matrix.length;
        const totalEdges = matrix.flat().filter(x => Math.abs(x) > Config.TOLERANCES.matrixElement).length;
        const density = totalEdges / (n * n);
        
        return {
            networkProperties: {
                nodes: n,
                edges: totalEdges,
                density
            },
            cycles: classification,
            motifs: motifAnalysis,
            summary: {
                totalCycles: cycles.length,
                hasComplexStructure: cycles.length > n,
                dominantMotif: motifAnalysis.hasTriangles ? 'triangles' : 
                              motifAnalysis.hasSquares ? 'squares' : 'none',
                stabilityHint: classification.stabilityIndicators.likelyStable ? 'stable' :
                              classification.stabilityIndicators.likelyUnstable ? 'unstable' : 'mixed'
            }
        };
    }
}

export default CycleAnalyzer;