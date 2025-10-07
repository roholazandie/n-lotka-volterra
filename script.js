// Import refactored classes using dynamic imports to avoid potential circular dependency issues
console.log('[DEBUG] Script started loading...');

console.log('[DEBUG] Starting dynamic module imports...');

// Use dynamic imports to load modules
Promise.all([
    import('./src/core/Config.js'),
    import('./src/core/EventBus.js'),
    import('./src/core/AppState.js'),
    import('./src/math/MatrixModel.js'),
    import('./src/math/DynamicsEngine.js'),
    import('./src/math/JacobianAndEigen.js'),
    import('./src/math/CycleAnalyzer.js')
]).then(([
    ConfigModule,
    EventBusModule, 
    AppStateModule,
    MatrixModelModule,
    DynamicsEngineModule,
    JacobianAndEigenModule,
    CycleAnalyzerModule
]) => {
    console.log('[DEBUG] All modules imported successfully');
    
    // Extract classes from modules
    const Config = ConfigModule.default;
    const EventBus = EventBusModule.default;
    const AppState = AppStateModule.default;
    const MatrixModel = MatrixModelModule.default;
    const DynamicsEngine = DynamicsEngineModule.default;
    const JacobianAndEigen = JacobianAndEigenModule.default;
    const CycleAnalyzer = CycleAnalyzerModule.default;
    
    console.log('[DEBUG] Classes extracted from modules');

    // Initialize global application components
    console.log('[DEBUG] Initializing components...');
    const eventBus = new EventBus();
    console.log('[DEBUG] EventBus created');
    const appState = new AppState(eventBus);
    console.log('[DEBUG] AppState created');
    const matrixModel = new MatrixModel();
    console.log('[DEBUG] MatrixModel created');
    const dynamicsEngine = new DynamicsEngine();
    console.log('[DEBUG] DynamicsEngine created');
    const jacobianAndEigen = new JacobianAndEigen();
    console.log('[DEBUG] JacobianAndEigen created');
    const cycleAnalyzer = new CycleAnalyzer();
    console.log('[DEBUG] CycleAnalyzer created');
    console.log('[DEBUG] All components initialized successfully');

    // Make components globally available
    window.Config = Config;
    window.eventBus = eventBus;
    window.appState = appState;
    window.matrixModel = matrixModel;
    window.dynamicsEngine = dynamicsEngine;
    window.jacobianAndEigen = jacobianAndEigen;
    window.cycleAnalyzer = cycleAnalyzer;
    
    console.log('[DEBUG] Components made globally available');
    
    // Continue with the rest of the script initialization
    initializeApplication();
    
}).catch(error => {
    console.error('[ERROR] Failed to load modules:', error);
    console.error('[ERROR] Stack:', error.stack);
});

// Move the rest of the application code into a function
function initializeApplication() {
    console.log('[DEBUG] Starting application initialization...');

// Check if D3.js is available
console.log('[DEBUG] Checking D3.js availability...');
console.log('[DEBUG] typeof d3:', typeof d3);
if (typeof d3 === 'undefined') {
    console.error('[ERROR] D3.js is not loaded!');
} else {
    console.log('[DEBUG] D3.js version:', d3.version || 'version unknown');
}

    // Use Config constants instead of hardcoded values
    console.log('[DEBUG] Initializing DOM elements...');
    const width = window.Config.CANVAS.width;
    const height = window.Config.CANVAS.height;
    console.log('[DEBUG] Canvas dimensions:', width, 'x', height);
    const svg = d3.select(window.Config.SELECTORS.graph);
    console.log('[DEBUG] SVG element selected:', svg.empty() ? 'NOT FOUND' : 'FOUND');
    const tooltip = d3.select(window.Config.SELECTORS.tooltip);
    console.log('[DEBUG] Tooltip element selected:', tooltip.empty() ? 'NOT FOUND' : 'FOUND');
    const statsDiv = document.getElementById("stats");
    console.log('[DEBUG] Stats div found:', statsDiv ? 'YES' : 'NO');// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
    console.error('[ERROR] Unhandled error:', event.error);
    console.error('[ERROR] Stack:', event.error?.stack);
});

// Check document ready state
console.log('[DEBUG] Document ready state:', document.readyState);

// Main execution code wrapper
try {
    console.log('[DEBUG] Starting main execution...');

// Structure graph setup using Config
const structureWidth = Config.STRUCTURE_GRAPH.width;
const structureHeight = Config.STRUCTURE_GRAPH.height;
const structureSvg = d3.select(Config.SELECTORS.structureGraph);

// Add background and styling to structure graph
structureSvg.append("rect")
    .attr("width", structureWidth)
    .attr("height", structureHeight)
    .attr("fill", "rgba(255, 255, 255, 0.02)")
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("rx", 20);

// Define arrow marker for structure graph
structureSvg.append("defs").append("marker")
    .attr("id", "arrow-structure")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 30)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#999");

const structureG = structureSvg.append("g");
const structureLinkGroup = structureG.append("g").attr("class", "structure-links");
const structureNodeGroup = structureG.append("g").attr("class", "structure-nodes");

// Time plot setup using Config
const timePlotSvg = d3.select(Config.SELECTORS.timePlot);
const timePlotWidth = Config.TIME_PLOT.width;
const timePlotHeight = Config.TIME_PLOT.height;
const timePlotMargin = Config.TIME_PLOT.margin;
const timePlotInnerWidth = timePlotWidth - timePlotMargin.left - timePlotMargin.right;
const timePlotInnerHeight = timePlotHeight - timePlotMargin.top - timePlotMargin.bottom;

const timePlotG = timePlotSvg.append("g")
    .attr("transform", `translate(${timePlotMargin.left},${timePlotMargin.top})`);

// Add background
timePlotG.append("rect")
    .attr("width", timePlotInnerWidth)
    .attr("height", timePlotInnerHeight)
    .attr("fill", "rgba(255, 255, 255, 0.02)")
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("rx", 8);

// Create scales
const xScale = d3.scaleLinear().range([0, timePlotInnerWidth]);
const yScale = d3.scaleLinear().range([timePlotInnerHeight, 0]);

// Create axes
const xAxis = d3.axisBottom(xScale).ticks(8);
const yAxis = d3.axisLeft(yScale).ticks(6);

const xAxisG = timePlotG.append("g")
    .attr("transform", `translate(0,${timePlotInnerHeight})`)
    .attr("class", "axis")
    .call(xAxis);

const yAxisG = timePlotG.append("g")
    .attr("class", "axis")
    .call(yAxis);

// Axis labels
timePlotSvg.append("text")
    .attr("transform", `translate(${timePlotWidth / 2},${timePlotHeight - 5})`)
    .style("text-anchor", "middle")
    .style("fill", "#888")
    .style("font-size", "12px")
    .text("Time");

timePlotSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -(timePlotHeight / 2))
    .style("text-anchor", "middle")
    .style("fill", "#888")
    .style("font-size", "12px")
    .text("Population (xi)");

// Style axes
timePlotSvg.selectAll(".axis path, .axis line")
    .style("stroke", "rgba(255, 255, 255, 0.2)");

timePlotSvg.selectAll(".axis text")
    .style("fill", "#888")
    .style("font-size", "11px");

const linesGroup = timePlotG.append("g").attr("class", "lines");

// Eigenvalue plot setup using Config
const eigenvaluePlotSvg = d3.select(Config.SELECTORS.eigenvaluePlot);
const eigenvaluePlotWidth = Config.EIGEN_PLOT.width * 2; // Keep current layout
const eigenvaluePlotHeight = Config.EIGEN_PLOT.height;
const eigenvaluePlotMargin = Config.EIGEN_PLOT.margin;
const eigenvaluePlotInnerWidth = eigenvaluePlotWidth - eigenvaluePlotMargin.left - eigenvaluePlotMargin.right;
const eigenvaluePlotInnerHeight = eigenvaluePlotHeight - eigenvaluePlotMargin.top - eigenvaluePlotMargin.bottom;

const eigenvaluePlotG = eigenvaluePlotSvg.append("g")
    .attr("transform", `translate(${eigenvaluePlotMargin.left},${eigenvaluePlotMargin.top})`);

// Add background
eigenvaluePlotG.append("rect")
    .attr("width", eigenvaluePlotInnerWidth)
    .attr("height", eigenvaluePlotInnerHeight)
    .attr("fill", "rgba(255, 255, 255, 0.02)")
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("rx", 8);

// Create scales for eigenvalue plot
const xScaleEigen = d3.scaleBand().range([0, eigenvaluePlotInnerWidth]).padding(0.2);
const yScaleEigen = d3.scaleLinear().range([eigenvaluePlotInnerHeight, 0]);

// Create axes for eigenvalue plot
const xAxisEigen = d3.axisBottom(xScaleEigen);
const yAxisEigen = d3.axisLeft(yScaleEigen).ticks(6);

const xAxisEigenG = eigenvaluePlotG.append("g")
    .attr("transform", `translate(0,${eigenvaluePlotInnerHeight})`)
    .attr("class", "axis");

const yAxisEigenG = eigenvaluePlotG.append("g")
    .attr("class", "axis");

// Axis labels for eigenvalue plot
eigenvaluePlotSvg.append("text")
    .attr("transform", `translate(${eigenvaluePlotWidth / 2},${eigenvaluePlotHeight - 5})`)
    .style("text-anchor", "middle")
    .style("fill", "#888")
    .style("font-size", "12px")
    .text("Eigenvalue Index");

eigenvaluePlotSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -(eigenvaluePlotHeight / 2))
    .style("text-anchor", "middle")
    .style("fill", "#888")
    .style("font-size", "12px")
    .text("|λ|");

// Style other axes (time plot and eigenvalue plot)
timePlotSvg.selectAll(".axis path, .axis line")
    .style("stroke", "rgba(255, 255, 255, 0.2)");

timePlotSvg.selectAll(".axis text")
    .style("fill", "#888")
    .style("font-size", "11px");

eigenvaluePlotSvg.selectAll(".axis path, .axis line")
    .style("stroke", "rgba(255, 255, 255, 0.2)");

eigenvaluePlotSvg.selectAll(".axis text")
    .style("fill", "#888")
    .style("font-size", "11px");

const barsGroup = eigenvaluePlotG.append("g").attr("class", "bars");

// Complex plane plot setup using Config
const complexPlotSvg = d3.select(Config.SELECTORS.complexPlot);
const complexPlotWidth = Config.COMPLEX_PLOT.width * 2; // Keep current layout
const complexPlotHeight = Config.COMPLEX_PLOT.height + 200; // Keep current layout
const complexPlotMargin = Config.COMPLEX_PLOT.margin;
const complexPlotInnerWidth = complexPlotWidth - complexPlotMargin.left - complexPlotMargin.right;
const complexPlotInnerHeight = complexPlotHeight - complexPlotMargin.top - complexPlotMargin.bottom;

const complexPlotG = complexPlotSvg.append("g")
    .attr("transform", `translate(${complexPlotMargin.left},${complexPlotMargin.top})`);

// Add background with gradient
const complexDefs = complexPlotSvg.append("defs");

const bgGradient = complexDefs.append("linearGradient")
    .attr("id", "complexBgGradient")
    .attr("x1", "0%")
    .attr("x2", "100%");

bgGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgba(100, 150, 255, 0.05)");

bgGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "rgba(255, 255, 255, 0.02)");

bgGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgba(255, 100, 100, 0.05)");

complexPlotG.append("rect")
    .attr("width", complexPlotInnerWidth)
    .attr("height", complexPlotInnerHeight)
    .attr("fill", "url(#complexBgGradient)")
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("rx", 8);

// Create scales for complex plane
const xScaleComplex = d3.scaleLinear().range([0, complexPlotInnerWidth]);
const yScaleComplex = d3.scaleLinear().range([complexPlotInnerHeight, 0]);

// Create axes
const xAxisComplex = d3.axisBottom(xScaleComplex).ticks(8);
const yAxisComplex = d3.axisLeft(yScaleComplex).ticks(8);

const xAxisComplexG = complexPlotG.append("g")
    .attr("class", "axis axis-center");

const yAxisComplexG = complexPlotG.append("g")
    .attr("class", "axis axis-center");

// Axis labels
complexPlotSvg.append("text")
    .attr("transform", `translate(${complexPlotWidth / 2},${complexPlotHeight - 10})`)
    .style("text-anchor", "middle")
    .style("fill", "#aaa")
    .style("font-size", "13px")
    .style("font-weight", "500")
    .text("Re(λ)");

complexPlotSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x", -(complexPlotHeight / 2))
    .style("text-anchor", "middle")
    .style("fill", "#aaa")
    .style("font-size", "13px")
    .style("font-weight", "500")
    .text("Im(λ)");

// Zero lines (will be drawn after scales are set)
const zeroLineVertical = complexPlotG.append("line")
    .attr("class", "zero-line-center")
    .attr("stroke", "rgba(255, 255, 255, 0.4)")
    .attr("stroke-width", 2);

const zeroLineHorizontal = complexPlotG.append("line")
    .attr("class", "zero-line-center")
    .attr("stroke", "rgba(255, 255, 255, 0.4)")
    .attr("stroke-width", 2);

// Style axes
complexPlotSvg.selectAll(".axis path, .axis line")
    .style("stroke", "rgba(255, 255, 255, 0.2)");

complexPlotSvg.selectAll(".axis text")
    .style("fill", "#888")
    .style("font-size", "11px");

const eigenPointsGroup = complexPlotG.append("g").attr("class", "eigen-points");
const eigenLinesGroup = complexPlotG.append("g").attr("class", "eigen-lines");

// Use Config.getFallColor instead of local function
// (Removed local getFallColor function - now using Config.getFallColor)

function updateEigenvaluePlot() {
    try {
        // Check if matrix is valid
        if (!window.appState.a || window.appState.a.length === 0) {
            console.warn("Matrix not initialized");
            return;
        }

        // Use Jacobian for oscillation mode, matrix A otherwise
        const zeroCycle = document.getElementById(window.Config.SELECTORS.zeroCycle.substring(1)).checked;
        let matrixToAnalyze;
        
        if (zeroCycle && window.appState.x && window.appState.epsilon) {
            // Use current Jacobian for oscillation analysis
            matrixToAnalyze = window.jacobianAndEigen.constructor.computeJacobian(window.appState.x, window.appState.epsilon, window.appState.a);
        } else {
            // Use matrix A for standard analysis
            matrixToAnalyze = window.appState.a;
        }

        // Get visualization data using refactored class
        const eigenData = window.jacobianAndEigen.constructor.getVisualizationData(matrixToAnalyze, 'magnitude');
        
        if (!eigenData.isValid) {
            console.warn("Eigenvalue computation failed:", eigenData.error);
            return;
        }

        // Extract magnitudes for bar chart
        const eigenvalues = eigenData.magnitudes;

        // Create data for bar chart
        const chartData = eigenvalues.map((value, i) => ({
            index: i + 1,
            value: value
        }));

        // Update scales
        xScaleEigen.domain(chartData.map(d => d.index));
        yScaleEigen.domain([0, Math.max(...eigenvalues) * 1.1 || 1]);

        // Update axes
        xAxisEigenG.call(xAxisEigen);
        yAxisEigenG.call(yAxisEigen);

        // Draw bars
        const bars = barsGroup.selectAll(".eigen-bar")
            .data(chartData);

        bars.exit().remove();

        bars.enter()
            .append("rect")
            .attr("class", "eigen-bar")
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                    .html(`λ${d.index}: ${Config.formatNumber(d.value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            })
            .merge(bars)
            .transition()
            .duration(300)
            .attr("x", d => xScaleEigen(d.index))
            .attr("y", d => yScaleEigen(d.value))
            .attr("width", xScaleEigen.bandwidth())
            .attr("height", d => eigenvaluePlotInnerHeight - yScaleEigen(d.value))
            .attr("fill", (d, i) => Config.getEigenBarColor(i, chartData.length))
            .attr("opacity", 0.8)
            .attr("rx", 4);

    } catch (error) {
        console.warn("Could not compute eigenvalues:", error.message);
        barsGroup.selectAll(".eigen-bar").remove();
    }
}

function updateComplexPlot() {
    try {
        // Use Jacobian for oscillation mode, matrix A otherwise
        const zeroCycle = document.getElementById(window.Config.SELECTORS.zeroCycle.substring(1)).checked;
        let matrixToAnalyze;
        
        if (zeroCycle && window.appState.x && window.appState.epsilon) {
            // Use current Jacobian for oscillation analysis
            matrixToAnalyze = window.jacobianAndEigen.constructor.computeJacobian(window.appState.x, window.appState.epsilon, window.appState.a);
        } else {
            // Use matrix A for standard analysis
            matrixToAnalyze = window.appState.a;
        }

        // Get visualization data using refactored class
        const eigenData = window.jacobianAndEigen.constructor.getVisualizationData(matrixToAnalyze, 'magnitude');
        
        if (!eigenData.isValid) {
            console.warn("Eigenvalue computation failed:", eigenData.error);
            return;
        }

        // Use plotDomain from visualization data
        const plotRange = eigenData.plotDomain.maxRange;

        // Update scales - centered at origin with equal scale
        xScaleComplex.domain([-plotRange, plotRange]);
        yScaleComplex.domain([-plotRange, plotRange]);

        // Update axes - position at center (0, 0)
        const zeroX = xScaleComplex(0);
        const zeroY = yScaleComplex(0);

        xAxisComplexG
            .attr("transform", `translate(0,${zeroY})`)
            .call(xAxisComplex);

        yAxisComplexG
            .attr("transform", `translate(${zeroX},0)`)
            .call(yAxisComplex);

        // Update zero lines (reinforcing the center axes)
        zeroLineVertical
            .attr("x1", zeroX)
            .attr("x2", zeroX)
            .attr("y1", 0)
            .attr("y2", complexPlotInnerHeight);

        zeroLineHorizontal
            .attr("x1", 0)
            .attr("x2", complexPlotInnerWidth)
            .attr("y1", zeroY)
            .attr("y2", zeroY);

        // Draw lines from origin to eigenvalues
        const lines = eigenLinesGroup.selectAll(".eigen-line")
            .data(eigenData.values);

        lines.exit().remove();

        lines.enter()
            .append("line")
            .attr("class", "eigen-line")
            .merge(lines)
            .transition()
            .duration(500)
            .attr("x1", zeroX)
            .attr("y1", zeroY)
            .attr("x2", d => xScaleComplex(d.real))
            .attr("y2", d => yScaleComplex(d.imag))
            .attr("stroke", d => Config.getComplexColor(d.real, d.imag, 70, 60))
            .attr("stroke-opacity", 0.3);

        // Draw eigenvalue points
        const points = eigenPointsGroup.selectAll(".eigen-point")
            .data(eigenData.values);

        points.exit()
            .transition()
            .duration(300)
            .attr("r", 0)
            .remove();

        const pointsEnter = points.enter()
            .append("circle")
            .attr("class", "eigen-point")
            .attr("r", 0);

        pointsEnter
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 12)
                    .style("filter", "drop-shadow(0 0 15px currentColor)");

                const eigenStr = Config.formatComplex(d.real, d.imag);
                const magnitude = Math.sqrt(d.real * d.real + d.imag * d.imag);

                tooltip.style("display", "block")
                    .html(`λ${d.index}: ${eigenStr}<br>|λ| = ${Config.formatNumber(magnitude)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(event, d) {
                const magnitude = Math.sqrt(d.real * d.real + d.imag * d.imag);
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", Math.sqrt(magnitude) * 5 + 3);

                tooltip.style("display", "none");
            });

        pointsEnter.merge(points)
            .transition()
            .duration(500)
            .attr("cx", d => xScaleComplex(d.real))
            .attr("cy", d => yScaleComplex(d.imag))
            .attr("r", d => {
                const magnitude = Math.sqrt(d.real * d.real + d.imag * d.imag);
                return Math.sqrt(magnitude) * 5 + 3;
            })
            .attr("fill", d => Config.getComplexColor(d.real, d.imag))
            .attr("opacity", 0.8)
            .style("filter", "drop-shadow(0 0 8px currentColor)");

    } catch (error) {
        console.warn("Could not compute eigenvalues for complex plot:", error.message);
        eigenPointsGroup.selectAll(".eigen-point").remove();
    }
}

function drawStructureGraph() {
    const centerX = structureWidth / 2;
    const centerY = structureHeight / 2;
    const radius = Config.STRUCTURE_GRAPH.circleRadius;
    const nodeRadius = Config.STRUCTURE_GRAPH.nodeRadius;

    // Position nodes in a circle
    const structureNodes = [];
    for (let i = 0; i < appState.n; i++) {
        const angle = (i / appState.n) * 2 * Math.PI - Math.PI / 2;
        structureNodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    // Create structure links using MatrixModel
    const structureLinks = window.matrixModel.constructor.renderableLinks(window.appState.a, window.Config.TOLERANCES.matrixElement)
        .map(link => ({
            source: structureNodes[link.source],
            target: structureNodes[link.target],
            value: link.value
        }));

    // Draw links
    const structureLink = structureLinkGroup.selectAll("path")
        .data(structureLinks, d => `${d.source.id}-${d.target.id}`);

    structureLink.exit().remove();

    const structureLinkEnter = structureLink.enter()
        .append("path")
        .attr("marker-end", "url(#arrow-structure)");

    structureLinkEnter.append("title");

    const structureLinkMerged = structureLinkEnter.merge(structureLink)
        .attr("marker-end", "url(#arrow-structure)")
        .attr("d", d => {
            // Calculate angle and adjust for node radius
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const angle = Math.atan2(dy, dx);

            const startX = d.source.x + nodeRadius * Math.cos(angle);
            const startY = d.source.y + nodeRadius * Math.sin(angle);
            const endX = d.target.x - nodeRadius * Math.cos(angle);
            const endY = d.target.y - nodeRadius * Math.sin(angle);

            const dr = Math.sqrt(dx * dx + dy * dy);

            // Determine if we need to curve this edge
            const sourceId = structureNodes.indexOf(d.source);
            const targetId = structureNodes.indexOf(d.target);

            // Check if there's a reverse edge
            const hasReverse = structureLinks.some(l =>
                structureNodes.indexOf(l.source) === targetId &&
                structureNodes.indexOf(l.target) === sourceId
            );

            if (hasReverse && sourceId < targetId) {
                // Curve one way
                const curveRadius = dr * 0.8;
                return `M${startX},${startY}A${curveRadius},${curveRadius} 0 0,1 ${endX},${endY}`;
            } else if (hasReverse && sourceId > targetId) {
                // Curve the other way
                const curveRadius = dr * 1.5;
                return `M${startX},${startY}A${curveRadius},${curveRadius} 0 0,0 ${endX},${endY}`;
            } else {
                // Straight line
                return `M${startX},${startY}L${endX},${endY}`;
            }
        })
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`a<sub>${d.source.id + 1},${d.target.id + 1}</sub> = ${d.value.toFixed(3)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

    structureLinkMerged.select("title")
        .text(d => `a_${d.source.id + 1},${d.target.id + 1} = ${d.value.toFixed(3)}`);

    // Draw nodes
    const structureNode = structureNodeGroup.selectAll("g")
        .data(structureNodes);

    structureNode.exit().remove();

    const structureNodeEnter = structureNode.enter()
        .append("g");

    structureNodeEnter.append("circle")
        .attr("r", nodeRadius);

    structureNodeEnter.append("text");

    structureNodeEnter.merge(structureNode)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .select("text")
        .text(d => d.id + 1);

    updateCycleInfo();
}

function renderMatrix() {
    const container = document.getElementById("matrixContainer");
    const isSkewSymmetric = document.getElementById(Config.SELECTORS.skewSymmetric.substring(1)).checked;

    let html = '<table class="matrix-table"><thead><tr><th></th>';

    // Column headers
    for (let j = 0; j < appState.n; j++) {
        html += `<th>${j + 1}</th>`;
    }
    html += "</tr></thead><tbody>";

    // Matrix rows
    for (let i = 0; i < appState.n; i++) {
        html += `<tr><th>${i + 1}</th>`;
        for (let j = 0; j < appState.n; j++) {
            const value = appState.a[i][j];
            let className = "matrix-cell";
            let readonly = "";
            let displayValue = value;

            if (i === j) {
                // Diagonal
                className += " diagonal";
                readonly = isSkewSymmetric ? "readonly" : "";
            } else if (isSkewSymmetric && i < j) {
                // Upper triangle in skew-symmetric mode - show -a[j][i] and make readonly
                displayValue = -appState.a[j][i];
                readonly = "readonly";
                className += " upper-triangle";
            }

            // Color based on display value using Config tolerance
            if (Math.abs(displayValue) < Config.TOLERANCES.matrixElement) {
                className += " zero";
            } else if (displayValue > 0) {
                className += " positive";
            } else {
                className += " negative";
            }

            html += `<td><input type="number" class="${className}" 
                     data-i="${i}" data-j="${j}" 
                     value="${Config.formatNumber(displayValue)}" 
                     step="0.01" ${readonly}></td>`;
        }
        html += "</tr>";
    }
    html += "</tbody></table>";

    container.innerHTML = html;

    // Add event listeners to all cells
    container.querySelectorAll(".matrix-cell").forEach(input => {
        input.addEventListener("change", e => {
            const i = parseInt(e.target.dataset.i);
            const j = parseInt(e.target.dataset.j);
            const value = parseFloat(e.target.value) || 0;

            appState.a[i][j] = value;

            // If skew-symmetric and lower triangle, update the upper triangle
            if (isSkewSymmetric && i !== j) {
                appState.a[j][i] = -value;
            }

            // Update the links in the graph
            updateLinks();

            // Re-render matrix to update colors and paired values
            renderMatrix();

            // Emit matrix update event
            eventBus.emit(EventBus.Events.MATRIX_UPDATED, {
                position: [i, j],
                value: value
            });
        });

        input.addEventListener("input", e => {
            const value = parseFloat(e.target.value) || 0;

            // Update cell appearance based on value
            e.target.classList.remove("positive", "negative", "zero");
            if (Math.abs(value) < Config.TOLERANCES.matrixElement) {
                e.target.classList.add("zero");
            } else if (value > 0) {
                e.target.classList.add("positive");
            } else {
                e.target.classList.add("negative");
            }
        });
    });
}

function updateLinks() {
    // Recreate links using MatrixModel
    appState.links = MatrixModel.renderableLinks(appState.a, Config.TOLERANCES.matrixElement);

    // Redraw the graph
    draw();

    // Update structure graph
    drawStructureGraph();

    // Update eigenvalue plots
    updateEigenvaluePlot();
    updateComplexPlot();

    // Emit event
    eventBus.emit(EventBus.Events.MATRIX_UPDATED, {
        linkCount: appState.links.length
    });
}

// Legacy variable compatibility - these reference appState properties
// TODO: Gradually replace direct usage of these with appState references
let n, x, epsilon, a, nodes, links, time, dt, animationId, extinct, history, isPaused, speedMultiplier, zeroCycleDiagonal;

// Initialize legacy variables from appState
function syncLegacyVariables() {
    n = window.appState.n;
    x = window.appState.x;
    epsilon = window.appState.epsilon;
    a = window.appState.a;
    nodes = window.appState.nodes;
    links = window.appState.links;
    time = window.appState.time;
    dt = window.appState.dt;
    extinct = window.appState.extinct;
    history = window.appState.history;
    isPaused = window.appState.flags.isPaused;
    speedMultiplier = window.appState.speedMultiplier;
    zeroCycleDiagonal = window.appState.zeroCycleDiagonal;
    animationId = window.appState.animation.animationId;
}

// Update appState from legacy variables (reverse sync)
function updateAppStateFromLegacy() {
    window.appState.n = n;
    window.appState.x = x;
    window.appState.epsilon = epsilon;
    window.appState.a = a;
    window.appState.nodes = nodes;
    window.appState.links = links;
    window.appState.time = time;
    window.appState.dt = dt;
    window.appState.extinct = extinct;
    window.appState.history = history;
    window.appState.flags.isPaused = isPaused;
    window.appState.speedMultiplier = speedMultiplier;
    window.appState.zeroCycleDiagonal = zeroCycleDiagonal;
    window.appState.animation.animationId = animationId;
}

// Initialize with default values
window.appState.setN(window.Config.SIMULATION.defaultNodes);
window.appState.dt = window.Config.ANIMATION.defaultDt;
window.appState.speedMultiplier = window.Config.ANIMATION.defaultSpeedMultiplier;
window.appState.flags.isPaused = false; // Ensure isPaused starts as false
syncLegacyVariables();

// Oscillation enforcement variables - use DynamicsEngine methods
let H0 = null; // Initial Hamiltonian value for monitoring

// Use refactored helper functions from classes - access static methods correctly
const MatrixModelClass = window.matrixModel.constructor;
const DynamicsEngineClass = window.dynamicsEngine.constructor;
const JacobianAndEigenClass = window.jacobianAndEigen.constructor;

const makeSkewSymmetric = MatrixModelClass.makeSkewSymmetric;
const setOscillationEquilibrium = DynamicsEngineClass.setOscillationEquilibrium;
const hamiltonian = DynamicsEngineClass.hamiltonian;
const currentJacobian = JacobianAndEigenClass.computeJacobian;

const g = svg.append("g");

// Add subtle background pattern
const defs = svg.append("defs");
const pattern = defs.append("pattern")
    .attr("id", "grid")
    .attr("width", 40)
    .attr("height", 40)
    .attr("patternUnits", "userSpaceOnUse");

pattern.append("circle")
    .attr("cx", 20)
    .attr("cy", 20)
    .attr("r", 0.5)
    .attr("fill", "rgba(102, 126, 234, 0.15)");

svg.insert("rect", ":first-child")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#grid)");

const linkGroup = g.append("g").attr("class", "links");
const nodeGroup = g.append("g").attr("class", "nodes");

// Create force simulation
const simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(0))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0))
    .on("tick", ticked);

function ticked() {
    linkGroup.selectAll(".link").attr("d", linkArc);
    nodeGroup.selectAll(".node").attr("transform", d => `translate(${d.x},${d.y})`);
}

// Drag functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    // Keep node fixed at dragged position
    // d.fx = null;
    // d.fy = null;
}

function getColor(value) {
    // Use Config color scheme for consistency
    if (value < 0) {
        // Pure blue gradient for negative values
        const intensity = Math.min(Math.abs(value) * 150, 255);
        return `rgb(${Math.floor(intensity * 0.2)}, ${Math.floor(intensity * 0.5)}, 255)`;
    } else {
        // Pure red gradient for positive values  
        const intensity = Math.min(value * 150, 255);
        return `rgb(255, ${Math.floor(Math.max(0, 200 - intensity))}, ${Math.floor(Math.max(0, 150 - intensity))})`;
    }
}

function randomNormal(mean = 0, stdDev = 1) {
    let u1 = 0;
    let u2 = 0;
    // Avoid zero to keep log defined
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const mag = Math.sqrt(-2.0 * Math.log(u1));
    return mean + stdDev * mag * Math.cos(2.0 * Math.PI * u2);
}

function randomPositiveDiagonal(n, options = {}) {
    const low = options.low ?? -0.5;
    const high = options.high ?? 0.5;
    return Array.from({length: n}, () => {
        const phi = Math.random() * (high - low) + low;
        return Math.exp(phi);
    });
}

function buildRingSkewMatrix(n, params = {}) {
    const ringScale = params.ringScale ?? 1.0;
    const extraDensity = params.extraDensity ?? 0.15;
    const extraScale = params.extraScale ?? 0.2;

    const skew = Array.from({length: n}, () => Array(n).fill(0));
    const ringWeights = Array.from({length: n}, () => randomNormal(0, ringScale));

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const w = ringWeights[i];
        skew[i][j] = w;
        skew[j][i] = -w;
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (Math.random() < extraDensity) {
                const value = randomNormal(0, extraScale);
                skew[i][j] += value;
                skew[j][i] -= value;
            }
        }
    }

    for (let i = 0; i < n; i++) {
        skew[i][i] = 0;
    }

    return skew;
}

function generateZeroCycleMatrix(n, density, scale, options = {}) {
    const {zeroDiagonal = true} = options;
    const clampedDensity = Math.min(Math.max(density ?? 0, 0), 1);
    const effectiveScale = Math.max(scale ?? 0.01, 0.01);

    const diag = randomPositiveDiagonal(n, {low: -0.5, high: 0.5});

    const ringScale = Math.max(effectiveScale, 0.05);
    const extraDensity = Math.min(Math.max(clampedDensity * 0.75, 0.12), 0.7);
    const extraScale = effectiveScale * 0.45;

    const skew = buildRingSkewMatrix(n, {ringScale, extraDensity, extraScale});
    const matrix = Array.from({length: n}, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        const invDiag = 1 / diag[i];
        for (let j = 0; j < n; j++) {
            matrix[i][j] = skew[i][j] * invDiag;
        }
    }

    if (zeroDiagonal) {
        for (let i = 0; i < n; i++) {
            matrix[i][i] = 0;
        }
    }

    return {matrix, diag};
}

function computeZeroCycleResidual(matrix, diag) {
    if (!matrix || !diag) {
        return null;
    }
    const size = matrix.length;
    if (diag.length !== size) {
        return null;
    }

    let residualSum = 0;
    let matrixNorm = 0;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const aij = matrix[i][j];
            const residual = matrix[j][i] * diag[j] + diag[i] * aij;
            residualSum += residual * residual;
            matrixNorm += aij * aij;
        }
    }

    const residualNorm = Math.sqrt(residualSum);
    const froNormA = Math.sqrt(matrixNorm);
    const relative = residualNorm / (1 + froNormA);

    return {residualNorm, froNormA, relative};
}

function logZeroCycleResidual(matrix, diag) {
    const stats = computeZeroCycleResidual(matrix, diag);
    if (!stats) {
        console.log("[Zero Cycle] Residual check skipped: missing matrix/diag.");
        return;
    }
    console.log("[Zero Cycle] ||A^T D + D A||_F =", stats.residualNorm.toExponential(6),
        "| ||A||_F =", stats.froNormA.toExponential(6),
        "| relative residual =", stats.relative.toExponential(6));
}

function canonicalCycleKey(cycle) {
    const len = cycle.length;
    if (len === 0) return "";
    const sequences = [];
    const doubled = cycle.concat(cycle);
    for (let i = 0; i < len; i++) {
        sequences.push(doubled.slice(i, i + len).join("-"));
    }
    const reversed = cycle.slice().reverse();
    const doubledRev = reversed.concat(reversed);
    for (let i = 0; i < len; i++) {
        sequences.push(doubledRev.slice(i, i + len).join("-"));
    }
    sequences.sort();
    return sequences[0];
}

function sampleCyclesFromMatrix(matrix, options = {}) {
    const size = matrix.length;
    if (size === 0) return [];

    const tol = options.tol ?? 1e-6;
    const maxCycles = options.maxCycles ?? Math.min(8, Math.max(3, size * 2));
    const maxLength = options.maxLength ?? Math.min(6, Math.max(3, size));
    const attempts = options.attempts ?? 600;

    const cycles = [];
    const seen = new Set();

    for (let attempt = 0; attempt < attempts && cycles.length < maxCycles; attempt++) {
        const start = Math.floor(Math.random() * size);
        const path = [start];
        const used = new Set([start]);

        for (let step = 0; step < maxLength - 1; step++) {
            const current = path[path.length - 1];
            const neighbors = [];
            for (let j = 0; j < size; j++) {
                if (!used.has(j) && Math.abs(matrix[current][j]) > tol) {
                    neighbors.push(j);
                }
            }

            if (neighbors.length === 0) {
                break;
            }

            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            path.push(next);
            used.add(next);

            if (path.length >= 2 && Math.abs(matrix[next][start]) > tol) {
                const cycle = path.slice();
                const key = canonicalCycleKey(cycle);
                if (!seen.has(key)) {
                    seen.add(key);
                    cycles.push(cycle);
                }
                break;
            }
        }
    }

    return cycles;
}

function analyzeCycleParity(cycle, matrix) {
    const length = cycle.length;
    if (length === 0) {
        return null;
    }

    let forward = 1;
    let reverse = 1;
    for (let idx = 0; idx < length; idx++) {
        const i = cycle[idx];
        const j = cycle[(idx + 1) % length];
        forward *= matrix[i][j];
        reverse *= matrix[j][i];
    }

    const sign = length % 2 === 0 ? 1 : -1;
    const expected = sign * reverse;
    const diff = Math.abs(forward - expected);
    const relative = diff / Math.max(1, Math.abs(expected));

    return {
        nodes: cycle,
        length,
        forward,
        reverse,
        expected,
        diff,
        relative,
        holds: relative < 1e-6
    };
}

function updateCycleInfo() {
    const container = document.getElementById("cycleInfo");
    if (!container) {
        return;
    }

    try {
        const cycles = window.cycleAnalyzer.constructor.sampleCyclesFromMatrix(window.appState.a);
        const analyses = cycles
            .map(cycle => window.cycleAnalyzer.constructor.analyzeCycleParity(cycle, window.appState.a))
            .filter(Boolean)
            .filter(analysis => analysis.length > 3);

        if (analyses.length === 0) {
            container.innerHTML = "<h3>Sample Cycle Parity</h3><p style=\"margin:0; color:#999;\">No directed cycles with length &gt; 3 detected.</p>";
            return;
        }

        const listItems = analyses.map((analysis, idx) => {
            const nodesLabel = analysis.nodes.map(node => node + 1).join(" → ") + " → " + (analysis.nodes[0] + 1);
            const productsLabel = `Π<sub>forward</sub> = ${analysis.forward.toExponential(3)} | Π<sub>reverse</sub> = ${analysis.reverse.toExponential(3)} | (-1)<sup>${analysis.length}</sup>Π<sub>reverse</sub> = ${analysis.expected.toExponential(3)}`;
            const statusClass = analysis.holds ? "cycle-status" : "cycle-status bad";
            const statusText = analysis.holds ? `✔ parity holds (rel. error ${analysis.relative.toExponential(2)})` : `✖ parity off (rel. error ${analysis.relative.toExponential(2)})`;
            return `<li><div class=\"cycle-header\">Cycle ${idx + 1} (length ${analysis.length}): ${nodesLabel}</div>
                <div class=\"cycle-products\">${productsLabel}</div>
                <div class=\"${statusClass}\">${statusText}</div></li>`;
        }).join("");

        container.innerHTML = `<h3>Sample Cycle Parity</h3><ul>${listItems}</ul>`;
        
        // Emit event for other components
        window.eventBus.emit('cycle-info-updated', { analyses });
        
    } catch (error) {
        console.error('Cycle info update error:', error);
        container.innerHTML = "<h3>Sample Cycle Parity</h3><p style=\"margin:0; color:#999;\">Error analyzing cycles.</p>";
    }
}

function initialize() {
    console.log('[DEBUG] Initialize function called');
    const inputN = parseInt(document.getElementById("numNodes").value);
    const isSkewSymmetric = document.getElementById("skewSymmetric").checked;
    const zeroCycle = document.getElementById("zeroCycle").checked;
    console.log('[DEBUG] Settings:', { inputN, isSkewSymmetric, zeroCycle });
    
    const interactionRangeInput = parseFloat(document.getElementById("interactionRange").value);
    const connectionProbInput = parseFloat(document.getElementById("connectionProb").value);
    const interactionRange = Number.isFinite(interactionRangeInput) ? interactionRangeInput : 1;
    const connectionProbability = Number.isFinite(connectionProbInput) ? connectionProbInput : 0.4;

    // Reset global time
    time = 0;
    
    // Update AppState with new settings
    appState.setN(inputN);
    appState.interactionRange = interactionRange;
    appState.connectionProbability = connectionProbability;
    appState.isSkewSymmetric = isSkewSymmetric;
    appState.zeroCycle = zeroCycle;
    
    // Generate matrix based on mode
    let matrix, diag = null;
    let initialX, initialEpsilon;
    
    if (zeroCycle) {
        // Zero-cycle graph mode: enforce neutral oscillations
        const result = window.matrixModel.constructor.generateZeroCycleMatrix(
            inputN,
            connectionProbability,
            interactionRange,
            { zeroDiagonal: true }
        );
        matrix = result.matrix;
        diag = result.diag;
        
        // Force skew-symmetry for oscillation
        window.matrixModel.constructor.makeSkewSymmetric(matrix);
        
        // Set equilibrium and linear terms for oscillation
        const equilibrium = window.dynamicsEngine.constructor.setOscillationEquilibrium(matrix);
        initialX = equilibrium.xStar.map(v => v * (1 + 0.05 * (Math.random() - 0.5)));
        initialEpsilon = equilibrium.eps;
        
        // Prevent extinction in oscillation mode
        document.getElementById("extinctionThreshold").value = "0";
        
        console.log("[Zero Cycle] Matrix generated with oscillation equilibrium");
    } else if (isSkewSymmetric) {
        matrix = window.matrixModel.constructor.generateRandomMatrix(inputN, connectionProbability, interactionRange, { isSkewSymmetric: true });
        initialX = Array(inputN).fill(0).map(() => Math.random() * 0.5 + 0.1);
        initialEpsilon = Array(inputN).fill(0).map(() => (Math.random() - 0.5) * 0.5);
    } else {
        matrix = window.matrixModel.constructor.generateRandomMatrix(inputN, connectionProbability, interactionRange);
        initialX = Array(inputN).fill(0).map(() => Math.random() * 0.5 + 0.1);
        initialEpsilon = Array(inputN).fill(0).map(() => (Math.random() - 0.5) * 0.5);
    }
    
    // Update AppState with generated values
    window.appState.a = matrix;  // AppState uses 'a' for matrix
    window.appState.x = initialX;
    window.appState.epsilon = initialEpsilon;
    window.appState.extinct = Array(inputN).fill(false);
    window.appState.zeroCycleDiagonal = diag;
    
    console.log('[DEBUG] Initial values set - x:', initialX.slice(0, 3));
    console.log('[DEBUG] Initial values set - epsilon:', initialEpsilon.slice(0, 3));
    console.log('[DEBUG] Matrix size:', matrix.length, 'x', matrix[0]?.length);
    
    // Note: DynamicsEngine uses static methods, no initialization needed
    
    // Initialize history for time plot
    history = Array(inputN).fill(0).map(() => []);
    for (let i = 0; i < inputN; i++) {
        history[i].push({time: 0, value: initialX[i]});
    }

    // Create nodes for visualization
    nodes = [];
    for (let i = 0; i < inputN; i++) {
        const angle = (i / inputN) * 2 * Math.PI - Math.PI / 2;
        nodes.push({
            id: i,
            x: window.Config.CANVAS.width / 2 + 220 * Math.cos(angle),
            y: window.Config.CANVAS.height / 2 + 220 * Math.sin(angle)
        });
    }

    // Create links from matrix using MatrixModel
    links = window.matrixModel.constructor.renderableLinks(matrix);
    
    // Update AppState with the created nodes and links
    window.appState.nodes = nodes;
    window.appState.links = links;
    
    // Sync legacy variables for compatibility (AFTER creating nodes/links)
    syncLegacyVariables();
    
    // Emit initialization event
    window.eventBus.emit('system-initialized', {
        n: inputN,
        matrix,
        x: initialX,
        epsilon: initialEpsilon,
        zeroCycle,
        isSkewSymmetric
    });

    // Render the matrix editor
    renderMatrix();
}

function computeDerivatives() {
    // Use DynamicsEngine static method for computation
    return window.dynamicsEngine.constructor.computeDerivatives(window.appState.x, window.appState.epsilon, window.appState.a);
}

function step() {
    console.log('[DEBUG] Step function called');
    const threshold = parseFloat(document.getElementById("extinctionThreshold").value);
    console.log('[DEBUG] Extinction threshold:', threshold);
    
    const zeroCycleMode = document.getElementById("zeroCycle").checked;
    console.log('[DEBUG] Zero cycle mode:', zeroCycleMode);
    
    // Create a state object that matches what DynamicsEngine expects
    const stateForEngine = {
        x: window.appState.x,
        epsilon: window.appState.epsilon,
        a: window.appState.a,  // Use 'a' for matrix
        extinct: window.appState.extinct,
        time: window.appState.time,
        dt: window.appState.dt,
        speedMultiplier: window.appState.speedMultiplier,
        n: window.appState.n,
        history: history,
        ui: {
            extinctionThreshold: threshold
        }
    };
    
    // Use DynamicsEngine static method to perform the step
    const maxChange = window.dynamicsEngine.constructor.step(stateForEngine);
    
    // Update AppState with new values from the modified state
    window.appState.x = stateForEngine.x;
    window.appState.time = stateForEngine.time;
    window.appState.extinct = stateForEngine.extinct;
    
    // Update legacy variables for compatibility
    syncLegacyVariables();
    
    // Update history for time plot (already updated by DynamicsEngine)
    // No need to update history here as DynamicsEngine handles it
    
    // Emit step event
    window.eventBus.emit('simulation-step', {
        time: window.appState.time,
        x: window.appState.x,
        extinct: window.appState.extinct
    });
    
    // Return max change for animation control
    return maxChange;
}

function linkArc(d) {
    const sourceNode = nodes[d.source];
    const targetNode = nodes[d.target];

    // Calculate node radii
    const sourceRadius = Math.sqrt(x[d.source]) * 30 + 5;
    const targetRadius = Math.sqrt(x[d.target]) * 30 + 5;

    // Calculate angle from source to target
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const angle = Math.atan2(dy, dx);

    // Adjust start and end points to be on the surface of circles
    const startX = sourceNode.x + sourceRadius * Math.cos(angle);
    const startY = sourceNode.y + sourceRadius * Math.sin(angle);
    const endX = targetNode.x - targetRadius * Math.cos(angle);
    const endY = targetNode.y - targetRadius * Math.sin(angle);

    const dr = Math.sqrt(dx * dx + dy * dy);

    // Use different curve radii for different directions to separate the edges
    let curveRadius;
    let sweep;

    if (d.source < d.target) {
        // i -> j where i < j: tighter curve
        curveRadius = dr * 0.8;
        sweep = 1;
    } else {
        // j -> i where j < i: wider curve  
        curveRadius = dr * 1.5;
        sweep = 0;
    }

    return `M${startX},${startY}A${curveRadius},${curveRadius} 0 0,${sweep} ${endX},${endY}`;
}

function updateTimePlot() {
    // Find max value for color scaling
    const maxValue = Math.max(...x);

    // Update scales
    const allTimes = history[0].map(d => d.time);
    const allValues = history.flat().map(d => d.value);

    xScale.domain([Math.min(...allTimes), Math.max(...allTimes)]);
    yScale.domain([0, Math.max(...allValues, 1)]);

    // Update axes
    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    // Draw lines for each node
    const lines = linesGroup.selectAll(".time-line")
        .data(history.map((h, i) => ({id: i, data: h, extinct: extinct[i]})));

    lines.exit().remove();

    lines.enter()
        .append("path")
        .attr("class", "time-line")
        .merge(lines)
        .attr("d", d => line(d.data))
        .attr("fill", "none")
        .attr("stroke", d => d.extinct ? "rgba(100, 100, 100, 0.3)" : window.Config.getFallColor(x[d.id], maxValue))
        .attr("stroke-width", d => d.extinct ? 1 : 2)
        .attr("opacity", d => d.extinct ? 0.3 : 0.8)
        .style("filter", d => d.extinct ? "none" : "drop-shadow(0 0 3px currentColor)");
}

function draw() {
    console.log('[DEBUG] Draw function called');
    console.log('[DEBUG] nodes array length:', nodes?.length);
    console.log('[DEBUG] links array length:', links?.length);
    console.log('[DEBUG] extinct array:', extinct?.slice(0, 5));
    console.log('[DEBUG] window.appState.extinct:', window.appState.extinct?.slice(0, 5));
    
    // Filter out extinct nodes and their links
    console.log('[DEBUG] Before filtering - nodes:', nodes?.length, 'extinct array length:', window.appState.extinct?.length);
    console.log('[DEBUG] First few nodes:', nodes?.slice(0, 3)?.map(n => ({id: n.id, extinct: window.appState.extinct[n.id]})));
    console.log('[DEBUG] Current n value:', n, 'x array length:', x?.length);
    
    const activeNodes = nodes.filter(d => !window.appState.extinct[d.id]);
    const activeLinks = links.filter(d => !window.appState.extinct[d.source] && !window.appState.extinct[d.target]);

    console.log('[DEBUG] Draw - Active nodes:', activeNodes.length, 'Active links:', activeLinks.length);

    // Update simulation
    simulation.nodes(activeNodes);

    // Update links
    const link = linkGroup.selectAll(".link")
        .data(activeLinks, d => `${d.source}-${d.target}`);

    link.exit().remove();

    const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .on("mouseover", function(event, d) {
            const linkData = d;
            tooltip.style("display", "block")
                .html(`a[${linkData.source + 1}][${linkData.target + 1}] = ${linkData.value.toFixed(4)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    linkEnter.merge(link)
        .attr("d", linkArc)
        .attr("stroke", d => d.value > 0 ? "rgba(255, 80, 80, 0.6)" : "rgba(80, 120, 255, 0.6)")
        .attr("stroke-width", d => Math.abs(d.value) * 20 + 1.5);

    // Update nodes
    const node = nodeGroup.selectAll(".node")
        .data(activeNodes, d => d.id);

    node.exit().remove();

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle");
    nodeEnter.append("text").attr("class", "node-label");
    nodeEnter.append("text").attr("class", "node-value").attr("dy", 0);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.attr("transform", d => `translate(${d.x},${d.y})`);

    nodeUpdate.select("circle")
        .attr("r", d => Math.sqrt(x[d.id]) * 30 + 5)
        .attr("fill", d => getColor(x[d.id]));

    nodeUpdate.select(".node-label")
        .text(d => d.id + 1);

    nodeUpdate.select(".node-value")
        .attr("y", d => Math.sqrt(x[d.id]) * 30 + 20)
        .text(d => x[d.id].toFixed(3));
}

function animate() {
    console.log('[DEBUG] Animate function called, isPaused:', isPaused, 'appState.isPaused:', window.appState.flags.isPaused);
    
    // Force sync in case of state mismatch
    if (isPaused !== window.appState.flags.isPaused) {
        console.log('[DEBUG] State mismatch detected! Syncing isPaused from appState');
        isPaused = window.appState.flags.isPaused;
    }
    
    if (!isPaused) {
        console.log('[DEBUG] Animation not paused, calling step()');
        const maxChange = step();
        console.log('[DEBUG] Step completed, maxChange:', maxChange);

        // Check if we have access to global variables
        if (typeof nodes === 'undefined') {
            console.error('[ERROR] nodes is undefined in animate()');
            return;
        }
        if (typeof links === 'undefined') {
            console.error('[ERROR] links is undefined in animate()');
            return;
        }

        // Monitor Hamiltonian for oscillation mode
        const zeroCycle = document.getElementById(window.Config.SELECTORS.zeroCycle.substring(1)).checked;
        let hamiltonianInfo = "";
        
        if (zeroCycle && window.appState.x && window.appState.epsilon && window.appState.a) {
            const H = window.dynamicsEngine.constructor.hamiltonian(window.appState.x, window.appState.epsilon, window.appState.a);
            if (H0 === null) H0 = H;
            const dH = H - H0;
            hamiltonianInfo = ` | H: ${H.toFixed(5)} (Δ ${dH.toExponential(2)})`;
        }

        // Filter out extinct nodes
        console.log('[DEBUG] Total nodes:', nodes?.length || 0, 'Total links:', links?.length || 0);
        console.log('[DEBUG] Extinct array length:', window.appState.extinct?.length || 0);
        console.log('[DEBUG] Extinct array sample:', window.appState.extinct?.slice(0, 3), '...');
        console.log('[DEBUG] First node extinct check:', window.appState.extinct?.[0]);
        const activeNodes = nodes?.filter(d => !window.appState.extinct[d.id]) || [];
        const activeLinks = links?.filter(d => !window.appState.extinct[d.source] && !window.appState.extinct[d.target]) || [];

        console.log('[DEBUG] Active nodes:', activeNodes.length, 'Active links:', activeLinks.length);
        console.log('[DEBUG] Current x values:', window.appState.x?.slice(0, 3), '...');
        console.log('[DEBUG] nodeGroup defined:', typeof nodeGroup !== 'undefined');
        console.log('[DEBUG] linkGroup defined:', typeof linkGroup !== 'undefined');

        // Update nodes data binding
        const node = nodeGroup.selectAll(".node")
            .data(activeNodes, d => d.id);

        console.log('[DEBUG] Node selection size:', node.size(), 'Exit size:', node.exit().size());
        node.exit().remove();

        // Update node sizes and colors based on x values
        node.select("circle")
            .attr("r", d => Math.sqrt(window.appState.x[d.id]) * 30 + 5)
            .attr("fill", d => getColor(window.appState.x[d.id]));

        node.select(".node-value")
            .attr("y", d => Math.sqrt(window.appState.x[d.id]) * 30 + 20)
            .text(d => window.appState.x[d.id].toFixed(3));

        // Update links data binding
        const link = linkGroup.selectAll(".link")
            .data(activeLinks, d => `${d.source}-${d.target}`);

        link.exit().remove();

        link.attr("d", linkArc);

        // Update time plot
        updateTimePlot();

        statsDiv.textContent = `Time: ${window.appState.time.toFixed(2)} | Max change: ${maxChange.toFixed(4)}${hamiltonianInfo}`;

        console.log('[DEBUG] Stats updated:', statsDiv.textContent);

        if (maxChange < 0.0001 || window.appState.time >= 1000) {
            console.log('[DEBUG] Animation stopping - maxChange:', maxChange, 'time:', window.appState.time);
            window.eventBus.emit('animation-stopped', { reason: 'convergence-or-timeout' });
            return; // Stop animation
        }
    }

    console.log('[DEBUG] Requesting next animation frame');
    animationId = requestAnimationFrame(animate);
}

function restart() {
    console.log('[DEBUG] Restart function called');
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    initialize();

    console.log('[DEBUG] After initialize - nodes:', nodes?.length || 0, 'links:', links?.length || 0);

    // Fix initial positions
    nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
    });

    // Force start the simulation
    isPaused = false;
    window.appState.flags.isPaused = false; // Also update appState
    console.log('[DEBUG] Setting isPaused to false, appState.flags.isPaused:', window.appState.flags.isPaused);
    
    // TEMPORARY FIX: Enable zero-cycle mode to fix the oscillation issue
    const zeroCycleCheckbox = document.getElementById("zeroCycle");
    const skewCheckbox = document.getElementById("skewSymmetric");
    console.log('[DEBUG] Current checkbox states - zeroCycle:', zeroCycleCheckbox.checked, 'skew:', skewCheckbox.checked);
    
    if (!zeroCycleCheckbox.checked && skewCheckbox.checked) {
        console.log('[DEBUG] Enabling zero-cycle mode to fix oscillations');
        zeroCycleCheckbox.checked = true;
        skewCheckbox.checked = false;
        skewCheckbox.disabled = true;
        // Re-initialize with new settings (call initialize directly to avoid infinite recursion)
        console.log('[DEBUG] Re-initializing with zero-cycle mode...');
        initialize();
    }
    
    const playPauseBtn = document.getElementById("playPauseBtn");
    playPauseBtn.innerHTML = '<span class="icon icon-pause"></span>';
    playPauseBtn.title = "Pause";

    draw();
    updateTimePlot();
    drawStructureGraph();
    updateEigenvaluePlot();
    updateComplexPlot();
    
    // Force start animation if it's not running
    console.log('[DEBUG] About to start animation, animationId:', animationId);
    if (animationId === null) {
        console.log('[DEBUG] Starting animation...');
        animate();
    }

    // Allow nodes to be draggable after initial layout
    setTimeout(() => {
        nodes.forEach(node => {
            node.fx = node.x;
            node.fy = node.y;
        });
    }, 100);

    animate();
}

document.getElementById("restartBtn").addEventListener("click", restart);
document.getElementById("numNodes").addEventListener("change", restart);
document.getElementById("connectionProb").addEventListener("change", restart);
document.getElementById("interactionRange").addEventListener("change", restart);
document.getElementById("zeroCycle").addEventListener("change", () => {
    syncSkewAvailability();
    restart();
});
document.getElementById("skewSymmetric").addEventListener("change", () => {
    if (document.getElementById("zeroCycle").checked) {
        return;
    }
    const isSkewSymmetric = document.getElementById("skewSymmetric").checked;

    if (isSkewSymmetric) {
        // Convert current matrix to skew-symmetric
        for (let i = 0; i < n; i++) {
            a[i][i] = 0;
            for (let j = i + 1; j < n; j++) {
                // Keep upper triangle, make lower opposite
                a[j][i] = -a[i][j];
            }
        }
        updateLinks();
        renderMatrix();
    }
});

document.getElementById("playPauseBtn").addEventListener("click", () => {
    isPaused = !isPaused;
    const btn = document.getElementById("playPauseBtn");
    if (isPaused) {
        btn.innerHTML = '<span class="icon icon-play"></span>';
        btn.title = "Play";
    } else {
        btn.innerHTML = '<span class="icon icon-pause"></span>';
        btn.title = "Pause";
    }

    if (!isPaused && animationId === null) {
        animate();
    }
});

document.getElementById("speedSlider").addEventListener("input", e => {
    speedMultiplier = parseFloat(e.target.value);
    document.getElementById("speedValue").textContent = speedMultiplier.toFixed(1) + "x";
});

// Toggle structure graph
document.getElementById("toggleStructure").addEventListener("click", () => {
    const panel = document.getElementById("structurePanel");
    const arrow = document.getElementById("structureArrow");
    const button = document.getElementById("toggleStructure");

    if (panel.style.display === "none") {
        panel.style.display = "flex";
        arrow.style.transform = "rotate(90deg)";
        button.classList.add("active");
    } else {
        panel.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
        button.classList.remove("active");
    }
});

function syncSkewAvailability() {
    const zeroCycleCheckbox = document.getElementById("zeroCycle");
    const skewCheckbox = document.getElementById("skewSymmetric");
    if (zeroCycleCheckbox.checked) {
        skewCheckbox.checked = false;
        skewCheckbox.disabled = true;
    } else {
        skewCheckbox.disabled = false;
    }
}

syncSkewAvailability();

restart();

    } catch (error) {
        console.error('[ERROR] Main execution failed:', error);
        console.error('[ERROR] Stack trace:', error.stack);
    }
} // End of initializeApplication function
