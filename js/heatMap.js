class HeatMap {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            legendHeight: 20,
            margin: {
                top: 30,
                right: 30,
                bottom: 30,
                left: 30
            }
        };
        this.data = _data;
        this.colorScale = d3.scaleLinear()
            .range(["#FFEAC1", "#C32020"])
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up SVG container
        vis.config.width = vis.config.containerWidth - vis.config.margin.left*2 - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom*3 - vis.config.legendHeight;

        vis.year_skip = 10;
        vis.size_skip = 50;
        vis.years = d3.range(1960, 2030, vis.year_skip);
        vis.setSizes = d3.range(0, 550, vis.size_skip).reverse();
        // Scales
        vis.xScale = d3.scaleBand()
            .domain(vis.years)
            .range([0, vis.config.width])
            .padding(0.01);

        vis.yScale = d3.scaleBand()
            .domain(vis.setSizes)
            .range([0, vis.config.height])
            .padding(0.01);

        vis.xAxis = d3.axisBottom(vis.xScale).tickValues(vis.years).tickFormat(d => d + "-" + (d + vis.year_skip - 1));

        vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.setSizes).tickFormat(d => (d + "-" + (d + vis.size_skip - 1)));
        
        vis.svg = vis.config.parentElement.append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.svg.append("text")
            .style('fill', 'black')
            .style('font-size', '18px')
            .attr('text-anchor', 'middle')
            .attr('x', vis.config.containerWidth / 2 + vis.config.margin.left)
            .attr('y', 20)
            .attr('fill-opacity', 1)
            .text("Sets by Number of Pieces and Year");

        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left*2},${vis.config.margin.top})`);
        
        vis.chart = vis.chartArea.append('g')

        // draw axis
        vis.xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height})`)
            .call(vis.xAxis);
        
        vis.xAxisGroup.append('text')
            .attr('class', 'axis text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', vis.config.width / 2)
            .attr('y', 28)
            .attr('fill-opacity', 1)
            .text("Year");
      
        vis.yAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis);

        vis.svg.append('text')
            .attr('class', 'axis text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', -vis.config.height / 2 - vis.config.margin.top)
            .attr('y', vis.config.margin.left + 10)
            .attr("transform", "rotate(-90)")
            .attr('fill-opacity', 1)
            .text("Number of Pieces in Set");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.filteredData = new Map();

        vis.data.forEach((d) => {
            const setNum = d.set_num;
            const year = Math.floor(d.set_year/vis.year_skip)*vis.year_skip;
            const size = Math.floor(d.set_num_parts/vis.size_skip)*vis.size_skip;
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
                if (!vis.blockData.has(year+":"+maxSize)) {
                    vis.blockData.set(year+":"+maxSize, 0);
                }
                vis.blockData.set(year+":"+maxSize, vis.blockData.get(year+":"+maxSize) + 1);
            }
        });

        vis.blockData = Array.from(vis.blockData, ([name, value]) => ({name, value}));

        vis.yScale = d3.scaleBand()
            .domain(vis.setSizes)
            .range([0, vis.config.height])
            .padding(0.01);

        vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.setSizes).tickFormat(d => (d + "-" + (d + vis.size_skip - 1)));

        vis.blockRange = vis.blockData.map(d => d.value);
        // Heat map blocks colour range
        vis.colorScale.domain([Math.min(...vis.blockRange), Math.max(...vis.blockRange)])

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
        vis.yAxisGroup.call(vis.yAxis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr('x', 14)
                .attr('y', -10)
                .attr("transform", "rotate(-90)" );

        vis.renderLegend();
    }

    renderLegend() {
        let vis = this;
        const legend = vis.svg.append("g");

        legend.append("defs")
            .append("linearGradient")
            .attr('id', 'linear-gradient')
            .selectAll('stop')
            .data(vis.colorScale.ticks(10).map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: vis.colorScale(t)})))
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr('stop-color', d => d.color);

        vis.chart.append("rect")
            .attr('width', vis.config.width)
            .attr('height', vis.config.legendHeight)
            .attr("transform", `translate(0, ${vis.config.height + vis.config.legendHeight + vis.config.margin.bottom})`)
            .attr('fill', "url(#linear-gradient)");

        let axisScale = d3.scaleLinear()
            .domain(vis.colorScale.domain())
            .range([0, vis.config.width]);

        let xAxis = d3.axisBottom(axisScale).tickValues([Math.min(...vis.blockRange), Math.floor(Math.max(...vis.blockRange)/2), Math.max(...vis.blockRange)]);

        let xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height + vis.config.legendHeight*2 + vis.config.margin.bottom})`)
            .call(xAxis);

        xAxisGroup.append('text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', vis.config.width / 2)
            .attr('y', -5)
            .attr('fill-opacity', 1)
            .text("Number of sets");
    }
}