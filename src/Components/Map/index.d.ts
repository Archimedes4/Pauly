/*
  Pauly
  Andrew Mainella
  November 9 2023
  Map.tsx
  This is a placeholder file and should not be complied on production.
*/

declare global {
  interface MapProps {
    proximity: number;
    onSetSelectedPositionIn: (item: { lat: number; lng: number }) => void;
    width: number;
    height: number;
  }
}

declare const Map: ({
  proximity,
  onSetSelectedPositionIn,
  width,
  height,
}: MapProps) => React.JSX.Element;

export = Map;
