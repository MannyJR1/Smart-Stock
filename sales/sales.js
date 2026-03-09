let currentSalesPeriod = 'รายวัน'; 
let salesChartInstance = null; 

document.addEventListener('DOMContentLoaded', () => {
    renderSalesDashboard();
    updateSalesChart();
});

function renderSalesDashboard() {
    let totalRevenue = 0, totalItems = 0, totalTransactions = recentSales.length;
    const tbody = document.getElementById('sales-table-body');
    tbody.innerHTML = '';
    
    if (recentSales.length === 0) { 
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">ยังไม่มีประวัติการขาย</td></tr>'; 
    } else {
        recentSales.forEach(sale => {
            const price = parseFloat(sale.price) || 0;
            const qty = parseInt(sale.qtySold) || 0;
            const rowTotal = price * qty;
            totalRevenue += rowTotal; 
            totalItems += qty;
            
            tbody.innerHTML += `
                <tr>
                    <td>${sale.date} <span style="font-size:11px; color:#888;">${sale.time}</span></td>
                    <td>${sale.name}</td><td>${sale.id}</td>
                    <td>฿${price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                    <td>${qty}</td>
                    <td style="color: #0da15c; font-weight: bold;">฿${rowTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                </tr>`;
        });
    }
    document.getElementById('sales-total-revenue').innerText = '฿' + totalRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2});
    document.getElementById('sales-total-items').innerText = totalItems.toLocaleString();
    document.getElementById('sales-total-transactions').innerText = totalTransactions.toLocaleString();
}

function setSalesFilter(period, element) {
    currentSalesPeriod = period;
    document.getElementById('chart-title-text').innerText = period;
    
    const buttons = document.querySelectorAll('#sales-time-filters .sales-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    updateSalesChart();
}

function updateSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (salesChartInstance) salesChartInstance.destroy(); 

    const groupedData = {};
    const chronologicalSales = [...recentSales].reverse();

    chronologicalSales.forEach(sale => {
        let key = sale.date; 
        let parts = sale.date.split(' '); 
        if (currentSalesPeriod === 'รายเดือน' && parts.length === 3) {
            key = parts[1] + ' ' + parts[2]; 
        } else if (currentSalesPeriod === 'รายปี' && parts.length === 3) {
            key = parts[2]; 
        }
        if (!groupedData[key]) groupedData[key] = 0;
        groupedData[key] += (parseFloat(sale.price) * parseInt(sale.qtySold));
    });

    const labels = Object.keys(groupedData);
    const dataPoints = Object.values(groupedData);
    if (labels.length === 0) { labels.push('ไม่มีข้อมูล'); dataPoints.push(0); }

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ยอดขายรวม (บาท)', data: dataPoints, backgroundColor: '#ffb3c6', borderColor: '#ff4d85',
                borderWidth: 1, borderRadius: 6, barPercentage: 0.5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return 'ยอดขาย: ฿' + context.raw.toLocaleString('th-TH', {minimumFractionDigits: 2}); } } } },
            scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return '฿' + value.toLocaleString(); } } } }
        }
    });
}