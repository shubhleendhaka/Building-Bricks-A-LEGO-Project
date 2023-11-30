class Hexagon {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 0,
                right: 5,
                bottom: 20,
                left: 0
            }
        };
        this.dispatcher = dispatcher;
        this.data = data;
        this.initVis();
        this.cardData = [];
        this.hoveredSet = null;
        this.clickedSet = null;
    }



    initVis() {
        let vis = this;
        console.log(Object.keys(vis.data).length, " items in the data");

        // Set up SVG container
        vis.svg = vis.config.parentElement.append('svg')
            .attr('id', 'network-graph')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Hexagon properties
        const hexRadius = 300;

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
            { color: '#fb8072', label: 'A' },   // Red
            { color: '#fdb462', label: 'B' },   // Orange
            { color: '#ffe45e', label: 'C' },   // Yellow
            { color: '#8dd3c7', label: 'D' },   // Green
            { color: '#80b1d3', label: 'E' },   // Blue
            { color: '#bebada', label: 'F' }    // Purple
        ];

        let colorMap = {
            'Books': '#fb8072',    // Red
            'Key Chain': '#fdb462',           // Orange
            'Friends': '#ffe45e',           // Yellow
            'Gear': '#8dd3c7',      // Green
            'Ninjago': '#80b1d3',           // Blue
            'Star Wars': '#bebada'          // Purple
        };

        // Draw hexagon edges
        vis.svg.selectAll('.edge')
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

        const circleData = [];

        console.log(vis.data);
        console.log(Object.values(vis.data)[0]);

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

        // ! POINTS CHOSEN FOR STATIC VISUALIZATION FOR M3 (next 4 lines)
        const hoverPoint = '30277-1';
        const selectedPoint = '42089-1';
        const attachedPoints = ['75094-1', '561508-1', '41135-1', '75046-1', '75033-1']
        // const staticPoints = [hoverPoint, selectedPoint, ...attachedPoints];
        let staticPoints = []



        vis.svg.selectAll('.circle')
            .data(circleData)
            .enter().append('circle')
            .attr('class', 'circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 3) // Set your desired radius
            .attr('fill', d => colorMap[vis.data[d.setNum].theme_name] ? colorMap[vis.data[d.setNum].theme_name] : 'white')
            .attr('stroke', 'black')
            .attr('stroke-dasharray', d => d.setNum === '30277-1' ? '2, 1' : 'none') // ! STATIC VISUALIZATION FOR M3
            .attr('stroke-width', d => staticPoints.includes(d.setNum) ? '1.5' : '0') // ! STATIC VISUALIZATION FOR M3
            .on('click', function (event, d) {
                // Toggle presence of setNum in cardData
                if (vis.clickedSet === d.setNum) {
                    vis.clickedSet = null;
                } else {
                    vis.clickedSet = d.setNum;
                }
                console.log([vis.clickedSet, vis.hoveredSet]);
                vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);

                vis.updateVis();
            })
            .on('mouseover', function (event, d) {
                vis.hoveredSet = d.setNum;
                vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);

                vis.updateVis();
            })
            .on('mouseout', function (event, d) {
                vis.hoveredSet = null;
                vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                vis.updateVis();
            });




        // // ! LINES FOR STATIC VISUALIZATION FOR M3 (next 11 lines)
        // const selectedPointX = circleData.find(d => d.setNum === selectedPoint).x;
        // const selectedPointY = circleData.find(d => d.setNum === selectedPoint).y;
        // attachedPoints.forEach(pointId => {
        //     const point = circleData.find(d => d.setNum === pointId);
        //     svg.append('line')
        //         .attr('x1', selectedPointX)
        //         .attr('y1', selectedPointY)
        //         .attr('x2', point.x)
        //         .attr('y2', point.y)
        //         .attr('stroke', 'black')
        //         .attr('stroke-width', '0.5')
        //         .lower();
        // })

    }

    updateVis() {
        // Update visualization if needed
        let vis = this;
        vis.svg.selectAll('.circle')
            .attr('opacity', function (d) {
                if (vis.clickedSet == null || vis.clickedSet === d.setNum || vis.hoveredSet === d.setNum) {
                    return '1';
                } else {
                    return '0.2';
                }
            });
    }

    renderVis() {
        // Render visualization if needed
    }
}
