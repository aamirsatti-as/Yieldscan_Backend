const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');

const gainInRev = document.querySelector('p#gain-in-rev');
const lossInRev = document.querySelector('p#loss-in-rev');

function calculateGainLoss(percentageChange) {
  if (percentageChange > 0) {
    return { gain: percentageChange, loss: 0 };
  } else if (percentageChange < 0) {
    return { gain: 0, loss: Math.abs(percentageChange) }; // Use Math.abs to get the positive loss value
  } else {
    return { gain: 0, loss: 0 }; // No gain or loss if the change is 0
  }
}

async function getPortfolioData() {
  return fetch(`${window.location.origin}/auth/portfolio/get_data/`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function createGainChart(percentageChange, chartId) {
  const gain = Math.max(0, percentageChange);
  const ctx = document.getElementById(chartId).getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: gain > 0 ? ['Gain'] : [],
      datasets: [
        {
          label: 'Gain',
          data: gain > 0 ? [gain] : [100], // Show full 100% when gain is 0
          backgroundColor: gain > 0 ? ['#16A34A'] : ['lightgray'], // Green or light gray
          borderWidth: 6,
          borderRadius: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      events: [],
    },
  });
}

function createLossChart(percentageChange, chartId) {
  const loss = Math.abs(Math.min(0, percentageChange));
  const ctx = document.getElementById(chartId).getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: loss > 0 ? ['Loss'] : [],
      datasets: [
        {
          label: 'Loss',
          data: loss > 0 ? [loss] : [100], // Show full 100% when loss is 0
          backgroundColor: loss > 0 ? ['#E2464A'] : ['lightgray'], // Red or light gray
          borderWidth: 6,
          borderRadius: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      events: [],
    },
  });
}

async function generateGraph() {
  getPortfolioData().then((data) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradient.addColorStop(0, 'rgba(0, 255, 94, 0.4)');
    gradient.addColorStop(1, 'rgba(22, 163, 74, 0)');
    const xValues = [];
    const yValues = [];
    data.data.forEach((item) => {
      yValues.push(parseFloat(item.average_gain_or_loss_percentage).toFixed(2));
      xValues.push(
        new Date(item.purchase_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      );
    });

    const { gain, loss } = calculateGainLoss(
      data.overall_gain_or_loss_percentage
    );
    gainInRev.innerText = Math.round(gain) + '%';
    lossInRev.innerText = Math.round(loss) + '%';

    createGainChart(data.overall_gain_or_loss_percentage, 'gain-chart');
    createLossChart(data.overall_gain_or_loss_percentage, 'loss-chart');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: xValues,
        datasets: [
          {
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            data: yValues,
            borderWidth: 4,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        elements: {
          point: {
            radius: 1,
            hitRadius: 8,
          },
        },
        scales: {
          x: {
            border: {
              display: false,
            },
            ticks: {
              font: {
                size: 16,
              },
              padding: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              callback: (val) => {
                return `${val}%`;
              },
              font: {
                size: 16,
              },
              padding: 8,
            },
          },
        },
      },
    });
  });
}

generateGraph();
