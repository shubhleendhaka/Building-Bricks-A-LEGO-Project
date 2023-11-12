class NetworkGraph {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 400,
            containerHeight: 400,
            margin: {
                top: 30,
                right: 5,
                bottom: 20,
                left: 30
            }
        };
        this.dispatcher = dispatcher;
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        console.log(Object.keys(vis.data).length, " items in the data");

        // Set up SVG container
        let svg = vis.config.parentElement.append('svg')
            .attr('id', 'network-graph')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Hexagon properties
        const hexRadius = 100;

        // Function to generate hexagon points
        function hexagonPoints(x, y, radius) {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (2 * Math.PI / 6) * i;
                const pointX = x + radius * Math.cos(angle);
                const pointY = y + radius * Math.sin(angle);
                points.push({ x: pointX, y: pointY });
            }
            return points;
        }

        // Hexagon data
        const hexagonData = [
            { color: 'red', label: 'A' },
            { color: 'orange', label: 'B' },
            { color: 'yellow', label: 'C' },
            { color: 'green', label: 'D' },
            { color: 'blue', label: 'E' },
            { color: 'purple', label: 'F' }
        ];

        // Draw hexagon edges
        svg.selectAll('.edge')
            .data(hexagonData)
            .enter().append('line')
            .attr('class', 'edge')
            .attr('x1', (d, i) => hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, hexRadius)[i].x)
            .attr('y1', (d, i) => hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, hexRadius)[i].y)
            .attr('x2', (d, i, nodes) => hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, hexRadius)[(i + 1) % nodes.length].x)
            .attr('y2', (d, i, nodes) => hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, hexRadius)[(i + 1) % nodes.length].y)
            .attr('stroke', d => d.color)
            .attr('stroke-width', '2');




    }

    updateVis() {
        // Update visualization if needed
    }

    renderVis() {
        // Render visualization if needed
    }
}

