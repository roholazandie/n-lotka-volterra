/**
 * Config - Static configuration and layout constants
 * Centralizes magic numbers, UI dimensions, and formatting functions
 */
class Config {
    // Animation and simulation constants
    static MAX_HISTORY_LENGTH = 500;
    static DEFAULT_DT = 0.02;
    static DEFAULT_SPEED_MULTIPLIER = 1;
    
    // Canvas dimensions
    static CANVAS = {
        width: 1000,
        height: 600
    };

    // Structure graph
    static STRUCTURE_GRAPH = {
        width: 1000,
        height: 600,
        nodeRadius: 20,
        circleRadius: 220
    };

    // Time plot
    static TIME_PLOT = {
        width: 1000,
        height: 300,
        margin: { top: 20, right: 30, bottom: 40, left: 50 }
    };

    // Eigenvalue plot
    static EIGEN_PLOT = {
        width: 400,
        height: 300,
        margin: { top: 20, right: 30, bottom: 40, left: 50 }
    };

    // Complex plot
    static COMPLEX_PLOT = {
        width: 400,
        height: 300,
        margin: { top: 20, right: 30, bottom: 40, left: 50 }
    };

    // Node visualization
    static NODE = {
        minRadius: 8,
        maxRadius: 30,
        defaultRadius: 15
    };

    // Animation settings
    static ANIMATION = {
        defaultDt: 0.01,
        defaultSpeedMultiplier: 1,
        maxTime: 1000,
        convergenceThreshold: 0.0001,
        historyInterval: 0.1,
        maxHistoryPoints: 500
    };

    // Simulation defaults
    static SIMULATION = {
        defaultNodes: 4,
        defaultConnectionProb: 0.4,
        defaultInteractionRange: 1.0,
        defaultExtinctionThreshold: 0.01,
        initPopulationMin: 0.1,
        initPopulationMax: 0.6,
        initEpsilonRange: 0.5,
        oscillationPerturbation: 0.05,
        oscillationEquilibriumMin: 0.4,
        oscillationEquilibriumMax: 1.0
    };

    // Tolerances and thresholds
    static TOLERANCES = {
        matrixElement: 0.001,
        eigenvalueImag: 0.0001,
        hamiltonianPrecision: 1e-12,
        skewSymmetryCheck: 1e-10
    };

    // DOM selectors
    static SELECTORS = {
        // Main containers
        graph: "#graph",
        structureGraph: "#structureGraph", 
        timePlot: "#timePlot",
        eigenvaluePlot: "#eigenvaluePlot",
        complexPlot: "#complexPlot",
        tooltip: "#tooltip",
        stats: "#stats",

        // Controls
        numNodes: "#numNodes",
        skewSymmetric: "#skewSymmetric",
        zeroCycle: "#zeroCycle",
        interactionRange: "#interactionRange",
        connectionProb: "#connectionProb",
        extinctionThreshold: "#extinctionThreshold",
        speedSlider: "#speedSlider",
        speedValue: "#speedValue",

        // Buttons
        initButton: "#initButton",
        playPauseButton: "#playPauseButton",
        resetButton: "#resetButton"
    };

    // Color schemes
    static COLORS = {
        // Node colors
        nodePositive: "#ff6b35",     // Orange for positive populations
        nodeNegative: "#4ecdc4",     // Teal for negative populations  
        nodeExtinct: "#666666",      // Gray for extinct populations
        
        // Link colors
        linkPositive: "#ff6b35",     // Orange for positive interactions
        linkNegative: "#4ecdc4",     // Teal for negative interactions
        
        // Structured link colors for cleaner categorization
        links: {
            positive: "#4CAF50",     // Green for positive interactions
            negative: "#F44336",     // Red for negative interactions
            neutral: "#9E9E9E"       // Gray for neutral/zero interactions
        },
        
        // Node colors (fall palette)
        nodeColors: [
            [255, 235, 140], // Light yellow
            [255, 200, 80],  // Golden
            [255, 150, 50],  // Orange
            [255, 100, 50],  // Red-orange
            [200, 50, 50],   // Deep red
            [150, 40, 30]    // Brown-red
        ],

        // Eigenvalue gradients
        eigenBarGradient: {
            start: { r: 102, g: 126, b: 234 },
            end: { r: 70, g: 90, b: 180 }
        },

        // UI colors
        background: "rgba(255, 255, 255, 0.02)",
        border: "rgba(255, 255, 255, 0.1)",
        axis: "rgba(255, 255, 255, 0.2)",
        text: "#888",
        centerLine: "rgba(255, 255, 255, 0.4)",
        header: "#f5f5f5"            // Header background color
    };

    /**
     * Get fall color based on value and maximum
     */
    static getFallColor(value, maxValue) {
        const t = Math.min(value / (maxValue || 1), 1);
        const colors = Config.COLORS.nodeColors;
        
        const idx = t * (colors.length - 1);
        const i = Math.floor(idx);
        const f = idx - i;

        if (i >= colors.length - 1) {
            return `rgb(${colors[colors.length - 1].join(',')})`;
        }

        const c1 = colors[i];
        const c2 = colors[i + 1];
        const r = Math.floor(c1[0] + (c2[0] - c1[0]) * f);
        const g = Math.floor(c1[1] + (c2[1] - c1[1]) * f);
        const b = Math.floor(c1[2] + (c2[2] - c1[2]) * f);

        return `rgb(${r},${g},${b})`;
    }

    /**
     * Get eigenvalue bar color based on index
     */
    static getEigenBarColor(index, totalCount) {
        const t = index / (totalCount - 1);
        const start = Config.COLORS.eigenBarGradient.start;
        const end = Config.COLORS.eigenBarGradient.end;
        
        const r = Math.floor(start.r + (end.r - start.r) * t);
        const g = Math.floor(start.g + (end.g - start.g) * t);
        const b = Math.floor(start.b + (end.b - start.b) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Get HSL color based on complex number angle
     */
    static getComplexColor(real, imag, saturation = 70, lightness = 60) {
        const angle = Math.atan2(imag, real);
        const hue = (angle * 180 / Math.PI + 180) % 360;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Format number for display
     */
    static formatNumber(value, decimals = 3) {
        if (Math.abs(value) < 1e-10) return "0";
        if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
            return value.toExponential(2);
        }
        return value.toFixed(decimals);
    }

    /**
     * Format complex number for display
     */
    static formatComplex(real, imag, decimals = 4) {
        if (Math.abs(imag) < Config.TOLERANCES.eigenvalueImag) {
            return Config.formatNumber(real, decimals);
        }
        
        const realPart = Config.formatNumber(real, decimals);
        const imagPart = Config.formatNumber(Math.abs(imag), decimals);
        const sign = imag >= 0 ? "+" : "-";
        return `${realPart} ${sign} ${imagPart}i`;
    }

    /**
     * Get species color for time series plots
     */
    static getSpeciesColor(index) {
        const colors = [
            "#ff6b35", // Orange
            "#4ecdc4", // Teal
            "#45b7d1", // Blue
            "#96ceb4", // Green
            "#ffeaa7", // Yellow
            "#dda0dd", // Plum
            "#98d8c8", // Mint
            "#f7dc6f", // Gold
            "#bb8fce", // Purple
            "#85c1e9"  // Light blue
        ];
        return colors[index % colors.length];
    }

    /**
     * Validate configuration at startup
     */
    static validate() {
        const required = [
            'CANVAS', 'STRUCTURE_GRAPH', 'TIME_PLOT', 'EIGEN_PLOT', 
            'COMPLEX_PLOT', 'ANIMATION', 'SIMULATION', 'TOLERANCES', 
            'SELECTORS', 'COLORS'
        ];
        
        for (const key of required) {
            if (!Config[key]) {
                throw new Error(`Config validation failed: missing ${key}`);
            }
        }
        
        return true;
    }
}

// Validate configuration on load
Config.validate();

export default Config;