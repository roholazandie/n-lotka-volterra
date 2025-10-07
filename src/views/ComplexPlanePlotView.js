import Config from '../core/Config.js';
import { EigenPair } from '../data/DataContracts.js';

/**
 * ComplexPlanePlotView - Manages eigenvalue complex plane visualization
 * Renders eigenvalues as points and rays in the complex plane
 */
export default class ComplexPlanePlotView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Dimensions
        this.width = Config.COMPLEX_PLOT.width * 2; // Keep current layout
        this.height = Config.COMPLEX_PLOT.height + 200; // Keep current layout
        this.margin = Config.COMPLEX_PLOT.margin;
        this.innerWidth = this.width - this.margin.left - this.margin.right;
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;
        
        // D3 components
        this.svg = null;
        this.g = null;
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;
        this.xAxisG = null;
        this.yAxisG = null;
        this.eigenLinesGroup = null;
        this.eigenPointsGroup = null;
        this.zeroLineVertical = null;
        this.zeroLineHorizontal = null;
        
        this.init();
    }

    /**
     * Initialize the plot structure
     */
    init() {
        this.svg = this.root;
        
        // Clear any existing content
        this.svg.selectAll('*').remove();
        
        // Add background gradient
        this.createBackgroundGradient();
        
        // Main group with margins
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Background with gradient
        this.g.append('rect')
            .attr('width', this.innerWidth)
            .attr('height', this.innerHeight)
            .attr('fill', 'url(#complexBgGradient)')
            .attr('stroke', Config.COLORS.border)
            .attr('rx', 8);

        // Create scales
        this.xScale = d3.scaleLinear().range([0, this.innerWidth]);
        this.yScale = d3.scaleLinear().range([this.innerHeight, 0]);

        // Create axes
        this.xAxis = d3.axisBottom(this.xScale).ticks(8);
        this.yAxis = d3.axisLeft(this.yScale).ticks(8);

        // Append axis groups (will be positioned at center)
        this.xAxisG = this.g.append('g').attr('class', 'axis axis-center');
        this.yAxisG = this.g.append('g').attr('class', 'axis axis-center');

        // Zero lines (center axes)
        this.zeroLineVertical = this.g.append('line')
            .attr('class', 'zero-line')
            .style('stroke', Config.COLORS.centerLine)
            .style('stroke-width', 2);

        this.zeroLineHorizontal = this.g.append('line')
            .attr('class', 'zero-line')
            .style('stroke', Config.COLORS.centerLine)
            .style('stroke-width', 2);

        // Axis labels
        this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.height - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', Config.COLORS.text)
            .style('font-size', '12px')
            .text('Real(λ)');

        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .attr('x', -(this.height / 2))
            .style('text-anchor', 'middle')
            .style('fill', Config.COLORS.text)
            .style('font-size', '12px')
            .text('Imag(λ)');

        // Style axes
        this.styleAxes();

        // Groups for eigenvalue visualization
        this.eigenLinesGroup = this.g.append('g').attr('class', 'eigen-lines');
        this.eigenPointsGroup = this.g.append('g').attr('class', 'eigen-points');

        console.log('[ComplexPlanePlotView] Initialized');
    }

    /**
     * Create background gradient
     */
    createBackgroundGradient() {
        const defs = this.svg.append('defs');

        const bgGradient = defs.append('linearGradient')
            .attr('id', 'complexBgGradient')
            .attr('x1', '0%')
            .attr('x2', '100%');

        bgGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(100, 150, 255, 0.05)');

        bgGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', 'rgba(255, 255, 255, 0.02)');

        bgGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(255, 100, 100, 0.05)');
    }

    /**
     * Style axis elements
     */
    styleAxes() {
        this.svg.selectAll('.axis path, .axis line')
            .style('stroke', Config.COLORS.axis);

        this.svg.selectAll('.axis text')
            .style('fill', Config.COLORS.text)
            .style('font-size', '11px');
    }

    /**
     * Render eigenvalue pairs in complex plane
     */
    render(eigenPairs) {
        if (!eigenPairs || eigenPairs.length === 0) {
            this.clear();
            return;
        }

        // Calculate symmetric domain
        const plotRange = this.calculatePlotRange(eigenPairs);
        this.updateDomains(plotRange);

        // Update axes (centered at origin)
        this.updateAxes();

        // Render eigenvalue lines and points
        this.renderEigenLines(eigenPairs);
        this.renderEigenPoints(eigenPairs);
    }

    /**
     * Calculate plot range for symmetric domain
     */
    calculatePlotRange(eigenPairs) {
        const realValues = eigenPairs.map(e => e.real);
        const imagValues = eigenPairs.map(e => e.imag);
        
        const maxReal = Math.max(...realValues.map(Math.abs));
        const maxImag = Math.max(...imagValues.map(Math.abs));
        
        const maxRange = Math.max(maxReal, maxImag) * 1.1 || 1;
        
        return maxRange;
    }

    /**
     * Update scale domains (symmetric around origin)
     */
    updateDomains(plotRange) {
        this.xScale.domain([-plotRange, plotRange]);
        this.yScale.domain([-plotRange, plotRange]);
    }

    /**
     * Update axes (positioned at center)
     */
    updateAxes() {
        const zeroX = this.xScale(0);
        const zeroY = this.yScale(0);

        // Position axes at center (0, 0)
        this.xAxisG
            .attr('transform', `translate(0,${zeroY})`)
            .call(this.xAxis);

        this.yAxisG
            .attr('transform', `translate(${zeroX},0)`)
            .call(this.yAxis);

        // Update zero lines (reinforcing the center axes)
        this.zeroLineVertical
            .attr('x1', zeroX)
            .attr('x2', zeroX)
            .attr('y1', 0)
            .attr('y2', this.innerHeight);

        this.zeroLineHorizontal
            .attr('x1', 0)
            .attr('x2', this.innerWidth)
            .attr('y1', zeroY)
            .attr('y2', zeroY);

        this.styleAxes();
    }

    /**
     * Render lines from origin to eigenvalues
     */
    renderEigenLines(eigenPairs) {
        const lines = this.eigenLinesGroup.selectAll('.eigen-line')
            .data(eigenPairs, d => d.index);

        // Remove old lines
        lines.exit().remove();

        // Add new lines
        const linesEnter = lines.enter()
            .append('line')
            .attr('class', 'eigen-line')
            .style('stroke-width', 2)
            .style('opacity', 0.6);

        // Merge and update
        const linesUpdate = linesEnter.merge(lines);

        linesUpdate
            .attr('x1', this.xScale(0))
            .attr('y1', this.yScale(0))
            .attr('x2', d => this.xScale(d.real))
            .attr('y2', d => this.yScale(d.imag))
            .style('stroke', (d, i) => this.getEigenColor(i));
    }

    /**
     * Render eigenvalue points
     */
    renderEigenPoints(eigenPairs) {
        const points = this.eigenPointsGroup.selectAll('.eigen-point')
            .data(eigenPairs, d => d.index);

        // Remove old points
        points.exit().remove();

        // Add new points
        const pointsEnter = points.enter()
            .append('circle')
            .attr('class', 'eigen-point')
            .attr('r', 6)
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('cursor', 'pointer');

        // Merge and update
        const pointsUpdate = pointsEnter.merge(points);

        pointsUpdate
            .attr('cx', d => this.xScale(d.real))
            .attr('cy', d => this.yScale(d.imag))
            .style('fill', (d, i) => this.getEigenColor(i))
            .style('opacity', 0.8)
            .on('mouseover', (event, d) => {
                // Highlight point
                d3.select(event.target)
                    .attr('r', 8)
                    .style('opacity', 1);
                
                // Show eigenvalue tooltip
                this.tooltip.showEigenvalue(d, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', (event) => {
                // Restore point
                d3.select(event.target)
                    .attr('r', 6)
                    .style('opacity', 0.8);
                
                this.tooltip.hide();
            });
    }

    /**
     * Get color for eigenvalue based on index
     */
    getEigenColor(index) {
        const colors = [
            '#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
            '#bb8fce', '#85c1e9'
        ];
        return colors[index % colors.length];
    }

    /**
     * Clear the plot
     */
    clear() {
        this.eigenLinesGroup.selectAll('*').remove();
        this.eigenPointsGroup.selectAll('*').remove();
    }

    /**
     * Get current dimensions
     */
    getDimensions() {
        return { 
            width: this.width, 
            height: this.height,
            innerWidth: this.innerWidth,
            innerHeight: this.innerHeight 
        };
    }

    /**
     * Resize the view
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.innerWidth = width - this.margin.left - this.margin.right;
        this.innerHeight = height - this.margin.top - this.margin.bottom;
        
        this.svg.attr('width', width).attr('height', height);
        
        // Update scales and re-render
        this.xScale.range([0, this.innerWidth]);
        this.yScale.range([this.innerHeight, 0]);
        
        // Re-position and update components
        this.g.select('rect')
            .attr('width', this.innerWidth)
            .attr('height', this.innerHeight);
    }
}