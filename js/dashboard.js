// ===============================
// KEPSEK DASHBOARD
// ===============================
let kepsekMap = null;
let kepsekMarkers = [];
let kepsekLokasiSelect = null;

// async function loadKepsekDashboard(useLoader = false) {
//     try {
//         const user = AppState.currentUser;
//         if (!user) return;

//         if (useLoader) {
//             showLoader("Memuat dashboard kepala sekolah...");
//         }

//         const lokasiId =
//             document.getElementById("kepsek-filter-lokasi")?.value || "ALL";

//         const tanggalEl = document.getElementById("kepsek-filter-tanggal");

//         if (tanggalEl && !tanggalEl.value) {
//             const now = new Date();

//             tanggalEl.value =
//                 now.getFullYear() + "-" +
//                 String(now.getMonth() + 1).padStart(2, "0") + "-" +
//                 String(now.getDate()).padStart(2, "0");
//         }

//         const tanggal = tanggalEl?.value || "";

//         const data = await ApiService.call({
//             action: "get_kepsek_dashboard",
//             lokasiId,
//             tanggal
//         });

//         const summary = data.summary || {};
//         const lokasiList = data.lokasiList || [];
//         const siswa = data.siswa || [];
//         const rekapIndustri = data.rekapIndustri || [];

//         renderKepsekFilter(lokasiList, lokasiId);
//         renderKepsekSummary(summary);
//         renderKepsekRekapIndustri(rekapIndustri, lokasiId);
//         renderKepsekTable(siswa);
//         renderKepsekMap(rekapIndustri, lokasiId);

//     } catch (error) {
//         console.error("Kepsek dashboard error:", error);
//         showToast("Gagal memuat dashboard kepala sekolah", true);

//     } finally {
//         hideLoader();
//     }
// }
async function loadKepsekDashboard(useLoader = false) {
    try {

        const user = AppState.currentUser;
        if (!user) return;

        if (useLoader) {
            showLoader("Memuat dashboard kepala sekolah...");
        }

        // ===============================
        // FILTER
        // ===============================

        const lokasiId =
            document.getElementById("kepsek-filter-lokasi")?.value || "ALL";

        const tanggalEl =
            document.getElementById("kepsek-filter-tanggal");

        if (tanggalEl && !tanggalEl.value) {

            const now = new Date();

            tanggalEl.value =
                now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0");

        }

        const tanggal = tanggalEl?.value || "";

        console.log("=== REQUEST ===");
        console.log({
            lokasiId,
            tanggal
        });

        // ===============================
        // API
        // ===============================

        const data = await ApiService.call({
            action: "get_kepsek_dashboard",
            lokasiId,
            tanggal
        });

        console.log("=== RESPONSE GAS ===");
        console.log(data);

        if (!data) {
            throw new Error("Response GAS kosong");
        }

        // ===============================
        // VALIDASI
        // ===============================

        if (!data.summary) {
            console.error("summary kosong", data);
        }

        if (!Array.isArray(data.lokasiList)) {
            console.error("lokasiList bukan array", data.lokasiList);
        }

        if (!Array.isArray(data.siswa)) {
            console.error("siswa bukan array", data.siswa);
        }

        if (!Array.isArray(data.rekapIndustri)) {
            console.error("rekapIndustri bukan array", data.rekapIndustri);
        }

        const summary =
            data.summary || {};

        const lokasiList =
            data.lokasiList || [];

        const siswa =
            data.siswa || [];

        const rekapIndustri =
            data.rekapIndustri || [];

        console.log("Summary :", summary);
        console.log("Lokasi :", lokasiList.length);
        console.log("Siswa :", siswa.length);
        console.log("Rekap :", rekapIndustri.length);

        // simpan ke state
        AppState.kepsekSiswa = siswa;

        // isi dropdown filter
        populateKepsekFilters();
        // ===============================
        // RENDER
        // ===============================

        renderKepsekFilter(
            lokasiList,
            lokasiId
        );

        renderKepsekSummary(
            summary
        );

        renderKepsekRekapIndustri(
            rekapIndustri,
            lokasiId
        );

        renderKepsekTable(
            siswa
        );

        renderKepsekMap(
            rekapIndustri,
            lokasiId
        );

        console.log("Dashboard Kepsek berhasil dirender.");

    }
    catch (error) {

        console.error("=== ERROR DASHBOARD KEPSEK ===");
        console.error(error);

        if (error.stack) {
            console.error(error.stack);
        }

        showToast(
            error.message || "Gagal memuat dashboard kepala sekolah",
            true
        );

    }
    finally {

        hideLoader();

    }
}

function renderKepsekFilter(lokasiList, selected) {
    const select = document.getElementById("kepsek-filter-lokasi");
    if (!select) return;

    if (kepsekLokasiSelect) {
        kepsekLokasiSelect.destroy();
        kepsekLokasiSelect = null;
    }

    select.innerHTML = `
        <option value="ALL">Semua Lokasi</option>
        ${lokasiList.map(l => `
            <option value="${l.lokasiId}" ${selected === l.lokasiId ? "selected" : ""}>
                ${l.namaIndustri}
            </option>
        `).join("")}
    `;

    kepsekLokasiSelect = new TomSelect("#kepsek-filter-lokasi", {
        create: false,
        allowEmptyOption: true,
        placeholder: "Ketik nama lokasi PKL...",
        sortField: {
            field: "text",
            direction: "asc"
        }
    });

    kepsekLokasiSelect.setValue(selected || "ALL");
}

function renderKepsekSummary(summary) {
    document.getElementById("kepsek-total-siswa").innerText =
        summary.totalSiswa || 0;

    document.getElementById("kepsek-total-hadir").innerText =
        summary.totalHadir || 0;

    document.getElementById("kepsek-total-belum").innerText =
        summary.totalBelum || 0;

    document.getElementById("kepsek-total-industri").innerText =
        summary.totalIndustri || 0;

    const statusEl = document.getElementById("kepsek-total-status");
    if (statusEl) {
        statusEl.innerText = summary.totalStatusKhusus || 0;
    }

    const pendingEl = document.getElementById("kepsek-total-pending");
    if (pendingEl) {
        pendingEl.innerText = summary.totalPendingApproval || 0;
    }
}

function getKepsekStatusBadge(status) {
    switch (String(status || "").trim().toLowerCase()) {
        case "hadir":
            return "bg-green-100 text-green-700";

        case "belum konfirmasi":
            return "bg-red-100 text-red-700";

        case "pending approval":
            return "bg-orange-100 text-orange-700";

        case "day off":
        case "izin":
        case "sakit":
        case "libur industri":
        case "lupa absen":
            return "bg-amber-100 text-amber-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function renderKepsekRekapIndustri(rekap, lokasiId) {
    const box = document.getElementById("kepsek-rekap-industri");
    if (!box) return;

    const data = lokasiId === "ALL"
        ? rekap
        : rekap.filter(r => r.lokasiId === lokasiId);

    if (!data.length) {
        box.innerHTML = `
            <div class="text-sm text-slate-500">
                Tidak ada data industri
            </div>
        `;
        return;
    }

    box.innerHTML = data.map(r => `
        <div class="border rounded-2xl p-4">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <h4 class="font-semibold text-slate-800">
                        ${r.namaIndustri}
                    </h4>
                    <p class="text-xs text-slate-500 mt-1">
                        ${r.alamat || "-"}
                    </p>
                </div>

                <span class="text-sm font-bold text-indigo-600">
                    ${r.persentase}%
                </span>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div class="bg-slate-50 rounded-xl p-2">
                    <div class="font-bold">${r.totalSiswa}</div>
                    <div class="text-xs text-slate-500">Siswa</div>
                </div>

                <div class="bg-green-50 rounded-xl p-2">
                    <div class="font-bold text-green-600">${r.hadir}</div>
                    <div class="text-xs text-slate-500">Hadir</div>
                </div>

                <div class="bg-red-50 rounded-xl p-2">
                    <div class="font-bold text-red-600">${r.belumHadir}</div>
                    <div class="text-xs text-slate-500">Belum</div>
                </div>
            </div>
        </div>
    `).join("");
}

function renderKepsekTable(siswa) {
    const tbody = document.getElementById("kepsek-table-body");
    if (!tbody) return;

    if ($.fn.DataTable.isDataTable("#kepsek-table")) {
        $("#kepsek-table").DataTable().clear().destroy();
    }

    if (!siswa.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-4 text-slate-500">
                    Tidak ada data siswa
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = siswa.map(s => `
        <tr>
            <td>${s.nama || "-"}</td>
            <td>${s.kategori || "-"}</td>
            <td>${s.namaIndustri || "-"}</td>
            <td>${s.jamMasuk || "-"}</td>
            <td>
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${getKepsekStatusBadge(s.statusHadir)}">
                    ${s.statusHadir}
                </span>
            </td>
            <td>
                ${
                    s.maps
                        ? `<a href="${s.maps}" target="_blank" class="text-indigo-600 font-medium">Maps</a>`
                        : "-"
                }
            </td>
        </tr>
    `).join("");

    $("#kepsek-table").DataTable({
        pageLength: 10,
        ordering: true,
        searching: true,
        scrollX: true,
        autoWidth: false,
        destroy: true,
        language: {
            search: "Cari:",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
            paginate: {
                next: "›",
                previous: "‹"
            },
            zeroRecords: "Data tidak ditemukan"
        }
    });
}

function renderKepsekMap(rekap, lokasiId) {
    const mapEl = document.getElementById("kepsek-map");
    if (!mapEl || typeof L === "undefined") return;
    const data = lokasiId === "ALL"
        ? rekap
        : rekap.filter(r => r.lokasiId === lokasiId);
    if (!kepsekMap) {
        kepsekMap = L.map("kepsek-map").setView([-8.65, 115.21], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap"
        }).addTo(kepsekMap);
    }
    kepsekMarkers.forEach(m => kepsekMap.removeLayer(m));
    kepsekMarkers = [];
    const bounds = [];
    data.forEach(r => {
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        let color = "red";
        if (r.totalSiswa > 0 && r.belumHadir === 0) color = "green";
        else if (r.hadir > 0) color = "orange";
        const marker = L.circleMarker([lat, lng], {
            radius: 10,
            color,
            fillColor: color,
            fillOpacity: 0.8
        }).addTo(kepsekMap);
        marker.bindPopup(`
            <b>${r.namaIndustri}</b><br>
            Total: ${r.totalSiswa}<br>
            Hadir: ${r.hadir}<br>
            Belum: ${r.belumHadir}
        `);
        kepsekMarkers.push(marker);
        bounds.push([lat, lng]);
    });
    if (bounds.length) {
        kepsekMap.fitBounds(bounds, {
            padding: [30, 30]
        });
    }
    setTimeout(() => {
        kepsekMap.invalidateSize();
    }, 300);
}

function populateKepsekFilters() {

    const kategoriEl =
        document.getElementById(
            "kepsek-filter-kategori"
        );

    const industriEl =
        document.getElementById(
            "kepsek-filter-industri"
        );

    if (!kategoriEl || !industriEl) return;

    const kategoriSet = new Set();
    const industriSet = new Set();

    (AppState.kepsekSiswa || [])
        .forEach(item => {

            if (item.kategori) {
                kategoriSet.add(item.kategori);
            }

            if (item.namaIndustri) {
                industriSet.add(item.namaIndustri);
            }

        });

    kategoriEl.innerHTML =
        `<option value="">Semua Kategori</option>`;

    [...kategoriSet]
        .sort()
        .forEach(item => {

            kategoriEl.innerHTML += `
                <option value="${item}">
                    ${item}
                </option>
            `;

        });

    industriEl.innerHTML =
        `<option value="">Semua Industri</option>`;

    [...industriSet]
        .sort()
        .forEach(item => {

            industriEl.innerHTML += `
                <option value="${item}">
                    ${item}
                </option>
            `;

        });

}

function filterKepsekSiswa() {

    const search =
        document.getElementById("kepsek-search")
        ?.value
        .toLowerCase()
        .trim();
    
    const tanggal =
    document.getElementById("kepsek-filter-tanggal")?.value;

    const kategori =
        document.getElementById(
            "kepsek-filter-kategori"
        )?.value;

    const industri =
        document.getElementById(
            "kepsek-filter-industri"
        )?.value;

    const result =
        AppState.kepsekSiswa.filter(s => {

            const matchSearch =

                !search ||

                s.nama?.toLowerCase()
                    .includes(search);

            const matchKategori =

                !kategori ||

                s.kategori === kategori;

            const matchIndustri =

                !industri ||

                s.namaIndustri === industri;

            return (
                matchSearch &&
                matchKategori &&
                matchIndustri
            );

        });

    renderKepsekTable(result);

}

//KEPSEK MASTER DATA SISWA

async function loadMasterSiswa() {

    try {

        showLoader("Memuat data siswa...");

        const data =
            await ApiService.call({
                action: "get_master_siswa"
            });

        AppState.masterSiswa = data || [];

        populateMasterFilters();

        renderMasterSiswaTable(
            AppState.masterSiswa
        );

    } catch(err) {

        console.error(err);

        showToast(
            "Gagal memuat data siswa",
            true
        );

    } finally {

        hideLoader();

    }

}

let masterSiswaTable = null;
function renderMasterSiswaTable(data = []) {
    const tbody =
        document.querySelector(
            "#table-master-siswa tbody"
        );
    if (!tbody) return;
    if (
        $.fn.DataTable.isDataTable(
            "#table-master-siswa"
        )
    ) {
        $("#table-master-siswa")
            .DataTable()
            .destroy();
    }
    tbody.innerHTML = "";
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.username || ""}</td>
                <td>${item.nama || ""}</td>
                <td>${item.kategori || ""}</td>
                <td>${item.namaIndustri || "-"}</td>
                <td>${item.namaPembimbing || "-"}</td>
                <td>
                    <button
                        onclick="openEditSiswa('${item.username}')"
                        class="btn btn-warning btn-sm">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    masterSiswaTable =
        $("#table-master-siswa").DataTable({
            pageLength: 10,
            responsive: true,
            destroy: true,
            language: {
                search: "Cari:",
                lengthMenu:
                    "Tampilkan _MENU_ data",
                info:
                    "Menampilkan _START_ - _END_ dari _TOTAL_ data",
                infoEmpty:
                    "Tidak ada data",
                zeroRecords:
                    "Data tidak ditemukan",
                paginate: {
                    first: "Awal",
                    last: "Akhir",
                    next: "›",
                    previous: "‹"
                }
            }
        });
}

function populateMasterFilters() {
    const kategoriEl =
        document.getElementById(
            "master-filter-kategori"
        );
    const industriEl =
        document.getElementById(
            "master-filter-industri"
        );
    if (!kategoriEl || !industriEl) return;
    const kategoriSet =
        new Set();
    const industriSet =
        new Set();
    AppState.masterSiswa.forEach(item => {
        if (item.kategori) {
            kategoriSet.add(
                item.kategori
            );
        }
        if (item.namaIndustri) {
            industriSet.add(
                item.namaIndustri
            );
        }
    });
    kategoriEl.innerHTML =
        `<option value="">Semua</option>`;
    [...kategoriSet]
        .sort()
        .forEach(item => {
            kategoriEl.innerHTML += `
                <option value="${item}">
                    ${item}
                </option>
            `;
        });
    industriEl.innerHTML =
        `<option value="">Semua</option>`;
    [...industriSet]
        .sort()
        .forEach(item => {
            industriEl.innerHTML += `
                <option value="${item}">
                    ${item}
                </option>
            `;
        });
}

function filterMasterSiswa() {
    const search =
        document.getElementById(
            "master-search"
        )
        ?.value
        .toLowerCase()
        .trim();
    const kategori =
        document.getElementById(
            "master-filter-kategori"
        )?.value;
    const industri =
        document.getElementById(
            "master-filter-industri"
        )?.value;
    const result =
        AppState.masterSiswa.filter(item => {
            const matchSearch =
                !search ||
                item.nama
                    ?.toLowerCase()
                    .includes(search) ||
                item.username
                    ?.toLowerCase()
                    .includes(search);
            const matchKategori =
                !kategori ||
                item.kategori === kategori;
            const matchIndustri =
                !industri ||
                item.namaIndustri === industri;
            return (
                matchSearch &&
                matchKategori &&
                matchIndustri
            );
        });
    AppState.masterSiswaFiltered =
        result;
    renderMasterSiswaTable(result);
}

async function openEditSiswa(username) {
    try {
        showLoader("Memuat data...");
        const siswa =
            await ApiService.call({
                action: "get_siswa_detail",
                username
            });
        const guruList =
            await ApiService.call({
                action: "get_guru_list"
            });
        const lokasiList =
            await ApiService.call({
                action: "get_lokasi_list"
            });
        document.getElementById("edit-username")
            .value = siswa.username;
        document.getElementById("edit-username-view")
            .value = siswa.username;
        document.getElementById("edit-nama")
            .value = siswa.nama;
        document.getElementById("edit-kategori")
            .value = siswa.kategori;

        populateGuruDropdown(
            guruList,
            siswa.parentId
        );
        populateLokasiDropdown(
            lokasiList,
            siswa.lokasiId
        );
        document
            .getElementById("modal-edit-siswa")
            .classList
            .remove("hidden");
    }
    catch(err){
        console.error(err);
        showToast(
            "Gagal memuat data siswa",
            true
        );
    }
    finally{
        hideLoader();
    }
}

function populateGuruDropdown(
    list,
    selectedId
){

    const el =
        document.getElementById(
            "edit-parentid"
        );

    el.innerHTML = "";

    list.forEach(guru=>{

        el.innerHTML += `
            <option
                value="${guru.id}"
                ${guru.id===selectedId ? "selected" : ""}>
                ${guru.nama}
            </option>
        `;

    });

}

function populateLokasiDropdown(
    list,
    selectedId
){
    const el =
        document.getElementById(
            "edit-lokasiid"
        );
    el.innerHTML = "";
    list.forEach(item=>{
        el.innerHTML += `
            <option
                value="${item.lokasiId}"
                ${item.lokasiId===selectedId ? "selected" : ""}>
                ${item.namaIndustri}
            </option>
        `;
    });
}

function closeEditSiswa() {
    document
        .getElementById("modal-edit-siswa")
        .classList
        .add("hidden");
}

async function saveEditSiswa(){
    try{
        showLoader("Menyimpan data...");
        const res =
            await ApiService.call({
                action:"update_siswa",
                username:
                    document.getElementById("edit-username").value,
                nama:
                    document.getElementById("edit-nama").value,
                kategori:
                    document.getElementById("edit-kategori").value,
                parentId:
                    document.getElementById("edit-parentid").value,
                lokasiId:
                    document.getElementById("edit-lokasiid").value,

            });
        showToast(
            "Data berhasil diperbarui"
        );
        closeEditSiswa();
        await loadMasterSiswa();
    }
    catch(error){
        console.error(error);
        showToast(
            "Gagal menyimpan data",
            true
        );
    }
    finally{
        hideLoader();
    }

}

// ===============================
// WALI DASHBOARD
// ===============================
function setMonitoringMode(mode) {

    AppState.monitoringMode = mode;

    const btnWali =
        document.getElementById("btn-mode-wali");

    const btnPembimbing =
        document.getElementById("btn-mode-pembimbing");

    // RESET STYLE
    btnWali?.classList.remove(
        "bg-indigo-600",
        "text-white"
    );

    btnPembimbing?.classList.remove(
        "bg-indigo-600",
        "text-white"
    );

    btnWali?.classList.add(
        "bg-slate-100",
        "text-slate-700"
    );

    btnPembimbing?.classList.add(
        "bg-slate-100",
        "text-slate-700"
    );

    // ACTIVE STYLE
    if (mode === "wali") {

        btnWali?.classList.remove(
            "bg-slate-100",
            "text-slate-700"
        );

        btnWali?.classList.add(
            "bg-indigo-600",
            "text-white"
        );

    } else {

        btnPembimbing?.classList.remove(
            "bg-slate-100",
            "text-slate-700"
        );

        btnPembimbing?.classList.add(
            "bg-indigo-600",
            "text-white"
        );
    }

    // RELOAD DASHBOARD
    loadWaliDashboard?.(true);
}

async function loadWaliDashboard(useLoader = false) {
    try {
        const user = AppState.currentUser;
        if (!user) return;

        if (useLoader) {
            showLoader("Memuat data siswa...");
        }

        if (!AppState.monitoringMode) {
            AppState.monitoringMode = "wali";
        }

        const data = await ApiService.call({
            action: "get_monitoring_dashboard",
            mode: AppState.monitoringMode,
            username: user.username,
            kategori: user.kategori
        });

        const siswa = data.siswa || [];
        const riwayat = data.riwayat || [];

        const contentBox = document.getElementById("wali-dashboard-content");
        const emptyBox = document.getElementById("wali-dashboard-empty");

        if (contentBox) contentBox.classList.remove("hidden");

        if (emptyBox) {
            emptyBox.classList.add("hidden");
            emptyBox.innerHTML = "";
        }

        if (AppState.monitoringMode === "wali" && siswa.length === 0) {
            if (contentBox) contentBox.classList.add("hidden");

            if (emptyBox) {
                emptyBox.classList.remove("hidden");
                emptyBox.innerHTML = `
                    <p>
                        Tidak memiliki siswa yang sedang PKL sebagai <b>Wali Kelas</b>.
                    </p>

                    <button onclick="setMonitoringMode('pembimbing')"
                        class="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
                        Buka Pembimbing PKL
                    </button>
                `;
            }

            return;
        }

        if (AppState.monitoringMode === "pembimbing" && siswa.length === 0) {
            if (contentBox) contentBox.classList.add("hidden");

            if (emptyBox) {
                emptyBox.classList.remove("hidden");
                emptyBox.innerHTML = `
                    <p>
                        Anda tidak sedang menjadi <b>Pembimbing PKL</b>.
                    </p>

                    <button onclick="setMonitoringMode('wali')"
                        class="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
                        Buka Wali Kelas
                    </button>
                `;
            }

            return;
        }

        const today = new Date();

        const todayStr =
            today.getDate().toString().padStart(2, "0") + "/" +
            (today.getMonth() + 1).toString().padStart(2, "0") + "/" +
            today.getFullYear();

        const hadirHariIni = riwayat.filter(r =>
            r.timestamp?.startsWith(todayStr) &&
            r.tipe === "Masuk"
        );

        const hadirUsernames = new Set(
            hadirHariIni.map(r => String(r.username || "").trim())
        );

        const statusKhusus = siswa.filter(s =>
            s.statusHarian &&
            String(s.approvalStatus || "").trim().toLowerCase() === "approved" &&
            !hadirUsernames.has(String(s.username || "").trim())
        );

        const statusPending = siswa.filter(s =>
            s.statusHarian &&
            String(s.approvalStatus || "").trim().toLowerCase() === "pending" &&
            !hadirUsernames.has(String(s.username || "").trim())
        );

        const statusUsernames = new Set(
            statusKhusus.map(s => String(s.username || "").trim()),
            statusPending.map(s => String(s.username || "").trim())
        );

        const belumHadir = siswa.filter(s =>
            !hadirUsernames.has(String(s.username || "").trim()) &&
            !statusUsernames.has(String(s.username || "").trim())
        );

        // ===============================
        // PROFILE WALI
        // ===============================
        const waliNama = document.getElementById("wali-nama");
        const waliKategori = document.getElementById("wali-kategori");
        const waliAvatar = document.getElementById("wali-avatar");

        if (waliNama) {
            waliNama.textContent =
                user.namaLengkap ||
                user.nama ||
                user["Nama Lengkap"] ||
                "-";
        }

        if (waliKategori) {
            waliKategori.textContent =
                user.kategori ||
                user.Kategori ||
                user["Kategori"] ||
                "-";
        }

        if (waliAvatar) {
            waliAvatar.textContent =
                (
                    user.namaLengkap ||
                    user.nama ||
                    user["Nama Lengkap"] ||
                    "W"
                ).charAt(0).toUpperCase();
        }

        // ===============================
        // SUMMARY
        // ===============================
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        setText("wali-total-siswa", siswa.length);
        setText("wali-sudah-hadir", hadirHariIni.length);
        setText("wali-belum-hadir", belumHadir.length);
        setText("wali-status-khusus", statusKhusus.length);

        setText("wali-belum-count", `${belumHadir.length} siswa`);
        setText("wali-hadir-count", `${hadirHariIni.length} siswa`);
        setText("wali-status-count", `${statusKhusus.length} siswa`);

        // ===============================
        // BELUM HADIR LIST
        // ===============================
        const belumList = document.getElementById("wali-belum-list");

        if (belumList) {
            if (!belumHadir.length) {
                belumList.innerHTML = `
                    <div class="text-sm text-green-600">
                        Tidak ada siswa yang belum konfirmasi
                    </div>
                `;
            } else {
                belumList.innerHTML = belumHadir.map(s => `
                    <div class="border rounded-xl p-3">
                        <div class="font-medium text-slate-800">
                            ${s.nama || "-"}
                        </div>

                        <div class="text-xs text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                            <span>${s.kategori || "-"}</span>
                            <span>•</span>
                            <a href="${s.mapsUrl || '#'}"
                                target="_blank"
                                class="text-indigo-600 hover:underline">
                                <i class="fa-solid fa-location-dot"></i>
                                ${s.namaIndustri || "Belum diatur"}
                            </a>
                        </div>
                    </div>
                `).join("");
            }
        }

        // ===============================
        // HADIR LIST
        // ===============================
        const hadirList = document.getElementById("wali-hadir-list");

        if (hadirList) {
            if (!hadirHariIni.length) {
                hadirList.innerHTML = `
                    <div class="text-sm text-slate-500">
                        Belum ada siswa hadir
                    </div>
                `;
            } else {
                hadirList.innerHTML = hadirHariIni.map(r => `
                    <div class="border rounded-xl p-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium text-slate-800">
                                    ${r.nama || "-"}
                                </div>

                                <div class="text-xs text-slate-500 mt-1">
                                    ${r.kategori || "-"}
                                </div>
                            </div>

                            <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Hadir
                            </span>
                        </div>

                        <div class="mt-2 text-xs text-slate-500">
                            ${r.timestamp || "-"}
                        </div>
                    </div>
                `).join("");
            }
        }

        // ===============================
        // STATUS KHUSUS LIST
        // ===============================
        const statusList = document.getElementById("wali-status-list");

        if (statusList) {
            if (!statusKhusus.length) {
                statusList.innerHTML = `
                    <div class="text-sm text-slate-500">
                        Tidak ada status khusus hari ini
                    </div>
                `;
            } else {
                statusList.innerHTML = statusKhusus.map(s => `
                    <div class="border rounded-xl p-3 bg-amber-50 border-amber-100">

                        <div class="flex items-start justify-between gap-2">

                            <div class="min-w-0">

                                <div class="font-medium text-slate-800 truncate">
                                    ${s.nama || "-"}
                                </div>

                                <div class="text-xs text-slate-500">
                                    ${s.kategori || "-"}
                                </div>

                            </div>

                            <span class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(s.statusHarian)}">
                                ${s.statusHarian || "-"}
                            </span>

                        </div>

                        ${
                            s.keteranganStatus
                                ? `
                                    <div class="mt-2 text-xs text-slate-500 italic">
                                        ${s.keteranganStatus}
                                    </div>
                                `
                                : ""
                        }

                    </div>
                `).join("");
            }
        }
        // ===============================
        // PENDING APPROVAL
        // ===============================
        setText("wali-pending-count", `${statusPending.length} siswa`);

        const pendingList = document.getElementById("wali-pending-list");

        if (pendingList) {
            if (!statusPending.length) {
                pendingList.innerHTML = `
                    <div class="text-sm text-slate-500">
                        Tidak ada pengajuan pending
                    </div>
                `;
            } else {
                pendingList.innerHTML = statusPending.map(s => `
                    <div class="border rounded-xl p-3 bg-orange-50 border-orange-100">

                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <div class="font-medium text-slate-800 truncate">
                                    ${s.nama || "-"}
                                </div>

                                <div class="text-xs text-slate-500">
                                    ${s.kategori || "-"}
                                </div>
                            </div>

                            <span class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(s.statusHarian)}">
                                ${s.statusHarian || "-"}
                            </span>
                        </div>

                        ${
                            s.keteranganStatus
                                ? `<div class="mt-2 text-xs text-slate-500 italic">${s.keteranganStatus}</div>`
                                : ""
                        }

                        <div class="mt-2 text-[11px] font-medium text-orange-600">
                            Menunggu Approval
                        </div>

                    </div>
                `).join("");
            }
        }

    } catch (error) {
        console.error("Wali dashboard error:", error);
        showToast("Gagal memuat dashboard wali", true);

    } finally {
        hideLoader();
    }
}

function getStatusBadgeClass(status) {

    switch ((status || "").toLowerCase()) {

        case "day off":
            return "bg-amber-100 text-amber-700";

        case "izin":
            return "bg-blue-100 text-blue-700";

        case "sakit":
            return "bg-red-100 text-red-700";

        case "libur industri":
            return "bg-purple-100 text-purple-700";

        case "lupa absen":
            return "bg-slate-200 text-slate-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getApprovalBadgeClass(approval) {
    switch (String(approval || "").trim().toLowerCase()) {
        case "approved":
            return "bg-green-100 text-green-700";

        case "rejected":
            return "bg-red-100 text-red-700";

        case "pending":
            return "bg-amber-100 text-amber-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function setApprovalMode(mode) {
    AppState.approvalMode = mode;

    const btnWali = document.getElementById("btn-approval-mode-wali");
    const btnPembimbing = document.getElementById("btn-approval-mode-pembimbing");

    btnWali?.classList.remove("bg-indigo-600", "text-white");
    btnPembimbing?.classList.remove("bg-indigo-600", "text-white");

    btnWali?.classList.add("bg-slate-100", "text-slate-700");
    btnPembimbing?.classList.add("bg-slate-100", "text-slate-700");

    if (mode === "wali") {
        btnWali?.classList.remove("bg-slate-100", "text-slate-700");
        btnWali?.classList.add("bg-indigo-600", "text-white");
    } else {
        btnPembimbing?.classList.remove("bg-slate-100", "text-slate-700");
        btnPembimbing?.classList.add("bg-indigo-600", "text-white");
    }

    loadStatusApproval(true);
}

async function loadStatusApproval(useLoader = false) {
    try {
        const user = AppState.currentUser;
        if (!user) return;

        if (useLoader) {
            showLoader("Memuat data approval...");
        }

        const data = await ApiService.call({
            action: "get_status_pending",
            mode: AppState.approvalMode,
            username: user.username,
            kategori: user.kategori
        });

        const list = document.getElementById("approval-list");
        if (!list) return;

        if (!data.length) {
            list.innerHTML = `
                <div class="bg-white rounded-2xl p-4 shadow text-center text-slate-500">
                    Tidak ada pengajuan pending.
                </div>
            `;
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="bg-white rounded-2xl p-4 shadow border border-slate-100">

                <div class="flex items-start justify-between gap-3">
                    <div>
                        <div class="font-bold text-slate-800">
                            ${item.nama || "-"}
                        </div>

                        <div class="text-xs text-slate-500 mt-1">
                            ${item.kategori || "-"} • ${item.tanggal || "-"}
                        </div>
                    </div>

                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}">
                        ${item.status || "-"}
                    </span>
                </div>

                ${
                    item.keterangan
                        ? `<div class="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                            ${item.keterangan}
                           </div>`
                        : ""
                }

                <div class="mt-4 flex gap-2">
                    <button onclick="updateApproval(${item.rowIndex}, 'Approved')"
                        class="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold">
                        Setujui
                    </button>

                    <button onclick="updateApproval(${item.rowIndex}, 'Rejected')"
                        class="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold">
                        Tolak
                    </button>
                </div>

            </div>
        `).join("");

    } catch (error) {
        console.error("Approval error:", error);
        showToast("Gagal memuat approval", true);

    } finally {
        hideLoader();
    }
}

async function updateApproval(rowIndex, approval) {
    const user = AppState.currentUser;
    if (!user) return;

    const label = approval === "Approved" ? "menyetujui" : "menolak";

    Swal.fire({
        title: approval === "Approved" ? "Setujui Pengajuan?" : "Tolak Pengajuan?",
        text: `Anda akan ${label} pengajuan ini.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: approval === "Approved" ? "Ya, Setujui" : "Ya, Tolak",
        cancelButtonText: "Batal",
        confirmButtonColor: approval === "Approved" ? "#16a34a" : "#dc2626"
    }).then(async result => {
        if (!result.isConfirmed) return;

        try {
            showLoader("Memproses approval...");

            const res = await ApiService.call({
                action: "update_status_approval",
                rowIndex,
                approval,
                approvedBy: user.username
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: res.message || "Status berhasil diperbarui",
                timer: 1500,
                showConfirmButton: false
            });

            loadStatusApproval(false);

        } catch (error) {
            console.error(error);
            showToast("Gagal memproses approval", true);

        } finally {
            hideLoader();
        }
    });
}
// ===============================
// MODE SISWA
// ===============================
function pilihModeSiswaOrtu() {
        Swal.fire({
        title: "Pilih Akses",
        text: "Masuk sebagai siswa atau orang tua?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Siswa",
        cancelButtonText: "Orang Tua",
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#16a34a",
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((result) => {
        if (result.isConfirmed) {
            AppState.accessMode = "siswa";
        } else {
            AppState.accessMode = "ortu";
        }

        buildMenu(AppState.currentUser);
        buildMobileBottomMenu?.(AppState.currentUser);

        showLoader("Memuat dashboard...");

        navigateTo("page-user-dashboard");
    });
}
// ===============================
// USER DASHBOARD
// ===============================

//01-07-2026

// async function loadUserDashboardStats() {
//     try {
//         const user = AppState.currentUser;
//         if (!user) return;

//         if (!AppState.currentUserLocation && user.lokasiId) {
//             await loadUserLocation();
//         }

//         const riwayat = await ApiService.call({
//             action: "get_riwayat",
//             role: user.role,
//             username: user.username
//         });
        

//         // ===============================
//         // REQUIRED UI CHECK
//         // ===============================
//         const requiredUI = [
//             "ui-status-hari",
//             "ui-masuk",
//             "ui-pulang",
//             "ui-total-hadir",
//             "ui-total-masuk",
//             "ui-total-pulang",
//             "ui-progress-kehadiran",
//             "ui-persentase",
//             "ui-last-absen"
//         ];

//         const missing = requiredUI.filter(id => !document.getElementById(id));

//         if (missing.length > 0) {
//             console.warn("Dashboard UI missing:", missing);
//             return; // STOP supaya tidak error
//         }

//         // ===============================
//         // SAFE DOM HELPERS
//         // ===============================
//         const setText = (id, value) => {
//             const el = document.getElementById(id);
//             if (el) el.innerText = value;
//         };

//         const setHTML = (id, value) => {
//             const el = document.getElementById(id);
//             if (el) el.innerHTML = value;
//         };

//         const setWidth = (id, value) => {
//             const el = document.getElementById(id);
//             if (el) el.style.width = value;
//         };

//         // ===============================
//         // VALIDATE DATA
//         // ===============================
//         if (!Array.isArray(riwayat)) {
//             console.warn("Riwayat bukan array:", riwayat);
//             return;
//         }
        

//         // ===============================
//         // FORMAT TODAY
//         // ===============================
//         const today = new Date();

//         const todayStr =
//             today.getDate().toString().padStart(2, "0") + "/" +
//             (today.getMonth() + 1).toString().padStart(2, "0") + "/" +
//             today.getFullYear();

//         // ===============================
//         // FILTER DATA
//         // ===============================
//         const todayData = riwayat.filter(r =>
//             r?.timestamp?.startsWith(todayStr)
//         );

//         const thisMonth = riwayat.filter(r => {
//             if (!r?.timestamp) return false;

//             const d = parseDateID(r.timestamp);

//             return (
//                 d &&
//                 d.getMonth() === today.getMonth() &&
//                 d.getFullYear() === today.getFullYear()
//             );
//         });

//         // ===============================
//         // STATUS HARI INI
//         // ===============================
//         const masukToday = todayData.find(r => r.tipe === "Masuk");
//         const pulangToday = todayData.find(r => r.tipe === "Pulang");

//         const statusHari =
//             todayData.length > 0 ? "Hadir" : "Belum Absen";

//         // ===============================
//         // RINGKASAN BULAN
//         // ===============================
//         const totalHadir = new Set(
//             thisMonth
//                 .filter(r => r.tipe === "Masuk")
//                 .map(r => r.timestamp.split(" ")[0])
//         ).size;

//         const totalMasuk =
//             thisMonth.filter(r => r.tipe === "Masuk").length;

//         const totalPulang =
//             thisMonth.filter(r => r.tipe === "Pulang").length;

//         // ===============================
//         // PROGRESS
//         // ===============================
//         const targetHari = 22;

//         const progress =
//             targetHari > 0
//                 ? Math.min((totalHadir / targetHari) * 100, 100)
//                 : 0;

//         // ===============================
//         // LAST ABSEN
//         // ===============================
//         const last = riwayat[0];

//         // ===============================
//         // UPDATE UI (SAFE)
//         // ===============================
//         setText("ui-status-hari", statusHari);

//         setText(
//             "ui-masuk",
//             masukToday?.timestamp?.split(" ")[1] || "-"
//         );

//         setText(
//             "ui-pulang",
//             pulangToday?.timestamp?.split(" ")[1] || "-"
//         );
//         setText("ui-user-name", user.nama);
//         setText("ui-user-kategori", user.kategori || "-");
//         setText("ui-total-hadir", totalHadir);
//         setText("ui-total-masuk", totalMasuk);
//         setText("ui-total-pulang", totalPulang);

//         setWidth("ui-progress-kehadiran", `${progress}%`);
//         setText("ui-persentase", `${Math.round(progress)}%`);
//         // setText("ui-user-lokasi", AppState.currentUserLocation?.namaIndustri || "Belum diatur");
//         const lokasiEl = document.getElementById("ui-user-lokasi");

//             if (lokasiEl && AppState.currentUserLocation) {
//                 const lokasi = AppState.currentUserLocation;

//                 lokasiEl.innerHTML = `
//                     <i class="fa-solid fa-location-dot"></i>
//                     ${lokasi.namaIndustri || "Lokasi PKL"}
//                 `;

//                 lokasiEl.href = `https://www.google.com/maps?q=${lokasi.lat},${lokasi.lng}`;
//                 lokasiEl.target = "_blank";
//             } else if (lokasiEl) {
//                 lokasiEl.innerText = "Belum diatur";
//                 lokasiEl.removeAttribute("href");
//             }
            
//         setText(
//             "ui-user-pembina",
//             user.pembimbingNama || "-"
//         );

//         const waEl = document.getElementById("ui-user-wa-pembina");

//         if (waEl && user.pembimbingWa) {
//             let wa = String(user.pembimbingWa).replace(/\D/g, "");

//             if (wa.startsWith("08")) {
//                 wa = "62" + wa.substring(1);
//             }

//             waEl.href = `https://wa.me/${wa}`;
//             waEl.classList.remove("hidden");
//         } else if (waEl) {
//             waEl.classList.add("hidden");
//         }

//         if (last) {
//             setHTML("ui-last-absen", `
//                 <p><b>${last.tipe}</b> - ${last.timestamp}</p>
//                 <p>${Math.round(last.jarak)} meter</p>
//             `);
//         } else {
//             setHTML("ui-last-absen", `
//                 <p>Belum ada riwayat absensi</p>
//             `);
//         }

//         console.log("Dashboard loaded successfully");
//         console.log("Total hadir:", totalHadir);

//     } catch (error) {
//         console.error("Dashboard error:", error);
//         showToast("Gagal load dashboard", true);
//     } finally {
//         hideLoader();
//     }
// }

async function loadUserDashboardStats() {

    try {

        const user = AppState.currentUser;

        if (!user) return;

        if (!AppState.currentUserLocation && user.lokasiId) {
            await loadUserLocation();
        }

        const dashboard = await ApiService.call({
            action: "get_dashboard_siswa",
            username: user.username
        });

        const hariIni = dashboard.hariIni || {};
        const ringkasan = dashboard.ringkasan || {};
        const last = dashboard.lastAbsen || null;

        const setText = (id,val)=>{
            const el=document.getElementById(id);
            if(el) el.innerText=val;
        };

        const setHTML=(id,val)=>{
            const el=document.getElementById(id);
            if(el) el.innerHTML=val;
        };

        const setWidth=(id,val)=>{
            const el=document.getElementById(id);
            if(el) el.style.width=val;
        };

        // ======================
        // STATUS HARI INI
        // ======================

        setText("ui-status-hari",hariIni.status||"Belum Absen");
        setText("ui-masuk",hariIni.masuk||"-");
        setText("ui-pulang",hariIni.pulang||"-");

        // ======================
        // USER
        // ======================

        setText("ui-user-name",user.nama);
        setText("ui-user-kategori",user.kategori||"-");

        // ======================
        // RINGKASAN
        // ======================

        setText("ui-total-hadir",ringkasan.totalHadir||0);
        setText("ui-total-masuk",ringkasan.totalMasuk||0);
        setText("ui-total-pulang",ringkasan.totalPulang||0);

        setWidth(
            "ui-progress-kehadiran",
            `${ringkasan.progress||0}%`
        );

        setText(
            "ui-persentase",
            `${ringkasan.progress||0}%`
        );

        // ======================
        // LOKASI
        // ======================

        const lokasiEl=document.getElementById("ui-user-lokasi");

        if(lokasiEl && AppState.currentUserLocation){

            const lokasi=AppState.currentUserLocation;

            lokasiEl.innerHTML=`
                <i class="fa-solid fa-location-dot"></i>
                ${lokasi.namaIndustri}
            `;

            lokasiEl.href=`https://www.google.com/maps?q=${lokasi.lat},${lokasi.lng}`;
            lokasiEl.target="_blank";

        }

        // ======================
        // PEMBIMBING
        // ======================

        setText("ui-user-pembina",user.pembimbingNama||"-");

        const waEl=document.getElementById("ui-user-wa-pembina");

        if(waEl && user.pembimbingWa){

            let wa=user.pembimbingWa.replace(/\D/g,'');

            if(wa.startsWith("08")){
                wa="62"+wa.substring(1);
            }

            waEl.href=`https://wa.me/${wa}`;
            waEl.classList.remove("hidden");

        }else if(waEl){

            waEl.classList.add("hidden");

        }

        // ======================
        // LAST ABSEN
        // ======================

        if(last){

            setHTML("ui-last-absen",`
                <p><b>${last.tipe}</b></p>
                <p>${last.tanggal} ${last.jam}</p>
                <p>${Math.round(last.jarak)} meter</p>
            `);

        }else{

            setHTML("ui-last-absen",
                "<p>Belum ada riwayat absensi</p>"
            );

        }

    }
    catch(err){

        console.error(err);
        showToast("Gagal memuat dashboard",true);

    }
    finally{

        hideLoader();

    }

}

function getTodayStatus(riwayat) {

    const today = new Date().toLocaleDateString("id-ID");

    const todayData = riwayat.filter(r =>
        r.timestamp.includes(today)
    );

    const masuk = todayData.find(r => r.tipe === "Masuk");
    const pulang = todayData.find(r => r.tipe === "Pulang");

    return {
        status: todayData.length ? "Hadir" : "Belum Absen",
        jamMasuk: masuk ? masuk.timestamp : "-",
        jamPulang: pulang ? pulang.timestamp : "-"
    };
}

function getMonthlySummary(riwayat) {

    const month = new Date().getMonth();

    const thisMonth = riwayat.filter(r => {
        const d = parseDate(r.timestamp);
        return d.getMonth() === month;
    });

    const hariMasuk = new Set(
        thisMonth
            .filter(r => r.tipe === "Masuk")
            .map(r => r.timestamp.split(" ")[0])
    );

    return {
        totalHadir: hariMasuk.size,
        totalMasuk: thisMonth.filter(r => r.tipe === "Masuk").length,
        totalPulang: thisMonth.filter(r => r.tipe === "Pulang").length
    };
}

function getAttendanceProgress(totalHadir) {

    const targetHariKerja = 22; // bisa kamu ganti nanti dari GAS

    const percent = (totalHadir / targetHariKerja) * 100;

    return Math.min(percent, 100);
}

//Riwayat Absen Bentuk CARD
// function renderStudentHistoryCards(riwayat) {
//     const container = document.getElementById("student-history-list");
//     if (!container) return;

//     const monthEl = document.getElementById("student-history-month");
//     const yearEl = document.getElementById("student-history-year");

//     const selectedMonth = Number(monthEl?.value || (new Date().getMonth() + 1));
//     const selectedYear = Number(yearEl?.value || new Date().getFullYear());

//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const currentYear = now.getFullYear();

//     let jumlahHari = new Date(selectedYear, selectedMonth, 0).getDate();

//     if (selectedMonth === currentMonth && selectedYear === currentYear) {
//         jumlahHari = now.getDate();
//     }

//     const grouped = {};

//     (riwayat || []).forEach(r => {
//         const tanggalText = r.timestamp?.split(" ")[0];
//         if (!tanggalText) return;

//         const [day, month, year] = tanggalText.split("/").map(Number);

//         if (month !== selectedMonth || year !== selectedYear) return;

//         if (!grouped[day]) {
//             grouped[day] = {
//                 masuk: null,
//                 pulang: null
//             };
//         }

//         if (r.tipe === "Masuk") grouped[day].masuk = r;
//         if (r.tipe === "Pulang") grouped[day].pulang = r;
//     });

//     let html = "";

//     for (let day = jumlahHari; day >= 1; day--) {
//         const masuk = grouped[day]?.masuk;
//         const pulang = grouped[day]?.pulang;

//         html += `
//             <div class="history-card">
//                 <div class="history-date">
//                     <div class="history-weekday">
//                         ${getDayName(day, selectedMonth, selectedYear)}
//                     </div>
//                     <div class="day">
//                         ${day}
//                     </div>
//                     <div class="month">
//                         ${getMonthShort(selectedMonth)} ${selectedYear}
//                     </div>
//                 </div>

//                 <div class="history-action">
//                     <div class="history-badge in">Scan In</div>
//                     <div class="history-time">
//                         ${masuk ? masuk.timestamp.split(" ")[1] : "00:00:00"}
//                     </div>
//                     <div class="history-note">
//                         ${masuk ? `${Math.round(masuk.jarak || 0)} meter` : "Belum absen"}
//                     </div>
//                 </div>

//                 <div class="history-action">
//                     <div class="history-badge out">
//                         Scan Out
//                     </div>
//                     <div class="history-time">
//                         ${pulang ? pulang.timestamp.split(" ")[1] : "00:00:00"}
//                     </div>
//                     <div class="history-note">
//                         ${pulang
//                             ? `${Math.round(pulang.jarak || 0)} meter`
//                             : "Belum absen"}
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     container.innerHTML = html;
// }

function getDayName(day, month, year) {
    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    return days[new Date(year, month - 1, day).getDay()];
}

function getMonthShort(month) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    return months[month - 1] || "";
}

// function initStudentHistoryFilter(force = false) {

//     const now = new Date();

//     const monthEl = document.getElementById("student-history-month");
//     const yearEl = document.getElementById("student-history-year");

//     if (!monthEl || !yearEl) return;

//     if (force || !monthEl.value) {
//         monthEl.value = now.getMonth() + 1;
//     }

//     if (force || !yearEl.value) {
//         yearEl.value = now.getFullYear();
//     }

// }
function initStudentHistoryFilter() {

    const now = new Date();

    const monthEl = document.getElementById("student-history-month");
    const yearEl = document.getElementById("student-history-year");

    if (!monthEl || !yearEl) return;

    monthEl.value = String(now.getMonth() + 1);
    yearEl.value = String(now.getFullYear());

}

//KONFIRMASI KEHADIRAN

function openStatusCamera() {

    document
        .getElementById("status-camera-input")
        .click();

}

function openStatusGallery() {

    document
        .getElementById("status-gallery-input")
        .click();

}

function initStatusHarianForm() {
    const tanggalEl = document.getElementById("status-tanggal");

    if (tanggalEl) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        tanggalEl.value = `${yyyy}-${mm}-${dd}`;
    }
}

//Compress
async function compressImage(file, options = {}) {
    const {
        maxWidth = 1280,
        quality = 0.75
    } = options;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        quality
                    )
                );
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

//PREVIEW
async function previewStatusPhoto(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {

        showToast(
            "Ukuran maksimal 10 MB",
            true
        );

        return;

    }

    showLoader("Memproses foto...");

    try {

        statusPhoto = await compressImage(file, {
            maxWidth: 1280,
            quality: 0.75
        });

        const preview =
            document.getElementById(
                "status-photo-preview"
            );

        preview.src = statusPhoto;

        preview.classList.remove("hidden-page");

    }
    catch(err){

        console.error(err);

        showToast(
            "Gagal membaca gambar",
            true
        );

    }
    finally{

        hideLoader();

    }

}

async function submitStatusHarian() {
    try {
        const user = AppState.currentUser;
        if (!user) return;

        const tanggal = document.getElementById("status-tanggal")?.value;
        const status = document.getElementById("status-tipe")?.value;
        const keterangan = document.getElementById("status-keterangan")?.value;

        if (!tanggal) {
            showToast("Tanggal wajib diisi", true);
            return;
        }

        if (!status) {
            showToast("Pilih status terlebih dahulu", true);
            return;
        }
        // ===============================
        // VALIDASI FOTO BUKTI
        // ===============================
        const wajibFoto = [
            "Sakit",
            "Izin"
        ];

        if (
            wajibFoto.includes(status) &&
            !statusPhoto
        ) {
            showToast("Silakan upload foto bukti terlebih dahulu.", true);
            return;
        }

        showLoader("Mengirim konfirmasi...");

        const res = await ApiService.call({
            action: "submit_status_harian",
            tanggal,
            username: user.username,
            nama: user.nama,
            kategori: user.kategori,
            lokasiId: user.lokasiId,
            status,
            keterangan,
            fotoBase64: statusPhoto
        });

        if (res.status === "error") {
            showToast(res.message, true);
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Konfirmasi kehadiran berhasil dikirim.",
            timer: 1600,
            showConfirmButton: false
        });

        // document.getElementById("status-tipe").value = "";
        // document.getElementById("status-keterangan").value = "";
        resetStatusHarianForm();

    } catch (error) {
        console.error(error);
        showToast("Gagal mengirim konfirmasi", true);

    } finally {
        hideLoader();
    }
}

function resetStatusHarianForm() {

    statusPhoto = null;

    document.getElementById("status-tipe").value = "";

    document.getElementById("status-keterangan").value = "";

    document.getElementById("status-camera-input").value = "";

    document.getElementById("status-gallery-input").value = "";

    const preview =
        document.getElementById("status-photo-preview");

    preview.src = "";

    preview.classList.add("hidden-page");

}