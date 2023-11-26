class Cards {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 0,
                right: 5,
                bottom: 20,
                left: 0
            }
        };
        this.dispatcher = dispatcher;
        this.data = data;

        // Wait for the DOM to fully load before initializing the visualization
        this.cardData = [];
        this.filteredCards = [];
        console.log(this.config.parentElement);
        this.initVis();

    }

    initVis() {
        this.updateVis()

    }
    updateVis() {
        const vis = this;
        console.log("Updating Cards");

        //     FROM VIS.data only get items where the set_num is in vis.cardData
        this.filteredCards = vis.data.filter(d => vis.cardData.includes(d.set_num));
        console.log(this.filteredCards.length);

        //     console.log(vis.filteredCards);


        this.renderVis()
    }

    renderVis() {
        let vis = this;

        // Append the generated HTML to the parent element
        let cardsHTML = '';
        for (let i = 0; i < vis.filteredCards.length; i++) {
            cardsHTML += `
                <div class="selected-card">
                    <h2 class="card-title">Power Boat</h2>
                    <div class="card-content">
                        <img class="card-image" src="https://cdn.rebrickable.com/media/sets/42089-1.jpg" />
                        <div class="card-info-titles        ">
                            <h4>Year:</h4>
                            <h4>Theme:</h4>
                            <h4>Pieces:</h4>
                        </div>
                        <div class="card-info">
                            <h5>${vis.filteredCards[i].set_year}</h5>
                            <h5>${vis.filteredCards[i].theme_id}</h5>
                            <h5>${vis.filteredCards[i].set_num_parts}</h5>
                        </div>
                    </div>
                </div>
                </div>
            `



        }
        vis.config.parentElement.html(cardsHTML);

    }
}

// Instantiate Cards

