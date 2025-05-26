// Firebase config
const dbUrl = "https://iotfinal-73d37-default-rtdb.asia-southeast1.firebasedatabase.app/sensorData.json";

// DOM Elements
const lightEl = document.getElementById("light");
const motionEl = document.getElementById("motion");
const tempEl = document.getElementById("temperature");
const humEl = document.getElementById("humidity");

// Fetch data from Firebase
async function fetchSensorData() {
  try {
    const res = await fetch(dbUrl);
    const data = await res.json();
    if (!data) return;

    // Sort by keys (timestamp) descending
    const entries = Object.entries(data)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 10);

    // Show latest
    const [latestKey, latestData] = entries[0];
    lightEl.textContent = latestData.light;
    motionEl.textContent = latestData.motion;
    tempEl.textContent = latestData.temperature;
    humEl.textContent = latestData.humidity;

    // Chart history
    updateChart(entries.reverse()); // oldest to newest
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}

// Chart.js setup
let chart;
function updateChart(data) {
  const labels = data.map(([key]) => new Date(parseInt(key)).toLocaleTimeString());
  const temps = data.map(([_, val]) => val.temperature);
  const hums = data.map(([_, val]) => val.humidity);

  const ctx = document.getElementById("historyChart").getContext("2d");

  if (chart) chart.destroy(); // reset
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
        },
        {
          label: "Humidity (%)",
          data: hums,
          borderColor: "rgb(54, 162, 235)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Initial + periodic fetch
fetchSensorData();
setInterval(fetchSensorData, 20000); // every 20 sec
