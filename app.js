// Firebase URL
const dbUrl = "https://iotfinal-73d37-default-rtdb.asia-southeast1.firebasedatabase.app/sensorData.json";

// DOM Elements
const lightEl = document.getElementById("light");
const motionEl = document.getElementById("motion");
const tempEl = document.getElementById("temperature");
const humEl = document.getElementById("humidity");

const lightTable = document.getElementById("lightTable");
const motionTable = document.getElementById("motionTable");
const tempHumTable = document.getElementById("tempHumTable");

let chart;

// Format timestamp
function formatTime(ms) {
  return new Date(parseInt(ms)).toLocaleString();
}

// Fetch and display sensor data
async function fetchSensorData() {
  try {
    const res = await fetch(dbUrl);
    const data = await res.json();
    if (!data) return;

    // Sort latest first
    const entries = Object.entries(data).sort((a, b) => b[0] - a[0]);

    // Latest reading (first one)
    const [latestKey, latestData] = entries[0];
    lightEl.textContent = latestData.light;
    motionEl.textContent = latestData.motion;
    tempEl.textContent = latestData.temperature + " °C";
    humEl.textContent = latestData.humidity + " %";

    // Update Chart (last 10 oldest to newest)
    updateChart(entries.slice(0, 10).reverse());

    // Update Tables (all)
    populateTables(entries);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}

// Update Chart.js
function updateChart(data) {
  const labels = data.map(([key]) => new Date(parseInt(key)).toLocaleTimeString());
  const temps = data.map(([_, val]) => val.temperature);
  const hums = data.map(([_, val]) => val.humidity);

  const ctx = document.getElementById("historyChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "rgb(255, 99, 132)",
          fill: false,
          tension: 0.4
        },
        {
          label: "Humidity (%)",
          data: hums,
          borderColor: "rgb(54, 162, 235)",
          fill: false,
          tension: 0.4
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ccc" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" }
        }
      }
    }
  });
}

// Populate sensor tables
function populateTables(entries) {
  // Clear old data
  lightTable.innerHTML = "";
  motionTable.innerHTML = "";
  tempHumTable.innerHTML = "";

  entries.forEach(([key, val]) => {
    const time = formatTime(key);

    // Light Table
    lightTable.innerHTML += `
      <tr>
        <td>${time}</td>
        <td>${val.light}</td>
        <td>${val.lightIntensity ?? "N/A"}</td>
      </tr>
    `;

    // Motion Table
    motionTable.innerHTML += `
      <tr>
        <td>${time}</td>
        <td>${val.motion}</td>
      </tr>
    `;

    // Temp + Humidity Table
    tempHumTable.innerHTML += `
      <tr>
        <td>${time}</td>
        <td>${val.temperature} °C</td>
        <td>${val.humidity} %</td>
      </tr>
    `;
  });
}

// Initial + periodic fetch
fetchSensorData();
setInterval(fetchSensorData, 20000); // every 20 seconds
