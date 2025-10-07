import Config from '../core/Config.js';

/**
 * TooltipService - Manages the shared tooltip element
 * Provides show/hide/move functionality for all views
 */
export default class TooltipService {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    /**
     * Initialize tooltip element
     */
    init() {
        this.tooltip = d3.select(Config.SELECTORS.tooltip);
        if (this.tooltip.empty()) {
            console.warn('Tooltip element not found:', Config.SELECTORS.tooltip);
            // Create fallback tooltip
            this.tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('display', 'none')
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.9)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '6px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('z-index', '1000')
                .style('border', '1px solid rgba(255, 255, 255, 0.2)');
        }
    }

    /**
     * Show tooltip at position with content
     */
    show(content, event) {
        if (!this.tooltip) return;
        
        this.tooltip
            .style('display', 'block')
            .html(content)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    /**
     * Update tooltip position
     */
    move(event) {
        if (!this.tooltip) return;
        
        this.tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    /**
     * Hide tooltip
     */
    hide() {
        if (!this.tooltip) return;
        
        this.tooltip.style('display', 'none');
    }

    /**
     * Show tooltip for eigenvalue
     */
    showEigenvalue(eigenPair, event) {
        const content = `
            <div>λ${eigenPair.index}</div>
            <div>Real: ${Config.formatNumber(eigenPair.real)}</div>
            <div>Imag: ${Config.formatNumber(eigenPair.imag)}</div>
            <div>|λ|: ${Config.formatNumber(eigenPair.magnitude)}</div>
        `;
        this.show(content, event);
    }

    /**
     * Show tooltip for matrix link
     */
    showLink(link, event) {
        const content = `
            <div>Link: ${link.sourceIndex} → ${link.targetIndex}</div>
            <div>Value: ${Config.formatNumber(link.value)}</div>
        `;
        this.show(content, event);
    }

    /**
     * Show tooltip for node
     */
    showNode(nodeId, population, extinct, event) {
        const status = extinct ? 'Extinct' : 'Active';
        const content = `
            <div>Node ${nodeId + 1}</div>
            <div>Population: ${Config.formatNumber(population)}</div>
            <div>Status: ${status}</div>
        `;
        this.show(content, event);
    }

    /**
     * Show tooltip for time series
     */
    showTimeSeries(nodeId, timePoint, event) {
        const content = `
            <div>Species ${nodeId + 1}</div>
            <div>Time: ${Config.formatNumber(timePoint.time)}</div>
            <div>Population: ${Config.formatNumber(timePoint.value)}</div>
        `;
        this.show(content, event);
    }
}