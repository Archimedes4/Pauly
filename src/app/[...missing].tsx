/*
  Pauly
  Andrew Mainella
  23 November 2023
  [...missing.tsx]
*/
import { useFocusEffect, useRouter } from 'expo-router'
import { Platform } from 'react-native';

export default function Missing() {
  if (Platform.OS === 'web') {
    const router = useRouter();
    useFocusEffect(() => {
      try {
        router.push('/');
      } catch (error) {
        console.error(error);
      }
    });
  }
  return (
    null
  )
}