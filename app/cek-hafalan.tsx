import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { cekHafalanApi } from '../services/api';

export default function CekHafalanScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('idle'); // idle, recording, processing, result
  const [feedback, setFeedback] = useState('');

  // 1. Mulai Rekam
  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( 
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  // 2. Stop Rekam & Kirim
  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(null);
    setStatus('processing');
    
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI(); 
    console.log('Recording stored at', uri);

    if (uri) {
      // Teks Target Dummy (Nanti ambil dari database)
      const ayatTarget = "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ"; 
      
      const result = await cekHafalanApi(uri, ayatTarget);
      
      setFeedback(result.feedback);
      setStatus('result');
    }
  }

  return (
    <View className="flex-1 bg-primary justify-center items-center p-6">
      <Text className="text-white text-2xl font-bold mb-10 text-center">
        Tes Hafalan Al-Fatihah: 2
      </Text>

      {/* Area Status / Feedback */}
      <View className="bg-card w-full p-6 rounded-2xl mb-10 min-h-[100px] justify-center items-center">
        {status === 'processing' ? (
          <View className="items-center">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 mt-4">Sedang mengoreksi...</Text>
          </View>
        ) : (
          <Text className={`text-xl text-center ${status === 'result' ? 'text-accent font-bold' : 'text-slate-400'}`}>
            {feedback || "Tekan tombol untuk mulai"}
          </Text>
        )}
      </View>

      {/* Tombol Mic Besar */}
      <TouchableOpacity
        onPress={recording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full justify-center items-center shadow-lg border-4 ${
          recording ? 'bg-red-500 border-red-300' : 'bg-accent border-emerald-300'
        }`}
      >
        <View className={`w-8 h-8 ${recording ? 'bg-white rounded-sm' : 'bg-white rounded-full'}`} />
      </TouchableOpacity>
      
      <Text className="text-slate-500 mt-6">
        {recording ? "Ketuk untuk Kirim" : "Ketuk untuk Bicara"}
      </Text>
    </View>
  );
}