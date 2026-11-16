# 🏃 VO₂max & Running Economy Test Logger

A browser-based sports science testing application designed to record, analyse and visualise data from **Running Economy** and **Maximal Oxygen Uptake (VO₂max) / Endurance Testing**.

The application provides a centralised interface for researchers, coaches and sports practitioners to collect physiological data, monitor exercise responses and analyse participant performance across progressive testing stages.

## 🎯 Project Overview

Assessing cardiorespiratory fitness and running performance involves collecting multiple physiological measurements under progressively increasing exercise demands.

Recording and analysing these measurements manually can be time-consuming and increase the possibility of human error.

This project was developed to simplify the data collection and analysis process by providing a digital testing logger that automatically organises participant information, calculates heart rate intensity, flags relevant physiological responses and generates visual performance reports.

The application consists of two main testing protocols:

1. Running Economy Test – speed increments.
2. Maximal Oxygen Uptake / Endurance Test – gradient increments.

## ✨ Features

### 1. Participant Information

Record essential participant and testing information:

- Participant number.
- Researcher name.
- Participant age.
- Testing date.
- Automatically calculated predicted maximum heart rate (HRmax).

**Predicted HRmax formula:**

HRmax = 220 − Age

### 2. Running Economy Test

Collect physiological data across progressive running speeds.

Users can customise the number of testing stages and record:

| Measurement | Unit |
|---|---|
| Running Speed | km/h |
| Oxygen Consumption (VO₂) | ml/kg/min |
| Heart Rate | bpm |
| Rating of Perceived Exertion (RPE) | 6–20 |

The application automatically generates a Running Economy graph displaying the relationship between running speed and oxygen consumption.

### 3. VO₂max / Endurance Test

Record physiological responses across progressively increasing treadmill gradients.

Users can customise the number of testing stages and record:

| Measurement | Unit |
|---|---|
| Treadmill Gradient | % |
| Oxygen Consumption (VO₂) | ml/kg/min |
| Heart Rate | bpm |
| Rating of Perceived Exertion (RPE) | 6–20 |

The application automatically calculates the highest recorded VO₂ value and generates physiological response graphs.

### 4. Automatic Heart Rate Analysis

The application calculates the percentage of predicted maximum heart rate for every endurance testing stage.

**Calculation:**

%HRmax = (Measured Heart Rate / Predicted HRmax) × 100

Stages exceeding 90% of predicted HRmax are automatically flagged and highlighted.

This allows researchers to identify stages where participants reach high relative cardiovascular intensity.

### 5. Automatic Performance Summary

The analysis dashboard provides:

- Highest recorded VO₂ (ml/kg/min).
- Predicted HRmax (bpm).
- Number of stages exceeding 90% HRmax.
- Endurance testing data table.
- Running Economy results table.

### 6. Data Visualisation

The application generates four interactive graphs using Chart.js:

| Graph | Variables |
|---|---|
| VO₂ Curve | VO₂ vs Testing Stage |
| Heart Rate Curve | HR vs Testing Stage |
| RPE Curve | RPE vs Testing Stage |
| Running Economy Curve | VO₂ vs Running Speed |

These graphs help visualise changes in physiological responses as exercise intensity increases.

### 7. Data Export

Testing results can be exported for further analysis and reporting.

- Running Economy results as CSV.
- VO₂max / Endurance results as CSV.
- Combined testing report using the browser's Print / Save as PDF functionality.

Exported CSV files include participant information and individual stage measurements.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive interface |
| JavaScript | Data collection, calculations and validation |
| Chart.js | Physiological data visualisation |
| GitHub Pages | Website hosting |

## 📁 Project Structure

```text
vo2max-running-economy/
│
├── index.html
│   └── Application structure and testing interface
│
├── style.css
│   └── Responsive dashboard styling
│
├── script.js
│   └── Data collection, calculations,
│       validation, graphs and CSV exports
│
└── README.md
    └── Project documentation
```

## 🚀 Getting Started

### Option 1: Access the Live Application

Visit the deployed GitHub Pages website:

`https://yourusername.github.io/vo2max-running-economy/`

Replace `yourusername` with your GitHub username.

### Option 2: Run Locally

Clone the repository:

```bash
git clone https://github.com/yourusername/vo2max-running-economy.git
```

Navigate into the project folder:

```bash
cd vo2max-running-economy
```

Open `index.html` in your browser.

No Python environment, Node.js server or backend installation is required.

### Deploy Using GitHub Pages

1. Upload all project files to your GitHub repository.
2. Navigate to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose the `main` branch.
5. Select `/ (root)`.
6. Click **Save**.

GitHub Pages will automatically deploy the application.

## 📊 How to Use

### Step 1: Participant Registration

Enter the participant number, researcher name, age and testing date.

The application automatically calculates predicted HRmax using the 220 − age formula.

### Step 2: Running Economy Testing

1. Select the number of testing stages.
2. Enter the starting speed.
3. Record running speed, VO₂, heart rate and RPE for each stage.
4. Click **Save Running Economy Data**.
5. Review the results table and VO₂ versus speed graph.

### Step 3: VO₂max / Endurance Testing

1. Select the number of testing stages.
2. Enter the treadmill test speed.
3. Record gradient, VO₂, heart rate and RPE for each stage.
4. Click **Save VO₂max Data**.
5. Review the physiological response graphs and automatically flagged stages.

### Step 4: Export Results

Download the respective CSV files or print the combined testing report as a PDF.

## ⚠️ Scientific Considerations

- Predicted HRmax using 220 − age is an estimation and may differ from an individual's actual maximum heart rate.
- The highest recorded VO₂ is not necessarily a confirmed VO₂max without appropriate verification criteria.
- Running Economy assessments should account for steady-state oxygen consumption and consistent testing conditions.
- Heart rate responses may be influenced by fatigue, hydration, environmental conditions and individual variability.
- RPE should be interpreted alongside physiological measurements rather than as an independent indicator of maximal effort.

This application is intended as a data collection and performance-monitoring aid, not a replacement for professional exercise testing protocols or clinical assessment.

## 🔮 Future Improvements

Potential future developments include:

- Supabase integration for centralised participant records.
- Permanent storage of testing sessions.
- Participant search and retrieval.
- Longitudinal VO₂max and Running Economy comparisons.
- Automated participant performance reports.
- Individual testing history dashboards.
- Integration with heart rate monitors and physiological measurement devices.
- Additional exercise physiology assessment protocols.

## 👨‍💻 Author

Developed as part of a sports science and performance technology portfolio.

**Project:** VO₂max & Running Economy Test Logger

**Focus Areas:** Exercise Physiology | Sports Science | Cardiorespiratory Fitness | Performance Testing | Data Visualisation | Web Development

---

*Turning physiological testing data into organised, accessible and actionable performance insights.*
