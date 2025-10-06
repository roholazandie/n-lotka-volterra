const width = 800;
const height = 600;
const svg = d3.select("#graph");
const tooltip = d3.select("#tooltip");
const statsDiv = document.getElementById("stats");

// Structure graph setup
const structureWidth = 800;
const structureHeight = 600;
const structureSvg = d3.select("#structureGraph");

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

// Time plot setup
const timePlotSvg = d3.select("#timePlot");
const timePlotWidth = 800;
const timePlotHeight = 300;
const timePlotMargin = {top: 20, right: 30, bottom: 40, left: 50};
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

// Eigenvalue plot setup
const eigenvaluePlotSvg = d3.select("#eigenvaluePlot");
const eigenvaluePlotWidth = 800;
const eigenvaluePlotHeight = 300;
const eigenvaluePlotMargin = {top: 20, right: 30, bottom: 40, left: 50};
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

// Complex plane plot setup
const complexPlotSvg = d3.select("#complexPlot");
const complexPlotWidth = 800;
const complexPlotHeight = 500;
const complexPlotMargin = {top: 30, right: 30, bottom: 50, left: 60};
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

// Fall color scale - yellows to oranges to deep reds
function getFallColor(value, maxValue) {
    const t = Math.min(value / (maxValue || 1), 1);
    // Autumn palette: light yellow -> orange -> red -> deep red/brown
    const colors = [
        [255, 235, 140], // Light yellow
        [255, 200, 80],  // Golden
        [255, 150, 50],  // Orange
        [255, 100, 50],  // Red-orange
        [200, 50, 50],   // Deep red
        [150, 40, 30]    // Brown-red
    ];

    const idx = t * (colors.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;

    if (i >= colors.length - 1) return `rgb(${colors[colors.length - 1].join(',')})`;

    const c1 = colors[i];
    const c2 = colors[i + 1];
    const r = Math.floor(c1[0] + (c2[0] - c1[0]) * f);
    const g = Math.floor(c1[1] + (c2[1] - c1[1]) * f);
    const b = Math.floor(c1[2] + (c2[2] - c1[2]) * f);

    return `rgb(${r},${g},${b})`;
}

function updateEigenvaluePlot() {
    try {
        // Check if matrix is valid
        if (!a || a.length === 0) {
            console.warn("Matrix not initialized");
            return;
        }

        // Calculate eigenvalues using numeric.js (more robust)
        const eigenResult = numeric.eig(a);

        // Check if eigenResult is valid
        if (!eigenResult || !eigenResult.lambda) {
            console.warn("Eigenvalue computation returned invalid result");
            return;
        }

        // Extract eigenvalues and compute absolute values
        let eigenvalues = [];

        if (eigenResult.lambda.x && eigenResult.lambda.y) {
            // Complex eigenvalues
            for (let i = 0; i < eigenResult.lambda.x.length; i++) {
                const real = eigenResult.lambda.x[i] || 0;
                const imag = eigenResult.lambda.y[i] || 0;
                eigenvalues.push(Math.sqrt(real * real + imag * imag));
            }
        } else if (Array.isArray(eigenResult.lambda)) {
            // All real eigenvalues
            eigenvalues = eigenResult.lambda.map(ev => Math.abs(ev || 0));
        } else {
            console.warn("Unexpected eigenvalue format");
            return;
        }

        // Sort in decreasing order
        eigenvalues.sort((a, b) => b - a);

        // Create data for bar chart
        const eigenData = eigenvalues.map((value, i) => ({
            index: i + 1,
            value: value
        }));

        // Update scales
        xScaleEigen.domain(eigenData.map(d => d.index));
        yScaleEigen.domain([0, Math.max(...eigenvalues) * 1.1 || 1]);

        // Update axes
        xAxisEigenG.call(xAxisEigen);
        yAxisEigenG.call(yAxisEigen);

        // Draw bars
        const bars = barsGroup.selectAll(".eigen-bar")
            .data(eigenData);

        bars.exit().remove();

        bars.enter()
            .append("rect")
            .attr("class", "eigen-bar")
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                    .html(`λ${d.index}: ${d.value.toFixed(4)}`)
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
            .attr("fill", (d, i) => {
                // Gradient from bright purple to deep blue
                const t = i / (eigenData.length - 1);
                const r = Math.floor(102 + (70 - 102) * t);
                const g = Math.floor(126 + (90 - 126) * t);
                const b = Math.floor(234 + (180 - 234) * t);
                return `rgb(${r}, ${g}, ${b})`;
            })
            .attr("opacity", 0.8)
            .attr("rx", 4);

    } catch (error) {
        console.warn("Could not compute eigenvalues:", error.message);
        barsGroup.selectAll(".eigen-bar").remove();
    }
}

function updateComplexPlot() {
    try {
        // Calculate eigenvalues using numeric.js
        const eigenResult = numeric.eig(a);

        // Extract real and imaginary parts
        const eigenData = [];

        if (eigenResult.lambda && eigenResult.lambda.x) {
            // Complex eigenvalues
            for (let i = 0; i < eigenResult.lambda.x.length; i++) {
                const real = eigenResult.lambda.x[i];
                const imag = eigenResult.lambda.y[i];
                eigenData.push({
                    real: real,
                    imag: imag,
                    magnitude: Math.sqrt(real * real + imag * imag),
                    index: i + 1
                });
            }
        } else {
            // All real eigenvalues
            eigenResult.lambda.forEach((ev, i) => {
                eigenData.push({
                    real: ev,
                    imag: 0,
                    magnitude: Math.abs(ev),
                    index: i + 1
                });
            });
        }

        // Calculate domain centered at origin with equal scale
        const realValues = eigenData.map(d => d.real);
        const imagValues = eigenData.map(d => d.imag);
        const maxReal = Math.max(...realValues, 0.1);
        const minReal = Math.min(...realValues, -0.1);
        const maxImag = Math.max(...imagValues, 0.1);
        const minImag = Math.min(...imagValues, -0.1);

        // Make domain symmetric around 0 and equal scale for x and y
        const maxAbsReal = Math.max(Math.abs(maxReal), Math.abs(minReal));
        const maxAbsImag = Math.max(Math.abs(maxImag), Math.abs(minImag));

        // Use the larger of the two to ensure equal scaling
        const maxRange = Math.max(maxAbsReal, maxAbsImag) * 1.2;

        // Update scales - centered at origin with equal scale
        xScaleComplex.domain([-maxRange, maxRange]);
        yScaleComplex.domain([-maxRange, maxRange]);

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
            .data(eigenData);

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
            .attr("stroke", d => {
                // Match the color of the eigenvalue point
                const angle = Math.atan2(d.imag, d.real);
                const hue = (angle * 180 / Math.PI + 180) % 360;
                return `hsla(${hue}, 70%, 60%, 0.3)`;
            });

        // Draw eigenvalue points
        const points = eigenPointsGroup.selectAll(".eigen-point")
            .data(eigenData);

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

                let eigenStr;
                if (Math.abs(d.imag) < 0.0001) {
                    // Pure real eigenvalue
                    eigenStr = d.real.toFixed(4);
                } else {
                    // Complex eigenvalue
                    const realPart = d.real.toFixed(4);
                    const imagPart = Math.abs(d.imag).toFixed(4);
                    const sign = d.imag >= 0 ? "+" : "-";
                    eigenStr = `${realPart} ${sign} ${imagPart}i`;
                }

                tooltip.style("display", "block")
                    .html(`λ${d.index}: ${eigenStr}<br>|λ| = ${d.magnitude.toFixed(4)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", d => Math.sqrt(d.magnitude) * 5 + 3);

                tooltip.style("display", "none");
            });

        pointsEnter.merge(points)
            .transition()
            .duration(500)
            .attr("cx", d => xScaleComplex(d.real))
            .attr("cy", d => yScaleComplex(d.imag))
            .attr("r", d => Math.sqrt(d.magnitude) * 5 + 3)
            .attr("fill", d => {
                // Color based on position in complex plane
                const angle = Math.atan2(d.imag, d.real);
                const hue = (angle * 180 / Math.PI + 180) % 360;
                return `hsl(${hue}, 70%, 60%)`;
            })
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
    const radius = 220;
    const nodeRadius = 20;

    // Position nodes in a circle
    const structureNodes = [];
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        structureNodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    // Create structure links based on adjacency matrix
    const structureLinks = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.abs(a[i][j]) > 0.001) {
                structureLinks.push({
                    source: structureNodes[i],
                    target: structureNodes[j],
                    value: a[i][j]
                });
            }
        }
    }

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
    const isSkewSymmetric = document.getElementById("skewSymmetric").checked;

    let html = '<table class="matrix-table"><thead><tr><th></th>';

    // Column headers
    for (let j = 0; j < n; j++) {
        html += `<th>${j + 1}</th>`;
    }
    html += "</tr></thead><tbody>";

    // Matrix rows
    for (let i = 0; i < n; i++) {
        html += `<tr><th>${i + 1}</th>`;
        for (let j = 0; j < n; j++) {
            const value = a[i][j];
            let className = "matrix-cell";
            let readonly = "";
            let displayValue = value;

            if (i === j) {
                // Diagonal
                className += " diagonal";
                readonly = isSkewSymmetric ? "readonly" : "";
            } else if (isSkewSymmetric && i < j) {
                // Upper triangle in skew-symmetric mode - show -a[j][i] and make readonly
                displayValue = -a[j][i];
                readonly = "readonly";
                className += " upper-triangle";
            }

            // Color based on display value
            if (Math.abs(displayValue) < 0.001) {
                className += " zero";
            } else if (displayValue > 0) {
                className += " positive";
            } else {
                className += " negative";
            }

            html += `<td><input type="number" class="${className}" 
                     data-i="${i}" data-j="${j}" 
                     value="${displayValue.toFixed(3)}" 
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

            a[i][j] = value;

            // If skew-symmetric and lower triangle, update the upper triangle
            if (isSkewSymmetric && i !== j) {
                a[j][i] = -value;
            }

            // Update the links in the graph
            updateLinks();

            // Re-render matrix to update colors and paired values
            renderMatrix();
        });

        input.addEventListener("input", e => {
            const value = parseFloat(e.target.value) || 0;

            // Update cell appearance based on value
            e.target.classList.remove("positive", "negative", "zero");
            if (Math.abs(value) < 0.001) {
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
    // Recreate links based on current matrix values
    links = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.abs(a[i][j]) > 0.001) {
                links.push({
                    source: i,
                    target: j,
                    value: a[i][j]
                });
            }
        }
    }

    // Redraw the graph
    draw();

    // Update structure graph
    drawStructureGraph();

    // Update eigenvalue plots
    updateEigenvaluePlot();
    updateComplexPlot();
}

let n = 10;
let x = [];
let epsilon = [];
let a = [];
let nodes = [];
let links = [];
let time = 0;
let dt = 0.01;
let animationId = null;
let extinct = []; // Track which nodes are extinct
let history = []; // Store time series data for each node
let isPaused = false;
let speedMultiplier = 1;
let zeroCycleDiagonal = null;

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

    const cycles = sampleCyclesFromMatrix(a);
    const analyses = cycles
        .map(cycle => analyzeCycleParity(cycle, a))
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
}

function initialize() {
    n = parseInt(document.getElementById("numNodes").value);
    time = 0;
    const isSkewSymmetric = document.getElementById("skewSymmetric").checked;
    const zeroCycle = document.getElementById("zeroCycle").checked;
    const interactionRangeInput = parseFloat(document.getElementById("interactionRange").value);
    const connectionProbInput = parseFloat(document.getElementById("connectionProb").value);
    const interactionRange = Number.isFinite(interactionRangeInput) ? interactionRangeInput : 1;
    const connectionProbability = Number.isFinite(connectionProbInput) ? connectionProbInput : 0.4;

    const randomWeight = () => (Math.random() * 2 - 1) * interactionRange;
    const randomNegativeDiagonal = () => {
        const base = Math.max(interactionRange * 0.15, 0.05);
        const spread = Math.max(interactionRange * 0.5, 0.1);
        return -(Math.random() * spread + base);
    };

    // Initialize state variables
    x = Array(n).fill(0).map(() => Math.random() * 0.5 + 0.1);
    epsilon = Array(n).fill(0).map(() => (Math.random() - 0.5) * 0.5);
    extinct = Array(n).fill(false); // No nodes extinct at start

    // Initialize history for time plot
    history = Array(n).fill(0).map(() => []);
    for (let i = 0; i < n; i++) {
        history[i].push({time: 0, value: x[i]});
    }

    // Initialize interaction matrix
    if (zeroCycle) {
        const {matrix, diag} = generateZeroCycleMatrix(
            n,
            connectionProbability,
            interactionRange,
            {zeroDiagonal: true}
        );
        a = matrix;
        zeroCycleDiagonal = diag;
        logZeroCycleResidual(a, zeroCycleDiagonal);
    } else if (isSkewSymmetric) {
        zeroCycleDiagonal = null;
        a = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            a[i][i] = 0;
            for (let j = i + 1; j < n; j++) {
                if (Math.random() < connectionProbability) {
                    const value = randomWeight();
                    a[i][j] = value;
                    a[j][i] = -value;
                }
            }
        }
    } else {
        zeroCycleDiagonal = null;
        a = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && Math.random() < connectionProbability) {
                    a[i][j] = randomWeight();
                }
            }
            a[i][i] = randomNegativeDiagonal();
        }
    }

    // Create nodes
    nodes = [];
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        nodes.push({
            id: i,
            x: width / 2 + 220 * Math.cos(angle),
            y: height / 2 + 220 * Math.sin(angle)
        });
    }

    // Create links
    links = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.abs(a[i][j]) > 0.001) {
                links.push({
                    source: i,
                    target: j,
                    value: a[i][j]
                });
            }
        }
    }

    // Render the matrix editor
    renderMatrix();
}

function computeDerivatives() {
    const dxdt = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = epsilon[i];
        for (let k = 0; k < n; k++) {
            sum += a[i][k] * x[k];
        }
        dxdt[i] = x[i] * sum;
    }
    return dxdt;
}

function step() {
    const threshold = parseFloat(document.getElementById("extinctionThreshold").value);
    const dxdt = computeDerivatives();
    let maxChange = 0;

    const effectiveDt = dt * speedMultiplier;

    for (let i = 0; i < n; i++) {
        if (!extinct[i]) {
            x[i] += dxdt[i] * effectiveDt;
            if (x[i] < 0.0001) x[i] = 0.0001;
            if (x[i] > 1000) x[i] = 1000; // Prevent extreme explosion

            // Check for extinction
            if (x[i] < threshold) {
                extinct[i] = true;
                x[i] = 0; // Set to 0 for extinct species
            }

            maxChange = Math.max(maxChange, Math.abs(dxdt[i]));
        }
    }

    time += effectiveDt;

    // Record history every 0.1 time units for performance
    if (Math.floor(time * 10) > Math.floor((time - effectiveDt) * 10)) {
        for (let i = 0; i < n; i++) {
            history[i].push({time: time, value: x[i]});
            // Keep last 500 points
            if (history[i].length > 500) {
                history[i].shift();
            }
        }
    }

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
        .attr("stroke", d => d.extinct ? "rgba(100, 100, 100, 0.3)" : getFallColor(x[d.id], maxValue))
        .attr("stroke-width", d => d.extinct ? 1 : 2)
        .attr("opacity", d => d.extinct ? 0.3 : 0.8)
        .style("filter", d => d.extinct ? "none" : "drop-shadow(0 0 3px currentColor)");
}

function draw() {
    // Filter out extinct nodes and their links
    const activeNodes = nodes.filter(d => !extinct[d.id]);
    const activeLinks = links.filter(d => !extinct[d.source] && !extinct[d.target]);

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
    if (!isPaused) {
        const maxChange = step();

        // Filter out extinct nodes
        const activeNodes = nodes.filter(d => !extinct[d.id]);
        const activeLinks = links.filter(d => !extinct[d.source] && !extinct[d.target]);

        // Update nodes data binding
        const node = nodeGroup.selectAll(".node")
            .data(activeNodes, d => d.id);

        node.exit().remove();

        // Update node sizes and colors based on x values
        node.select("circle")
            .attr("r", d => Math.sqrt(x[d.id]) * 30 + 5)
            .attr("fill", d => getColor(x[d.id]));

        node.select(".node-value")
            .attr("y", d => Math.sqrt(x[d.id]) * 30 + 20)
            .text(d => x[d.id].toFixed(3));

        // Update links data binding
        const link = linkGroup.selectAll(".link")
            .data(activeLinks, d => `${d.source}-${d.target}`);

        link.exit().remove();

        link.attr("d", linkArc);

        // Update time plot
        updateTimePlot();

        statsDiv.textContent = `Time: ${time.toFixed(2)} | Max change: ${maxChange.toFixed(4)}`;

        if (maxChange < 0.0001 || time >= 1000) {
            return; // Stop animation
        }
    }

    animationId = requestAnimationFrame(animate);
}

function restart() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    initialize();

    // Fix initial positions
    nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
    });

    isPaused = false;
    const playPauseBtn = document.getElementById("playPauseBtn");
    playPauseBtn.innerHTML = '<span class="icon icon-pause"></span>';
    playPauseBtn.title = "Pause";

    draw();
    updateTimePlot();
    drawStructureGraph();
    updateEigenvaluePlot();
    updateComplexPlot();

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
