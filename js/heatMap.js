class HeatMap {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 460,
            tooltipPadding: 15,
            legendHeight: 20,
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

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgbBasis(["#FFBE0B", "#FB5607", "#FF006E", "#8338EC"]))


        vis.data = this.data.filter(d => d.num_parts > 0);

        vis.data.forEach(d => {
            d.pieceBinLabel = vis.getPieceBinLabel(d.num_parts);
            d.yearBinLabel = vis.getYearBinLabel(d.year);
        });



        // Set up SVG container
        vis.config.width = vis.config.containerWidth - vis.config.margin.left * 2 - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom * 3 - vis.config.legendHeight;


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

        vis.xAxis = d3.axisBottom(vis.xScale).tickValues(vis.yearBins).tickSize(0);

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
            .text("Sets by Number of Pieces and Year")
            .style("font-weight", "bold");
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left * 2},${vis.config.margin.top})`);

        vis.chart = vis.chartArea.append('g')

        // draw axis
        vis.xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height + 10})`)
            .call(vis.xAxis);

        vis.xAxisGroup.selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", ".5em") // Adjust this value as needed
            .attr("dy", ".5em");
        vis.xAxisGroup.append('text')
            .attr('class', 'axis text')
            .style('fill', 'black')
            .style('font-size', '14px')
            .attr('text-anchor', 'middle')
            .attr('x', vis.config.width / 2)
            .attr('y', 28)
            .attr('fill-opacity', 1)
            .text("Number of Sets")
            .attr("transform", "translate(0, 28)");

        vis.yAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis);

        vis.yAxisGroup.selectAll(".tick text")
            .attr("transform", "rotate(-90), translate(20, -14)")
            .style("text-anchor", "end");

        vis.yAxisGroup.select(".domain").remove();
        vis.xAxisGroup.select(".domain").remove();


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

        const aggregatedData = d3.rollup(
            vis.data,
            v => v.length, // Count the occurrences for each group
            d => d.yearBinLabel,
            d => d.pieceBinLabel
        );

        vis.dataArray = Array.from(aggregatedData, ([yearBinLabel, values]) =>
            Array.from(values, ([pieceBinLabel, count]) => ({ yearBinLabel, pieceBinLabel, count }))
        ).flat();



        vis.blockRange = vis.dataArray.map(d => d.count);

        vis.colorScale.domain([Math.min(...vis.blockRange), Math.max(...vis.blockRange)])

        vis.renderVis();
    }



    renderVis() {
        let vis = this;





        vis.chart.selectAll('.block')
            .data(vis.dataArray)
            .join('g')
            .each(function (d, i) {
                let group = d3.select(this);

                var defs = group.append("defs");


                var dropShadowFilter = defs.append('svg:filter')
                    .attr('id', 'drop-shadow')
                    .attr('filterUnits', "userSpaceOnUse")
                    .attr('width', '250%')
                    .attr('height', '250%');

                dropShadowFilter.append('svg:feGaussianBlur')
                    .attr('in', 'SourceAlpha') // Use alpha channel of source graphic for blur
                    .attr('stdDeviation', 2)
                    .attr('result', 'blur-out');

                dropShadowFilter.append('svg:feOffset')
                    .attr('in', 'blur-out')
                    .attr('dx', 3)
                    .attr('dy', 3)
                    .attr('result', 'offset-out');

                dropShadowFilter.append('svg:feComponentTransfer')
                    .attr('in', 'offset-out')
                    .attr('result', 'shadow-out')
                    .append('feFuncA')
                    .attr('type', 'linear')
                    .attr('slope', 0.2); // Adjust the alpha value (opacity) of the shadow

                dropShadowFilter.append('svg:feBlend')
                    .attr('in', 'SourceGraphic')
                    .attr('in2', 'shadow-out')
                    .attr('mode', 'normal');
                group.append('rect')
                    .attr('x', d => { return vis.xScale(d.yearBinLabel); })
                    .attr('y', d => { return vis.yScale(d.pieceBinLabel); })
                    .attr('width', vis.xScale.bandwidth())
                    .attr('height', vis.yScale.bandwidth())
                    .style('fill', d => { return vis.colorScale(d.count); });

                let radius = vis.xScale.bandwidth() / 7;
                let padding = radius;
                for (let j = 0; j < 2; j++) {
                    for (let k = 0; k < 2; k++) {
                        group.append('circle')
                            .attr('cx', vis.xScale(d.yearBinLabel) + 2 * padding + j * (radius * 2 + padding))
                            .attr('cy', vis.yScale(d.pieceBinLabel) + 2 * padding + k * (radius * 2 + padding))
                            .attr('r', radius)
                            .style('fill', d => {
                                console.log("Color Scale")
                                console.log(d3.color(vis.colorScale(d.count)).formatHex());
                                console.log(d3.rgb(vis.colorScale(d.count)).darker(1).formatHex())
                                return vis.colorScale(d.count)
                            })
                            // .attr('stroke', 'grey')
                            .attr('stroke', d => d3.rgb(vis.colorScale(d.count)).darker(1)) // Darken the fill color for the stroke
                            .attr('stroke-width', 1.5)
                            .style("filter", "url(#drop-shadow)"); // Apply the drop shadow filter

                    }
                }
            })
            .on('mouseover', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'flex')
                    .style('left', event.pageX + vis.config.tooltipPadding + 'px')
                    .style('top', event.pageY + vis.config.tooltipPadding + 'px')
                    .html(`
                <div class="tooltip-title"><b>${d.count}</b> sets</div>
                <div class="tooltip-subtitle">
                    Between <u>${d.yearBinLabel}</u> with <u>${d.pieceBinLabel}</u> pieces
                </div>
                `);
                d3.select(this).raise();
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });



        // vis.chart.selectAll('.block-text')
        //     .data(vis.dataArray)
        //     .join('text')
        //     .attr('x', d => { return vis.xScale(d.yearBinLabel) + vis.xScale.bandwidth() / 2; })
        //     .attr('y', d => { return vis.yScale(d.pieceBinLabel) + vis.yScale.bandwidth() / 2; })
        //     .attr('text-anchor', 'middle')
        //     .style('fill', d => {
        //         const blockColor = vis.colorScale(d.count);
        //         const textColor = d3.lab(blockColor).l <= d3.lab("#e3685c").l ? "white" : "black";
        //         return textColor;
        //     })
        //     .attr('dominant-baseline', 'central')
        //     .text(d => d.count);

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
            .attr("transform", `translate(0, ${vis.config.height + vis.config.legendHeight + vis.config.margin.bottom + 20})`)
            .attr('fill', "url(#linear-gradient)");

        let axisScale = d3.scaleLinear()
            .domain(vis.colorScale.domain())
            .range([0, vis.config.width]);

        let xAxis = d3.axisBottom(axisScale).tickValues(d3.range(0, 2501, 500));
        let xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${0},${vis.config.height + vis.config.legendHeight * 2 + vis.config.margin.bottom + 20} )`)
            .call(xAxis);


        // remove domain line
        xAxisGroup.select(".domain").remove();
        // xAxisGroup.append('text')
        //     .style('fill', 'black')
        //     .style('font-size', '14px')
        //     .attr('text-anchor', 'middle')
        //     .attr('x', vis.config.width / 2)
        //     .attr('y', -10)
        //     .attr('fill-opacity', 1)
        //     .text("Number of sets");
    }
}