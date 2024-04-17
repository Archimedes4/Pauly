import { View } from 'react-native';
import React from 'react';
import MapView from 'react-native-maps';

export default function Map({
  proximity,
  onSetSelectedPositionIn,
  width,
  height,
  coordinateLat,
  coordinateLng,
}: MapProps) {
  return (
    <View>
      <MapView
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
}
