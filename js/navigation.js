// ===============================
// NAVIGATION.JS (STABLE VERSION)
// ===============================

// Lifecycle hooks (aman)
const PageLifecycle = {
    onEnter: {},
    onLeave: {}
};

// optional global cleanup handler
let pageCleanup = null;

// ===============================
// NAVIGATE PAGE
// ===============================
// function navigateTo(pageId) {

//     // 1. RUN CLEANUP PAGE SEBELUMNYA
//     if (typeof pageCleanup === "function") {
//         try {
//             pageCleanup();
//         } catch (e) {
//             console.warn("Cleanup error:", e);
//         }
//         pageCleanup = null;
//     }

//     // 2. HIDE ALL PAGES
//     const pages = document.querySelectorAll("section[id^='page-']");
//     pages.forEach(p => p.classList.add("hidden-page"));

//     // 3. SHOW TARGET PAGE
//     const target = document.getElementById(pageId);
//     if (target) target.classList.remove("hidden-page");

//     // 4. TOGGLE LAYOUT
//     const layout = document.getElementById("layout-main");
//     if (layout) {
//         layout.classList.toggle("hidden-page", pageId === "page-login");
//     }

//     // 5. PAGE LOADER
//     runPageLoader(pageId);
//     setActiveNav(pageId); // 👈 panggil di sini
// }

function navigateTo(pageId) {

    // 1. RUN CLEANUP PAGE SEBELUMNYA
    if (typeof pageCleanup === "function") {
        try {
            pageCleanup();
        } catch (e) {
            console.warn("Cleanup error:", e);
        }
        pageCleanup = null;
    }

    // 2. HIDE ALL PAGES
    const pages = document.querySelectorAll("section[id^='page-']");
    pages.forEach(p => p.classList.add("hidden-page"));

    // 3. SHOW TARGET PAGE
    const target = document.getElementById(pageId);
    if (target) target.classList.remove("hidden-page");

    // 4. TOGGLE LAYOUT
    const layout = document.getElementById("layout-main");
    if (layout) {
        layout.classList.toggle("hidden-page", pageId === "page-login");
    }

    // 5. ACTIVE SIDEBAR MENU
    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.classList.remove("active");
    });

    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add("active");
    }

    // 6. PAGE LOADER
    runPageLoader(pageId);

    // 7. ACTIVE NAV BAWAH / NAV LAINNYA
    if (typeof setActiveNav === "function") {
        setActiveNav(pageId);
    }
    console.log("NAVIGATE TO:", pageId);
    console.log("TARGET:", document.getElementById(pageId));
}

// ===============================
// PAGE LOADER (SAFE VERSION)
// ===============================
function runPageLoader(pageId) {

    // ===============================
    // ALWAYS CLEANUP FIRST
    // ===============================
    if (typeof stopCamera === "function") {
        stopCamera();
    }

    // ===============================
    // ROUTING PAGE INIT
    // ===============================
    switch (pageId) {

        case "page-admin-dashboard":
            loadAdminDashboardStats?.();
            break;

        case "page-admin-users":
            loadUsers?.();
            break;

        case "page-admin-settings":
            populateLocationSettingsForm?.();
            break;

        case "page-wali-dashboard":
            setMonitoringMode?.(AppState.monitoringMode || "wali");
            break;

        case "page-wali-rekap":
            initRekapBulananPage?.();
            break;

        case "page-wali-history":
            setHistoryMode?.(AppState.historyMode || "wali");
            break;
        
        case "page-wali-approval":
            setApprovalMode?.(AppState.approvalMode || "wali");
            break;
                
        case "page-user-dashboard":
            loadUserDashboardStats?.();
            break;

        case "page-user-absen":
            // ONLY THIS ONE CONTROL CAMERA + GPS
            // initAbsenForm?.();
            // break;
            if (AppState.accessMode === "ortu") {
                showToast("Orang tua tidak memiliki akses absensi", true);
                navigateTo("page-user-dashboard");
                return;
            }

            initAbsenForm?.();
            break;
        
        case "page-user-status":
            initStatusHarianForm?.();
            break;

        case "page-user-status-history":
            loadStatusHistory?.(true);
            break;

        case "page-history":
            loadHistory(true);
            break;
        
        case "page-kepsek-dashboard":
            loadKepsekDashboard?.(true);
            break;

        case "page-master-siswa":
            loadMasterSiswa();
            break;

        case "page-user-profile":
            loadProfile();
            break;
    }
}

// ===============================
// MENU BUILDER (ROLE BASED)
// ===============================
function buildMenu(user) {
    const menu = document.getElementById("nav-menu");
    if (!menu || !user) return;

    const role = user.role;

    if (role === "admin") {
        menu.innerHTML = `
            <a href="#" onclick="navigateTo('page-admin-dashboard')">Dashboard</a>
            <a href="#" onclick="navigateTo('page-admin-users')">Kelola User</a>
            <a href="#" onclick="navigateTo('page-history')">Rekap Absensi</a>
            <a href="#" onclick="navigateTo('page-admin-settings')">Pengaturan</a>
        `;
    }

    else if (role === "wali") {
        menu.innerHTML = `
            <a href="#" data-page="page-wali-dashboard" onclick="navigateTo('page-wali-dashboard')"
                class="sidebar-link active">
                <i class="fa-solid fa-chart-line w-5"></i>
                <span>Dashboard Monitoring</span>
            </a>

            <a href="#" onclick="navigateTo('page-wali-approval')"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                <i class="fa-solid fa-clipboard-check w-5"></i>
                <span>Approval Status</span>
            </a>

            <a href="#" onclick="navigateTo('page-wali-rekap')"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                <i class="fa-solid fa-table-list w-5"></i>
                <span>Rekap Bulanan</span>
            </a>

            <a href="#" data-page="page-wali-history" onclick="navigateTo('page-wali-history')"
                class="sidebar-link">
                <i class="fa-solid fa-clock-rotate-left w-5"></i>
                <span>Riwayat</span>
            </a>
        `;
    }

    else if (role === "kepsek") {
        menu.innerHTML = `
            <a href="#" onclick="navigateTo('page-kepsek-dashboard')"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                <i class="fa-solid fa-school w-5"></i>
                <span>Dashboard Kepsek</span>
            </a>

            <a href="#" onclick="navigateTo('page-wali-rekap')"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                <i class="fa-solid fa-table-list w-5"></i>
                <span>Rekap Bulanan</span>
            </a>

            <a href="#" onclick="navigateTo('page-master-siswa')"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                <i class="fa-solid fa-user w-5"></i>
                <span>Data Siswa</span>
            </a>
        `;
    }

    else {
        if (AppState.accessMode === "ortu") {
            menu.innerHTML = `
                <a href="#" onclick="navigateTo('page-user-dashboard')">Dashboard</a>
                <a href="#" onclick="navigateTo('page-history')">Riwayat</a>
            `;
        } else {
            menu.innerHTML = `
                <a href="#" onclick="navigateTo('page-user-dashboard')">Dashboard</a>
                <a href="#" onclick="navigateTo('page-user-absen')">Absen</a>
                <a href="#" onclick="navigateTo('page-user-status')">Konfirmasi Kehadiran</a>
                <a href="#" onclick="navigateTo('page-user-status-history')"
                    class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                    <i class="fa-solid fa-list-check w-5"></i>
                    <span>Riwayat Status</span>
                </a>
                <a href="#" onclick="navigateTo('page-history')">Riwayat</a>
                <a href="#" onclick="navigateTo('page-user-profile')">Profil</a>
            `;
        }
    }
}

function setActiveNav(pageId) {
    const map = {
        "page-user-dashboard": 0,
        "page-user-absen": 1,
        "page-user-status": 2,
        "page-user-status-history": 3,
        "page-history": 4,
        "page-user-profile": 5
    };

    const index = map[pageId];

    document.querySelectorAll(".bottom-nav").forEach((btn, i) => {
        if (i === index) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function buildMobileBottomMenu(user) {

    const menu = document.getElementById("mobile-bottom-menu");

    if (!menu || !user) return;

    const role = user.role;

    // ===============================
    // ADMIN
    // ===============================
    if (role === "admin") {

        menu.innerHTML = `
            <button onclick="navigateTo('page-admin-dashboard')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-chart-line text-lg"></i>
                <span>Dashboard</span>
            </button>

            <button onclick="navigateTo('page-admin-users')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-users text-lg"></i>
                <span>User</span>
            </button>

            <button onclick="navigateTo('page-history')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                <span>Riwayat</span>
            </button>
        `;
    }

    // ===============================
    // WALI / PEMBIMBING
    // ===============================
    else if (role === "wali") {

        menu.innerHTML = `
            <button onclick="navigateTo('page-wali-dashboard')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-chart-line text-lg"></i>
                <span>Monitoring</span>
            </button>

            <button onclick="navigateTo('page-wali-approval')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                <i class="fa-solid fa-clipboard-check text-lg"></i>
                <span>Approval</span>
            </button>

            <button onclick="navigateTo('page-wali-rekap')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                <i class="fa-solid fa-table-list text-lg"></i>
                <span>Rekap</span>
            </button>

            <button onclick="navigateTo('page-wali-history')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                <span>Riwayat</span>
            </button>
        `;
    }

    // ===============================
    // KEPALA SEKOLAH
    // ===============================
    else if (role === "kepsek") {

        menu.innerHTML = `
            <button onclick="navigateTo('page-kepsek-dashboard')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                <i class="fa-solid fa-school text-lg"></i>
                <span>Kepsek</span>
            </button>

            <button onclick="navigateTo('page-wali-rekap')"
                class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                <i class="fa-solid fa-table-list text-lg"></i>
                <span>Rekap</span>
            </button>

            <button onclick="navigateTo('page-master-siswa')"
                class="sidebar-link"
                data-page="page-master-siswa">
                <i class="fa-solid fa-user-graduate w-5"></i>
                <span>Data Siswa</span>
            </button>
        `;
    }

    // ===============================
    // SISWA
    // ===============================
    else {
        if (AppState.accessMode === "ortu") {
            menu.innerHTML = `
                <button onclick="navigateTo('page-user-dashboard')" class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-house text-lg"></i>
                    <span>Home</span>
                </button>

                <button onclick="navigateTo('page-history')" class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                    <span>Riwayat</span>
                </button>
            `;
        } else {
            menu.innerHTML = `
                <button onclick="navigateTo('page-user-dashboard')" class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-house text-lg"></i>
                    <span>Home</span>
                </button>

                <button onclick="navigateTo('page-user-absen')" class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-camera text-lg"></i>
                    <span>Absen</span>
                </button>

                <button onclick="navigateTo('page-user-status')"
                    class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-calendar-check text-lg"></i>
                    <span>Status</span>
                </button>

                <button onclick="navigateTo('page-user-status-history')"
                    class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-list-check text-lg"></i>
                    <span>Approval</span>
                </button>

                <button onclick="navigateTo('page-history')" class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">
                    <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                    <span>Riwayat</span>
                </button>

                <button onclick="navigateTo('page-user-profile')"
                    class="bottom-nav flex flex-col items-center text-xs text-gray-500 transition">

                    <i class="fa-solid fa-user text-lg"></i>

                    <span>Profil</span>

                </button>
            `;
        }
    }
}

// CHANGE PASSWORD
function loadProfile(){

    const user = AppState.currentUser;

    if(!user) return;

    document.getElementById("profile-nama").innerText =
        user.nama || "-";

    document.getElementById("profile-role").innerText =
        user.kategori || "-";

    document.getElementById("profile-username").innerText =
        user.username || "-";

    document.getElementById("profile-lokasi").innerText =
        AppState.currentUserLocation?.namaIndustri || "-";

    document.getElementById("profile-pembimbing").innerText =
        user.pembimbingNama || "-";

}

function showChangePassword(){

    document
        .getElementById("modal-change-password")
        .classList.remove("hidden-page");

}

function closeChangePassword(){
    document
        .getElementById("modal-change-password")
        .classList.add("hidden-page");
    [
        "old-password",
        "new-password",
        "confirm-password"
    ].forEach(id=>{
        document.getElementById(id).value="";
    });
    checkPasswordStrength();
}

async function changePassword() {

    const user = AppState.currentUser;
    if (!user) return;
    const oldPassword =
        document.getElementById("old-password").value.trim();
    const newPassword =
        document.getElementById("new-password").value.trim();
    const confirmPassword =
        document.getElementById("confirm-password").value.trim();
    // ===============================
    // VALIDASI
    // ===============================
    if (!oldPassword) {
        showToast("Masukkan password lama.", true);
        return;
    }
    if (newPassword.length < 6) {
        showToast("Password baru minimal 6 karakter.", true);
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast("Konfirmasi password tidak sama.", true);
        return;
    }
    if (oldPassword === newPassword) {
        showToast("Password baru harus berbeda dengan password lama.", true);
        return;
    }

    // =========================
    // LOADING BUTTON
    // =========================

    const btn = document.getElementById("btn-change-password");

        btn.disabled = true;
        btn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
        Menyimpan...
        `;

    try {
        showLoader("Mengubah password...");
        const res = await ApiService.call({
            action: "change_password",
            username: user.username,
            oldPassword,
            newPassword
        });
        if (res.status === "error") {
            hideLoader();
            resetChangePasswordButton();
            showToast(
                res.message || "Gagal mengubah password.",
                true
            );
            return;
        }
        // ===============================
        // SUKSES
        // ===============================
        closeChangePassword();
        hideLoader();
        await Swal.fire({
            icon: "success",
            title: "Password Berhasil Diubah",
            text: "Silakan login kembali menggunakan password baru.",
            confirmButtonText: "Login Ulang",
            confirmButtonColor: "#4f46e5",
            allowOutsideClick: false
        });
        resetChangePasswordButton();
        logout();
    }
    catch (err) {
        console.error("Change Password Error :", err);
        hideLoader();
        resetChangePasswordButton();
        showToast("Terjadi kesalahan saat mengubah password.", true );
    }
}

function togglePasswords(id, btn){

    const input=document.getElementById(id);
    const icon=btn.querySelector("i");
    if(input.type==="password"){
        input.type="text";
        icon.className="fa-solid fa-eye-slash";
    }else{
        input.type="password";
        icon.className="fa-solid fa-eye";
    }
}

function checkPasswordStrength(){

    const input=document.getElementById("new-password");
    const bar=document.getElementById("password-strength-bar");
    const text=document.getElementById("password-strength-text");
    const pass=input.value;
    let score=0;
    if(pass.length>=6) score++;
    if(/[A-Z]/.test(pass)) score++;
    if(/[0-9]/.test(pass)) score++;
    if(/[!@#$%^&*]/.test(pass)) score++;
    const widths=["0%","25%","50%","75%","100%"];
    const colors=[
        "bg-gray-300",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500"
    ];
    const labels=[
        "Minimal 6 karakter",
        "Lemah",
        "Sedang",
        "Baik",
        "Sangat Kuat"
    ];
    bar.style.width=widths[score];
    bar.className=
        `h-full rounded-full transition-all duration-300 ${colors[score]}`;
    text.innerHTML=labels[score];
}

function resetChangePasswordButton(){
    const btn = document.getElementById("btn-change-password");
    if(!btn) return;
    btn.disabled = false;
    btn.innerHTML = "Simpan Password";
}
