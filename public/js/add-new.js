document.addEventListener("DOMContentLoaded", async function () {
    const dateInput = document.getElementById("dateTime");
    const checkDateModalButton = document.getElementById("checkDatemodalButton");
    const datePicker = flatpickr(dateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: false,
        altInput: true,
        altFormat: "F j, Y h:iK",
        onChange: async function (selectedDates, dateStr) {
            if (!dateStr) return;

            // Convert selected date to Unix timestamp (Seconds)
            const selectedDate = new Date(dateStr.split(" ")[0]); // Extract only the date part
            selectedDate.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
            const unixDateTimestamp = Math.floor(selectedDate.getTime() / 1000);

            console.log("Checking for existing concerts on:", unixDateTimestamp);

            // Send request to check for existing concerts
            try {
                const response = await fetch(`/check-concert-date?date=${unixDateTimestamp}`);
                const data = await response.json();

                if (data.exists) {
                    document.getElementById('checkDatemodal').style.display = 'flex';
                }
            } catch (error) {
                console.error("Error checking concert date:", error);
            }
        }
    });

    checkDateModalButton.addEventListener("click", function () {
        datePicker.clear(); // ✅ Clears Flatpickr selection
        document.getElementById('checkDatemodal').style.display = 'none';
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
    conductorSelect.addEventListener("change", function () {
        let conductorSelectedOption = conductorSelect.options[conductorSelect.selectedIndex];
        let conductorName = conductorSelectedOption.textContent;
        document.getElementById("conductorName").value = conductorName;
    });

    // Show warning messages for require fields
    const form = document.getElementById("addNewConcert");

    function showError(field, message) {
        let errorSpan = field.parentNode.querySelector(".error-message");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.classList.add("error-message");
            field.parentNode.appendChild(errorSpan);
        }

        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        field.classList.add("input-error");
    }

    // Remove warning message
    function clearError(field) {
        let errorSpan = field.parentNode.querySelector(".error-message");
        if (errorSpan) {
            errorSpan.style.display = "none";
        }
        field.classList.remove("input-error"); // Remove error styling
    }

    // Custom form validation before submission
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Stop default browser validation

        let isValid = true;
        const requiredFields = form.querySelectorAll("input[required], select[required]");

        requiredFields.forEach(field => {
            const label = form.querySelector(`label[for="${field.id}"]`);
            const fieldName = label ? label.textContent.replace(":", "").trim() : "This field";
            if (!field.value.trim()) {
                showError(field, `${fieldName} is required`);
                isValid = false;
            } else {
                clearError(field);
            }
        });

        // If all good, submit the form manually
        if (isValid) {
            form.submit();
        } else {
            console.log("Form has errors, not submitting.");
        }
    });

    // Remove warning messages on event
    document.querySelectorAll("input[required], select[required]").forEach(field => {
        field.addEventListener("input", () => clearError(field));
        field.addEventListener("change", () => clearError(field));
    });

});