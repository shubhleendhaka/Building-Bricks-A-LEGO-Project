d3.csv("data/lego_data.csv").then((data) => {
    // Convert columns to numerical values
    data.forEach((d) => {
        d.set_year = +d.set_year;
        d.theme_id = +d.theme_id;
        d.set_num_parts = +d.set_num_parts;
        d.color_id = +d.color_id;
        d.rgb = d.rgb // leaving rgb as string
    });

    const dispatcher = d3.dispatch(
        "searchPoint",
        "randomPoint",
        "selectedPoint"
    );
    const filteredData = {};

    data.forEach((d) => {
        const setNum = d.set_num;
        if (!filteredData[setNum]) {
            filteredData[setNum] = {
                theme_name: d.theme_name,
            };
        }
    });

    d3.select("#search-input").on("keypress", (event) => {
        if (event.key === "Enter") {
            // TODO: Dispatch search event
            console.log(`Search input entered for: ${event.target.value}`);
            event.target.value = "";
        }
    });

    d3.select("#pick-random").on("click", () => {
        // TODO: Dispatch random selection event
        console.log("Pick random button clicked!");
    });

    const networkGraph = new NetworkGraph(
        {
            parentElement: d3.select("#network-graph-container"),
        },
        dispatcher,
        filteredData
    );

    const heatMap = new HeatMap(
        {
            parentElement: d3.select("#heat-map-container"),
        },
        data
    );
    // Instantiate ColorChart
    const colorChart = new ColorChart(
        {
            parentElement: d3.select("#color-chart-container"),
        },
        data
    );
});
