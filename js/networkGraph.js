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
        const hexRadius = 125;

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
        // Make a theme color map and fill it out with themes and distinct colors
        let colorMap = {
            'Creator 3-in-1': 'red',
            'Ninjago': 'orange',
            'Friends': 'yellow',
            'Harry Potter': 'green',
            'Technic': 'blue',
            'Start Wars': 'purple'
        };


        const circleData = [];

        Object.keys(vis.data).forEach(d => {
            // Generate random coordinates within the hexagon
            let randomX, randomY;
            do {
                randomX = Math.random() * (2 * hexRadius) - hexRadius + vis.config.containerWidth / 2;
                randomY = Math.random() * (2 * hexRadius) - hexRadius + vis.config.containerHeight / 2;
            } while (!pointInHexagon(randomX, randomY, hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, hexRadius)));

            circleData.push({ x: randomX, y: randomY, setNum: d });
        });

        function pointInHexagon(x, y, hexagonPoints) {
            let isInside = false;
            for (let i = 0, j = hexagonPoints.length - 1; i < hexagonPoints.length; j = i++) {
                const xi = hexagonPoints[i].x, yi = hexagonPoints[i].y;
                const xj = hexagonPoints[j].x, yj = hexagonPoints[j].y;

                const intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) isInside = !isInside;
            }
            return isInside;
        }

        svg.selectAll('.circle')
            .data(circleData)
            .enter().append('circle')
            .attr('class', 'circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 2) // Set your desired radius
            .attr('fill', d => colorMap[vis.data[d.setNum].theme_name] ? colorMap[vis.data[d.setNum].theme_name] : 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '1')
            .on('mouseover', function (d) {
                d3.select(this).raise();
            })




    }

    updateVis() {
        // Update visualization if needed
    }

    renderVis() {
        // Render visualization if needed
    }
}
