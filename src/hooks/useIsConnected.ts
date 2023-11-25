import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export default function useIsConnected() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  async function checkIfConnected() {
    const result = await Network.getNetworkStateAsync();
    if (result.isInternetReachable) {
      // Internet reachable
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }

  //connection hook
  useEffect(() => {
    checkIfConnected();
    const intervalId = setInterval(() => {
      // assign interval to a variable to clear it.
      checkIfConnected();
    }, 5000); // 5s

    return () => clearInterval(intervalId);
  }, []);
  console.log('connected:', isConnected)
  return isConnected
}