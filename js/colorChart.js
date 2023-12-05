class ColorChart {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 150,
            margin: { top: 0, right: 10, bottom: 0, left: 10 },
            squareSize: 25, // Size of each color square
            gap: 4 // Gap between squares
        };
        this.data = data;
        this.dispatcher = dispatcher;
        this.activeColors = new Set();
        this.selectedColors = new Set();
        this.initChart();

    }

    initChart() {
        let chart = this;

        // Extract unique color values from data
        chart.uniqueColors = [...new Set(chart.data.map(d => d.rgb))];


        // Set up SVG container
        chart.svg = chart.config.parentElement.append('svg')
            .attr('id', 'color-chart')
            .attr('width', chart.config.containerWidth)
            .attr('height', chart.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${chart.config.margin.left},${chart.config.margin.top})`);

        // Draw the color squares
        chart.drawSquares();
    }

    drawSquares() {
        let chart = this;

        // Calculate number of squares per row
        let squaresPerRow = Math.floor((chart.config.containerWidth - chart.config.margin.left - chart.config.margin.right) / (chart.config.squareSize + chart.config.gap));

        // Function to darken a color
        function darkenColor(colorStr) {
            // Assumes colorStr is of the form "#rrggbb"
            let r = Math.max(0, parseInt(colorStr.substring(1, 3), 16) - 50);
            let g = Math.max(0, parseInt(colorStr.substring(3, 5), 16) - 50);
            let b = Math.max(0, parseInt(colorStr.substring(5, 7), 16) - 50);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        // Create a group for each lego piece
        let legoGroup = chart.svg.selectAll('.lego-group')
            .data(chart.uniqueColors)
            .enter().append('g')
            .attr('class', 'lego-group')
            .attr('transform', (d, i) => {
                let x = (i % squaresPerRow) * (chart.config.squareSize + chart.config.gap);
                let y = Math.floor(i / squaresPerRow) * (chart.config.squareSize + chart.config.gap);
                return `translate(${x},${y})`;
            })
            .on('click', function (event, d) {
                chart.activeColors = new Set();

                if (chart.selectedColors.has(d)) {

                    chart.selectedColors.delete(d);
                } else {
                    chart.selectedColors.add(d);
                }
                chart.updateOpacity();
                chart.dispatcher.call('selectedColors', event, chart.selectedColors);



            });



        // Append the main square (lego base) to the group
        legoGroup.append('rect')
            .attr('width', chart.config.squareSize)
            .attr('height', chart.config.squareSize)
            .style('fill', d => `#${d}`)
            .attr('stroke', d => darkenColor(`#${d}`)) // Darken the fill color for the stroke
            .attr('stroke-width', 1.75)
            .attr('opacity', d => {
                console.log(chart.activeColors.size === 0 || chart.activeColors.has(d));
                return chart.activeColors.size === 0 || chart.activeColors.has(d) ? 1 : 0.2;
            });
        // Define the size and spacing of the bumps
        let bumpSize = chart.config.squareSize / 4; // Diameter of the bump

        // Calculate the gap by dividing the total remaining space by 3 (two gaps at the edges and one in the middle)
        //let totalBumpWidth = bumpSize;
        let gap = (chart.config.squareSize - 3 * bumpSize) / 2;
        let initialOffset = gap;

        // Calculate the x and y position for the bumps on a 2x2 lego brick
        let bumpPositions = [
            { x: initialOffset + bumpSize / 2, y: initialOffset + bumpSize / 2 }, //top left
            { x: chart.config.squareSize - initialOffset - bumpSize / 2, y: initialOffset + bumpSize / 2 }, //top right
            { x: initialOffset + bumpSize / 2, y: chart.config.squareSize - initialOffset - bumpSize / 2 }, // bottom left
            { x: chart.config.squareSize - initialOffset - bumpSize / 2, y: chart.config.squareSize - initialOffset - bumpSize / 2 } // bottom right
        ];

        // Append circles (lego bumps) to the group
        bumpPositions.forEach(pos => {
            legoGroup.append('circle')
                .attr('cx', pos.x)
                .attr('cy', pos.y)
                .attr('r', bumpSize / 2)
                .style('fill', d => `#${d}`)
                .attr('stroke', d => darkenColor(`#${d}`)) // Darken the fill color for the stroke
                .attr('stroke-width', 1.5);
        });

        // Add any additional styling or interactivity as required
    }

    updateOpacity() {
        let chart = this;
        chart.svg.selectAll('.lego-group')
            .attr('opacity', d => {
                if (chart.activeColors.size === 0 && chart.selectedColors.size === 0) {
                    return 1
                } else if (chart.activeColors.has(d) || chart.selectedColors.has(d)) {
                    return 1;
                } else {
                    return 0.2;
                }
            });


    }

    // Method to update chart if needed
    updateChart(updatedData) {
        this.data = updatedData;
        this.uniqueColors = [...new Set(this.data.map(d => d.rgb))];
        this.drawSquares();
        this.updateOpacity();
    }





}