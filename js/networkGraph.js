class NetworkGraph {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 0,
                right: 0,
                bottom: 20,
                left: 0
            }
        };
        this.dispatcher = dispatcher;
        this.data = data;
        this.cardData = [];
        this.hoveredSet = null;
        this.clickedSet = null;
        this.attachedPoints = [];
        this.lineData = [];
        this.initVis();

    }

    hexagonPoints(x, y, radius) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (2 * Math.PI / 6) * i;
            const pointX = x + radius * Math.cos(angle);
            const pointY = y + radius * Math.sin(angle);
            points.push({ x: pointX, y: pointY });
        }
        return points;
    }

    initVis() {
        let vis = this;

        // Set up SVG container
        vis.svg = vis.config.parentElement.append('svg')
            .attr('id', 'network-graph')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Hexagon properties
        vis.hexRadius = 300;
        vis.centerX = vis.config.containerWidth / 2 + vis.config.margin.left;
        vis.centerY = vis.config.containerHeight / 2 + vis.config.margin.top;

        // Hexagon data
        vis.hexagonData = [
            { color: '#fb8072', label: 'Books', angle: -60, offset: 20, xOffset: -10, yOffset: 20 },   // Red
            { color: '#80b1d3', label: 'Key Chain', angle: 0, offset: 20, xOffset: -10, yOffset: 0 },   // Blue
            { color: '#ffe246', label: 'Friends', angle: 60, offset: 20, xOffset: -8, yOffset: -10 },   // Yellow
            { color: '#8dd3c7', label: 'Gear', angle: -60, offset: -15, xOffset: 10, yOffset: -20 },   // Green
            { color: '#fdb462', label: 'Ninjago', angle: 0, offset: -18, xOffset: 25, yOffset: -3 },   // Orange
            { color: '#bebada', label: 'Star Wars', angle: 60, offset: -15, xOffset: 10, yOffset: 15 }    // Purple
        ];

        // Map theme to hex
        vis.colorMap = {
            'Books': '#fb8072',             // Red
            'Key Chain': '#80b1d3',         // Blue
            'Friends': '#ffe246',           // Yellow
            'Gear': '#8dd3c7',              // Green
            'Ninjago': '#fdb462',           // Orange
            'Star Wars': '#bebada'          // Purple
        };

        // Draw hexagon edges
        vis.svg.selectAll('.edge')
            .data(vis.hexagonData)
            .enter().append('line')
            .attr('class', 'edge')
            .attr('x1', (d, i) => vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].x)
            .attr('y1', (d, i) => vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].y)
            .attr('x2', (d, i, nodes) => vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % nodes.length].x)
            .attr('y2', (d, i, nodes) => vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % nodes.length].y)
            .attr('stroke', d => d.color)
            .attr('stroke-width', '10')
            .attr('stroke-linecap', 'round');

        // Draw hexagon edge labels
        let labels = vis.svg.selectAll('.edge-label')
            .data(vis.hexagonData);

        // Adjust the labels to correct positions for each edge
        labels.enter().append('text')
            .merge(labels)
            .attr('class', 'edge-label')
            .attr('x', (d, i) => {
                const midX = (vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].x
                    + vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % vis.hexagonData.length].x) / 2;
                return midX + d.offset + (d.xOffset || 0); 
            })
            .attr('y', (d, i) => {
                const midY = (vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].y
                    + vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % vis.hexagonData.length].y) / 2;
                return midY + d.offset + (d.yOffset || 0);
            })
            .attr('fill', d => d.color)
            .text(d => d.label)
            .attr('font-size', '25px')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('transform', (d, i) => {
                let x = (vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].x
                    + vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % vis.hexagonData.length].x) / 2
                    + (d.xOffset || 0); 
                let y = (vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[i].y
                    + vis.hexagonPoints(vis.centerX, vis.centerY, vis.hexRadius)[(i + 1) % vis.hexagonData.length].y) / 2
                    + (d.yOffset || 0); 
                return `rotate(${d.angle},${x},${y})`;
            });

        vis.updateData(vis.data);
    }

    updateData(data) {
        let vis = this;
        vis.data = data;
        vis.circleData = [];
        vis.clickedSet = null;
        vis.attachedPoints = [];
        vis.lineData = [];

        // Push initial data for each point -> Each point should initialize in center of hexagon before forces move them around
        vis.data.forEach(d => {
            vis.circleData.push({ x: d.x, y: d.y, setNum: d.set_num, data: d })
        });

        vis.updateVis();
    }

    updateVis() {
        // Update visualization if needed
        let vis = this;

        vis.renderVis();
    }

    updateStyle() {
        let vis = this;
        vis.svg.selectAll('.circle')
            .attr('opacity', function (d) {
                if (vis.clickedSet === null || vis.clickedSet.set_num === d.setNum || (vis.hoveredSet && vis.hoveredSet.set_num === d.setNum) || vis.attachedPoints.includes(d.setNum)) {
                    return '1';
                } else {
                    return '0.2';
                }
            })
            .attr('stroke-width', function (d) {
                if (vis.clickedSet !== null && (vis.clickedSet.set_num === d.setNum || vis.attachedPoints.includes(d.setNum))) {
                    return 1.5;
                } else return 0
            })
            .attr('stroke-dasharray', function (d) {
                if (vis.hoveredSet !== null && vis.hoveredSet.set_num === d.setNum) {
                    return '2, 1';
                } else return 'none'
            })
            .attr('fill', d => {
                if (vis.clickedSet && d.setNum === vis.clickedSet.set_num) {
                    return 'black';
                } else return (
                    vis.colorMap[d.data.theme_name] ? vis.colorMap[d.data.theme_name] : 'white')
            });
    }

    updateLines() {
        let vis = this;

        if (vis.clickedSet !== null) {
            vis.attachedPoints = vis.clickedSet.top_5_similar_sets;
            vis.selectedPointX = vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).x;
            vis.selectedPointY = vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).y;
            vis.lineData = []
            vis.attachedPoints.forEach(pointId => {
                let point = vis.circleData.filter(d => d.setNum === pointId);
                point = point[0];
                if (point !== undefined) {
                    vis.lineData.push({
                        source: { x: vis.selectedPointX, y: vis.selectedPointY },
                        target: { x: point.x, y: point.y }
                    });
                }
            });

        } else {
            vis.attachedPoints = [];
            vis.lineData = [];
        }

        // Draw lines between points
        let lines = vis.svg.selectAll('.connector')
            .data(vis.lineData);

        lines.enter().append('line')
            .merge(lines)
            .attr('class', 'connector')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5')
            .lower();

        // Exit and remove unused lines
        lines.exit().remove();
    }

    renderVis() {
        // Render visualization if needed
        let vis = this;

        // Draw the points for each set
            // Notice cx and cy are taken from data -- No longer computed by force simulation
        let circles = vis.svg.selectAll('.circle')
            .data(vis.circleData);

        circles.enter().append('circle')
            .attr('class', 'circle')
            .attr('id', d => d.setNum)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 3) // Set your desired radius
            .attr('fill', d => vis.colorMap[d.data.theme_name] ? vis.colorMap[d.data.theme_name] : 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '0') 
            .on('mouseover', function (event, d) {
                if (vis.clickedSet === null || vis.clickedSet.set_num !== d.setNum) {
                    vis.hoveredSet = d.data;
                    d3.select(this).raise();
                    vis.updateStyle();
                    vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                }
            })
            .on('mouseout', function (event, d) {
                if (vis.clickedSet === null || vis.clickedSet.set_num !== d.setNum) {
                    vis.hoveredSet = null;

                    vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                    vis.updateStyle();
                }
            })
            .on('click', function (event, d) {
                if (vis.clickedSet && vis.clickedSet.set_num === d.setNum) {
                    vis.clickedSet = null;
                    vis.hoveredSet = d.data;
                    vis.attachedPoints = [];
                    vis.lineData = [];

                } else {
                    vis.clickedSet = d.data;
                    vis.hoveredSet = null;
                    vis.selectedPointX = d.x;
                    vis.selectedPointY = d.y;
                }
                vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);

                vis.updateLines();
                vis.updateStyle();


            })

        // Update circles
        circles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('fill', d => {
                if (vis.clickedSet && d.setNum === vis.clickedSet.set_num) {
                    return 'black';
                } else return (
                    vis.colorMap[d.data.theme_name] ? vis.colorMap[d.data.theme_name] : 'white')
            });

        // Exit and remove unused circles
        circles.exit().remove();

        vis.updateLines();
        vis.updateStyle();

    }
}

