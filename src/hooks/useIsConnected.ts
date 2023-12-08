/*
  Pauly
  Andrew Mainella
  useIsConnected
  holds the connection api, tests every 5 seconds to see if user is connected to a network.
  If user is connected to network returns true otherwise false.
*/
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
  return isConnected
}