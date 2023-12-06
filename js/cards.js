class Cards {
    constructor(_config, dispatcher, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        };
        this.dispatcher = dispatcher;
        this.data = data;

        // Wait for the DOM to fully load before initializing the visualization
        this.cardData = [];
        this.filteredCards = [];
        this.initVis();

    }

    initVis() {
        let vis = this;
        vis.colorMap = {
            'Books': '#fb8072',    // Red
            'Key Chain': '#80b1d3',           // Orange
            'Friends': '#ffe45e',           // Yellow
            'Gear': '#8dd3c7',      // Green
            'Ninjago': '#fdb462',           // Blue
            'Star Wars': '#bebada'          // Purple
        };
        vis.updateVis()


    }
    updateVis() {
        const vis = this;


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

                let currentCard = vis.cardData[i];
                console.log(currentCard);
                let transformation = ''
                let translateText = ''
                let translateCard = ''
                if (cardsHTML !== '') {
                    transformation = `transform: scaleY(-1)`
                    translateText = ` translateY(20px);`;
                    translateCard = ` translateY(-20px);`
                }


                cardsHTML += `
                <div class="selected-card" style="--selected-card-color: ${vis.colorMap[currentCard.theme_name]};${transformation}${translateCard}">
                <div class="card-content" style="${transformation}${translateText}}">
                <h2 class="card-title">${currentCard.set_name}</h2>

                        <img class="card-image" src=${currentCard.set_img_url} /> 
                        <div class="card-info-titles">
                            <h4>Year</h4>
                            <h4>Theme</h4>
                            <h4>Pieces</h4>
                        </div>
                        <div class="card-info">
                            <h5>${currentCard.set_year}</h5>
                            <h5>${currentCard.theme_name}</h5>
                            <h5>${currentCard.num_parts}</h5>
                        </div>
                    </div>
                </div>
            `

            }
        }

        vis.config.parentElement.html(cardsHTML);
    }
}

// Instantiate Cards

