import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from '@react-google-maps/api';

const center = {
  lat: 49.85663823299096,
  lng: -97.22659526509193,
};

type LatLngLiteral = google.maps.LatLngLiteral;

export default function MapWeb({
  proximity,
  onSetSelectedPositionIn,
  width,
  height,
}: {
  proximity: number;
  onSetSelectedPositionIn: (item: { lat: number; lng: number }) => void;
  width: number;
  height: number;
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAltyD_LL0kbe84kyMRxgRmoH74Spi5rvw', // TO DO put this into a loval env
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

  // const [map, setMap] = React.useState(null)

  // const onLoad = React.useCallback(function callback(map) {
  //   // This is just an example of getting and using the map instance!!! don't just blindly copy!
  //   const bounds = new window.google.maps.LatLngBounds(center);
  //   map.fitBounds(bounds);

  //   setMap(map)
  // }, [])

  // const onUnmount = React.useCallback(function callback(map) {
  //   setMap(null)
  // }, [])

  return isLoaded ? (
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
          setSelectedPosition({ lat: ev.latLng!.lat(), lng: ev.latLng!.lng() });
        }}
      >
        {/* Child components, such as markers, info windows, etc. */}
        {selectedPosition && <Marker position={selectedPosition} />}
        {selectedPosition && (
          <Circle center={selectedPosition} radius={proximity} />
        )}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
}
