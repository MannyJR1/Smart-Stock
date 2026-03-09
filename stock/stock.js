// --- State Management ---
let uploadedImageBase64 = '';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    renderTableStock();
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

// --- ระบบค้นหาและ Dropdown ขายด่วน (เหมือนต้นฉบับเป๊ะ) ---
function handleSearchStock(event) {
    const query = event.target.value.toLowerCase().trim();
    currentSearchQuery = query;

    const dropdown = document.getElementById('stock-dropdown');
    dropdown.innerHTML = ''; 

    if (query.length > 0) {
        const matches = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.id.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            matches.forEach(m => {
                dropdown.innerHTML += `
                    <div class="search-item" onclick="quickSellFromSearch('${m.id}')">
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

    renderTableStock();
}

function quickSellFromSearch(sku) {
    closeAllDropdowns();
    currentSearchQuery = ''; 
    document.querySelectorAll('.search-bar').forEach(bar => bar.value = '');
    renderTableStock(); 
    openRecordSaleModal(sku); // เปิด Popup บันทึกการขายทันที
}

function closeAllDropdowns() {
    document.querySelectorAll('.search-dropdown').forEach(dd => dd.classList.add('hidden'));
}

document.addEventListener('click', function(event) {
    if (!event.target.classList.contains('search-bar')) {
        closeAllDropdowns();
    }
});

// --- ฟังก์ชัน Render ตารางหน้าสต็อก ---
function renderTableStock() {
    const tbody = document.getElementById('editable-table-body');
    tbody.innerHTML = '';
    
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearchQuery) || p.id.toLowerCase().includes(currentSearchQuery));
    
    if (filteredProducts.length === 0) { 
        tbody.innerHTML = '<tr class="empty-row"><td colspan="10">ไม่มีสินค้าที่ค้นหา / ยังไม่มีสินค้าในระบบ</td></tr>'; 
        return; 
    }
    
    filteredProducts.forEach(p => {
        const statusBadge = p.stock > 0 ? '<span class="status in-stock">มีสินค้า</span>' : '<span class="status out-stock">สินค้าหมด</span>';
        tbody.innerHTML += `
            <tr>
                <td>${p.date}<br><span style="color: #888; font-size: 12px;">${p.time} น.</span></td>
                <td><img src="${p.image}" class="product-thumbnail" alt="Product"></td>
                <td>${p.name}</td><td>${p.id}</td><td>${p.category}</td>
                <td>${p.price}</td><td>${p.stock}</td><td>${statusBadge}</td><td>${p.user}</td>
                <td style="display: flex; gap: 5px; justify-content: center;">
                    <button class="btn-save btn-small" style="padding: 6px 12px; border: none; cursor: pointer;" onclick="openRecordSaleModal('${p.id}')">ขาย</button>
                    <button class="btn-danger btn-small" style="padding: 6px 12px; border: none; cursor: pointer;" onclick="openSellModal('${p.id}')">ลดสต็อก</button>
                </td>
            </tr>`;
    });
}

function closeModalOnOutsideClick(event, modalId) {
    if (event.target.id === modalId) { document.getElementById(modalId).classList.add('hidden'); }
}

// --- 1. เพิ่มสินค้าใหม่ (กู้คืนการเคลียร์ฟอร์มแบบต้นฉบับ 100%) ---
function previewImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('modal-prod-image-preview').src = e.target.result;
            document.getElementById('modal-prod-image-preview').style.display = 'block';
            document.getElementById('modal-prod-image-placeholder').style.display = 'none';
            uploadedImageBase64 = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openAddProductModal() {
    document.getElementById('addProductModal').classList.remove('hidden');
    const randomID = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    document.getElementById('modal-prod-sku').value = `PRO-${randomID}`;
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.add('hidden');
    document.getElementById('modal-prod-name').value = '';
    document.getElementById('modal-prod-cat').selectedIndex = 0;
    document.getElementById('modal-prod-price').value = '';
    document.getElementById('modal-prod-stock').value = '';
    document.getElementById('modal-prod-exp').value = '';
    document.getElementById('modal-prod-image-input').value = '';
    document.getElementById('modal-prod-image-preview').src = '';
    document.getElementById('modal-prod-image-preview').style.display = 'none';
    document.getElementById('modal-prod-image-placeholder').style.display = 'block';
    uploadedImageBase64 = '';
}

function saveNewProduct() {
    const name = document.getElementById('modal-prod-name').value || 'สินค้าใหม่';
    const sku = document.getElementById('modal-prod-sku').value; 
    const cat = document.getElementById('modal-prod-cat').value;
    const price = document.getElementById('modal-prod-price').value || '0';
    const stock = parseInt(document.getElementById('modal-prod-stock').value || '0');
    const expDate = document.getElementById('modal-prod-exp').value; 
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' });
    const imageSrc = uploadedImageBase64 ? uploadedImageBase64 : 'https://via.placeholder.com/300?text=No+Image';

    const newProduct = {
        id: sku, name: name, category: cat !== 'เลือกหมวดหมู่' ? cat : 'ของใช้ทั่วไป', 
        price: price, stock: stock, exp: expDate, image: imageSrc,
        date: dateStr, time: timeStr, user: currentUserLoggedIn
    };

    products.unshift(newProduct);

    if(stock > 0) {
        stockMovements.unshift({
            date: dateStr, time: timeStr, productName: name,
            productId: sku, category: newProduct.category, image: imageSrc,
            user: currentUserLoggedIn, type: 'in', qty: stock, balance: stock,
            remark: 'นำเข้าสินค้าใหม่'
        });
    }
    
    saveGlobalData(); // สั่งเซฟข้อมูล
    closeAddProductModal();
    renderTableStock();
    
    // แบบต้นฉบับ: บันทึกเสร็จ ให้สลับหน้าไปที่สินค้าทั้งหมดทันที
    window.location.href = '../products/products.html'; 
}

// --- 2. เพิ่มสต็อกเข้า (Original Logic) ---
function openAddStockModal() {
    const selectDropdown = document.getElementById('stock-add-sku');
    selectDropdown.innerHTML = '<option value="">-- กรุณาเลือกสินค้า --</option>';
    
    if (products.length === 0) { 
        alert("ยังไม่มีสินค้าในระบบเลยครับ กรุณาเพิ่มสินค้าใหม่ก่อน"); 
        return; 
    }
    
    products.forEach(p => { 
        selectDropdown.innerHTML += `<option value="${p.id}">[${p.id}] ${p.name} (คงเหลือ: ${p.stock})</option>`; 
    });
    
    document.getElementById('stock-add-qty').value = '';
    document.getElementById('addStockModal').classList.remove('hidden');
}

function closeAddStockModal() { 
    document.getElementById('addStockModal').classList.add('hidden'); 
}

function saveAddedStock() {
    const sku = document.getElementById('stock-add-sku').value;
    const qty = parseInt(document.getElementById('stock-add-qty').value);

    if (!sku) { alert("กรุณาเลือกสินค้าที่ต้องการเพิ่มสต็อกครับ"); return; }
    if (!qty || qty <= 0) { alert("กรุณาระบุจำนวนที่ต้องการเพิ่มให้ถูกต้องครับ (ต้องมากกว่า 0)"); return; }

    const productIndex = products.findIndex(p => p.id === sku);
    
    if (productIndex !== -1) {
        products[productIndex].stock += qty;
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: '2-digit' });
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' });

        products[productIndex].date = dateStr;
        products[productIndex].time = timeStr;

        stockMovements.unshift({
            date: dateStr, time: timeStr, productName: products[productIndex].name,
            productId: sku, category: products[productIndex].category, image: products[productIndex].image,
            user: currentUserLoggedIn, type: 'in', qty: qty, balance: products[productIndex].stock,
            remark: 'เพิ่มสต็อก'
        });

        saveGlobalData();
        closeAddStockModal();
        renderTableStock();
        alert(`เพิ่มสต็อกสำเร็จ! (+${qty} ชิ้น ให้กับรหัส ${sku})`);
    }
}

// --- 3. ตัดสต็อก / ไม่คิดเป็นยอดขาย (Original Logic) ---
function openSellModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('sell-modal-desc').innerText = `ลดสต็อกสินค้า: ${product.name}\n(คงเหลือปัจจุบัน: ${product.stock} ชิ้น)`;
    document.getElementById('sell-sku').value = product.id;
    document.getElementById('sell-qty').value = '';
    document.getElementById('sell-remark').value = ''; 
    document.getElementById('sellStockModal').classList.remove('hidden');
}

function closeSellStockModal() { 
    document.getElementById('sellStockModal').classList.add('hidden'); 
}

function confirmSellStock() {
    const id = document.getElementById('sell-sku').value;
    const qty = parseInt(document.getElementById('sell-qty').value);
    const remark = document.getElementById('sell-remark').value || '-'; 

    if (isNaN(qty) || qty <= 0) { alert("กรุณาระบุจำนวนเป็นตัวเลขที่มากกว่า 0"); return; }

    const product = products.find(p => p.id === id);
    if (!product) return;

    let actualQty = qty;
    if (actualQty > product.stock) { actualQty = product.stock; }

    product.stock -= actualQty;

    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' });
    
    product.date = dateStr;
    product.time = timeStr;

    stockMovements.unshift({
        date: dateStr, time: timeStr, productName: product.name,
        productId: product.id, category: product.category, image: product.image,
        user: currentUserLoggedIn, type: 'out', qty: actualQty, balance: product.stock,
        remark: remark 
    });

    saveGlobalData();
    closeSellStockModal();
    renderTableStock();
    alert(`ลดสต็อกสำเร็จ! (-${actualQty} ชิ้น)`);
}

// --- 4. บันทึกการขาย / เพิ่มยอดขาย + ตัดสต็อก (Original Logic) ---
function openRecordSaleModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (product.stock <= 0) {
        alert("สินค้านี้สต็อกหมดแล้ว ไม่สามารถจำหน่ายได้ครับ");
        return;
    }

    document.getElementById('record-sale-desc').innerText = `จำหน่ายสินค้า: ${product.name}\n(ราคา: ฿${product.price} | คงเหลือ: ${product.stock} ชิ้น)`;
    document.getElementById('record-sale-sku').value = product.id;
    document.getElementById('record-sale-qty').value = '';
    document.getElementById('recordSaleModal').classList.remove('hidden');
}

function closeRecordSaleModal() { 
    document.getElementById('recordSaleModal').classList.add('hidden'); 
}

function confirmRecordSale() {
    const id = document.getElementById('record-sale-sku').value;
    const qty = parseInt(document.getElementById('record-sale-qty').value);

    if (isNaN(qty) || qty <= 0) { alert("กรุณาระบุจำนวนเป็นตัวเลขที่มากกว่า 0"); return; }

    const product = products.find(p => p.id === id);
    if (!product) return;

    let actualQty = qty;
    if (actualQty > product.stock) { actualQty = product.stock; }

    product.stock -= actualQty;

    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' });
    
    product.date = dateStr;
    product.time = timeStr;

    recentSales.unshift({
        date: dateStr, time: timeStr, name: product.name, id: product.id,
        category: product.category, price: product.price, qtySold: actualQty, stock: product.stock
    });

    stockMovements.unshift({
        date: dateStr, time: timeStr, productName: product.name,
        productId: product.id, category: product.category, image: product.image,
        user: currentUserLoggedIn, type: 'out', qty: actualQty, balance: product.stock,
        remark: 'จำหน่ายสินค้า' 
    });

    saveGlobalData();
    closeRecordSaleModal();
    renderTableStock();
    alert(`บันทึกยอดขายสำเร็จ! (${actualQty} ชิ้น)`);
}