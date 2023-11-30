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
            if (key !== 'id' && key !== 'set_num' && key !== 'top_5_similar_sets' && key !== 'set_name' && key !== 'img_url' && key !== 'theme_name') {
                d[key] = +d[key];
            }
        });




    });



    console.log("Themes are ", themes);
    const dispatcher = d3.dispatch(
        "searchPoint",
        "randomPoint",
        "selectedPoint",
        "cardData"
    );

    const cards = new Cards(
        {
            parentElement: d3.select("#cards-container"),
        },
        dispatcher,
        data
    );
    dispatcher.on("cardData", (cardData) => {
        console.log("Card Data", cardData);
        cards.cardData = cardData;
        cards.updateVis();
    });

    const networkGraph = new Hexagon(
        {
            parentElement: d3.select("#hexagon-container"),
        },
        dispatcher,
        data
    );



});


d3.csv("data/lego_data.csv").then((data) => {
    // Convert columns to numerical values
    data.forEach((d) => {
        d.set_year = +d.set_year;
        d.theme_id = +d.theme_id;
        d.set_num_parts = +d.set_num_parts;
        d.color_id = +d.color_id;
        d.rgb = d.rgb; // leaving rgb as string
    });

    const dispatcher = d3.dispatch(
        "searchPoint",
        "randomPoint",
        "selectedPoint",
        "cardData"
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

    // Search Input Listener
    d3.select("#search-input").on("keypress", (event) => {
        if (event.key === "Enter") {
            // TODO: Dispatch search event
            console.log(`Search input entered for: ${event.target.value}`);
            event.target.value = "";
        }
    });

    // Pick Random Listener
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


    // Instantiate Cards
    const cards = new Cards(
        {
            parentElement: d3.select("#cards-container"),
        },
        dispatcher,
        data
    );
    dispatcher.on("cardData", (cardData) => {
        console.log("Card Data", cardData);
        cards.cardData = cardData;
        cards.updateVis();
    });


});
