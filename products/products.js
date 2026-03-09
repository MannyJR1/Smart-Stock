let currentSearchQuery = ''; 
let currentCategoryFilter = 'ทั้งหมด';
let currentSpecialFilter = null; // เพิ่มตัวแปรเก็บสถานะการกรองพิเศษ

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('header-total-count').innerText = products.length.toLocaleString();
    
    // โค้ดสำหรับเช็คว่ากดมาจากการ์ดหน้า Dashboard หรือไม่
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
        setTimeout(() => {
            const btnId = `pill-${filterParam}`;
            const btn = document.getElementById(btnId);
            if(btn) filterSpecial(filterParam, btn);
        }, 50); // หน่วงเวลาเล็กน้อยให้ DOM โหลดเสร็จ
    } else {
        renderGridProducts();
    }
});

function handleSearch() {
    currentSearchQuery = document.getElementById('search-product').value.toLowerCase().trim();
    renderGridProducts();
}

// การกรองหมวดหมู่แบบปกติ
function filterCategory(category, element) {
    currentSpecialFilter = null; // ล้างค่า Filter พิเศษเมื่อกดปุ่มปกติ
    currentCategoryFilter = category;
    
    const pills = document.querySelectorAll('#category-filters .pill');
    pills.forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    
    renderGridProducts();
}

// การกรองแบบพิเศษ (ใกล้หมด, หมดอายุ)
function filterSpecial(type, element) {
    currentCategoryFilter = null; // ล้างค่า Filter หมวดหมู่ปกติ
    currentSpecialFilter = type;
    
    const pills = document.querySelectorAll('#category-filters .pill');
    pills.forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    
    renderGridProducts();
}

function renderGridProducts() {
    const container = document.getElementById('product-grid-container');
    container.innerHTML = '';
    
    // 1. กรองด้วยช่องค้นหาก่อน
    let filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearchQuery) || p.id.toLowerCase().includes(currentSearchQuery));
    
    // 2. เช็คว่าเป็นการใช้งาน Filter พิเศษหรือไม่ (ใกล้หมด, หมดอายุ)
    if (currentSpecialFilter) {
        const today = new Date();
        const todayDateOnly = new Date(today).setHours(0,0,0,0);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const thirtyDaysTime = thirtyDaysFromNow.setHours(0,0,0,0);

        if (currentSpecialFilter === 'low-stock') {
            // กรองเฉพาะที่มีสต็อก 1-5 ชิ้น
            filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock <= 5);
        } else if (currentSpecialFilter === 'expiring') {
            // กรองเฉพาะที่ใกล้วันหมดอายุ (ภายใน 30 วัน)
            filteredProducts = filteredProducts.filter(p => {
                if (!p.exp) return false;
                const expDate = new Date(p.exp).setHours(0,0,0,0);
                return expDate >= todayDateOnly && expDate <= thirtyDaysTime;
            });
        } else if (currentSpecialFilter === 'expired') {
            // กรองเฉพาะที่หมดอายุไปแล้ว
            filteredProducts = filteredProducts.filter(p => {
                if (!p.exp) return false;
                const expDate = new Date(p.exp).setHours(0,0,0,0);
                return expDate < todayDateOnly;
            });
        }
    } 
    // 3. ถ้าไม่ได้ใช้ Filter พิเศษ ค่อยมากรองตามหมวดหมู่ปกติ
    else if (currentCategoryFilter && currentCategoryFilter !== 'ทั้งหมด') { 
        filteredProducts = filteredProducts.filter(p => p.category === currentCategoryFilter); 
    }
    
    // กรณีไม่มีสินค้าแสดงผล
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div style="color: #888; grid-column: 1 / -1; text-align: center; padding: 40px;">ไม่มีสินค้าที่ค้นหา หรือตรงตามเงื่อนไข</div>'; 
        return;
    }
    
    // วาดการ์ดสินค้า
    filteredProducts.forEach(p => {
        container.innerHTML += `
            <div class="product-card-grid" onclick="openProductDetailModal('${p.id}')">
                <div class="img-container"><img src="${p.image}" alt="${p.name}"></div>
                <div class="qty-badge">${p.stock} ชิ้น</div>
                <div class="card-footer">
                    <div class="title">${p.name}</div>
                    <div class="brand">[${p.category}]</div>
                </div>
            </div>`;
    });
}

function openProductDetailModal(sku) {
    const product = products.find(p => p.id === sku);
    if (!product) return;

    document.getElementById('detail-display-img').src = product.image;
    document.getElementById('detail-display-cat').innerText = product.category;
    document.getElementById('detail-display-name').innerText = product.name;
    document.getElementById('detail-display-sku').innerText = "รหัสสินค้า: " + product.id;
    document.getElementById('detail-display-price').innerText = "฿" + parseFloat(product.price).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    document.getElementById('detail-display-stock').innerText = product.stock + " ชิ้น";
    
    if(product.exp) {
        const expDate = new Date(product.exp);
        document.getElementById('detail-display-exp').innerText = expDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    } else {
        document.getElementById('detail-display-exp').innerText = "ไม่มีระบุ";
    }
    document.getElementById('productDetailModal').classList.remove('hidden');
}

function closeProductDetailModal() { document.getElementById('productDetailModal').classList.add('hidden'); }
function closeModalOnOutsideClick(event, modalId) { if (event.target.id === modalId) { document.getElementById(modalId).classList.add('hidden'); } }
