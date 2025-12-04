import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    // Tambahkan style={{ flex: 1, backgroundColor: 'black' }} buat maksa hitam
    <View className="flex-1 items-center justify-center bg-primary p-6" style={{ backgroundColor: '#0F172A' }}>
      
      {/* Coba ganti warna teks jadi merah biar kelihatan */}
      <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>
        Ma'rifah Test
      </Text>
      
      <Text className="text-slate-400 text-lg mb-10 text-center" style={{ color: '#94a3b8' }}>
        Belajar Ngaji & Hafalan Pintar dengan AI
      </Text>

      <Link href="/cek-hafalan" asChild>
        <TouchableOpacity className="bg-accent px-8 py-4 rounded-full mt-5" style={{ backgroundColor: '#10B981' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🎤 Coba Tes Hafalan
          </Text>
        </TouchableOpacity>
      </Link>
      
    </View>
  );
}