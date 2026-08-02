window.AppState = {
    currentUser: null,
    appSettings: null,

    // target lokasi absensi siswa
    currentUserLocation: null,
    monitoringMode: "wali",
    historyMode: "wali",
    accessMode: "siswa",
    approvalMode: "wali", // 👈 tambah ini
    masterSiswa: [],
    masterSiswaFiltered: [],
    

    // camera
    cameraStream: null,
    currentPhotoBase64: null,

    // posisi GPS realtime user
    currentLocation: null,

    // cache
    riwayat: []
};