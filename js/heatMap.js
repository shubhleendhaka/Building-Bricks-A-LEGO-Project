class HeatMap {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 30,
                right: 30,
                bottom: 30,
                left: 30
            }
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up SVG container
        vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.years = [1980, 1990, 2000, 2010, 2020];
        // vis.step = 1000;
        // let ySize = new Set(vis.data.map((d) => d.set_num_parts));
        // let ymax = Math.floor(Math.max(...ySize)/vis.step);
        // let setSizes = [...Array(ymax).keys()].map(d => d * vis.step).reverse();
        vis.setSizes = [0, 100, 200, 300, 400, 500].reverse();
        // Scales
        vis.xScale = d3.scaleBand()
            .domain(vis.years)
            .range([0, vis.config.width])
            .padding(0.01);

        vis.yScale = d3.scaleBand()
            .domain(vis.setSizes)
            .range([0, vis.config.height])
            .padding(0.01);

        vis.xAxis = d3.axisBottom(vis.xScale).tickValues(vis.years);

        vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.setSizes);
        
        vis.svg = vis.config.parentElement.append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.chart = vis.chartArea.append('g')

        // draw axis
        vis.xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height})`)
            .call(vis.xAxis);
      
        vis.yAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.filteredData = new Map();

        vis.data.forEach((d) => {
            const setNum = d.set_num;
            const year = Math.floor(d.set_year/10)*10;
            const size = Math.floor(d.set_num_parts/100)*100;
            if (!vis.filteredData.has(setNum)) {
                vis.filteredData.set(setNum, year+":"+size);
            }
        });

        vis.filteredData = Array.from(vis.filteredData);
        
        vis.blockData = new Map();
        vis.setSizes.forEach(d => {
            vis.years.forEach(v => vis.blockData.set(v+":"+d, 0))
        })

        let maxSize = Math.max(...vis.setSizes);
        vis.filteredData.forEach(function(d) {
            const str = d[1].split(":");
            const year = str[0];
            const size = str[1];
            if (vis.blockData.has(year+":"+size)) {
                vis.blockData.set(year+":"+size, vis.blockData.get(year+":"+size) + 1);
            } else if (size > maxSize) {
                vis.blockData.set(year+":"+maxSize, vis.blockData.get(year+":"+maxSize) + 1);
            }
        });

        vis.blockData = Array.from(vis.blockData, ([name, value]) => ({name, value}));

        vis.yScale = d3.scaleBand()
            .domain(vis.setSizes)
            .range([0, vis.config.height])
            .padding(0.01);

        vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.setSizes);

        const blockRange = vis.blockData.map(d => d.value);
        // Heat map blocks colour range
        vis.colorScale = d3.scaleLinear()
            .range(["#FFEAC1", "#C32020"])
            .domain([Math.min(...blockRange), Math.max(...blockRange)])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.chart.selectAll('.block')
            .data(vis.blockData, d => {return d[0];})
            .join('rect')
                .attr('x', d => { return vis.xScale(d.name.split(':')[0]); })
                .attr('y', d => { return vis.yScale(d.name.split(':')[1]); })
                .attr('width', vis.xScale.bandwidth())
                .attr('height', vis.yScale.bandwidth())
                .style('fill', d => { return vis.colorScale(d.value); })

        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }
}