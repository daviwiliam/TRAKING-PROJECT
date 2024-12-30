const eventoForm = document.getElementById('eventoForm');
const nomeInput = document.getElementById('nome');
const acaoInput = document.getElementById('acao');

const API_URL = "http://127.0.0.1:5000/eventos/";

// Manipula o envio do formulário
eventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        nome: nomeInput.value,
        acao: acaoInput.value
    };

    const result = await postToAPI(formData);
    alert(result.status);

    trackFormSubmit(formData);
    fetchData();
});

// Envia os dados para a API
async function postToAPI(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Erro ao enviar dados para a API");
        }

        return await response.json();
    } catch (error) {
        console.error("Erro no envio para a API:", error);
    }
}

// Envia os dados para o Google Tag Manager
function trackFormSubmit(data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'formSubmit',
        ...data
    });
    console.log('Tracking:', window.dataLayer);
}

// Destrói gráficos existentes
function destroyChart(chart) {
    if (chart && chart.destroy) {
        chart.destroy();
    }
}

// Cria gráficos com Chart.js
function createChart(ctx, type, data, options) {
    return new Chart(ctx, { type, data, options });
}

// Busca dados da API e cria os gráficos
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Erro ao acessar a API");
        }

        const { eventos } = await response.json();
        if (!Array.isArray(eventos)) {
            throw new Error("Os dados 'eventos' não são um array");
        }

        const { labels, values } = processData(eventos);
        renderCharts(labels, values);
    } catch (error) {
        console.error("Erro ao processar os dados da API:", error);
    }
}

// Processa os dados para uso nos gráficos
function processData(eventos) {
    const acaoCount = eventos.reduce((acc, { acao }) => {
        acc[acao] = (acc[acao] || 0) + 1;
        return acc;
    }, {});

    return {
        labels: Object.keys(acaoCount),
        values: Object.values(acaoCount)
    };
}

// Renderiza os gráficos
function renderCharts(labels, values) {
    const pieCtx = document.getElementById('myChart').getContext('2d');
    const barCtx = document.getElementById('myChartBar').getContext('2d');

    destroyChart(window.myChart);
    destroyChart(window.myChartBar);

    window.myChart = createChart(pieCtx, 'pie', getPieChartData(labels, values), getPieChartOptions());
    window.myChartBar = createChart(barCtx, 'bar', getBarChartData(labels, values), getBarChartOptions());
}

// Dados e opções para o gráfico de pizza
function getPieChartData(labels, values) {
    return {
        labels,
        datasets: [{
            data: values,
            backgroundColor: ['rgba(0, 123, 255, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)'],
            borderColor: ['rgba(0, 123, 255, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            borderWidth: 1
        }]
    };
}

function getPieChartOptions() {
    return {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true }
        },
        aspectRatio: 1
    };
}

// Dados e opções para o gráfico de barras
function getBarChartData(labels, values) {
    return {
        labels,
        datasets: [{
            label: 'Quantidade de Ações',
            data: values,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    };
}

function getBarChartOptions() {
    return {
        responsive: true,
        scales: {
            x: {
                title: { display: true, text: 'Ações' }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Quantidade' }
            }
        }
    };
}
