/**
 * Data Contracts - Simple DTOs for type safety and testing
 * Keep these plain objects to make testing easy
 */

/**
 * Represents an eigenvalue with its properties
 */
export class EigenPair {
    constructor(index, real, imag, magnitude) {
        this.index = index;
        this.real = real;
        this.imag = imag;
        this.magnitude = magnitude;
    }

    /**
     * Create from complex number array
     */
    static fromComplex(complex, index) {
        const magnitude = Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
        return new EigenPair(index, complex.real, complex.imag, magnitude);
    }
}

/**
 * Represents cycle analysis results
 */
export class CycleAnalysis {
    constructor(nodes, length, forward, reverse, expected, diff, relative, holds) {
        this.nodes = nodes;           // Array of node indices in cycle
        this.length = length;         // Cycle length
        this.forward = forward;       // Forward cycle sum
        this.reverse = reverse;       // Reverse cycle sum
        this.expected = expected;     // Expected value (0 for zero-cycle)
        this.diff = diff;            // Absolute difference
        this.relative = relative;     // Relative error
        this.holds = holds;          // Boolean: does condition hold
    }
}

/**
 * Represents a time series data point
 */
export class TimePoint {
    constructor(time, value) {
        this.time = time;
        this.value = value;
    }
}

/**
 * Represents a graph link/edge
 */
export class Link {
    constructor(source, target, value) {
        this.source = source;   // Source node index
        this.target = target;   // Target node index  
        this.value = value;     // Edge weight
    }

    /**
     * Create from matrix entry
     */
    static fromMatrix(i, j, value) {
        return new Link(i, j, value);
    }

    /**
     * Get renderable link for D3 (with source/target objects)
     */
    toD3Link(nodes) {
        return {
            source: nodes[this.source],
            target: nodes[this.target],
            value: this.value,
            sourceIndex: this.source,
            targetIndex: this.target
        };
    }
}

/**
 * Represents a graph node
 */
export class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    /**
     * Create node in circular layout
     */
    static createCircular(id, total, centerX, centerY, radius) {
        const angle = (id / total) * 2 * Math.PI - Math.PI / 2;
        return new Node(
            id,
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
    }
}

/**
 * Represents simulation statistics
 */
export class SimulationStats {
    constructor(time, maxChange, hamiltonian, deltaHamiltonian) {
        this.time = time;
        this.maxChange = maxChange;
        this.hamiltonian = hamiltonian;
        this.deltaHamiltonian = deltaHamiltonian;
    }
}