import * as Location from 'expo-location';
import { getDistance } from "geolib";
import { locationStateEnum } from '../../types';

export default async function getUsersLocation(commission: commissionType): Promise<{result: locationStateEnum, data?: locationCoords}> {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return {result: locationStateEnum.permissionDenied}
  }

  let location = await Location.getCurrentPositionAsync();
  if (!location.mocked) {
    if (commission.coordinateLat !== undefined && commission.coordinateLng !== undefined && commission.proximity !== undefined) {
      const prox = getDistance({lat: location.coords.latitude, lng: location.coords.longitude}, {
        latitude: commission?.coordinateLat,
        longitude: commission?.coordinateLng
      })
      if (prox <= commission.proximity) {
        return {result: locationStateEnum.success, data: {
          latCoordinate: location.coords.latitude,
          lngCoordinate: location.coords.longitude
        }}
      } else {
        return {result: locationStateEnum.notCloseEnough}
      }
      
    }
  } else {
    return {result: locationStateEnum.mockedLocation}
  }
  return {result: locationStateEnum.notStarted}
}