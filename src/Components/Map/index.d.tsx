/*
  Pauly
  Andrew Mainella
  November 9 2023
  Map.tsx
  This is a placeholder file and should not be complied on production.
*/

interface SXGXmlProps {
  proximity: number;
  onSetSelectedPositionIn: (item: { lat: number; lng: number }) => void;
  width: number;
  height: number;
}

declare const SVGXml: React.FC<SXGXmlProps>

export = SVGXml