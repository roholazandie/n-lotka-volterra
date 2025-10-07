import Config from '../core/Config.js';
import { Node, Link } from '../data/DataContracts.js';

/**
 * StructureGraphView - Manages fixed ring layout visualization
 * Renders nodes in a circular arrangement with editable links
 */
export default class StructureGraphView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Dimensions
        this.width = Config.STRUCTURE_GRAPH.width;
        this.height = Config.STRUCTURE_GRAPH.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) * 0.35;
        
        // D3 components
        this.svg = null;
        this.g = null;
        this.linksGroup = null;
        this.nodesGroup = null;
        
        // Event callbacks
        this.onLinkClick = null;
        this.onNodeClick = null;
        
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
        
        // Main group (no margin needed for centered layout)
        this.g = this.svg.append('g');

        // Background with gradient
        this.g.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'url(#structureBgGradient)')
            .attr('stroke', Config.COLORS.border)
            .attr('rx', 8);

        // Groups for rendering order (links behind nodes)
        this.linksGroup = this.g.append('g').attr('class', 'links-group');
        this.nodesGroup = this.g.append('g').attr('class', 'nodes-group');

        console.log('[StructureGraphView] Initialized');
    }

    /**
     * Create background gradient
     */
    createBackgroundGradient() {
        const defs = this.svg.append('defs');

        const bgGradient = defs.append('radialGradient')
            .attr('id', 'structureBgGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '70%');

        bgGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(255, 255, 255, 0.08)');

        bgGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', 'rgba(200, 230, 255, 0.04)');

        bgGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(150, 200, 255, 0.02)');
    }

    /**
     * Set event callbacks
     */
    setCallbacks({ onLinkClick, onNodeClick }) {
        this.onLinkClick = onLinkClick;
        this.onNodeClick = onNodeClick;
    }

    /**
     * Calculate fixed positions for nodes in a ring
     */
    calculateRingPositions(nodeCount) {
        const positions = [];
        const angleStep = (2 * Math.PI) / nodeCount;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const x = this.centerX + this.radius * Math.cos(angle);
            const y = this.centerY + this.radius * Math.sin(angle);
            
            positions.push({ x, y, angle });
        }
        
        return positions;
    }

    /**
     * Render the structure graph with fixed ring layout
     */
    render(nodes, links, matrixData) {
        if (!nodes || nodes.length === 0) {
            this.clear();
            return;
        }

        // Calculate fixed positions
        const positions = this.calculateRingPositions(nodes.length);
        
        // Assign positions to nodes
        const positionedNodes = nodes.map((node, i) => ({
            ...node,
            x: positions[i].x,
            y: positions[i].y,
            fixed: true
        }));

        // Filter active links
        const activeLinks = links.filter(link => Math.abs(link.strength) > 0.001);

        // Render components
        this.renderLinks(activeLinks, positionedNodes);
        this.renderNodes(positionedNodes);
    }

    /**
     * Render links between nodes
     */
    renderLinks(links, nodes) {
        const linkSelection = this.linksGroup.selectAll('.struct-link')
            .data(links, d => `${d.source}-${d.target}`);

        // Remove old links
        linkSelection.exit().remove();

        // Add new links
        const linksEnter = linkSelection.enter()
            .append('path')
            .attr('class', 'struct-link')
            .style('fill', 'none')
            .style('stroke-width', 0)
            .style('cursor', 'pointer');

        // Merge and update
        const linksUpdate = linksEnter.merge(linkSelection);

        linksUpdate
            .attr('d', d => this.getLinkPath(d, nodes))
            .style('stroke', d => this.getLinkColor(d.strength))
            .style('stroke-width', d => this.getLinkWidth(d.strength))
            .style('opacity', 0.7)
            .style('stroke-dasharray', d => d.strength < 0 ? '5,5' : 'none')
            .on('mouseover', (event, d) => {
                // Highlight link
                d3.select(event.target)
                    .style('stroke-width', this.getLinkWidth(d.strength) + 2)
                    .style('opacity', 1);
                
                // Show link tooltip
                this.tooltip.showLink(d, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', (event, d) => {
                // Restore link
                d3.select(event.target)
                    .style('stroke-width', this.getLinkWidth(d.strength))
                    .style('opacity', 0.7);
                
                this.tooltip.hide();
            })
            .on('click', (event, d) => {
                if (this.onLinkClick) {
                    this.onLinkClick(d, event);
                }
            });
    }

    /**
     * Generate path for link (curved for better visibility)
     */
    getLinkPath(link, nodes) {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return '';

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3; // Curve factor

        return `M ${sourceNode.x},${sourceNode.y} A ${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
    }

    /**
     * Get link color based on strength
     */
    getLinkColor(strength) {
        if (strength > 0) {
            return Config.COLORS.links.positive;
        } else {
            return Config.COLORS.links.negative;
        }
    }

    /**
     * Get link width based on strength magnitude
     */
    getLinkWidth(strength) {
        const magnitude = Math.abs(strength);
        return Math.max(1, Math.min(8, magnitude * 5));
    }

    /**
     * Render nodes in fixed positions
     */
    renderNodes(nodes) {
        const nodeSelection = this.nodesGroup.selectAll('.struct-node')
            .data(nodes, d => d.id);

        // Remove old nodes
        nodeSelection.exit().remove();

        // Add new nodes
        const nodesEnter = nodeSelection.enter()
            .append('g')
            .attr('class', 'struct-node')
            .style('cursor', 'pointer');

        // Add node circles
        nodesEnter.append('circle')
            .attr('class', 'node-circle')
            .attr('r', Config.NODE.radius)
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // Add node labels
        nodesEnter.append('text')
            .attr('class', 'node-label')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#fff')
            .style('pointer-events', 'none');

        // Merge and update
        const nodesUpdate = nodesEnter.merge(nodeSelection);

        // Position nodes
        nodesUpdate
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Update node appearance
        nodesUpdate.select('.node-circle')
            .style('fill', d => Config.getSpeciesColor(d.id))
            .style('opacity', 0.8);

        // Update labels
        nodesUpdate.select('.node-label')
            .text(d => d.id + 1); // 1-based labeling

        // Add interactions
        nodesUpdate
            .on('mouseover', (event, d) => {
                // Highlight node
                d3.select(event.target.parentNode).select('.node-circle')
                    .attr('r', Config.NODE.radius + 3)
                    .style('opacity', 1);
                
                // Show node tooltip
                this.tooltip.showNode(d, event);
            })
            .on('mousemove', (event) => {
                this.tooltip.move(event);
            })
            .on('mouseout', (event, d) => {
                // Restore node
                d3.select(event.target.parentNode).select('.node-circle')
                    .attr('r', Config.NODE.radius)
                    .style('opacity', 0.8);
                
                this.tooltip.hide();
            })
            .on('click', (event, d) => {
                if (this.onNodeClick) {
                    this.onNodeClick(d, event);
                }
            });
    }

    /**
     * Highlight specific nodes and links
     */
    highlight(nodeIds = [], linkIds = []) {
        // Reset all highlights
        this.nodesGroup.selectAll('.struct-node')
            .style('opacity', 1);
        this.linksGroup.selectAll('.struct-link')
            .style('opacity', 0.7);

        // Dim non-highlighted elements if any highlights specified
        if (nodeIds.length > 0 || linkIds.length > 0) {
            this.nodesGroup.selectAll('.struct-node')
                .style('opacity', d => nodeIds.includes(d.id) ? 1 : 0.3);
            
            this.linksGroup.selectAll('.struct-link')
                .style('opacity', d => {
                    const linkId = `${d.source}-${d.target}`;
                    return linkIds.includes(linkId) ? 1 : 0.2;
                });
        }
    }

    /**
     * Clear the graph
     */
    clear() {
        this.linksGroup.selectAll('*').remove();
        this.nodesGroup.selectAll('*').remove();
    }

    /**
     * Get current dimensions
     */
    getDimensions() {
        return { 
            width: this.width, 
            height: this.height,
            centerX: this.centerX,
            centerY: this.centerY,
            radius: this.radius
        };
    }

    /**
     * Resize the view
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.radius = Math.min(width, height) * 0.35;
        
        this.svg.attr('width', width).attr('height', height);
        
        // Update background
        this.g.select('rect')
            .attr('width', width)
            .attr('height', height);
    }
}