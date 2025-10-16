const graphButtons = document.querySelectorAll('div#graph-btns > button');
const canvas = document.getElementById('myChart');
const chartContainer = canvas.parentElement;
const ctx = canvas.getContext('2d');
let myChart = null;

const noDataMessage = document.createElement('div');
noDataMessage.className = 'text-center py-8 text-gray-500 text-lg';
noDataMessage.textContent = 'No chart data available';
noDataMessage.style.display = 'none'; // Hide by default
chartContainer.appendChild(noDataMessage);

async function getSalesData(date) {
  return fetch(
    `${window.location.origin}/market/sales_data/${cardId}/date/${date}/`
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

async function generateGraph(date) {
  getSalesData(date).then((data) => {
    if (!data || !data.data || !data.data.sales || data.data.sales.length === 0) {
      // No data available
      if (myChart) {
        myChart.destroy();
        myChart = null;
      }
      canvas.style.display = 'none';
      noDataMessage.style.display = 'block';
      return;
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradient.addColorStop(0, 'rgba(0, 255, 94, 0.4)');
    gradient.addColorStop(1, 'rgba(22, 163, 74, 0)');
    const xValues = [];
    const yValues = [];
    data.data.sales.forEach((item) => {
      yValues.push(parseFloat(item.avg_price).toFixed(2));
      xValues.push(
        new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      );
    });

    if (myChart) {
      myChart.data.labels = xValues;
      myChart.data.datasets[0].data = yValues;
      return myChart.update();
    }

    myChart = new Chart(ctx, {
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
                return '$ ' + val;
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

graphButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    graphButtons.forEach((button) => button.classList.remove('bg-[#EAECEF]'));
    btn.classList.add('bg-[#EAECEF]');
    generateGraph(btn.value);
  });
});

generateGraph('1m');
