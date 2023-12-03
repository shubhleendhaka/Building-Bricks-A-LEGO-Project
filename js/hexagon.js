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

        // Set up SVG container
        vis.svg = vis.config.parentElement.append('svg')
            .attr('id', 'network-graph')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Hexagon properties
        vis.hexRadius = 300;

        // Hexagon data
        vis.hexagonData = [
            { color: '#fb8072', label: 'Books' },   // Red
            { color: '#fdb462', label: 'Key Chain' },   // Orange
            { color: '#ffe45e', label: 'Friends' },   // Yellow
            { color: '#8dd3c7', label: 'Gear' },   // Green
            { color: '#80b1d3', label: 'Ninjago' },   // Blue
            { color: '#bebada', label: 'Star Wars' }    // Purple
        ];

        vis.colorMap = {
            'Books': '#fb8072',    // Red
            'Key Chain': '#fdb462',           // Orange
            'Friends': '#ffe45e',           // Yellow
            'Gear': '#8dd3c7',      // Green
            'Ninjago': '#80b1d3',           // Blue
            'Star Wars': '#bebada'          // Purple
        };

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

        // Calculate hexagon edge midpoints
        vis.hexagonMidpoints = vis.calculateHexagonMidpoints();

        // Initialize force simulation
        vis.forceSimulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-10))
            // ! Do we need force center to help it remain within the hexagon?
            // .force("center", d3.forceCenter(vis.config.containerWidth / 2, vis.config.containerHeight / 2))
            .force("collide", d3.forceCollide(3))
            .force("themeForce", vis.themeForce());

        vis.updateData(vis.data);
        // vis.updateLines();
    }

    calculateHexagonMidpoints() {
        let vis = this;
        const center = { x: vis.config.containerWidth / 2, y: vis.config.containerHeight / 2 };
        const points = vis.hexagonPoints(center.x, center.y, vis.hexRadius);
        const midpoints = [];
    
        for (let i = 0; i < points.length; i++) {
            const nextIndex = (i + 1) % points.length;
            midpoints.push({
                x: (points[i].x + points[nextIndex].x + center.x) / 3,
                y: (points[i].y + points[nextIndex].y + center.y) / 3,
                theme: vis.hexagonData[i].label // Assuming each edge corresponds to a theme
            });
        }
        return midpoints;
    }

    themeForce() {
        let vis = this;
        return (alpha) => {
            vis.circleData.forEach(d => {
                const target = vis.hexagonMidpoints.find(p => p.theme === d.data.theme_name);
                if (target) {
                    d.x += (target.x - d.x) * alpha;
                    d.y += (target.y - d.y) * alpha;
                }
            });
        };
    }

    updateData(data) {
        let vis = this;
        vis.data = data;
        vis.circleData = [];
        vis.clickedSet = null;
        vis.attachedPoints = [];
        vis.lineData = [];

        console.log("FLAG 1");
        console.log(vis.circleData);

        let centerX = vis.config.containerWidth / 2;
        let centerY = vis.config.containerHeight / 2;

        vis.data.forEach(d => {
            // Generate random coordinates within the hexagon
            // let randomX, randomY;
            // do {
            //     randomX = Math.random() * (2 * vis.hexRadius) - vis.hexRadius + vis.config.containerWidth / 2;
            //     randomY = Math.random() * (2 * vis.hexRadius) - vis.hexRadius + vis.config.containerHeight / 2;
            // } while (!vis.pointInHexagon(randomX, randomY, vis.hexagonPoints(vis.config.containerWidth / 2, vis.config.containerHeight / 2, vis.hexRadius)));
            // vis.circleData.push({ x: randomX, y: randomY, setNum: d.set_num, data: d });
            vis.circleData.push({ x: centerX, y: centerY, setNum: d.set_num, data: d})
        });

        console.log(vis.data);

        console.log("FLAG 2");
        console.log(vis.circleData);

        vis.updateVis();

    }



    updateVis() {
        // Update visualization if needed
        let vis = this;
        console.log("New data is ", vis.data.length, " items long ");

        vis.forceSimulation.nodes(vis.circleData).on("tick", () => this.renderVis());
        vis.forceSimulation.alpha(1).restart();

        vis.updateLines();
        vis.updateStyle();
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
            });
    }

    updateLines() {
        let vis = this;
        console.log("Updating lines");
        console.log(vis.circleData)

        if (vis.clickedSet !== null) {
            vis.attachedPoints = vis.clickedSet.top_5_similar_sets;
            // vis.selectedPointX = vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).x;
            // vis.selectedPointY = vis.circleData.find(d => d.setNum === vis.clickedSet.set_num).y;
            vis.lineData = []
            vis.attachedPoints.forEach(pointId => {
                let point = vis.circleData.filter(d => d.setNum === pointId);
                point = point[0];
                if (point !== undefined) {
                    console.log("Found point", point);
                    console.log("Selected point", vis.selectedPointX, vis.selectedPointY);



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
        console.log(vis.lineData);


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
        console.log("lines", lines)
        // Exit and remove unused lines
        lines.exit().remove();
    }


    renderVis() {
        // Render visualization if needed
        console.log("do be rendering")
        let vis = this;

        let circles = vis.svg.selectAll('.circle')
            .data(vis.circleData);

        // console.log("PAIN");
        // console.log(vis.circleData);

        circles.enter().append('circle')
            .attr('class', 'circle')
            .attr('id', d => d.setNum)
            .attr('cx', d => {
                console.log("AAAA");
                console.log(d);
                return d.x;
            })
            .attr('cy', d => d.y)
            .attr('r', 3) // Set your desired radius
            .attr('fill', d => vis.colorMap[d.data.theme_name] ? vis.colorMap[d.data.theme_name] : 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '0') // ! STATIC VISUALIZATION FOR M3
            .on('mouseover', function (event, d) {
                if (!d3.select(this).classed('clicked')) {
                    vis.hoveredSet = d.data;
                    console.log("Hovered set", d)
                    d3.select(this).raise();
                    vis.updateStyle();
                    vis.dispatcher.call('cardData', event, [vis.clickedSet, vis.hoveredSet]);
                }
            })
            .on('mouseout', function (event, d) {
                if (!d3.select(this).classed('clicked')) {
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
                    console.log("Clicked set", d)
                }

                vis.updateLines();
                vis.updateStyle();


            })

        circles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);


        circles.exit().remove();





    }
}

