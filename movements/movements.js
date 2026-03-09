let currentMovPeriod = 'รายเดือน';
let movementsChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    renderMovementsDashboard();
    updateMovementsChart();
});

function renderMovementsDashboard() {
    let totalIn = 0;
    let totalOut = 0;
    const tbody = document.getElementById('movements-table-body');
    tbody.innerHTML = '';

    if (stockMovements.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">ยังไม่มีประวัติความเคลื่อนไหวสต็อก</td></tr>';
    } else {
        stockMovements.forEach(m => {
            if(m.type === 'in') { totalIn += m.qty; } 
            else { totalOut += m.qty; }

            const typeBadge = m.type === 'in' 
                ? '<span style="background-color: #e0f2e9; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">รับเข้า</span>' 
                : '<span style="background-color: #ffeef5; color: #ff4d85; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">จ่ายออก/ลด</span>';
            
            const qtyStyle = m.type === 'in' ? 'color: #2e7d32; font-weight: bold;' : 'color: #e63939; font-weight: bold;';
            const qtyPrefix = m.type === 'in' ? '+' : '-';

            tbody.innerHTML += `
                <tr>
                    <td><div style="font-weight: 500;">${m.date}</div><div style="font-size: 11px; color: #888;">${m.time} น.</div></td>
                    <td><img src="${m.image}" class="product-thumbnail"></td>
                    <td>${m.productId}</td>
                    <td>${m.productName}</td>
                    <td>${m.category}</td>
                    <td>${typeBadge}</td>
                    <td style="${qtyStyle}">${qtyPrefix}${m.qty}</td>
                    <td style="font-weight: 500;">${m.balance}</td>
                    <td style="color: #666; font-size: 13px;">${m.remark || '-'}</td>
                </tr>
            `;
        });
    }
    document.getElementById('mov-total-in').innerText = totalIn.toLocaleString();
    document.getElementById('mov-total-out').innerText = totalOut.toLocaleString();
}

function setMovementsFilter(period, element) {
    currentMovPeriod = period;
    document.getElementById('mov-chart-title').innerText = period;
    
    const buttons = document.querySelectorAll('#movements-time-filters .sales-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    updateMovementsChart();
}

function updateMovementsChart() {
    const canvas = document.getElementById('movementsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (movementsChartInstance) movementsChartInstance.destroy(); 

    const groupedData = {}; 
    const chronologicalMovs = [...stockMovements].reverse(); 

    chronologicalMovs.forEach(mov => {
        let key = mov.date; 
        let parts = mov.date.split(' '); 
        if (currentMovPeriod === 'รายเดือน' && parts.length === 3) {
            key = parts[1] + ' ' + parts[2]; 
        } else if (currentMovPeriod === 'รายปี' && parts.length === 3) {
            key = parts[2]; 
        }

        if (!groupedData[key]) groupedData[key] = { in: 0, out: 0 };
        if(mov.type === 'in') { groupedData[key].in += mov.qty; } 
        else { groupedData[key].out += mov.qty; }
    });

    const labels = Object.keys(groupedData);
    const dataIn = labels.map(label => groupedData[label].in);
    const dataOut = labels.map(label => groupedData[label].out);
    if (labels.length === 0) { labels.push('ไม่มีข้อมูล'); dataIn.push(0); dataOut.push(0); }

    movementsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'รับเข้า', data: dataIn, backgroundColor: '#4ade80', borderRadius: 4, barPercentage: 0.6 },
                { label: 'จ่ายออก', data: dataOut, backgroundColor: '#ff7aa2', borderRadius: 4, barPercentage: 0.6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return context.dataset.label + ': ' + context.raw + ' ชิ้น'; } } } },
            scales: { y: { beginAtZero: true } }
        }
    });
}