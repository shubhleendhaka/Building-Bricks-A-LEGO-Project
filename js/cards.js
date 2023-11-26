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
        this.initVis();
        this.cardData = [];
        console.log(this.config.parentElement);
    }

    initVis() {
        this.updateVis()

    }
    updateVis() {
        const vis = this;
        const cardsHTML = `
            <div class="selected-card">
                <h2 class="card-title">Power Boat</h2>
                <div class="card-content">
                    <img class="card-image" src="https://cdn.rebrickable.com/media/sets/42089-1.jpg" />
                    <div class="card-info-titles">
                        <h4>Year:</h4>
                        <h4>Theme:</h4>
                        <h4>Pieces:</h4>
                    </div>
                    <div class="card-info">
                        <h5>2019</h5>
                        <h5>Technic</h5>
                        <h5>174</h5>
                    </div>
                </div>
            </div>
            <div class="hovered-card">
                <h2 class="card-title">First Order Star Destroyer</h2>
                <div class="card-content">
                    <img class="card-image" src="https://cdn.rebrickable.com/media/sets/30277-1.jpg" />
                    <div class="card-info-titles">
                        <h4>Year:</h4>
                        <h4>Theme:</h4>
                        <h4>Pieces:</h4>
                    </div>
                    <div class="card-info">
                        <h5>2016</h5>
                        <h5>Star Wars</h5>
                        <h5>56</h5>
                    </div>
                </div>
            </div>
        `;

        // Append the generated HTML to the parent element
        vis.config.parentElement.html(cardsHTML);

        console.log("Added card content to DOM");
    }
}

// Instantiate Cards

