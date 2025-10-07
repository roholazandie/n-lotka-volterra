import Config from '../core/Config.js';
import { SimulationStats } from '../data/DataContracts.js';

/**
 * StatsPanelView - Manages simulation statistics display panel
 * Shows current time, max change, Hamiltonian, and other metrics
 */
export default class StatsPanelView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Statistics data
        this.stats = new SimulationStats();
        
        // DOM elements
        this.container = null;
        this.timeDisplay = null;
        this.maxChangeDisplay = null;
        this.hamiltonianDisplay = null;
        this.statusDisplay = null;
        this.metricsContainer = null;
        this.controlsContainer = null;
        
        this.init();
    }

    /**
     * Initialize the stats panel
     */
    init() {
        // Clear any existing content
        this.root.selectAll('*').remove();
        
        // Create main container
        this.container = this.root.append('div')
            .attr('class', 'stats-panel-container')
            .style('width', '100%')
            .style('height', '100%')
            .style('padding', '15px')
            .style('box-sizing', 'border-box')
            .style('background', 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)')
            .style('border-radius', '8px')
            .style('border', '1px solid rgba(200,220,240,0.8)')
            .style('overflow-y', 'auto');

        // Title
        this.container.append('h4')
            .style('margin', '0 0 15px 0')
            .style('color', Config.COLORS.text)
            .style('font-size', '16px')
            .style('text-align', 'center')
            .style('border-bottom', '2px solid rgba(100,150,200,0.3)')
            .style('padding-bottom', '8px')
            .text('Simulation Statistics');

        // Main metrics section
        this.createMainMetrics();
        
        // Additional metrics section
        this.createAdditionalMetrics();
        
        // Status section
        this.createStatusSection();

        console.log('[StatsPanelView] Initialized');
    }

    /**
     * Create main metrics display (time, maxChange, Hamiltonian)
     */
    createMainMetrics() {
        const mainSection = this.container.append('div')
            .attr('class', 'main-metrics')
            .style('margin-bottom', '20px');

        // Time display
        this.timeDisplay = this.createMetricCard(mainSection, {
            label: 'Simulation Time',
            value: '0.000',
            unit: 's',
            color: '#2196F3',
            description: 'Current simulation time'
        });

        // Max change display
        this.maxChangeDisplay = this.createMetricCard(mainSection, {
            label: 'Max Population Change',
            value: '0.000',
            unit: '/s',
            color: '#FF9800',
            description: 'Maximum rate of population change'
        });

        // Hamiltonian display
        this.hamiltonianDisplay = this.createMetricCard(mainSection, {
            label: 'Hamiltonian (H)',
            value: '0.000',
            unit: '',
            color: '#4CAF50',
            description: 'Total energy of the system (conserved quantity)'
        });
    }

    /**
     * Create additional metrics section
     */
    createAdditionalMetrics() {
        this.metricsContainer = this.container.append('div')
            .attr('class', 'additional-metrics')
            .style('margin-bottom', '20px');

        // Section title
        this.metricsContainer.append('h5')
            .style('margin', '0 0 10px 0')
            .style('color', Config.COLORS.text)
            .style('font-size', '14px')
            .style('opacity', '0.8')
            .text('System Metrics');
    }

    /**
     * Create status section
     */
    createStatusSection() {
        const statusSection = this.container.append('div')
            .attr('class', 'status-section')
            .style('margin-top', '20px')
            .style('padding-top', '15px')
            .style('border-top', '1px solid rgba(200,220,240,0.5)');

        // Status title
        statusSection.append('h5')
            .style('margin', '0 0 10px 0')
            .style('color', Config.COLORS.text)
            .style('font-size', '14px')
            .style('opacity', '0.8')
            .text('System Status');

        // Status display
        this.statusDisplay = statusSection.append('div')
            .attr('class', 'status-indicator')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('text-align', 'center')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('background', 'rgba(100,100,100,0.1)')
            .style('color', '#666')
            .text('Ready');
    }

    /**
     * Create a metric card component
     */
    createMetricCard(parent, config) {
        const card = parent.append('div')
            .attr('class', 'metric-card')
            .style('background', 'white')
            .style('border', '1px solid rgba(200,220,240,0.6)')
            .style('border-radius', '8px')
            .style('padding', '12px')
            .style('margin-bottom', '10px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
            .style('transition', 'all 0.3s ease')
            .style('cursor', 'help')
            .attr('title', config.description);

        // Label
        card.append('div')
            .attr('class', 'metric-label')
            .style('font-size', '11px')
            .style('color', '#666')
            .style('margin-bottom', '4px')
            .style('text-transform', 'uppercase')
            .style('letter-spacing', '0.5px')
            .text(config.label);

        // Value container
        const valueContainer = card.append('div')
            .attr('class', 'metric-value-container')
            .style('display', 'flex')
            .style('align-items', 'baseline')
            .style('justify-content', 'space-between');

        // Value
        const valueSpan = valueContainer.append('span')
            .attr('class', 'metric-value')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .style('color', config.color)
            .text(config.value);

        // Unit
        if (config.unit) {
            valueContainer.append('span')
                .attr('class', 'metric-unit')
                .style('font-size', '12px')
                .style('color', '#999')
                .style('margin-left', '4px')
                .text(config.unit);
        }

        // Add hover effect
        card
            .on('mouseover', function() {
                d3.select(this)
                    .style('transform', 'translateY(-2px)')
                    .style('box-shadow', '0 4px 8px rgba(0,0,0,0.15)');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style('transform', 'translateY(0)')
                    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
            });

        return valueSpan;
    }

    /**
     * Update statistics display
     */
    render(simulationStats) {
        if (!simulationStats) {
            return;
        }

        this.stats = simulationStats;

        // Update main metrics
        this.timeDisplay.text(this.formatTime(simulationStats.currentTime));
        this.maxChangeDisplay.text(this.formatNumber(simulationStats.maxChange, 3));
        this.hamiltonianDisplay.text(this.formatNumber(simulationStats.hamiltonian, 6));

        // Update additional metrics
        this.updateAdditionalMetrics(simulationStats);

        // Update status
        this.updateStatus(simulationStats);
    }

    /**
     * Update additional metrics
     */
    updateAdditionalMetrics(stats) {
        // Clear existing metrics
        this.metricsContainer.selectAll('.additional-metric').remove();

        const metrics = [
            {
                label: 'Active Nodes',
                value: stats.activeNodes,
                unit: '',
                color: '#9C27B0'
            },
            {
                label: 'Active Links',
                value: stats.activeLinks,
                unit: '',
                color: '#607D8B'
            },
            {
                label: 'Integration Steps',
                value: stats.integrationSteps,
                unit: '',
                color: '#795548'
            },
            {
                label: 'Total Population',
                value: this.formatNumber(stats.totalPopulation, 2),
                unit: '',
                color: '#E91E63'
            }
        ];

        // Create compact metric displays
        metrics.forEach(metric => {
            const metricDiv = this.metricsContainer.append('div')
                .attr('class', 'additional-metric')
                .style('display', 'flex')
                .style('justify-content', 'space-between')
                .style('align-items', 'center')
                .style('padding', '6px 8px')
                .style('margin-bottom', '4px')
                .style('background', 'rgba(255,255,255,0.7)')
                .style('border-radius', '4px')
                .style('border-left', `3px solid ${metric.color}`);

            metricDiv.append('span')
                .style('font-size', '12px')
                .style('color', '#666')
                .text(metric.label);

            const valueSpan = metricDiv.append('span')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('color', metric.color);

            valueSpan.text(metric.value);
            
            if (metric.unit) {
                valueSpan.append('span')
                    .style('font-weight', 'normal')
                    .style('opacity', '0.7')
                    .text(` ${metric.unit}`);
            }
        });
    }

    /**
     * Update system status
     */
    updateStatus(stats) {
        let status, color, background;

        if (stats.isOscillating) {
            status = 'Oscillating';
            color = '#4CAF50';
            background = 'rgba(76, 175, 80, 0.1)';
        } else if (stats.isConverging) {
            status = 'Converging';
            color = '#FF9800';
            background = 'rgba(255, 152, 0, 0.1)';
        } else if (stats.isDiverging) {
            status = 'Diverging';
            color = '#F44336';
            background = 'rgba(244, 67, 54, 0.1)';
        } else {
            status = 'Running';
            color = '#2196F3';
            background = 'rgba(33, 150, 243, 0.1)';
        }

        this.statusDisplay
            .text(status)
            .style('color', color)
            .style('background', background)
            .style('border', `1px solid ${color}40`);
    }

    /**
     * Format time value for display
     */
    formatTime(time) {
        if (time < 10) {
            return time.toFixed(3);
        } else if (time < 100) {
            return time.toFixed(2);
        } else {
            return time.toFixed(1);
        }
    }

    /**
     * Format numerical values
     */
    formatNumber(value, decimals = 3) {
        if (Math.abs(value) < Math.pow(10, -decimals)) {
            return '0';
        } else if (Math.abs(value) < 0.01) {
            return value.toExponential(2);
        } else if (Math.abs(value) > 1000) {
            return value.toExponential(2);
        } else {
            return value.toFixed(decimals);
        }
    }

    /**
     * Add custom metric
     */
    addCustomMetric(label, value, unit = '', color = '#666') {
        const metricDiv = this.metricsContainer.append('div')
            .attr('class', 'custom-metric additional-metric')
            .style('display', 'flex')
            .style('justify-content', 'space-between')
            .style('align-items', 'center')
            .style('padding', '6px 8px')
            .style('margin-bottom', '4px')
            .style('background', 'rgba(255,255,255,0.7)')
            .style('border-radius', '4px')
            .style('border-left', `3px solid ${color}`);

        metricDiv.append('span')
            .style('font-size', '12px')
            .style('color', '#666')
            .text(label);

        const valueSpan = metricDiv.append('span')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('color', color)
            .text(value);

        if (unit) {
            valueSpan.append('span')
                .style('font-weight', 'normal')
                .style('opacity', '0.7')
                .text(` ${unit}`);
        }

        return metricDiv;
    }

    /**
     * Clear custom metrics
     */
    clearCustomMetrics() {
        this.metricsContainer.selectAll('.custom-metric').remove();
    }

    /**
     * Highlight specific metric
     */
    highlightMetric(metricType) {
        // Reset all highlights
        this.container.selectAll('.metric-card')
            .style('border-color', 'rgba(200,220,240,0.6)');

        // Highlight specific metric
        let targetElement = null;
        switch (metricType) {
            case 'time':
                targetElement = this.timeDisplay.node().closest('.metric-card');
                break;
            case 'maxChange':
                targetElement = this.maxChangeDisplay.node().closest('.metric-card');
                break;
            case 'hamiltonian':
                targetElement = this.hamiltonianDisplay.node().closest('.metric-card');
                break;
        }

        if (targetElement) {
            d3.select(targetElement)
                .style('border-color', '#2196F3')
                .style('box-shadow', '0 0 0 2px rgba(33, 150, 243, 0.2)');
        }
    }

    /**
     * Get current statistics
     */
    getStats() {
        return this.stats;
    }

    /**
     * Reset statistics display
     */
    reset() {
        this.stats = new SimulationStats();
        this.render(this.stats);
    }
}