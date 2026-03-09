let currentSearchQuery = ''; 
let currentCategoryFilter = 'ทั้งหมด';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('header-total-count').innerText = products.length.toLocaleString();
    renderGridProducts();
});

function handleSearch() {
    currentSearchQuery = document.getElementById('search-product').value.toLowerCase().trim();
    renderGridProducts();
}

function filterCategory(category, element) {
    currentCategoryFilter = category;
    const pills = document.querySelectorAll('#category-filters .pill');
    pills.forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    renderGridProducts();
}

function renderGridProducts() {
    const container = document.getElementById('product-grid-container');
    container.innerHTML = '';
    
    let filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearchQuery) || p.id.toLowerCase().includes(currentSearchQuery));
    if (currentCategoryFilter !== 'ทั้งหมด') { 
        filteredProducts = filteredProducts.filter(p => p.category === currentCategoryFilter); 
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div style="color: #888; grid-column: 1 / -1; text-align: center; padding: 40px;">ไม่มีสินค้าที่ค้นหา หรือในหมวดหมู่นี้ให้แสดงผล</div>'; 
        return;
    }
    
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