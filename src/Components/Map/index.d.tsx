/*
  Pauly
  Andrew Mainella
  November 9 2023
  Map.tsx
  This is a placeholder file and should not be complied on production.
*/

interface MapProps {
  proximity: number;
  onSetSelectedPositionIn: (item: { lat: number; lng: number }) => void;
  width: number;
  height: number;
}

declare const Map: React.FC<MapProps>;

export = Map;
