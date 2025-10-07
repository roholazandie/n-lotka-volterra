import Config from '../core/Config.js';
import { EigenPair } from '../data/DataContracts.js';

/**
 * EigenBarChartView - Manages eigenvalue magnitude bar chart
 * Owns scales, axes, and bar rendering for eigenvalue magnitudes
 */
export default class EigenBarChartView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Dimensions
        this.width = Config.EIGEN_PLOT.width * 2; // Keep current layout
        this.height = Config.EIGEN_PLOT.height;
        this.margin = Config.EIGEN_PLOT.margin;
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
        this.barsGroup = null;
        
        this.init();
    }

    /**
     * Initialize the chart structure
     */
    init() {
        this.svg = this.root;
        
        // Clear any existing content
        this.svg.selectAll('*').remove();
        
        // Main group with margins
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Background
        this.g.append('rect')
            .attr('width', this.innerWidth)
            .attr('height', this.innerHeight)
            .attr('fill', Config.COLORS.background)
            .attr('stroke', Config.COLORS.border)
            .attr('rx', 8);

        // Create scales
        this.xScale = d3.scaleBand().range([0, this.innerWidth]).padding(0.2);
        this.yScale = d3.scaleLinear().range([this.innerHeight, 0]);

        // Create axes
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale).ticks(6);

        // Append axis groups
        this.xAxisG = this.g.append('g')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .attr('class', 'axis');

        this.yAxisG = this.g.append('g')
            .attr('class', 'axis');

        // Axis labels
        this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.height - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', Config.COLORS.text)
            .style('font-size', '12px')
            .text('Eigenvalue Index');

        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .attr('x', -(this.height / 2))
            .style('text-anchor', 'middle')
            .style('fill', Config.COLORS.text)
            .style('font-size', '12px')
            .text('|λ|');

        // Style axes
        this.styleAxes();

        // Bars group
        this.barsGroup = this.g.append('g').attr('class', 'bars');

        console.log('[EigenBarChartView] Initialized');
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
     * Render eigenvalue magnitudes
     */
    render(eigenPairs) {
        if (!eigenPairs || eigenPairs.length === 0) {
            this.clear();
            return;
        }

        // Create chart data
        const chartData = eigenPairs.map(eigenPair => ({
            index: eigenPair.index,
            magnitude: eigenPair.magnitude,
            eigenPair: eigenPair
        }));

        // Update domains
        this.updateDomains(chartData);

        // Update axes
        this.xAxisG.call(this.xAxis);
        this.yAxisG.call(this.yAxis);
        this.styleAxes();

        // Render bars
        this.renderBars(chartData);
    }

    /**
     * Update scale domains
     */
    updateDomains(chartData) {
        // X domain: eigenvalue indices
        this.xScale.domain(chartData.map(d => d.index));

        // Y domain: magnitude range with padding
        const maxMagnitude = d3.max(chartData, d => d.magnitude) || 1;
        this.yScale.domain([0, maxMagnitude * 1.1]);
    }

    /**
     * Render bars
     */
    renderBars(chartData) {
        const bars = this.barsGroup.selectAll('.eigen-bar')
            .data(chartData, d => d.index);

        // Remove old bars
        bars.exit().remove();

        // Add new bars
        const barsEnter = bars.enter()
            .append('rect')
            .attr('class', 'eigen-bar')
            .style('cursor', 'pointer')
            .attr('rx', 4);

        // Merge and update
        const barsUpdate = barsEnter.merge(bars);

        barsUpdate
            .transition()
            .duration(300)
            .attr('x', d => this.xScale(d.index))
            .attr('y', d => this.yScale(d.magnitude))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d => this.innerHeight - this.yScale(d.magnitude))
            .attr('fill', (d, i) => this.getBarColor(i, chartData.length))
            .attr('opacity', 0.8);

        // Add interactions
        barsUpdate
            .on('mouseover', (event, d) => {
                // Highlight bar
                d3.select(event.target)
                    .attr('opacity', 1)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
                
                // Show eigenvalue tooltip
                this.tooltip.showEigenvalue(d.eigenPair, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', (event) => {
                // Restore bar
                d3.select(event.target)
                    .attr('opacity', 0.8)
                    .attr('stroke', 'none');
                
                this.tooltip.hide();
            });
    }

    /**
     * Get color for eigenvalue bar
     */
    getBarColor(index, total) {
        const gradient = Config.COLORS.eigenBarGradient;
        const t = total > 1 ? index / (total - 1) : 0;
        
        const r = Math.floor(gradient.start.r + (gradient.end.r - gradient.start.r) * t);
        const g = Math.floor(gradient.start.g + (gradient.end.g - gradient.start.g) * t);
        const b = Math.floor(gradient.start.b + (gradient.end.b - gradient.start.b) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Clear the chart
     */
    clear() {
        this.barsGroup.selectAll('*').remove();
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
            
        this.xAxisG.attr('transform', `translate(0,${this.innerHeight})`);
    }
}