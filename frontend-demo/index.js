// index.js

let websiteUrlInput = document.getElementById('websiteUrl');
let websiteUrl = websiteUrlInput.value;
const statusElement = document.getElementById('status');
const chartCanvas = document.getElementById('uptimeChart');
const ctx = chartCanvas.getContext('2d');
let intervalId;
let uptimeData = JSON.parse(localStorage.getItem('uptimeData')) || [];
let chart;
let startTimeInput = document.getElementById('startTime');
let startTime;


updateChart();

function toggleMonitoring() {
    const button = document.getElementById('toggleButton');

    if (button.textContent === 'Start Monitoring') {
        startMonitoring();
        button.textContent = 'Stop Monitoring';
    } else {
        stopMonitoring();
        button.textContent = 'Start Monitoring';
    }
}

function startMonitoring() {
    websiteUrl = websiteUrlInput.value;
    if (!websiteUrl) {
        alert('Please enter a valid website URL');
        return;
    }

    const startTimeString = startTimeInput.value;
    
    if (!startTimeString) {
        alert('Please enter a valid start time');
        return;
    }

    clearInterval(intervalId);

    startTime = new Date(startTimeString);

    intervalId = setInterval(checkWebsiteStatus, getInterval());
    setStatus(`Monitoring started for ${websiteUrl} from ${startTime.toLocaleString()}`);
    document.getElementById('toggleButton').disabled = false;
}

function stopMonitoring() {
    clearInterval(intervalId);
    setStatus('Monitoring stopped');

    document.getElementById('toggleButton').disabled = false;
}

function checkWebsiteStatus() {
    const startTime = new Date().getTime();
    const timestamp = new Date();

    fetch(websiteUrl)
        .then(response => {
            const endTime = new Date().getTime();
            const responseTime = endTime - startTime;

            if (response.ok) {
                setStatus(`Website is UP - Response Time: ${responseTime}ms`);
                saveData(timestamp, responseTime);
            } else {
                setStatus('Website is DOWN');
                saveData(timestamp, null);
            }
        })
        .catch(error => {
            const endTime = new Date().getTime();
            const responseTime = endTime - startTime;

            setStatus('Error checking website status');
            saveData(timestamp, responseTime);
            console.error('Error:', error);
        });

    updateChart();
}

function updateChart() {
    if (chart) {
        chart.destroy();
    }

    const startTimeFilter = startTime ? startTime.getTime() : new Date().getTime();
    
    const filteredData = uptimeData.filter(data => {
        const timestamp = new Date(data.timestamp);
        return timestamp instanceof Date && !isNaN(timestamp) && timestamp.getTime() >= startTimeFilter;
    });

    const timestamps = filteredData.map(data => new Date(data.timestamp));
    const responseTimes = filteredData.map(data => data.responseTime);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Response Time (ms)',
                borderColor: 'rgb(75, 192, 192)',
                data: responseTimes,
                fill: false,
            }],
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'h:mm:ss a'
                        }
                    },
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: 'Response Time (ms)'
                    }
                }
            }
        }
    });
}


function setStatus(message) {
    statusElement.textContent = message;
}

function saveData(timestamp, responseTime) {
    uptimeData.push({ timestamp, responseTime });
    localStorage.setItem('uptimeData', JSON.stringify(uptimeData));
}

function getDuration() {
    return parseInt(document.getElementById('duration').value, 10) * 60 * 1000 || 0;
}

function getInterval() {
    return parseInt(document.getElementById('interval').value, 10);
}
