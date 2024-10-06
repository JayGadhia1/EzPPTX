import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(() => {
    console.log("addOnUISdk is ready for use.");

    const exportButton = document.getElementById("Export");

    // Add event listener for button click
    exportButton.addEventListener("click", () => {
        console.log("Export button clicked.");

        // Call the backend to trigger the conversion and download the result
        exportAdobeExpressToPptx();
    });

    // Enable the button when the SDK is ready
    exportButton.disabled = false;
});

function exportAdobeExpressToPptx() {
    fetch("http://localhost:3000/convert-adobe-express-to-pptx", {  // Make sure this is pointing to the correct backend URL
        method: "POST",
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();  // We expect the response to be a blob (the file)
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "AdobeExpressToPptx.pptx";  // Set the default file name for the download
        document.body.appendChild(a);  // Append the link to the body
        a.click();  // Programmatically click the link to trigger the download
        a.remove();  // Remove the link after the download
    })
    .catch(error => {
        console.error("Error during conversion:", error);
        alert("An error occurred while converting the Adobe Express project.");
    });
}

