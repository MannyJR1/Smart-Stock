// เมื่อหน้าเว็บโหลดเสร็จ ให้ทำงานฟังก์ชันเหล่านี้
document.addEventListener('DOMContentLoaded', () => {
    renderDashboardStats();
    renderRecentSalesTable();
});

// ฟังก์ชันพับเก็บเมนูด้านซ้าย
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('main-wrapper');
    const btnToggle = document.querySelector('.sidebar-toggle');
    sidebar.classList.toggle('closed');
    mainWrapper.classList.toggle('expanded');
    btnToggle.innerHTML = sidebar.classList.contains('closed') ? '&gt;' : '&lt;';
}

// คำนวณข้อมูลสถิติ
function renderDashboardStats() {
    let totalStock = 0;
    let lowStockCount = 0, expiringCount = 0, expiredCount = 0;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // ดึงตัวแปร products มาจากไฟล์ global.js
    products.forEach(p => {
        totalStock += parseInt(p.stock) || 0;
        if (p.stock > 0 && p.stock <= 5) lowStockCount++;
        
        if (p.exp) {
            const productExpDate = new Date(p.exp);
            productExpDate.setHours(0,0,0,0);
            const todayDateOnly = new Date(today).setHours(0,0,0,0);
            if (productExpDate < todayDateOnly) { expiredCount++; } 
            else if (productExpDate <= thirtyDaysFromNow) { expiringCount++; }
        }
    });

    document.getElementById('dash-total-sku').innerText = products.length.toLocaleString();
    document.getElementById('dash-total-stock').innerText = totalStock.toLocaleString() + ' ชิ้น';
    document.getElementById('dash-low-stock').innerText = lowStockCount.toLocaleString();
    document.getElementById('dash-expiring').innerText = expiringCount.toLocaleString();
    document.getElementById('dash-expired').innerText = expiredCount.toLocaleString();
}

// แสดงรายการตารางจำหน่ายล่าสุด 5 รายการ
function renderRecentSalesTable() {
    const tbody = document.getElementById('dash-table-body');
    tbody.innerHTML = '';
    
    // ดึงตัวแปร recentSales มาจากไฟล์ global.js
    if (recentSales.length === 0) { 
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">ยังไม่มีรายการจำหน่ายล่าสุด</td></tr>'; 
        return; 
    }
    
    recentSales.slice(0, 5).forEach(sale => {
        const statusBadge = sale.stock > 0 ? '<span class="status in-stock">มีสินค้า</span>' : '<span class="status out-stock">สินค้าหมด</span>';
        tbody.innerHTML += `
            <tr>
                <td>${sale.date} <span style="font-size:11px; color:#888;">${sale.time}</span></td>
                <td>${sale.name}</td><td>${sale.id}</td><td>${sale.category}</td>
                <td>฿${parseFloat(sale.price).toLocaleString('th-TH')}</td>
                <td style="color: #e63939; font-weight: bold;">-${sale.qtySold}</td>
                <td>${sale.stock}</td><td>${statusBadge}</td>
            </tr>`;
    });
}

// ระบบ Dropdown ค้นหาสินค้า
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('dash-dropdown');
    dropdown.innerHTML = ''; 
    
    if (query.length > 0) {
        const matches = products.filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query));
        if (matches.length > 0) {
            matches.forEach(m => {
                dropdown.innerHTML += `
                    <div class="search-item" onclick="window.location.href='../products/products.html?search=${m.id}'">
                        <img src="${m.image}" alt="">
                        <div class="search-item-text">
                            <span class="title">${m.name}</span>
                            <span class="sku">รหัสสินค้า: ${m.id}</span>
                        </div>
                    </div>
                `;
            });
            dropdown.classList.remove('hidden');
        } else {
            dropdown.innerHTML = '<div style="padding:15px; color:#888; font-size:13px; text-align:center;">ไม่พบสินค้า</div>';
            dropdown.classList.remove('hidden');
        }
    } else {
        dropdown.classList.add('hidden');
    }
}

// ปิด Dropdown เมื่อคลิกที่อื่น
document.addEventListener('click', function(event) {
    if (!event.target.classList.contains('search-bar')) {
        const dropdown = document.getElementById('dash-dropdown');
        if(dropdown) dropdown.classList.add('hidden');
    }
});