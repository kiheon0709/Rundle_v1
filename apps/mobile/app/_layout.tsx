import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Rundle' }} />
      <Stack.Screen
        name="auth/login"
        options={{
          title: '로그인',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: '회원가입',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
