class HeatMap {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 750,
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
        this.dataArray = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        const flarePalette = ['#F0E68C', '#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgbBasis(["#e98d6b", "#e3685c", "#d14a61", "#b13c6c", "#8f3371", "#6c2b6d"]))

        vis.minYear = d3.min(vis.data, d => d.year);
        vis.maxYear = d3.max(vis.data, d => d.year);

        console.log(vis.minYear, vis.maxYear);

        vis.data = this.data.filter(d => d.num_parts > 0);

        vis.data.forEach(d => {
            d.pieceBinLabel = vis.getPieceBinLabel(d.num_parts);
            d.yearBinLabel = vis.getYearBinLabel(d.year);
        });

        let setNums = new Set();
        let hasDuplicates = false;

        vis.data.forEach(d => {
            if (setNums.has(d.set_num)) {
                hasDuplicates = true;
            } else {
                setNums.add(d.set_num);
            }
        });

        console.log('Has duplicates:', hasDuplicates);





        // Set up SVG container
        vis.config.width = vis.config.containerWidth - vis.config.margin.left * 2 - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom * 3 - vis.config.legendHeight;




        // Scales


        vis.pieceBins = ["1-50", "51-100", "101-150", "151-200", "200+"];
        vis.yearBins = ["1949-1959", "1960-1969", "1970-1979", "1980-1989", "1990-1999", "2000-2009", "2010-2019", "2020-2024"];

        vis.xScale = d3.scaleBand()
            .domain(vis.yearBins)
            .range([0, vis.config.width])
            .paddingInner(0.01) // Adjust the padding as needed
            .paddingOuter(0.01); // Adjust the padding as needed


        vis.yScale = d3.scaleBand()
            .domain(vis.pieceBins)
            .range([vis.config.height, 0])
            .paddingInner(0.01)
            .paddingOuter(0.01);

        vis.xAxis = d3.axisBottom(vis.xScale).tickValues(vis.yearBins);

        vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.pieceBins).tickSize(0);

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
            .attr('transform', `translate(${vis.config.margin.left * 2},${vis.config.margin.top})`);

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
            .text("Year")
            .attr("transform", "translate(0, 10)");

        vis.yAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis);

        vis.yAxisGroup.selectAll(".tick text")
            .attr("transform", "rotate(-90), translate(-10, -14)")
            .style("text-anchor", "end");

        vis.svg.append('text')
            .attr('class', 'axis text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', -vis.config.height / 2 - vis.config.margin.top)
            .attr('y', vis.config.margin.left + 10)
            .attr("transform", "rotate(-90) translate(-10, -14)")
            .attr('fill-opacity', 1)
            .text("Number of Pieces in Set");

        vis.updateVis();
    }
    getPieceBinLabel(value) {
        if (value <= 50) return "1-50";
        else if (value <= 100) return "51-100";
        else if (value <= 150) return "101-150";
        else if (value <= 200) return "151-200";
        else return "200+";
    }

    getYearBinLabel(value) {
        if (value <= 1959) return "1949-1959";
        else if (value <= 1969) return "1960-1969";
        else if (value <= 1979) return "1970-1979";
        else if (value <= 1989) return "1980-1989";
        else if (value <= 1999) return "1990-1999";
        else if (value <= 2009) return "2000-2009";
        else if (value <= 2019) return "2010-2019";
        else return "2020-2024";
    }
    updateVis() {
        let vis = this;

        // vis.filteredData = new Map();

        // vis.data.forEach((d) => {
        //     const setNum = d.set_num;
        //     const year = Math.floor(d.set_year / vis.year_skip) * vis.year_skip;
        //     const size = Math.floor(d.set_num_parts / vis.size_skip) * vis.size_skip;
        //     if (!vis.filteredData.has(setNum)) {
        //         vis.filteredData.set(setNum, year + ":" + size);
        //     }
        // });

        // vis.filteredData = Array.from(vis.filteredData);

        // vis.blockData = new Map();
        // vis.setSizes.forEach(d => {
        //     vis.years.forEach(v => vis.blockData.set(v + ":" + d, 0))
        // })

        // let maxSize = Math.max(...vis.setSizes);
        // vis.filteredData.forEach(function (d) {
        //     const str = d[1].split(":");
        //     const year = str[0];
        //     const size = str[1];
        //     if (vis.blockData.has(year + ":" + size)) {
        //         vis.blockData.set(year + ":" + size, vis.blockData.get(year + ":" + size) + 1);
        //     } else if (size > maxSize) {
        //         if (!vis.blockData.has(year + ":" + maxSize)) {
        //             vis.blockData.set(year + ":" + maxSize, 0);
        //         }
        //         vis.blockData.set(year + ":" + maxSize, vis.blockData.get(year + ":" + maxSize) + 1);
        //     }
        // });

        // vis.blockData = Array.from(vis.blockData, ([name, value]) => ({ name, value }));
        // console.log(vis.blockData);

        // vis.yAxis = d3.axisLeft(vis.yScale).tickValues(vis.setSizes).tickFormat(d => (d + "-" + (d + vis.size_skip - 1)));

        // vis.blockRange = vis.blockData.map(d => d.value);
        // Heat map blocks colour range

        const aggregatedData = d3.rollup(
            vis.data,
            v => v.length, // Count the occurrences for each group
            d => d.yearBinLabel,
            d => d.pieceBinLabel
        );

        console.log(aggregatedData);
        vis.dataArray = Array.from(aggregatedData, ([yearBinLabel, values]) =>
            Array.from(values, ([pieceBinLabel, count]) => ({ yearBinLabel, pieceBinLabel, count }))
        ).flat();

        vis.totalCount = vis.dataArray.reduce((sum, d) => sum + d.count, 0);
        console.log(vis.totalCount);
        // get sum of counts from data array


        vis.blockRange = vis.dataArray.map(d => d.count);

        vis.colorScale.domain([Math.min(...vis.blockRange), Math.max(...vis.blockRange)])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.chart.selectAll('.block')
            .data(vis.dataArray)
            .join('rect')
            .attr('x', d => { return vis.xScale(d.yearBinLabel); })
            .attr('y', d => { return vis.yScale(d.pieceBinLabel); })
            .attr('width', vis.xScale.bandwidth())
            .attr('height', vis.yScale.bandwidth())
            .style('fill', d => { return vis.colorScale(d.count); })

        function hexToDecimal(hex) {
            return parseInt(hex.replace("#", ""), 16);
        }

        vis.chart.selectAll('.block-text')
            .data(vis.dataArray)
            .join('text')
            .attr('x', d => { return vis.xScale(d.yearBinLabel) + vis.xScale.bandwidth() / 2; })
            .attr('y', d => { return vis.yScale(d.pieceBinLabel) + vis.yScale.bandwidth() / 2; })
            .attr('text-anchor', 'middle')
            .style('fill', d => {
                const blockColor = vis.colorScale(d.count);

                const textColor = d3.lab(blockColor).l <= d3.lab("#e3685c").l ? "white" : "black";
                return textColor;
            })
            .attr('dominant-baseline', 'central')
            .text(d => d.count);

        // vis.xAxisGroup.call(vis.xAxis);
        // vis.yAxisGroup.call(vis.yAxis)
        //     .selectAll("text")
        //     .style("text-anchor", "start")
        //     .attr("transform", "rotate(-90) translate(-10, -14)");
        vis.renderLegend();
    }

    renderLegend() {
        let vis = this;
        const legend = vis.svg.append("g");

        legend.append("defs")
            .append("linearGradient")
            .attr('id', 'linear-gradient')
            .selectAll('stop')
            .data(vis.colorScale.ticks(10).map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: vis.colorScale(t) })))
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr('stop-color', d => d.color);

        vis.chart.append("rect")
            .attr('width', vis.config.width)
            .attr('height', vis.config.legendHeight)
            .attr("transform", `translate(0, ${vis.config.height + vis.config.legendHeight + vis.config.margin.bottom + 15})`)
            .attr('fill', "url(#linear-gradient)");

        let axisScale = d3.scaleLinear()
            .domain(vis.colorScale.domain())
            .range([0, vis.config.width]);

        let xAxis = d3.axisBottom(axisScale).tickValues(d3.range(0, 2501, 500));
        let xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height + vis.config.legendHeight * 2 + vis.config.margin.bottom + 16} )`)
            .call(xAxis);

        xAxisGroup.append('text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', vis.config.width / 2)
            .attr('y', -25)
            .attr('fill-opacity', 1)
            .text("Number of sets");
    }
}