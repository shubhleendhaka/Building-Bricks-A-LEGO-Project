class ColorChart{
    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 625,
            containerHeight: 120,
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            squareSize: 20, // Size of each color square
            gap: 5 // Gap between squares
        };
        this.data = data;
        this.initChart();
    }

    initChart() {
        let chart = this;

        // Extract unique color values from data
        chart.uniqueColors = [...new Set(chart.data.map(d => d.rgb))];

        // Set up SVG container
        chart.svg = chart.config.parentElement.append('svg')
            .attr('id','color-chart')
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

        chart.svg.selectAll('.color-square')
            .data(chart.uniqueColors)
            .enter().append('rect')
            .attr('class', 'color-square')
            .attr('width', chart.config.squareSize)
            .attr('height', chart.config.squareSize)
            .attr('x', (d, i) => (i % squaresPerRow) * (chart.config.squareSize + chart.config.gap))
            .attr('y', (d, i) => Math.floor(i / squaresPerRow) * (chart.config.squareSize + chart.config.gap))
            .style('fill', d => `#${d}`); // d.rgb is a hex code

        // Add any additional styling or interactivity as required
    }


    // Method to update chart if needed
    updateChart(updatedData) {
        this.data = updatedData;
        this.uniqueColors = [...new Set(this.data.map(d => d.rgb))];
        this.drawSquares();
    }





}