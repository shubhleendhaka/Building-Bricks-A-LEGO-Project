// TODO: REMOVE AFTER TESTING:
// d3.csv("data/test_data.csv").then((data) => {

d3.csv("data/hexagon_data.csv").then((data) => {
    // make a set of all the themes that are in the data

    const themes = new Set();



    data.forEach((d) => {
        // d.top_5_similar_sets = JSON.parse(d.top_5_similar_sets);
        themes.add(d.theme_name);

        let csvString = d.top_5_similar_sets;

        // Remove square brackets and single quotes, then split by commas
        const values = csvString.replace(/[\[\]']+/g, '').split(', ');

        // Convert the array elements to JSON format
        const jsonArrayString = JSON.stringify(values);

        // Parse the JSON array string into an actual JavaScript array
        const jsonArray = JSON.parse(jsonArrayString);

        d.top_5_similar_sets = jsonArray;


        Object.keys(d).forEach((key) => {
            if (key !== 'id' && key !== 'set_num' && key !== 'top_5_similar_sets' && key !== 'set_name' && key !== 'set_img_url' && key !== 'theme_name') {
                d[key] = +d[key];
            }


        });
    });

    // Extract the RGB color column names
    const rgbColumns = data.columns.filter(column => column.match(/[0-9A-Fa-f]{6}/));

    // Transform the column names into the expected format for ColorChart
    const colorData = rgbColumns.map(color => ({ rgb: color }));

    console.log("Color Data", colorData);



    console.log("Themes are ", themes);
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

    const networkGraph = new Hexagon(
        {
            parentElement: d3.select("#hexagon-container"),
        },
        dispatcher,
        data
    );


    const colorChart = new ColorChart(
        {
            parentElement: d3.select("#color-chart-container"),
        },
        dispatcher,
        colorData // Use the transformed color data here
    );

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



    dispatcher.on("selectedColors", (selectedColors) => {
        colorChart.selectedColors = selectedColors;
        colorChart.activeColors = new Set();
        colorChart.updateChart(colorData);

        let filteredData = data.filter(point => {
            // Check if the value for each of the selected colors is 1
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

    d3.select("#search-input").on("keypress", (event) => {
        if (event.key === "Enter") {

            let point = networkGraph.data.find(d => d.set_name === event.target.value);

            if (point !== undefined) {
                networkGraph.clickedSet = point;
                networkGraph.updateVis();
                dispatcher.call('cardData', event, [point, null]);
            }

        }
    });

    // Pick Random Listener
    d3.select("#pick-random").on("click", (event) => {
        // TODO: Dispatch random selection event

        let randomPoint = networkGraph.data[Math.floor(Math.random() * networkGraph.data.length)];
        networkGraph.clickedSet = randomPoint;
        // clear search input
        d3.select("#search-input").node().value = "";
        networkGraph.updateVis();
        dispatcher.call('cardData', event, [randomPoint, null]);
        console.log("Pick random button clicked!");
    });


    // Instantiate the ColorChart with the transformed color data



});


// d3.csv("data/lego_data.csv").then((data) => {
//     // Convert columns to numerical values
//     data.forEach((d) => {
//         d.set_year = +d.set_year;
//         d.theme_id = +d.theme_id;
//         d.set_num_parts = +d.set_num_parts;
//         d.color_id = +d.color_id;
//         d.rgb = d.rgb; // leaving rgb as string
//     });

//     const dispatcher = d3.dispatch(
//         "searchPoint",
//         "randomPoint",
//         "selectedPoint",
//         "cardData"
//     );

//     const filteredData = {};

//     data.forEach((d) => {
//         const setNum = d.set_num;
//         if (!filteredData[setNum]) {
//             filteredData[setNum] = {
//                 theme_name: d.theme_name,
//             };
//         }
//     });

//     // Search Input Listener






//     const heatMap = new HeatMap(
//         {
//             parentElement: d3.select("#heat-map-container"),
//         },
//         data
//     );


//     // Instantiate Cards
//     const cards = new Cards(
//         {
//             parentElement: d3.select("#cards-container"),
//         },
//         dispatcher,
//         data
//     );
//     dispatcher.on("cardData", (cardData) => {
//         console.log("Card Data", cardData);
//         cards.cardData = cardData;
//         cards.updateVis();
//     });


// });
