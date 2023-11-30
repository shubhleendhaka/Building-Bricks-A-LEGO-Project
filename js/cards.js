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
        console.log(vis.cardData)

        //     FROM VIS.data only get items where the set_num is in vis.cardData

        //     console.log(vis.filteredCards);


        this.renderVis()
    }

    renderVis() {
        let vis = this;

        // Append the generated HTML to the parent element
        let cardsHTML = '';
        for (let i = 0; i < vis.cardData.length; i++) {
            if (vis.cardData[i] !== null) {
                console.log("Current Card", vis.data[vis.cardData[i]])

                let currentCard = vis.data[vis.cardData[i]];


                cardsHTML += `
                <div class="selected-card">
                    <h2 class="card-title">${currentCard.set_name}</h2>
                    <div class="card-content">
                    <img class="card-image" src=${currentCard.set_img_url} /> 
                        <div class="card-info-titles">
                            <h4>Year:</h4>
                            <h4>Theme:</h4>
                            <h4>Pieces:</h4>
                        </div>
                        <div class="card-info">
                            <h5>${currentCard.set_year}</h5>
                            <h5>${currentCard.theme_name}</h5>
                            <h5>${currentCard.num_parts}</h5>
                        </div>
                    </div>
                </div>
                </div>
            `

            }
        }
        // }
        vis.config.parentElement.html(cardsHTML);

    }
}

// Instantiate Cards

