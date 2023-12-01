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
        this.cardData = [];
        this.hoveredSet = null;
        this.clickedSet = null;
        this.attachedPoints = [];
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

    pointInHexagon(x, y, hexagonPoints) {
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
        vis.hexRadius = 300;

        // Function to generate hexagon points


        // Hexagon data
        vis.hexagonData = [
            { color: '#fb8072', label: 'A' },   // Red
            { color: '#fdb462', label: 'B' },   // Orange
            { color: '#ffe45e', label: 'C' },   // Yellow
            { color: '#8dd3c7', label: 'D' },   // Green
            { color: '#80b1d3', label: 'E' },   // Blue
            { color: '#bebada', label: 'F' }    // Purple
        ];

        vis.colorMap = {
            'Books': '#fb8072',    // Red
            'Key Chain': '#fdb462',           // Orange
            'Friends': '#ffe45e',           // Yellow
            'Gear': '#8dd3c7',      // Green
            'Ninjago': '#80b1d3',           // Blue
            'Star Wars': '#bebada'          // Purple
        };

        // Draw hexagon edges

        // Make a theme color map and fill it out with themes and distinct colors


        console.log(vis.data);
        console.log(Object.values(vis.data)[0]);









        vis.updateVis();




    }

    updateVis() {
        // Update visualization if needed
        let vis = this;
        console.log("New data is ", vis.data.length, " items long ");
        vis.circleData = [];



        Object.keys(vis.data).forEach(d => {
            // Generate random coordinates within the hexagon
            let randomX, randomY;
            do {
                randomX = Math.random() * (2 * vis.hexRadius) - vis.hexRadius + vis.config.containerWidth / 2;
                randomY = Math.random() * (2 * vis.hexRadius) - vis.hexRadius + vis.config.containerHeight / 2;
            } while (!vis.pointInHexagon(randomX, randomY, vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)));
            vis.circleData.push({ x: randomX, y: randomY, setNum: vis.data[d].set_num, data: vis.data[d] });
        });

        console.log("Circle Data", vis.circleData)

        let circles = vis.svg.selectAll('.circle')
            .data(vis.circleData);

        let circlesEnter = circles.enter().append('circle')
            .attr('class', 'circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 3) // Set your desired radius
            .attr('fill', d => vis.colorMap[d.data.theme_name] ? vis.colorMap[d.data.theme_name] : 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '0') // ! STATIC VISUALIZATION FOR M3
            .on('click', function (event, d) {
                // Toggle presence of setNum in cardData
                if (vis.clickedSet && vis.clickedSet.set_num === d.setNum) {
                    vis.clickedSet = null;
                    vis.attachedPoints = []
                    vis.hoveredSet = d.data
                } else {
                    vis.clickedSet = d.data;
                    // raise point
                    d3.select(this).raise();
                    vis.attachedPoints = vis.clickedSet.top_5_similar_sets;

                    vis.hoveredSet = null;
                }

                circles.exit().remove();
                vis.renderVis();

                vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                // vis.updateVis();


            })
            .on('mouseover', function (event, d) {
                if (!d3.select(this).classed('clicked')) {
                    vis.hoveredSet = d.data;
                    d3.select(this).raise();

                    vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                    // vis.updateVis();
                    vis.renderVis();



                }
            })
            .on('mouseout', function (event, d) {
                if (!d3.select(this).classed('clicked')) {



                    vis.hoveredSet = null;



                    vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                    // vis.updateVis();
                    vis.renderVis();
                }
            });


        circles.exit().remove();




        console.log("Clicked set is " + vis.clickedSet);
        // console.log("Top 5", vis.data[vis.clickedSet].top_5_similar_sets)
        console.log("Attached Points ", vis.attachedPoints)
        // // ! LINES FOR STATIC VISUALIZATION FOR M3 (next 11 lines)

        // vis.svg.selectAll('.line').remove();

        console.log("Points", vis.points)
        // vis.svg.selectAll('.connector').remove();


        // Bind data






        vis.renderVis();
    }

    renderVis() {
        // Render visualization if needed
        let vis = this;
        vis.points = [];

        vis.selectedPointX = this.clickedSet ? vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).x : null;
        vis.selectedPointY = this.clickedSet ? vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).y : null;

        vis.attachedPoints.forEach(pointId => {
            console.log("Point ID", pointId)

            const point = vis.circleData.find(d => d.setNum === pointId);
            if (point !== undefined) {
                vis.points.push(point)
            }

        })

        console.log("Points", vis.points)
        let lines = vis.svg.selectAll('.connector')
            .data(vis.points, d => {
                console.log("Data", d)

                d.data.set_num
            }); // Use a unique identifier for each data point

        // Enter new lines
        let newLines = lines.enter()
            .append('line')
            .attr('class', 'connector');

        // Update existing lines and add attributes to new lines
        lines.merge(newLines)
            .attr('x1', vis.selectedPointX)
            .attr('y1', vis.selectedPointY)
            .attr('x2', d => d.x)
            .attr('y2', d => d.y)
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5')
            .lower();

        // Exit and remove unused lines
        lines.exit().remove();
        vis.svg.selectAll('.edge')
            .data(vis.hexagonData)
            .enter().append('line')
            .attr('class', 'edge')
            .attr('x1', (d, i) => vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)[i].x)
            .attr('y1', (d, i) => vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)[i].y)
            .attr('x2', (d, i, nodes) => vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)[(i + 1) % nodes.length].x)
            .attr('y2', (d, i, nodes) => vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)[(i + 1) % nodes.length].y)
            .attr('stroke', d => d.color)
            .attr('stroke-width', '2');

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
            });


    }
}

