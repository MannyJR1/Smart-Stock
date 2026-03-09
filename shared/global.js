// --- 1. ระบบดึงข้อมูล (เปลี่ยน Products, Sales, Movements เป็น sessionStorage) ---
let products = JSON.parse(sessionStorage.getItem('smartStockUsers_products')) || [];
let recentSales = JSON.parse(sessionStorage.getItem('smartStockUsers_sales')) || []; 
let stockMovements = JSON.parse(sessionStorage.getItem('smartStockUsers_movements')) || [];

// --- ส่วนบัญชีผู้ใช้งาน ใช้ localStorage เหมือนเดิม (ข้อมูลจะได้ไม่หาย) ---
let registeredUsers = JSON.parse(localStorage.getItem('smartStockUsers')) || [];

// --- สถานะล็อกอิน ใช้ sessionStorage (ปิดแท็บ = ต้องล็อกอินใหม่) ---
let currentUserLoggedIn = sessionStorage.getItem('smartStock_currentUser') || '';

// --- 2. ฟังก์ชันอัปเดตข้อมูลลงเบราว์เซอร์ (บันทึกลง sessionStorage) ---
function saveGlobalData() {
    sessionStorage.setItem('smartStockUsers_products', JSON.stringify(products));
    sessionStorage.setItem('smartStockUsers_sales', JSON.stringify(recentSales));
    sessionStorage.setItem('smartStockUsers_movements', JSON.stringify(stockMovements));
}

// --- 3. ตรวจสอบสิทธิ์การเข้าใช้งาน ---
function checkAuth() {
    if (!currentUserLoggedIn && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = '../index.html'; 
    }
}

// --- 4. ฟังก์ชันออกจากระบบ ---
function logout() {
    sessionStorage.removeItem('smartStock_currentUser');
    window.location.href = '../index.html'; 
}