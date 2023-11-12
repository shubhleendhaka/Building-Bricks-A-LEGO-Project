d3.csv('data/lego_data.csv').then(data => {

    // Convert columns to numerical values
    data.forEach(d => {

        d.set_year = +d.set_year;
        d.theme_id = +d.theme_id;
        d.set_num_parts = +d.set_num_parts;
        d.color_id = +d.color_id;

    })

    const dispatcher = d3.dispatch('selectedPoint');
    const filteredData = {};

    data.forEach(d => {
        const setNum = d.set_num;
        if (!filteredData[setNum]) {
            filteredData[setNum] = {
                theme_name: d.theme_name
            };
        }
    });




    const networkGraph = new NetworkGraph({
        parentElement: d3.select('#network-graph-container'),
    }, dispatcher, filteredData);

});
