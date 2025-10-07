import Config from '../core/Config.js';
import { Link } from '../data/DataContracts.js';

/**
 * NetworkGraphView - Manages the main dynamic simulation visualization
 * Owns its SVG and d3 selections, handles nodes/links rendering and interactions
 */
export default class NetworkGraphView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        this.width = Config.CANVAS.width;
        this.height = Config.CANVAS.height;
        
        // D3 selections
        this.svg = null;
        this.nodeGroup = null;
        this.linkGroup = null;
        
        // Drag behavior
        this.drag = null;
        
        this.init();
    }

    /**
     * Initialize SVG structure
     */
    init() {
        this.svg = this.root;
        
        // Clear any existing content
        this.svg.selectAll('*').remove();
        
        // Create main groups (links first so they appear behind nodes)
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        
        console.log('[NetworkGraphView] Initialized with dimensions:', this.width, 'x', this.height);
    }

    /**
     * Set drag behavior (from simulation)
     */
    setDrag(dragBehavior) {
        this.drag = dragBehavior;
    }

    /**
     * Render nodes and links
     */
    render(nodes, links, populations, extinct) {
        this.renderLinks(links);
        this.renderNodes(nodes, populations, extinct);
    }

    /**
     * Render links/edges
     */
    renderLinks(links) {
        const linkSelection = this.linkGroup.selectAll('.link')
            .data(links, d => `${d.sourceIndex}-${d.targetIndex}`);

        // Remove old links
        linkSelection.exit().remove();

        // Add new links
        const linkEnter = linkSelection.enter()
            .append('path')
            .attr('class', 'link')
            .style('fill', 'none')
            .style('stroke-width', d => Math.abs(d.value) * 3 + 1)
            .style('opacity', 0.7)
            .style('cursor', 'pointer');

        // Merge and update
        const linkUpdate = linkEnter.merge(linkSelection);

        linkUpdate
            .style('stroke', d => d.value > 0 ? Config.COLORS.linkPositive : Config.COLORS.linkNegative)
            .style('stroke-width', d => Math.abs(d.value) * 3 + 1)
            .attr('d', d => this.linkArc(d))
            .on('mouseover', (event, d) => {
                this.tooltip.showLink(d, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', () => {
                this.tooltip.hide();
            });
    }

    /**
     * Render nodes
     */
    renderNodes(nodes, populations, extinct) {
        const nodeSelection = this.nodeGroup.selectAll('.node')
            .data(nodes, d => d.id);

        // Remove old nodes
        nodeSelection.exit().remove();

        // Add new nodes
        const nodeEnter = nodeSelection.enter()
            .append('circle')
            .attr('class', 'node')
            .style('cursor', 'grab')
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // Apply drag if available
        if (this.drag) {
            nodeEnter.call(this.drag);
        }

        // Merge and update
        const nodeUpdate = nodeEnter.merge(nodeSelection);

        nodeUpdate
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => {
                const pop = populations[d.id];
                const baseRadius = Config.NODE.minRadius;
                const maxRadius = Config.NODE.maxRadius;
                const radius = extinct[d.id] ? baseRadius : baseRadius + (pop * (maxRadius - baseRadius));
                return Math.max(baseRadius, Math.min(maxRadius, radius));
            })
            .style('fill', d => {
                if (extinct[d.id]) return Config.COLORS.nodeExtinct;
                const pop = populations[d.id];
                return pop > 0 ? Config.COLORS.nodePositive : Config.COLORS.nodeNegative;
            })
            .style('opacity', d => extinct[d.id] ? 0.3 : 0.8)
            .on('mouseover', (event, d) => {
                this.tooltip.showNode(d.id, populations[d.id], extinct[d.id], event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', () => {
                this.tooltip.hide();
            });
    }

    /**
     * Update positions during animation tick
     */
    updateOnTick() {
        // Update node positions
        this.nodeGroup.selectAll('.node')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        // Update link paths
        this.linkGroup.selectAll('.link')
            .attr('d', d => this.linkArc(d));
    }

    /**
     * Calculate arc path for links
     */
    linkArc(d) {
        if (!d.source || !d.target) return '';
        
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        // Create slight curve for better visibility
        const sweep = dr > 0 ? 1 : 0;
        const arc = dr * 0.3; // Curve amount
        
        return `M${d.source.x},${d.source.y}A${arc},${arc} 0 0,${sweep} ${d.target.x},${d.target.y}`;
    }

    /**
     * Get current dimensions
     */
    getDimensions() {
        return { width: this.width, height: this.height };
    }

    /**
     * Resize the view
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
    }

    /**
     * Clear the visualization
     */
    clear() {
        this.nodeGroup.selectAll('*').remove();
        this.linkGroup.selectAll('*').remove();
    }
}