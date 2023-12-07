d3.csv("data/hexagon_data_with_coords.csv").then((data) => {

    // Make a set of all the themes that are in the data
    const themes = new Set();

    data.forEach((d) => {
        themes.add(d.theme_name);

        let csvString = d.top_5_similar_sets;

        // Remove square brackets and single quotes -> Split by commas
        const values = csvString.replace(/[\[\]']+/g, '').split(', ');

        // Convert the array elements to JSON
        const jsonArrayString = JSON.stringify(values);

        // Parse JSON array str. into JS array
        const jsonArray = JSON.parse(jsonArrayString);

        d.top_5_similar_sets = jsonArray;

        Object.keys(d).forEach((key) => {
            if (key !== 'id' && key !== 'set_num' && key !== 'top_5_similar_sets' && key !== 'set_name' && key !== 'set_img_url' && key !== 'theme_name') {
                d[key] = +d[key];
            }

        });
    });

    // Extract RGB color column names
    const rgbColumns = data.columns.filter(column => column.match(/[0-9A-Fa-f]{6}/));

    // Transform column names into format for ColorChart
    const colorData = rgbColumns.map(color => ({ rgb: color }));

    const dispatcher = d3.dispatch(
        "cardData",
        "selectedColors"
    );

    const cards = new Cards(
        {
            parentElement: d3.select("#cards-container"),
        },
        dispatcher,
        data
    );

    const networkGraph = new NetworkGraph(
        {
            parentElement: d3.select("#network-graph-container"),
        },
        dispatcher,
        data
    );


    const colorChart = new ColorChart(
        {
            parentElement: d3.select("#color-chart-container"),
        },
        dispatcher,
        colorData
    );

    // Dispatcher for card data
    dispatcher.on("cardData", (cardData) => {
        cards.cardData = cardData;
        cards.updateVis();

        let activeColors = new Set();
        for (let i = 0; i < cardData.length; i++) {
            if (cardData[i] !== null) {
                const currentCard = cardData[i];
                for (let column of rgbColumns) {
                    if (currentCard[column]) {
                        activeColors.add(column);
                    }
                }

            }
        }

        colorChart.activeColors = activeColors;
        colorChart.updateChart(colorData);
    });

    // Dispatcher for selected colours
    dispatcher.on("selectedColors", (selectedColors) => {
        colorChart.selectedColors = selectedColors;
        colorChart.activeColors = new Set();
        colorChart.updateChart(colorData);

        let filteredData = data.filter(point => {
            // Check if each selected colour == 1
            for (let color of selectedColors) {
                if (point[color] !== 1) {
                    return false;
                }
            }
            return true;
        });

        networkGraph.data = filteredData;
        networkGraph.updateData(filteredData);
    });

    // Search widget listener
    d3.select("#search-input").on("keypress", (event) => {
        if (event.key === "Enter") {

            let point = networkGraph.data.find(d => d.set_name === event.target.value);

            if (point !== undefined) {
                networkGraph.clickedSet = point;
                networkGraph.updateVis();
                dispatcher.call('cardData', event, [point, null]);
            } else {
                networkGraph.clickedSet = null;
                networkGraph.updateVis();
                dispatcher.call('cardData', event, [null, null]);
            }

            d3.select("#search-input").node().value = "";
        }
    });

    d3.select("#search-button").on("click", () => {
        let inputValue = d3.select("#search-input").node().value;

        let point = networkGraph.data.find(d => d.set_name === inputValue);

        if (point !== undefined) {
            networkGraph.clickedSet = point;
            networkGraph.updateVis();
            dispatcher.call('cardData', event, [point, null]);
        } else {
            networkGraph.clickedSet = null;
            networkGraph.updateVis();
            dispatcher.call('cardData', event, [null, null]);
        }
        d3.select("#search-input").node().value = "";

    });



    // Pick Random Listener
    d3.select("#shuffle-button").on("click", (event) => {
        let randomPoint = networkGraph.data[Math.floor(Math.random() * networkGraph.data.length)];
        networkGraph.clickedSet = randomPoint;
        // Clear search input
        d3.select("#search-input").node().value = "";
        networkGraph.updateVis();
        dispatcher.call('cardData', event, [randomPoint, null]);
    });

});

d3.csv("data/sets.csv").then((data) => {
    // Convert columns to numerical values
    data.forEach((d) => {
        d.year = +d.year;
        d.num_parts = +d.num_parts;
    });

    const heatMap = new HeatMap(
        {
            parentElement: d3.select("#heat-map-container"),
        },
        data
    );

});
