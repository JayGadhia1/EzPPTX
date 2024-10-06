import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(() => {
    console.log("addOnUISdk is ready for use.");

    const clickMeButton = document.getElementById("Export");
    clickMeButton.addEventListener("click", () => {
        clickMeButton.innerHTML = "Clicked";
    });

    const clickMeButtonAI = document.getElementById("ExportAI");
    clickMeButton.addEventListener("click", () => {
        clickMeButton.innerHTML = "Clicked";
    });


    // Enable the button only when:
    // 1. `addOnUISdk` is ready, and
    // 2. `click` event listener is registered.
    clickMeButton.disabled = false;
});
