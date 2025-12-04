// services/api.js

// GANTI INI DENGAN IP LAPTOP KAMU (Cek pakai 'ipconfig' di CMD)
// Jangan pakai localhost, HP gak akan bisa akses!
const API_URL = "http://192.168.18.48:5000/api"; 

export const cekHafalanApi = async (audioUri, ayatTarget) => {
  try {
    const formData = new FormData();
    
    // Siapkan file audio untuk dikirim
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a', // Format default iOS/Expo
      name: 'recording.m4a',
    });

    // Kirim teks ayat target (untuk contekan AI)
    formData.append('ayatTarget', ayatTarget);

    console.log("🚀 Mengirim ke Backend:", API_URL);

    const response = await fetch(`${API_URL}/cek-hafalan`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("❌ Error API:", error);
    return { isCorrect: false, feedback: "Gagal terhubung ke server." };
  }
};