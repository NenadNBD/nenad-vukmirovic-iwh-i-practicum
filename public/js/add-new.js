document.addEventListener("DOMContentLoaded", async function () {
    flatpickr("#dateTime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: false,
        altInput: true,
        altFormat: "F j, Y h:iK"
    });
    const programContainer = document.getElementById("programContainer");
    const addProgramButton = document.getElementById("addProgram");

    addProgramButton.addEventListener("click", function () {
        const programRows = programContainer.querySelectorAll(".program-column-fieldset").length + 1;

        // Create fieldset wrapper
        const fieldset = document.createElement("fieldset");
        fieldset.classList.add("program-column-fieldset");

        // Create count div
        const countDiv = document.createElement("div");
        countDiv.classList.add("count-program-rows");
        const countP = document.createElement("p");
        countP.textContent = programRows; // Set the number
        countDiv.appendChild(countP);

        // Create Composer input
        const composerDiv = document.createElement("div");
        composerDiv.classList.add("form-input");
        const composerLabel = document.createElement("label");
        composerLabel.setAttribute("for", `composer-${programRows}`);
        composerLabel.textContent = "Composer:";
        const composerInput = document.createElement("input");
        composerInput.type = "text";
        composerInput.name = "composer[]";
        composerInput.id = `composer-${programRows}`;
        composerInput.required = true;
        composerDiv.appendChild(composerLabel);
        composerDiv.appendChild(composerInput);

         // Create Composition input
         const compositionDiv = document.createElement("div");
         compositionDiv.classList.add("form-input");
         const compositionLabel = document.createElement("label");
         compositionLabel.setAttribute("for", `composition-${programRows}`);
         compositionLabel.textContent = "Composition:";
         const compositionInput = document.createElement("input");
         compositionInput.type = "text";
         compositionInput.name = "composition[]";
         compositionInput.id = `composition-${programRows}`;
         compositionInput.required = true;
         compositionDiv.appendChild(compositionLabel);
         compositionDiv.appendChild(compositionInput);

        // Create Remove button (only for second row and beyond)
        const removeDiv = document.createElement("div");
        removeDiv.classList.add("remove-program-row");
        if (programRows > 1) {
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.type = "button"; // Prevent form submission
            removeButton.classList.add("remove-program-button"); // Add CSS class
        
            removeButton.addEventListener("click", function () {
                fieldset.remove();
                updateOrdinalNumbers(); // Update numbering after removal
            });
        
            removeDiv.appendChild(removeButton);
        }
        // Append all elements to fieldset
        fieldset.appendChild(countDiv);
        fieldset.appendChild(composerDiv);
        fieldset.appendChild(compositionDiv);
        fieldset.appendChild(removeDiv);

        // Append fieldset to container
        programContainer.appendChild(fieldset);
    });

    function updateOrdinalNumbers() {
        const rows = programContainer.querySelectorAll(".program-column-fieldset");
        rows.forEach((row, index) => {
            row.querySelector(".count-program-rows p").textContent = (index + 1) + ".";
        });
    }

    const conductorSelect = document.getElementById("conductor");

    try {
        const conductorsResponse = await fetch("/conductors"); // Fetch data from API
        const setConductors = await conductorsResponse.json(); // Parse JSON

        setConductors.forEach(conductor => {
            const option = document.createElement("option");
            option.value = conductor.properties.hs_object_id; // Set value to object ID
            option.textContent = `${conductor.properties.firstname} ${conductor.properties.lastname}`; // Show name
            conductorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching conductors:", error);
    }

});