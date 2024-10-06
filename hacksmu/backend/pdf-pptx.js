const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExportPDFJob,
    ExportPDFParams,
    ExportPDFTargetFormat,
    ExportPDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} = require("@adobe/pdfservices-node-sdk");

const credentialsPath = path.join(__dirname, "pdfservices-api-credentials.json");
const credentialsData = JSON.parse(fs.readFileSync(credentialsPath));

// Initialize credentials using the JSON file
const credentials = new ServicePrincipalCredentials({
    clientId: credentialsData.client_credentials.client_id,
    clientSecret: credentialsData.client_credentials.client_secret
});

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for both HTTP and HTTPS origins
const allowedOrigins = ['http://localhost:5241', 'https://localhost:5241'];
app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Route to handle PDF to PPTX conversion
app.post("/convert-adobe-express-to-pptx", async (req, res) => {
    let readStream;
    try {
        // Step 1: Initialize credentials for Adobe PDF Services (done above)

        // Step 2: Create an instance of PDF Services
        const pdfServices = new PDFServices({ credentials });

        // Step 3: Read the PDF file (adjust the file path as needed)
        const pdfFilePath = path.join(__dirname, "resources/sample.pdf");

        // Check if file exists
        if (!fs.existsSync(pdfFilePath)) {
            console.error("File not found:", pdfFilePath);
            return res.status(500).json({ error: "File not found." });
        }

        readStream = fs.createReadStream(pdfFilePath);

        // Step 4: Upload the PDF to Adobe PDF Services
        const inputAsset = await pdfServices.upload({
            readStream,
            mimeType: MimeType.PDF
        });

        // Step 5: Set parameters for the export job (PDF to PPTX)
        const params = new ExportPDFParams({
            targetFormat: ExportPDFTargetFormat.PPTX
        });

        // Step 6: Create and submit the export job
        const job = new ExportPDFJob({ inputAsset, params });
        const pollingURL = await pdfServices.submit({ job });

        // Step 7: Wait for the job to complete and get the result
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: ExportPDFResult
        });

        // Step 8: Save the resulting PPTX file
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });
        const pptxFilePath = path.join(__dirname, "output/AdobeExpressToPptx.pptx");

        // Save the PPTX file locally
        const outputStream = fs.createWriteStream(pptxFilePath);
        streamAsset.readStream.pipe(outputStream);

        outputStream.on("finish", () => {
            // Send the PPTX file as a download
            res.download(pptxFilePath, "AdobeExpressToPptx.pptx", (err) => {
                if (err) {
                    console.error("Error during download:", err);
                    res.status(500).send("Could not download the file.");
                }
            });
        });

    } catch (err) {
        // Enhanced error logging
        console.error("Error during conversion:", err);

        if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
            res.status(500).json({ error: "PDF Services error occurred during the conversion.", details: err.message });
        } else {
            res.status(500).json({ error: "An internal error occurred during the conversion.", details: err.message });
        }
    } finally {
        readStream?.destroy();
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
