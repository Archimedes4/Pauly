/*
  Pauly
  Andrew Mainella
  November 9 2023
  SVGXml.native.tsx
  Renders svg given width and height for native devices. Uses react-native-svg
*/
import React from 'react';
import { SvgXml } from 'react-native-svg';

export default function SVGXml({
  xml,
  height,
  width,
}:{
  xml: string;
  width: number;
  height: number;
}) {
  return <SvgXml style={{ height, width }} xml={xml} />;
}
