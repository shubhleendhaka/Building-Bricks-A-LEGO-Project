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
            'Books': { color: '#fb8072', font: 'white' },      // Red
            'Key Chain': { color: '#80b1d3', font: 'white' },   // Blue
            'Friends': { color: '#ffe45e', font: 'black' },    // Yellow
            'Gear': { color: '#8dd3c7', font: 'black' },       // Green
            'Ninjago': { color: '#fdb462', font: 'black' },     // Otange
            'Star Wars': { color: '#bebada', font: 'black' }    // Purple
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

                let fontColor = vis.colorMap[currentCard.theme_name].font;
                let cardColor = vis.colorMap[currentCard.theme_name].color;
                console.log("Font Color", fontColor)
                let title = currentCard.set_name;
                if (title.length > 47) {
                    title = title.substring(0, 44) + '...';
                }

                cardsHTML += `
                    <div class="selected-card" style="--selected-card-color: ${cardColor};${transformation}${translateCard}">
                        <div class="card-content" style="${transformation}${translateText} color:${fontColor}">
                            <h2 class="card-title">${title}</h2>
                            <img class="card-image" src=${currentCard.set_img_url} onerror="this.onerror=null; this.src='data/default-lego-image.jpg'; this.style.width='175px'; this.style.height='110px';"/> 
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
                `;

            }
        }

        vis.config.parentElement.html(cardsHTML);
    }
}

// Instantiate Cards

