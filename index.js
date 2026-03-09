// ถ้าล็อกอินค้างไว้อยู่แล้ว ให้เด้งไปหน้า Dashboard ทันที
document.addEventListener('DOMContentLoaded', () => {
    if (currentUserLoggedIn) {
        window.location.href = 'dashboard/dashboard.html';
    }
});

function toggleAuthMode() {
    document.getElementById('form-login').classList.toggle('hidden');
    document.getElementById('form-signup').classList.toggle('hidden');
}

function handleSignup(event) {
    event.preventDefault(); 
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const idcard = document.getElementById('reg-idcard').value.trim();
    const pwd = document.getElementById('reg-password').value;
    const confirmPwd = document.getElementById('reg-confirm-password').value;
    
    if (pwd !== confirmPwd) {
        alert("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง!");
        return;
    }

    const userExists = registeredUsers.some(u => u.username === username);
    if (userExists) {
        alert("ชื่อผู้ใช้งานนี้ (Username) ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่นครับ");
        return;
    }

    const newUser = { username: username, email: email, idcard: idcard, password: pwd };
    registeredUsers.push(newUser);
    localStorage.setItem('smartStockUsers', JSON.stringify(registeredUsers));

    alert("สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้เลยครับ");
    document.getElementById('register-form').reset();
    toggleAuthMode(); 
}

function enterDashboard(event) {
    event.preventDefault(); 
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    const validUser = registeredUsers.find(u => u.username === user && u.password === pass);

    if (validUser) {
        localStorage.setItem('smartStock_currentUser', validUser.username);
        // พอเข้าสู่ระบบสำเร็จ จะสั่งให้ลิงก์ไปที่โฟลเดอร์ dashboard
        window.location.href = 'dashboard/dashboard.html'; 
    } else {
        alert("ชื่อผู้ใช้งาน (Username) หรือ รหัสผ่าน ไม่ถูกต้อง!\n(หากยังไม่มีบัญชี กรุณากดสมัครสมาชิกก่อนครับ)");
    }
}