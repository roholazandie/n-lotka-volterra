import Config from '../core/Config.js';
import { TimePoint } from '../data/DataContracts.js';

/**
 * TimeSeriesPlotView - Manages the time evolution plot
 * Owns scales, axes, and line rendering for population time series
 */
export default class TimeSeriesPlotView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Dimensions
        this.width = Config.TIME_PLOT.width;
        this.height = Config.TIME_PLOT.height;
        this.margin = Config.TIME_PLOT.margin;
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
        this.linesGroup = null;
        this.line = null;
        
        this.init();
    }

    /**
     * Initialize the plot structure
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
            .attr('fill', 'rgba(255, 255, 255, 0.02)')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('rx', 8);

        // Create scales
        this.xScale = d3.scaleLinear().range([0, this.innerWidth]);
        this.yScale = d3.scaleLinear().range([this.innerHeight, 0]);

        // Create axes
        this.xAxis = d3.axisBottom(this.xScale).ticks(8);
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
            .style('fill', '#888')
            .style('font-size', '12px')
            .text('Time');

        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .attr('x', -(this.height / 2))
            .style('text-anchor', 'middle')
            .style('fill', '#888')
            .style('font-size', '12px')
            .text('Population (xi)');

        // Style axes
        this.styleAxes();

        // Lines group
        this.linesGroup = this.g.append('g').attr('class', 'lines');

        // Line generator
        this.line = d3.line()
            .x(d => this.xScale(d.time))
            .y(d => this.yScale(d.value))
            .curve(d3.curveLinear);

        console.log('[TimeSeriesPlotView] Initialized');
    }

    /**
     * Style axis elements
     */
    styleAxes() {
        this.svg.selectAll('.axis path, .axis line')
            .style('stroke', 'rgba(255, 255, 255, 0.2)');

        this.svg.selectAll('.axis text')
            .style('fill', '#888')
            .style('font-size', '11px');
    }

    /**
     * Render time series data
     */
    render(history, extinct) {
        if (!history || history.length === 0) {
            this.clear();
            return;
        }

        // Calculate domains
        this.updateDomains(history);

        // Update axes
        this.xAxisG.call(this.xAxis);
        this.yAxisG.call(this.yAxis);
        this.styleAxes();

        // Render lines for each species
        this.renderLines(history, extinct);
    }

    /**
     * Update scale domains based on data
     */
    updateDomains(history) {
        // Time domain
        const allTimes = history.flat().map(d => d.time);
        const timeExtent = d3.extent(allTimes);
        this.xScale.domain(timeExtent);

        // Population domain
        const allValues = history.flat().map(d => d.value);
        const valueExtent = d3.extent(allValues);
        // Add some padding
        const padding = (valueExtent[1] - valueExtent[0]) * 0.1;
        this.yScale.domain([
            Math.min(0, valueExtent[0] - padding),
            valueExtent[1] + padding
        ]);
    }

    /**
     * Render lines for each species
     */
    renderLines(history, extinct) {
        const lineData = history.map((seriesData, i) => ({
            id: i,
            data: seriesData,
            extinct: extinct[i]
        }));

        const lines = this.linesGroup.selectAll('.time-series-line')
            .data(lineData, d => d.id);

        // Remove old lines
        lines.exit().remove();

        // Add new lines
        const linesEnter = lines.enter()
            .append('path')
            .attr('class', 'time-series-line')
            .style('fill', 'none')
            .style('stroke-width', 2)
            .style('cursor', 'pointer');

        // Merge and update
        const linesUpdate = linesEnter.merge(lines);

        linesUpdate
            .attr('d', d => this.line(d.data))
            .style('stroke', (d, i) => Config.getSpeciesColor(i))
            .style('opacity', d => d.extinct ? 0.3 : 0.8)
            .style('stroke-dasharray', d => d.extinct ? '5,5' : 'none')
            .on('mouseover', (event, d) => {
                // Highlight line
                d3.select(event.target)
                    .style('stroke-width', 3)
                    .style('opacity', 1);
                
                // Show species info
                this.tooltip.show(`Species ${d.id + 1}`, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', (event, d) => {
                // Restore line
                d3.select(event.target)
                    .style('stroke-width', 2)
                    .style('opacity', d.extinct ? 0.3 : 0.8);
                
                this.tooltip.hide();
            });

        // Add hover dots for data points
        this.addHoverDots(history, extinct);
    }

    /**
     * Add invisible dots for better hover interaction
     */
    addHoverDots(history, extinct) {
        // Remove old dots
        this.g.selectAll('.hover-dot').remove();

        // Add dots for recent points only (performance)
        const maxDotsPerSeries = 50;
        
        history.forEach((seriesData, seriesIndex) => {
            const recentData = seriesData.slice(-maxDotsPerSeries);
            
            this.g.selectAll(`.hover-dots-${seriesIndex}`)
                .data(recentData)
                .enter()
                .append('circle')
                .attr('class', `hover-dot hover-dots-${seriesIndex}`)
                .attr('cx', d => this.xScale(d.time))
                .attr('cy', d => this.yScale(d.value))
                .attr('r', 4)
                .style('fill', 'transparent')
                .style('cursor', 'crosshair')
                .on('mouseover', (event, d) => {
                    this.tooltip.showTimeSeries(seriesIndex, d, event);
                })
                .on('mousemove', (event) => {
                    this.tooltip.move(event);
                })
                .on('mouseout', () => {
                    this.tooltip.hide();
                });
        });
    }

    /**
     * Clear the plot
     */
    clear() {
        this.linesGroup.selectAll('*').remove();
        this.g.selectAll('.hover-dot').remove();
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