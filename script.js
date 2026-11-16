
"use strict";

// ========================================
// 1. APPLICATION STATE
// ========================================

let runningEconomyData = null;
let vo2Data = null;

let vo2Chart = null;
let hrChart = null;
let rpeChart = null;
let reChart = null;


// ========================================
// 2. ELEMENT HELPER
// ========================================

const $ = id => document.getElementById(id);


// ========================================
// 3. DATE INITIALISATION
// ========================================

function getLocalDate() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

$("date").value = getLocalDate();


// ========================================
// 4. PREDICTED HRMAX
// ========================================

// Original formula:
// HRmax = 220 - Age

function getHRmax() {

    const ageText = $("age").value.trim();
    const age = Number(ageText);

    if (
        ageText === "" ||
        !Number.isInteger(age) ||
        age < 10 ||
        age > 100
    ) {
        return null;
    }

    return 220 - age;

}

function updateHRmax() {

    const hrmax = getHRmax();

    $("hrmaxDisplay").textContent =
        hrmax === null ? "-- bpm" : `${hrmax} bpm`;

    // Existing endurance results may need recalculation
    if (vo2Data) {
        vo2Data = null;
        $("analysis").hidden = true;
        $("vo2Message").hidden = true;
        $("vo2Error").hidden = true;
    }

}

$("age").addEventListener("input", updateHRmax);


// ========================================
// 5. PARTICIPANT INFORMATION
// ========================================

function getParticipantInfo() {

    const participant = $("participant").value.trim();
    const researcher = $("researcher").value.trim();
    const ageText = $("age").value.trim();
    const date = $("date").value;

    const age = Number(ageText);

    if (!participant) {
        throw new Error("Please enter the participant number.");
    }

    if (!researcher) {
        throw new Error("Please enter the researcher's name.");
    }

    if (
        ageText === "" ||
        !Number.isInteger(age) ||
        age < 10 ||
        age > 100
    ) {
        throw new Error("Please enter a valid age between 10 and 100.");
    }

    if (!date || Number.isNaN(Date.parse(date + "T00:00:00"))) {
        throw new Error("Please select a valid testing date.");
    }

    return {

        participant,
        researcher,
        age,
        date,
        hrmax: 220 - age

    };

}


// ========================================
// 6. DYNAMIC STAGE GENERATOR
// ========================================

function generateStageInputs(type) {

    const isRE = type === "re";

    const countInput = $(isRE ? "reStages" : "vo2Stages");
    const container = $(isRE ? "reInputs" : "vo2Inputs");

    const previousValues = [];

    container.querySelectorAll(".stage-row").forEach(row => {

        const values = {};

        row.querySelectorAll("input").forEach(input => {
            values[input.dataset.field] = input.value;
        });

        previousValues.push(values);

    });

    const count = Number(countInput.value);

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const previous = previousValues[i] || {};

        const row = document.createElement("div");
        row.className = "stage-row";

        const heading = document.createElement("h4");
        heading.textContent = `Stage ${i + 1}`;

        const grid = document.createElement("div");
        grid.className = "stage-grid";

        const fields = isRE

            ? [
                ["speed", "Speed (km/h)", "0.1"],
                ["vo2", "VO₂ (ml/kg/min)", "0.1"],
                ["hr", "Heart Rate (bpm)", "1"],
                ["rpe", "RPE (6–20)", "1"]
            ]

            : [
                ["gradient", "Gradient (%)", "0.5"],
                ["vo2", "VO₂ (ml/kg/min)", "0.1"],
                ["hr", "Heart Rate (bpm)", "1"],
                ["rpe", "RPE (6–20)", "1"]
            ];

        fields.forEach(([field, label, step]) => {

            const group = document.createElement("div");
            group.className = "stage-field";

            const fieldLabel = document.createElement("label");
            fieldLabel.textContent = label;

            const input = document.createElement("input");

            input.type = "number";
            input.min = field === "rpe" ? "6" : "0";
            input.step = step;
            input.placeholder = "Enter value";

            input.className = "stage-input";
            input.dataset.field = field;

            input.value = previous[field] ?? "";

            if (field === "rpe") {
                input.max = "20";
            }

            group.append(fieldLabel, input);
            grid.appendChild(group);

        });

        row.append(heading, grid);

        container.appendChild(row);

    }

    // Changing stages invalidates the previous saved dataset
    if (isRE) {

        runningEconomyData = null;

        $("reAnalysis").hidden = true;
        $("reMessage").hidden = true;

    } else {

        vo2Data = null;

        $("analysis").hidden = true;
        $("vo2Message").hidden = true;

    }

}

$("reStages").addEventListener("change", () => {
    generateStageInputs("re");
});

$("vo2Stages").addEventListener("change", () => {
    generateStageInputs("vo2");
});


// ========================================
// 7. VALIDATE STAGE COUNT
// ========================================

function validateStageCount(id) {

    const value = $(id).value.trim();
    const count = Number(value);

    if (
        value === "" ||
        !Number.isInteger(count) ||
        count < 1 ||
        count > 20
    ) {
        throw new Error(
            "Number of stages must be between 1 and 20."
        );
    }

    return count;

}


// ========================================
// 8. READ STAGE DATA
// ========================================

function readStageData(type) {

    const isRE = type === "re";

    const container = $(isRE ? "reInputs" : "vo2Inputs");

    const rows = container.querySelectorAll(".stage-row");

    const data = [];

    rows.forEach((row, index) => {

        const values = {};

        row.querySelectorAll("input").forEach(input => {

            const field = input.dataset.field;
            const text = input.value.trim();
            const value = Number(text);

            if (
                text === "" ||
                !Number.isFinite(value)
            ) {
                throw new Error(
                    `Please complete all fields in Stage ${index + 1}.`
                );
            }

            if (field === "rpe") {

                if (
                    !Number.isInteger(value) ||
                    value < 6 ||
                    value > 20
                ) {
                    throw new Error(
                        `RPE in Stage ${index + 1} must be between 6 and 20.`
                    );
                }

            } else if (value < 0) {

                throw new Error(
                    `Stage ${index + 1} contains a negative value.`
                );

            }

            values[field] = value;

        });

        data.push(values);

    });

    return data;

}


// ========================================
// 9. VALIDATE SPEED INFORMATION
// ========================================

function getTestSpeed(id, label) {

    const text = $(id).value.trim();
    const value = Number(text);

    if (
        text === "" ||
        !Number.isFinite(value) ||
        value < 0
    ) {
        throw new Error(
            `Please enter a valid ${label}.`
        );
    }

    return value;

}


// ========================================
// 10. SAVE RUNNING ECONOMY DATA
// ========================================

function saveRunningEconomy() {

    hideMessage("reError");
    hideMessage("reMessage");

    try {

        const participant = getParticipantInfo();

        validateStageCount("reStages");

        const startingSpeed = getTestSpeed(
            "startSpeed",
            "starting speed"
        );

        const stages = readStageData("re");

        const speedValues = stages.map(stage => stage.speed);

        if (
            speedValues.some(
                (speed, index) =>
                    index > 0 && speed <= speedValues[index - 1]
            )
        ) {
            throw new Error(
                "Running Economy speeds must increase at each stage."
            );
        }

        runningEconomyData = {

            ...participant,

            startingSpeed,

            stages: stages.map((stage, index) => ({

                stage: index + 1,

                speed: stage.speed,
                vo2: stage.vo2,
                hr: stage.hr,
                rpe: stage.rpe

            }))

        };

        $("reMessage").textContent =
            "✓ Running Economy data recorded successfully.";

        $("reMessage").hidden = false;

        renderRunningEconomy();

        $("reAnalysis").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        showMessage("reError", error.message);

    }

}

$("saveREBtn").addEventListener(
    "click",
    saveRunningEconomy
);


// ========================================
// 11. SAVE VO2MAX DATA
// ========================================

function saveVO2() {

    hideMessage("vo2Error");
    hideMessage("vo2Message");

    try {

        const participant = getParticipantInfo();

        validateStageCount("vo2Stages");

        const testSpeed = getTestSpeed(
            "testSpeed",
            "test speed"
        );

        const stages = readStageData("vo2");

        const gradients = stages.map(stage => stage.gradient);

        if (
            gradients.some(
                (gradient, index) =>
                    index > 0 && gradient <= gradients[index - 1]
            )
        ) {
            throw new Error(
                "Gradient must increase at each stage."
            );
        }

        const data = stages.map((stage, index) => {

            const percentageHRmax =
                (stage.hr / participant.hrmax) * 100;

            return {

                stage: index + 1,

                gradient: stage.gradient,
                vo2: stage.vo2,
                hr: stage.hr,
                rpe: stage.rpe,

                percentageHRmax,

                flagged: percentageHRmax > 90

            };

        });

        vo2Data = {

            ...participant,

            testSpeed,

            stages: data

        };

        $("vo2Message").textContent =
            "✓ VO₂max endurance data recorded successfully.";

        $("vo2Message").hidden = false;

        renderVO2Analysis();

        $("analysis").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        showMessage("vo2Error", error.message);

    }

}

$("saveVO2Btn").addEventListener(
    "click",
    saveVO2
);


// ========================================
// 12. RENDER VO2MAX ANALYSIS
// ========================================

function renderVO2Analysis() {

    if (!vo2Data) return;

    const data = vo2Data.stages;

    const highestVO2 = Math.max(
        ...data.map(stage => stage.vo2)
    );

    const flaggedCount = data.filter(
        stage => stage.flagged
    ).length;

    $("vo2maxResult").textContent =
        highestVO2.toFixed(2);

    $("hrmaxResult").textContent =
        vo2Data.hrmax;

    $("flaggedStages").textContent =
        flaggedCount;

    $("participantSummary").textContent =
        `Participant: ${vo2Data.participant} | ` +
        `Researcher: ${vo2Data.researcher} | ` +
        `Age: ${vo2Data.age} | ` +
        `Date: ${vo2Data.date} | ` +
        `Test Speed: ${vo2Data.testSpeed} km/h`;

    renderVO2Table();

    drawVO2Chart();
    drawHRChart();
    drawRPEChart();

    $("analysis").hidden = false;

}


// ========================================
// 13. VO2MAX RESULTS TABLE
// ========================================

function renderVO2Table() {

    const table = $("vo2ResultsTable");

    table.innerHTML = "";

    vo2Data.stages.forEach(stage => {

        const row = document.createElement("tr");

        if (stage.flagged) {
            row.classList.add("flagged-row");
        }

        const values = [

            stage.stage,

            stage.gradient.toFixed(1) + "%",

            stage.vo2.toFixed(2),

            stage.hr,

            stage.percentageHRmax.toFixed(1) + "%",

            stage.rpe,

            stage.flagged ? "⚠ Above 90%" : "Normal"

        ];

        values.forEach((value, index) => {

            const cell = document.createElement("td");

            cell.textContent = value;

            if (index === 6) {

                cell.className = stage.flagged
                    ? "flagged-status"
                    : "normal-status";

            }

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}


// ========================================
// 14. RENDER RUNNING ECONOMY ANALYSIS
// ========================================

function renderRunningEconomy() {

    if (!runningEconomyData) return;

    const table = $("reResultsTable");

    table.innerHTML = "";

    runningEconomyData.stages.forEach(stage => {

        const row = document.createElement("tr");

        const values = [

            stage.stage,
            stage.speed.toFixed(1),
            stage.vo2.toFixed(2),
            stage.hr,
            stage.rpe

        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

    drawREChart();

    $("reAnalysis").hidden = false;

}


// ========================================
// 15. CHART CONFIGURATION
// ========================================

function makeChart(canvasId, label, values, color, title, yTitle) {

    const existingChart = {

        vo2Chart,
        hrChart,
        rpeChart,
        reChart

    }[canvasId];

    if (existingChart) {
        existingChart.destroy();
    }

    const chart = new Chart($(canvasId), {

        type: "line",

        data: {

            labels: values.labels,

            datasets: [{

                label,

                data: values.data,

                borderColor: color,
                backgroundColor: color,

                borderWidth: 3,

                pointRadius: 6,
                pointHoverRadius: 9,

                tension: 0.2

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: true,

            plugins: {

                title: {

                    display: true,
                    text: title,
                    color: "#ffffff"

                },

                legend: {

                    labels: {
                        color: "#cbd5e1"
                    }

                }

            },

            scales: {

                x: {

                    title: {

                        display: true,
                        text: values.xTitle || "Stage",
                        color: "#cbd5e1"

                    },

                    ticks: {
                        color: "#94a3b8"
                    },

                    grid: {
                        color: "#334155"
                    }

                },

                y: {

                    title: {

                        display: true,
                        text: yTitle,
                        color: "#cbd5e1"

                    },

                    ticks: {
                        color: "#94a3b8"
                    },

                    grid: {
                        color: "#334155"
                    }

                }

            }

        }

    });

    return chart;

}


// ========================================
// 16. VO2 CURVE
// ========================================

function drawVO2Chart() {

    vo2Chart = makeChart(

        "vo2Chart",

        "VO₂ (ml/kg/min)",

        {

            labels: vo2Data.stages.map(
                stage => `Stage ${stage.stage}`
            ),

            data: vo2Data.stages.map(
                stage => stage.vo2
            )

        },

        "#38bdf8",

        "VO₂ Curve",

        "VO₂ (ml/kg/min)"

    );

}


// ========================================
// 17. HEART RATE CURVE
// ========================================

function drawHRChart() {

    hrChart = makeChart(

        "hrChart",

        "Heart Rate (bpm)",

        {

            labels: vo2Data.stages.map(
                stage => `Stage ${stage.stage}`
            ),

            data: vo2Data.stages.map(
                stage => stage.hr
            )

        },

        "#fb7185",

        "Heart Rate Curve",

        "Heart Rate (bpm)"

    );

}


// ========================================
// 18. RPE CURVE
// ========================================

function drawRPEChart() {

    rpeChart = makeChart(

        "rpeChart",

        "RPE",

        {

            labels: vo2Data.stages.map(
                stage => `Stage ${stage.stage}`
            ),

            data: vo2Data.stages.map(
                stage => stage.rpe
            )

        },

        "#a78bfa",

        "Rating of Perceived Exertion",

        "RPE (6–20)"

    );

}


// ========================================
// 19. RUNNING ECONOMY CHART
// ========================================

function drawREChart() {

    reChart = makeChart(

        "reChart",

        "VO₂ (ml/kg/min)",

        {

            labels: runningEconomyData.stages.map(
                stage => stage.speed
            ),

            data: runningEconomyData.stages.map(
                stage => stage.vo2
            ),

            xTitle: "Running Speed (km/h)"

        },

        "#4ade80",

        "Running Economy: VO₂ vs Speed",

        "VO₂ (ml/kg/min)"

    );

}


// ========================================
// 20. CSV GENERATOR
// ========================================

function downloadCSV(filename, headers, rows) {

    if (!rows.length) {

        $("exportMessage").textContent =
            "Please save the relevant test data before exporting.";

        return;

    }

    function escapeCSV(value) {

        const text = String(value ?? "");

        return `"${text.replace(/"/g, '""')}"`;

    }

    const csv = [

        headers,

        ...rows

    ].map(row =>

        row.map(escapeCSV).join(",")

    ).join("\r\n");

    const blob = new Blob(

        ["\uFEFF" + csv],

        { type: "text/csv;charset=utf-8;" }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    $("exportMessage").textContent =
        "CSV file generated successfully.";

}


// ========================================
// 21. RUNNING ECONOMY CSV
// ========================================

function exportRE() {

    if (!runningEconomyData) {

        $("exportMessage").textContent =
            "Save Running Economy data first.";

        return;

    }

    const headers = [

        "Participant Number",
        "Researcher",
        "Age",
        "Date",
        "Starting Speed (km/h)",
        "Stage",
        "Speed (km/h)",
        "VO2 (ml/kg/min)",
        "Heart Rate (bpm)",
        "RPE"

    ];

    const rows = runningEconomyData.stages.map(stage => [

        runningEconomyData.participant,
        runningEconomyData.researcher,
        runningEconomyData.age,
        runningEconomyData.date,
        runningEconomyData.startingSpeed,
        stage.stage,
        stage.speed,
        stage.vo2,
        stage.hr,
        stage.rpe

    ]);

    downloadCSV(
        `RunningEconomy_${safeFilename(runningEconomyData.participant)}.csv`,
        headers,
        rows
    );

}

$("exportREBtn").addEventListener("click", exportRE);


// ========================================
// 22. VO2MAX CSV
// ========================================

function exportVO2() {

    if (!vo2Data) {

        $("exportMessage").textContent =
            "Save VO₂max data first.";

        return;

    }

    const headers = [

        "Participant Number",
        "Researcher",
        "Age",
        "Date",
        "Predicted HRmax",
        "Test Speed (km/h)",
        "Stage",
        "Gradient (%)",
        "VO2 (ml/kg/min)",
        "Heart Rate (bpm)",
        "%HRmax",
        "Above 90% HRmax",
        "RPE"

    ];

    const rows = vo2Data.stages.map(stage => [

        vo2Data.participant,
        vo2Data.researcher,
        vo2Data.age,
        vo2Data.date,
        vo2Data.hrmax,
        vo2Data.testSpeed,
        stage.stage,
        stage.gradient,
        stage.vo2,
        stage.hr,
        stage.percentageHRmax.toFixed(2),
        stage.flagged ? "Yes" : "No",
        stage.rpe

    ]);

    downloadCSV(
        `VO2max_${safeFilename(vo2Data.participant)}.csv`,
        headers,
        rows
    );

}

$("exportVO2Btn").addEventListener("click", exportVO2);


// ========================================
// 23. SAFE FILE NAME
// ========================================

function safeFilename(value) {

    return value.replace(/[^a-z0-9_-]/gi, "_");

}


// ========================================
// 24. PDF / PRINT REPORT
// ========================================

function exportPDF() {

    if (!runningEconomyData && !vo2Data) {

        $("exportMessage").textContent =
            "Please save at least one test before exporting.";

        return;

    }

    $("exportMessage").textContent =
        "Use your browser's print window to save the report as PDF.";

    window.print();

}

$("exportPDFBtn").addEventListener(
    "click",
    exportPDF
);


// ========================================
// 25. MESSAGE HELPERS
// ========================================

function showMessage(id, message) {

    $(id).textContent = message;

    $(id).hidden = false;

}

function hideMessage(id) {

    $(id).textContent = "";

    $(id).hidden = true;

}


// ========================================
// 26. INITIALISE APPLICATION
// ========================================

function initialiseApp() {

    generateStageInputs("re");

    generateStageInputs("vo2");

    updateHRmax();

}

initialiseApp();
