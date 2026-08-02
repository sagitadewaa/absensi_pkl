// ===============================
// API SERVICE
// ===============================

const ApiService = {

    async call(payload) {

    if (CONFIG.IS_PREVIEW) {
        return this.mock(payload);
    }

    try {

        const response = await fetch(CONFIG.GAS_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        console.log("=== RAW RESPONSE ===");
        console.log(text);

        const result = JSON.parse(text);

        if (result.status === "success") {
            return result.data;
        }

        throw new Error(result.message);

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

},

    async mock(payload) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const action = payload.action;

                try {

                    switch (action) {

                        // ===============================
                        // LOGIN
                        // ===============================
                        case "login":
                            const user = DummyData.users.find(
                                u =>
                                    u.username === payload.username &&
                                    u.password === payload.password
                            );

                            if (!user) {
                                throw new Error(
                                    "Username atau password salah"
                                );
                            }

                            resolve({
                                username: user.username,
                                role: user.role,
                                nama: user.nama,
                                kategori: user.kategori,
                                lokasiId: user.lokasiId || "L001"
                            });
                            break;

                        // ===============================
                        // SETTINGS GLOBAL
                        // ===============================
                        case "get_settings":
                            resolve(AppState.appSettings);
                            break;

                        case "save_settings":
                            AppState.appSettings = {
                                lat: parseFloat(payload.lat),
                                lng: parseFloat(payload.lng),
                                radius: parseInt(payload.radius)
                            };

                            resolve("Pengaturan tersimpan");
                            break;

                        // ===============================
                        // LOKASI USER PKL
                        // ===============================
                        case "get_user_location":
                            resolve({
                                lokasiId: payload.lokasiId,
                                namaIndustri: "Demo Lokasi PKL",
                                lat: -8.650123,
                                lng: 115.216789,
                                radius: 100
                            });
                            break;

                        // ===============================
                        // USERS
                        // ===============================
                        case "get_users":
                            resolve(
                                DummyData.users.filter(
                                    u => u.role === "peserta"
                                )
                            );
                            break;

                        case "save_user":
                            DummyData.users.push({
                                username: payload.username,
                                password: payload.password,
                                role: "peserta",
                                nama: payload.nama,
                                kategori: payload.kategori,
                                lokasiId: payload.lokasiId || "L001"
                            });

                            resolve("Peserta ditambahkan");
                            break;

                        case "delete_user":
                            DummyData.users =
                                DummyData.users.filter(
                                    u =>
                                        u.username !== payload.username
                                );

                            resolve("Peserta dihapus");
                            break;

                        // ===============================
                        // RIWAYAT
                        // ===============================
                        case "get_riwayat":
                            if (payload.role === "admin") {
                                resolve(DummyData.riwayat);
                            } else {
                                resolve(
                                    DummyData.riwayat.filter(
                                        r =>
                                            r.username ===
                                            payload.username
                                    )
                                );
                            }
                            break;

                        // ===============================
                        // SUBMIT ABSENSI
                        // ===============================
                        case "submit_absen":
                            const now = new Date();

                            const newData = {
                                id: "ABS-" + Date.now(),
                                timestamp: now.toLocaleString("id-ID"),
                                username: payload.username,
                                nama: payload.nama,
                                kategori: payload.kategori,
                                lokasiId: payload.lokasiId,
                                tipe: payload.tipe,
                                fotoUrl: "dummy.jpg",
                                lat: payload.lat,
                                lng: payload.lng,
                                jarak: payload.jarak
                            };

                            DummyData.riwayat.unshift(newData);

                            resolve({
                                status: "success",
                                message: "Absensi berhasil"
                            });

                            break;

                        default:
                            throw new Error(
                                "Action tidak dikenali"
                            );
                    }

                } catch (err) {
                    reject(err);
                }

            }, 300);
        });
    }

};