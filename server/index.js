require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require("groq-sdk");

const app = express();
const port = 5000;

// Middleware agar HP bisa akses server laptop
app.use(cors());
app.use(express.json());

// --- KONFIGURASI GROQ ---
// Menggunakan API Key yang ada di file lama Anda
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Setup folder upload sementara
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Konfigurasi penyimpanan file audio
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      // Simpan dengan ekstensi asli atau .m4a (format standar HP)
      const ext = path.extname(file.originalname) || '.m4a';
      cb(null, 'rekaman-' + Date.now() + ext)
    }
});
const upload = multer({ storage: storage });

// --- 1. RUMUS KEMIRIPAN (LEVENSHTEIN) ---
const calculateSimilarity = (s1, s2) => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    const editDistance = (s1, s2) => {
      s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
      const costs = new Array();
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i == 0) costs[j] = j;
          else {
            if (j > 0) {
              let newValue = costs[j - 1];
              if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    }
    return (longerLength - editDistance(longer, shorter)) / longerLength;
};

// --- 2. NORMALIZER ARAB ---
const normalizeArabic = (text) => {
    if (!text) return "";
    let clean = text
        .replace(/[\u0640\u0653\u0610-\u061A\u064B-\u0652\u0670\u06D6-\u06ED]/g, '') 
        .replace(/[أإآٱا]/g, '') 
        .replace(/(ة)/g, 'ه')       
        .replace(/(ى)/g, 'ي')       
        .replace(/(ؤ)/g, 'و')       
        .replace(/(ئ)/g, 'ي')
        .replace(/[^ا-ي]/g, '') 
        .trim();
    return clean;
};

// --- ENDPOINT UTAMA: CEK HAFALAN ---
app.post('/api/cek-hafalan', upload.single('audio'), async (req, res) => {
    let audioPath = null;

    try {
        if (!req.file) {
            console.log("❌ File audio tidak diterima server.");
            return res.status(400).json({ error: 'No Audio uploaded' });
        }
        
        const ayatTarget = req.body.ayatTarget || "";
        // Ambil potongan awal ayat sebagai context untuk AI
        const contextPrompt = ayatTarget.substring(0, 150); 
        
        console.log(`\n🎤 Menerima Audio: ${req.file.filename}`);
        console.log(`🎯 Target Hafalan: ${contextPrompt}...`);

        audioPath = req.file.path;

        // --- KIRIM KE GROQ (Whisper) ---
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-large-v3",
            language: "ar", 
            response_format: "json",
            prompt: contextPrompt // Teknik Priming agar AI "bias" ke ayat ini
        });

        const userText = transcription.text;
        console.log(`🗣️  Hasil Dengar AI: ${userText}`);

        // --- BANDINGKAN HASIL ---
        const userClean = normalizeArabic(userText);
        const targetClean = normalizeArabic(ayatTarget);

        let isCorrect = userClean.includes(targetClean);
        let similarity = 0;

        if (!isCorrect) {
            similarity = calculateSimilarity(userClean, targetClean);
            console.log(`📊 Skor Kemiripan: ${(similarity * 100).toFixed(2)}%`);
            
            // Toleransi kemiripan 75%
            if (similarity >= 0.75) {
                isCorrect = true;
            }
        }

        console.log(`✅ Status Akhir: ${isCorrect ? "BENAR" : "SALAH"}`);

        // Hapus file audio setelah selesai agar storage tidak penuh
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        res.json({
            isCorrect: isCorrect,
            skor: (similarity * 100).toFixed(0),
            feedback: isCorrect ? "MasyaAllah, Lancar!" : `Kurang tepat, coba lagi ya. (Mirip ${(similarity*100).toFixed(0)}%)`,
            transkripUser: userText
        });

    } catch (error) {
        console.error("❌ Error Server:", error);
        // Hapus file jika error
        if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        res.status(500).json({ isCorrect: false, feedback: "Gagal memproses suara." });
    }
});

// Jalankan di 0.0.0.0 agar bisa diakses network lokal (HP)
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server Marifah SIAP!`);
    console.log(`👉 Akses dari HP via IP Laptop: http:///192.168.18.48:${port}/api/cek-hafalan`);
});