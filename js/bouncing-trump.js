// --------------------------------------------------------------------------
// Bouncing Trump
// (c) 2019 https://bouncingtrump.com
//
// Based on the following tutorial
// http://rembound.com/articles/how-to-load-and-draw-images-with-html5-canvas
// --------------------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function () {
    // Get the canvas and context
    var total_trumps = 16;
    var canvas = document.getElementById("trump-canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    var context = canvas.getContext("2d");

    // Timing and frames
    var lastframe = 0;

    var initialized = false;

    // Level properties
    var level = {
        x: 1,
        y: 1,
        width: canvas.width,
        height: canvas.height
    };

    // Define an entity class
    var Entity = function (image, x, y, width, height, xdir, ydir, speed, filepath) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xdir = xdir;
        this.ydir = ydir;
        this.speed = speed;
        this.filepath = filepath;
    };

    // Array of entities
    var entities = [];

    // Images
    var images = [];

    // Image loading global variables
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;

    // Load images
    function loadImages(imagefiles) {
        // Initialize variables
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;

        // Load the images
        var loadedimages = [];
        for (var i = 0; i < imagefiles.length; i++) {
            // Create the image object
            var image = new Image();

            // Add onload event handler
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    // Done loading
                    preloaded = true;
                }
            };

            // Set the source url of the image
            image.src = imagefiles[i];

            // Save to the image array
            loadedimages[i] = image;
        }

        // Return an array of images
        return loadedimages;
    }

    // Initialize
    function init(image) {
        // Add mouse events
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);

        // Set random Trump quote
        quote = randomTrumpQuote();

        // Add Trump
        addTrump(image, 1);

        // Enter main loop
        main(0);
    }

    // Add Trump
    function addTrump(image, number) {
        // Load images
        images = loadImages([image]);

        // Create entity
        for (var i = 0; i < number; i++) {
            var scale = randRange(75, 200);
            var imageindex = i % images.length;
            var xdir = 1 - 2 * randRange(0, 1);
            var ydir = 1 - 2 * randRange(0, 1);
            var entity = new Entity(images[imageindex], 0, 0, scale, scale, xdir, ydir, randRange(100, 100), image);

            // Set a random position
            entity.x = randRange(0, level.width - entity.width);
            entity.y = randRange(0, level.height - entity.height);

            // Add to the entities array
            entities.push(entity);
        }
    }

    // Get a random int between low and high, inclusive
    function randRange(low, high) {
        return Math.floor(low + Math.random() * (high - low + 1));
    }

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Preloader
        if (!initialized) {
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the frame
            drawFrame();
            if (preloaded) {
                initialized = true;
            }
        } else {
            // Update and render
            update(tframe);
            render();
        }
    }

    // Update state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;

        // Update entities
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            // Move the entity, time-based
            entity.x += dt * entity.speed * entity.xdir;
            entity.y += dt * entity.speed * entity.ydir;

            // Handle left and right collisions with the level
            if (entity.x <= level.x) {
                // Left edge
                entity.xdir = 1;
                entity.x = level.x;
            } else if (entity.x + entity.width >= level.x + level.width) {
                // Right edge
                entity.xdir = -1;
                entity.x = level.x + level.width - entity.width;
            }

            // Handle top and bottom collisions with the level
            if (entity.y <= level.y) {
                // Top edge
                entity.ydir = 1;
                entity.y = level.y;
            } else if (entity.y + entity.height >= level.y + level.height) {
                // Bottom edge
                entity.ydir = -1;
                entity.y = level.y + level.height - entity.height;
            }
        }
    }

    // Render
    function render() {
        // Draw the frame
        drawFrame();

        // Draw the entities
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            context.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
        }
    }

    // Reset clear Trumps and get a new one
    function reset() {
        // Clear the canvas
        entities = [];

        // Remove Trump button toggle
        removeTrumpToggle();

        // Happy Trump
        happyTrump();

        // Start Bouncing Trump
        init(getRndTrump());
    }

    // Draw a frame
    function drawFrame() {
        // Draw background
        context.fillStyle = "#363636";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Mouse event handlers
    function onMouseMove(e) {}

    function onMouseDown(e) {
        // Update entities
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            var pos = getMousePos(canvas, e);

            // Check if we clicked the entity
            if (pos.x >= entity.x && pos.x < entity.x + entity.width &&
                pos.y >= entity.y && pos.y < entity.y + entity.height) {

                // Remove the current Trump
                var index = entities.indexOf(entity);
                if (index > -1) {
                    entities.splice(index, 1);
                }

                // Add two more of the current Trump
                addTrump(entity.filepath, 2);

                // Remove trump button toggle
                removeTrumpToggle();

                // Update Trump count
                updateTrumpCount();
            }
        }

    }

    function onMouseUp(e) {}

    function onMouseOut(e) {}

    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }

    // Get a random Trump
    function getRndTrump() {
        trump = "images/trump" + (Math.floor(Math.random() * total_trumps) + 1) + ".png";
        return trump;
    }

    // Helper function for the Trump quotes
    function randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Get random Trump quote from https://whatdoestrumpthink.com/api-docs
    function randomTrumpQuote() {
        let url = "https://api.whatdoestrumpthink.com/api/v1/quotes/random";

        fetch(url)
            .then(res => res.json())
            .then((data) => {
                quote = data.message;
            })
            .catch(err => { quote = "The wall just got ten feet taller."; throw err; });
    }

    // Toggle remove Trump button
    function removeTrumpToggle() {
        // Show the remove trump button once there are more than 1 Trump
        if (entities.length > 1) {
            document.getElementById("remove-trump").style.visibility = "visible";
        }
        else if (entities.length < 2) {
            document.getElementById("remove-trump").style.visibility = "hidden";
        }
        else {
            document.getElementById("remove-trump").style.visibility = "hidden";
        }
    }

    // Update Trump count
    function updateTrumpCount() {
        if (entities.length > 50 && entities.length < 100) {
            mehTrump();
        }
        else if (entities.length > 99 && entities.length < 150) {
            sadTrump();
        }
        else if (entities.length > 149 && entities.length < 200) {
            dangeTrump();
        }
        else if (entities.length == 200) {
            swal({
                title: "Bouncing Trump limit exceeded!",
                text: "\"" + quote + "\" -- Donald Trump",
                icon: getRndTrump(),
                closeOnClickOutside: false,
                button: "OK",
                // timer: 10000,
            })
            .then((value) => {
                reset();
            });
        }
        else if (entities.length <= 50) {
            happyTrump();
        }
        else  {
            dangeTrump();
        }
    }

    // Happy Trump
    function happyTrump() {
        document.getElementById("trump-count").style.background = "#1e7e34";
        document.getElementById("trump-count").style.borderColor = "#1e7e34";
        document.getElementById("trump-status").className = "";
        document.getElementById("trump-status").innerHTML = "";
        document.getElementById("trump-status").classList.add("far");
        document.getElementById("trump-status").classList.add("fa-smile");
        document.getElementById("trump-count").classList.remove("flashit")
    }

    // Meh Trump
    function mehTrump() {
        document.getElementById("trump-count").style.background = "#d39e00";
        document.getElementById("trump-count").style.borderColor = "#d39e00";
        document.getElementById("trump-status").className = "";
        document.getElementById("trump-status").innerHTML = "";
        document.getElementById("trump-status").classList.add("far");
        document.getElementById("trump-status").classList.add("fa-meh");
        document.getElementById("trump-count").classList.remove("flashit")
    }

    // Sad Trump
    function sadTrump() {
        document.getElementById("trump-count").style.background = "#bd2130";
        document.getElementById("trump-count").style.borderColor = "#bd2130";
        document.getElementById("trump-status").className = "";
        document.getElementById("trump-status").innerHTML = "";
        document.getElementById("trump-status").classList.add("far");
        document.getElementById("trump-status").classList.add("fa-frown");
        document.getElementById("trump-count").classList.remove("flashit")
    }

    // Danger Trump
    function dangeTrump() {
        document.getElementById("trump-count").style.background = "#bd2130";
        document.getElementById("trump-count").style.borderColor = "#bd2130";
        document.getElementById("trump-status").className = "";
        document.getElementById("trump-status").innerHTML = "";
        document.getElementById("trump-status").classList.add("fas");
        document.getElementById("trump-status").classList.add("fa-exclamation-triangle");
        document.getElementById("trump-count").classList.add("flashit")
    }

    // Trump Count/Status
    document.getElementById('trump-count').onclick = function (e) {
        plural = ((entities.length > 1) ? 's' : '');
        swal({
            title: entities.length + " Trump" + plural,
            text: "\"" + quote + "\" -- Donald Trump",
            icon: getRndTrump(),
            closeOnClickOutside: false,
            button: "OK",
        })
            .then((value) => {
                // Set random Trump quote
                quote = randomTrumpQuote();
            });
    };

    // Add Trump
    document.getElementById('add-trump').onclick = function (e) {
        // Add new Trump
        addTrump(getRndTrump(), 1);

        // Remove Trump button toggle
        removeTrumpToggle();

        // Update Trump count
        updateTrumpCount();
    };

    // Remove Trump
    document.getElementById('remove-trump').onclick = function (e) {
        // Remove last Trump
        entities.pop();
        // Remove trump button toggle
        removeTrumpToggle();

        // Update Trump count
        updateTrumpCount();
    };

    // Reset
    document.getElementById('reset').onclick = function (e) {
        reset();
        // Remove trump button toggle
        removeTrumpToggle();

        // Update Trump count
        updateTrumpCount();

        // Set random Trump quote
        quote = randomTrumpQuote();
    };

    // Start Bouncing Trump
    init(getRndTrump());

};
