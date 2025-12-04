import { Stack } from 'expo-router';
import { StatusBar, View } from 'react-native';

// INI KUNCI NYA: Import style global di sini
import "../global.css";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />
      <Stack 
        screenOptions={{
          headerShown: false, // Kita sembunyikan header bawaan biar full design kita
          contentStyle: { backgroundColor: '#0F172A' } // Paksa background gelap lewat style biasa (backup kalau tailwind macet)
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="cek-hafalan" />
      </Stack>
    </View>
  );
}