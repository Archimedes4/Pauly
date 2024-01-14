import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from '@react-google-maps/api';
import { Text } from 'react-native';

const center = {
  lat: 49.85663823299096,
  lng: -97.22659526509193,
};

type LatLngLiteral = google.maps.LatLngLiteral;

export default function Map({
  proximity,
  onSetSelectedPositionIn,
  width,
  height,
}: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAO7Ee-EXgNl4Karxfg1q9RY68XmCich_k', // TO DO put this into a loval env
  });
  const [selectedPosition, setSelectedPosition] = useState<LatLngLiteral>();
  const [containerStyle, setContainerStyle] = useState<{
    width: string;
    height: string;
  }>({
    width: '400px',
    height: '400px',
  });

  useEffect(() => {
    setContainerStyle({
      width: `${width.toString()}px`,
      height: `${height.toString()}px`,
    });
  }, [width, height]);

  if (isLoaded) {
    return (
      <div style={{ width, height }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onClick={ev => {
            onSetSelectedPositionIn({
              lat: ev.latLng!.lat(),
              lng: ev.latLng!.lng(),
            });
            setSelectedPosition({
              lat: ev.latLng!.lat(),
              lng: ev.latLng!.lng(),
            });
          }}
        >
          {/* Child components, such as markers, info windows, etc. */}
          {selectedPosition && <Marker position={selectedPosition} />}
          {selectedPosition && (
            <Circle center={selectedPosition} radius={proximity} />
          )}
        </GoogleMap>
      </div>
    );
  }
  return <Text>Loading</Text>;
}
