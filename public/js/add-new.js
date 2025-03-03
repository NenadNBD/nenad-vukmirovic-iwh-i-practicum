document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#dateTime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: false,
        altInput: true,
        altFormat: "F j, Y h:iK"
    });
    const composerContainer = document.getElementById("composer-container");
    const addComposerButton = document.getElementById("add-composer");

    addComposerButton.addEventListener("click", function () {
        // Create Composer label and input
        const newComposerLabel = document.createElement("label");
        newComposerLabel.textContent = "Composer:";
        newComposerLabel.setAttribute("for", "composer");

        const newComposerInput = document.createElement("input");
        newComposerInput.type = "text";
        newComposerInput.name = "composer[]"; // Keep array format
        newComposerInput.required = true;

        // Create Composition label and input
        const newCompositionLabel = document.createElement("label");
        newCompositionLabel.textContent = "Composition:";
        newCompositionLabel.setAttribute("for", "composition");

        const newCompositionInput = document.createElement("input");
        newCompositionInput.type = "text";
        newCompositionInput.name = "composition[]"; // Keep array format
        newCompositionInput.required = true;

        // Append new elements before the button
        composerContainer.appendChild(newComposerLabel);
        composerContainer.appendChild(newComposerInput);
        composerContainer.appendChild(newCompositionLabel);
        composerContainer.appendChild(newCompositionInput);
    });
});