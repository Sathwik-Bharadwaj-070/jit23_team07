let growthChart = null;
let yieldCompareChart = null;
let growthCompareChart = null;

let currentMoisture = null;
let currentSeedQuality = null;
let currentCropType = null;

const SOIL_COLORS = { Black: "#5c4033", Red: "#c1440e", Clay: "#3b7dd8" };

async function readSensor() {
    document.getElementById("error_msg").innerText = "";
    document.getElementById("moisture_display").innerText = "Reading...";
    try {
        const response = await fetch("/moisture");
        const data = await response.json();

        if (data.error || data.moisture === null) {
            currentMoisture = null;
            document.getElementById("moisture_display").innerText = "Not read yet";
            document.getElementById("error_msg").innerText =
                data.error || "Sensor not connected or no reading yet.";
            return;
        }

        currentMoisture = data.moisture;
        document.getElementById("moisture_display").innerText = data.moisture + "%";
    } catch (err) {
        currentMoisture = null;
        document.getElementById("moisture_display").innerText = "Not read yet";
        document.getElementById("error_msg").innerText = "Error: " + err.message;
    }
}

async function analyzeSeed() {
    document.getElementById("error_msg").innerText = "";
    const fileInput = document.getElementById("seed_image");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("error_msg").innerText = "Please choose a seed image first.";
        return;
    }

    document.getElementById("crop_type_display").innerText = "Analyzing...";
    document.getElementById("seed_quality_display").innerText = "Analyzing...";

    try {
        const formData = new FormData();
        formData.append("seed_image", file);

        const response = await fetch("/classify_seed", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            currentSeedQuality = null;
            currentCropType = null;
            document.getElementById("crop_type_display").innerText = "Not analyzed yet";
            document.getElementById("seed_quality_display").innerText = "Not analyzed yet";
            document.getElementById("error_msg").innerText = data.error;
            return;
        }

        currentSeedQuality = data.seed_quality;
        currentCropType = data.crop_type;
        document.getElementById("crop_type_display").innerText =
            `${data.crop_type} (confidence: ${data.crop_confidence}%)`;
        document.getElementById("seed_quality_display").innerText =
            `${data.seed_quality} (score: ${data.quality_score}/100)`;
    } catch (err) {
        currentSeedQuality = null;
        currentCropType = null;
        document.getElementById("crop_type_display").innerText = "Not analyzed yet";
        document.getElementById("seed_quality_display").innerText = "Not analyzed yet";
        document.getElementById("error_msg").innerText = "Error: " + err.message;
    }
}

async function runComparison() {
    document.getElementById("error_msg").innerText = "";

    if (currentCropType === null || currentSeedQuality === null) {
        document.getElementById("error_msg").innerText = "Please analyze a seed image first.";
        return;
    }
    if (currentMoisture === null) {
        document.getElementById("error_msg").innerText = "Please read the moisture sensor first.";
        return;
    }

    const crop = currentCropType;
    const seed_quality = currentSeedQuality;
    const moisture_pct = currentMoisture;

    try {
        const response = await fetch("/compare_soils", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop, seed_quality, moisture_pct })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById("error_msg").innerText = data.error;
            return;
        }

        document.getElementById("comparison_results").style.display = "block";

        const soils = Object.keys(data);
        const yields = soils.map(s => data[s].predicted_yield_kg_per_ha);
        const colors = soils.map(s => SOIL_COLORS[s]);

        // Bar chart: yield comparison across soils
        const yieldCtx = document.getElementById("yieldCompareChart").getContext("2d");
        if (yieldCompareChart) yieldCompareChart.destroy();
        yieldCompareChart = new Chart(yieldCtx, {
            type: "bar",
            data: {
                labels: soils,
                datasets: [{
                    label: "Predicted Yield (kg/ha)",
                    data: yields,
                    backgroundColor: colors
                }]
            },
            options: {
                plugins: { title: { display: true, text: `Yield Comparison - ${crop}` } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // Line chart: overlaid growth curves for all 3 soils
        const labels = data[soils[0]].growth_simulation.map(p => p.day);
        const datasets = soils.map(soil => ({
            label: `${soil} soil`,
            data: data[soil].growth_simulation.map(p => p.growth_percent),
            borderColor: SOIL_COLORS[soil],
            fill: false,
            tension: 0.3
        }));

        const growthCtx = document.getElementById("growthCompareChart").getContext("2d");
        if (growthCompareChart) growthCompareChart.destroy();
        growthCompareChart = new Chart(growthCtx, {
            type: "line",
            data: { labels, datasets },
            options: {
                plugins: { title: { display: true, text: `Growth Curve Comparison - ${crop}` } },
                scales: {
                    x: { title: { display: true, text: "Days" } },
                    y: { title: { display: true, text: "Growth (%)" }, min: 0, max: 100 }
                }
            }
        });
    } catch (err) {
        document.getElementById("error_msg").innerText = "Error: " + err.message;
    }
}

async function runPrediction() {
    document.getElementById("error_msg").innerText = "";

    if (currentCropType === null || currentSeedQuality === null) {
        document.getElementById("error_msg").innerText = "Please analyze a seed image first.";
        return;
    }
    if (currentMoisture === null) {
        document.getElementById("error_msg").innerText = "Please read the moisture sensor first.";
        return;
    }

    const crop = currentCropType;
    const seed_quality = currentSeedQuality;
    const moisture_pct = currentMoisture;

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop, seed_quality, moisture_pct })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById("error_msg").innerText = data.error;
            return;
        }

        const rec = data.crop_recommendation;
        const yieldPred = data.yield_prediction;

        document.getElementById("rec_soil").innerText = rec.recommended_soil;
        document.getElementById("rec_score").innerText = rec.suitability_score;
        document.getElementById("rec_reason").innerText = rec.reason;
        document.getElementById("pred_yield").innerText = yieldPred.predicted_yield_kg_per_ha;
        document.getElementById("pred_days").innerText = yieldPred.harvest_days;

        document.getElementById("results").style.display = "block";

        const days = yieldPred.growth_simulation.map(p => p.day);
        const growth = yieldPred.growth_simulation.map(p => p.growth_percent);

        const ctx = document.getElementById("growthChart").getContext("2d");
        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [{
                    label: "Growth (%)",
                    data: growth,
                    borderColor: "green",
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: "Days" } },
                    y: { title: { display: true, text: "Growth (%)" }, min: 0, max: 100 }
                }
            }
        });
    } catch (err) {
        document.getElementById("error_msg").innerText = "Error: " + err.message;
    }
}
