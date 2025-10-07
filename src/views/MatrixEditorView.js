import Config from '../core/Config.js';

/**
 * MatrixEditorView - Manages editable matrix table interface
 * Provides interactive editing of interaction matrix values
 */
export default class MatrixEditorView {
    constructor(rootSelection, tooltipService) {
        this.root = rootSelection;
        this.tooltip = tooltipService;
        
        // Table properties
        this.matrix = null;
        this.n = 0;
        
        // DOM elements
        this.container = null;
        this.table = null;
        this.tbody = null;
        
        // Event callbacks
        this.onMatrixChange = null;
        this.onCellFocus = null;
        
        this.init();
    }

    /**
     * Initialize the matrix editor
     */
    init() {
        // Clear any existing content
        this.root.selectAll('*').remove();
        
        // Create container div
        this.container = this.root.append('div')
            .attr('class', 'matrix-editor-container')
            .style('width', '100%')
            .style('height', '100%')
            .style('overflow', 'auto')
            .style('padding', '10px')
            .style('box-sizing', 'border-box');

        // Add title
        this.container.append('h4')
            .style('margin', '0 0 10px 0')
            .style('color', Config.COLORS.text)
            .style('font-size', '14px')
            .text('Interaction Matrix');

        // Create table
        this.table = this.container.append('table')
            .attr('class', 'matrix-table')
            .style('width', '100%')
            .style('border-collapse', 'collapse')
            .style('margin', '0')
            .style('background', 'rgba(255, 255, 255, 0.9)')
            .style('border-radius', '8px')
            .style('overflow', 'hidden')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');

        // Table header
        this.thead = this.table.append('thead');
        
        // Table body
        this.tbody = this.table.append('tbody');

        console.log('[MatrixEditorView] Initialized');
    }

    /**
     * Set event callbacks
     */
    setCallbacks({ onMatrixChange, onCellFocus }) {
        this.onMatrixChange = onMatrixChange;
        this.onCellFocus = onCellFocus;
    }

    /**
     * Render the matrix editor table
     */
    render(matrix) {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
            this.clear();
            return;
        }

        this.matrix = matrix;
        this.n = matrix.length;

        this.renderHeader();
        this.renderBody();
    }

    /**
     * Render table header with species labels
     */
    renderHeader() {
        // Clear existing header
        this.thead.selectAll('*').remove();

        const headerRow = this.thead.append('tr');

        // Empty corner cell
        headerRow.append('th')
            .style('width', '60px')
            .style('height', '35px')
            .style('background', Config.COLORS.header)
            .style('border', '1px solid #ddd')
            .style('text-align', 'center')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('color', '#666');

        // Column headers (target species)
        for (let j = 0; j < this.n; j++) {
            headerRow.append('th')
                .style('width', '60px')
                .style('height', '35px')
                .style('background', Config.getSpeciesColor(j))
                .style('border', '1px solid #ddd')
                .style('text-align', 'center')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('color', '#fff')
                .style('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)')
                .text(`S${j + 1}`)
                .attr('title', `Target Species ${j + 1}`);
        }
    }

    /**
     * Render table body with editable cells
     */
    renderBody() {
        // Clear existing body
        this.tbody.selectAll('*').remove();

        // Create rows
        for (let i = 0; i < this.n; i++) {
            const row = this.tbody.append('tr')
                .attr('data-source', i);

            // Row header (source species)
            row.append('td')
                .style('width', '60px')
                .style('height', '35px')
                .style('background', Config.getSpeciesColor(i))
                .style('border', '1px solid #ddd')
                .style('text-align', 'center')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('color', '#fff')
                .style('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)')
                .text(`S${i + 1}`)
                .attr('title', `Source Species ${i + 1}`);

            // Editable cells
            for (let j = 0; j < this.n; j++) {
                const cell = row.append('td')
                    .style('width', '60px')
                    .style('height', '35px')
                    .style('border', '1px solid #ddd')
                    .style('padding', '0')
                    .style('position', 'relative');

                const input = cell.append('input')
                    .attr('type', 'number')
                    .attr('step', '0.01')
                    .attr('data-row', i)
                    .attr('data-col', j)
                    .style('width', '100%')
                    .style('height', '100%')
                    .style('border', 'none')
                    .style('outline', 'none')
                    .style('text-align', 'center')
                    .style('font-size', '11px')
                    .style('background', this.getCellBackground(i, j))
                    .style('color', this.getCellTextColor(this.matrix[i][j]))
                    .property('value', this.formatValue(this.matrix[i][j]))
                    .on('input', (event) => this.handleCellInput(event, i, j))
                    .on('focus', (event) => this.handleCellFocus(event, i, j))
                    .on('blur', (event) => this.handleCellBlur(event, i, j))
                    .on('keydown', (event) => this.handleKeydown(event, i, j));

                // Add visual indicators for special cells
                if (i === j) {
                    // Diagonal cell indicator
                    cell.append('div')
                        .style('position', 'absolute')
                        .style('top', '2px')
                        .style('right', '2px')
                        .style('width', '6px')
                        .style('height', '6px')
                        .style('background', '#666')
                        .style('border-radius', '50%')
                        .style('opacity', '0.6')
                        .attr('title', 'Self-interaction (diagonal)');
                }
            }
        }
    }

    /**
     * Get background color for cell based on position and value
     */
    getCellBackground(i, j) {
        if (i === j) {
            return 'rgba(100, 100, 100, 0.1)'; // Diagonal cells
        }
        
        const value = this.matrix[i][j];
        if (Math.abs(value) < 0.001) {
            return 'rgba(255, 255, 255, 0.9)'; // Zero values
        } else if (value > 0) {
            return 'rgba(76, 175, 80, 0.1)'; // Positive values
        } else {
            return 'rgba(244, 67, 54, 0.1)'; // Negative values
        }
    }

    /**
     * Get text color based on value magnitude
     */
    getCellTextColor(value) {
        if (Math.abs(value) < 0.001) {
            return '#999';
        } else if (Math.abs(value) > 1) {
            return '#000';
        } else {
            return '#333';
        }
    }

    /**
     * Format numerical value for display
     */
    formatValue(value) {
        if (Math.abs(value) < 0.001) {
            return '0';
        }
        return value.toFixed(3);
    }

    /**
     * Handle cell input changes
     */
    handleCellInput(event, i, j) {
        const value = parseFloat(event.target.value) || 0;
        
        // Update matrix
        this.matrix[i][j] = value;
        
        // Update cell appearance
        const cell = event.target.parentNode;
        event.target.style.background = this.getCellBackground(i, j);
        event.target.style.color = this.getCellTextColor(value);
        
        // Trigger change callback
        if (this.onMatrixChange) {
            this.onMatrixChange(this.matrix, i, j, value);
        }
    }

    /**
     * Handle cell focus
     */
    handleCellFocus(event, i, j) {
        // Highlight cell
        event.target.style.boxShadow = '0 0 0 2px #2196F3';
        event.target.select();
        
        // Trigger focus callback
        if (this.onCellFocus) {
            this.onCellFocus(i, j, this.matrix[i][j]);
        }
    }

    /**
     * Handle cell blur
     */
    handleCellBlur(event, i, j) {
        // Remove highlight
        event.target.style.boxShadow = 'none';
        
        // Ensure proper formatting
        const value = parseFloat(event.target.value) || 0;
        event.target.value = this.formatValue(value);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(event, i, j) {
        const { key } = event;
        let newI = i, newJ = j;
        
        switch (key) {
            case 'ArrowUp':
                newI = Math.max(0, i - 1);
                break;
            case 'ArrowDown':
                newI = Math.min(this.n - 1, i + 1);
                break;
            case 'ArrowLeft':
                newJ = Math.max(0, j - 1);
                break;
            case 'ArrowRight':
                newJ = Math.min(this.n - 1, j + 1);
                break;
            case 'Enter':
                newI = i + 1 < this.n ? i + 1 : 0;
                if (newI === 0) newJ = j + 1 < this.n ? j + 1 : 0;
                break;
            case 'Tab':
                if (event.shiftKey) {
                    newJ = j - 1 >= 0 ? j - 1 : this.n - 1;
                    if (j === 0) newI = i - 1 >= 0 ? i - 1 : this.n - 1;
                } else {
                    newJ = j + 1 < this.n ? j + 1 : 0;
                    if (j === this.n - 1) newI = i + 1 < this.n ? i + 1 : 0;
                }
                break;
            default:
                return; // Don't prevent default for other keys
        }
        
        if (newI !== i || newJ !== j) {
            event.preventDefault();
            this.focusCell(newI, newJ);
        }
    }

    /**
     * Focus specific cell
     */
    focusCell(i, j) {
        const input = this.tbody
            .select(`input[data-row="${i}"][data-col="${j}"]`)
            .node();
        
        if (input) {
            input.focus();
            input.select();
        }
    }

    /**
     * Highlight cells related to specific interaction
     */
    highlightInteraction(sourceId, targetId) {
        // Reset all highlights
        this.tbody.selectAll('input')
            .style('box-shadow', 'none');
        
        if (sourceId !== null && targetId !== null) {
            // Highlight specific cell
            this.tbody.select(`input[data-row="${sourceId}"][data-col="${targetId}"]`)
                .style('box-shadow', '0 0 0 3px #FF9800');
        }
    }

    /**
     * Update matrix values programmatically
     */
    updateMatrix(matrix) {
        this.matrix = matrix;
        
        // Update all input values
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const input = this.tbody
                    .select(`input[data-row="${i}"][data-col="${j}"]`)
                    .node();
                
                if (input) {
                    const value = matrix[i][j];
                    input.value = this.formatValue(value);
                    input.style.background = this.getCellBackground(i, j);
                    input.style.color = this.getCellTextColor(value);
                }
            }
        }
    }

    /**
     * Clear the editor
     */
    clear() {
        this.tbody.selectAll('*').remove();
        this.thead.selectAll('*').remove();
    }

    /**
     * Get current matrix data
     */
    getMatrix() {
        return this.matrix;
    }

    /**
     * Validate matrix data
     */
    validateMatrix() {
        const errors = [];
        
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const value = this.matrix[i][j];
                if (isNaN(value) || !isFinite(value)) {
                    errors.push(`Invalid value at (${i}, ${j}): ${value}`);
                }
            }
        }
        
        return errors;
    }
}