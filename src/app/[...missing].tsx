/*
  Pauly
  Andrew Mainella
  23 November 2023
  [...missing.tsx]
*/
import { useFocusEffect, useRouter } from 'expo-router'

export default function Missing() {
  const router = useRouter();
  useFocusEffect(() => {
    try {
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  });
  return (
    null
  )
}