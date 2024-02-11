/*
  Pauly
  Andrew Mainella
  20 January 2024
  rooms/[id].tsx
  Screen for editing room data. Apart of Pauly classes.
*/
import React from 'react';
import { GovermentRoomsUpdate } from './create';

export default function GovernmentRoomsEdit() {
  return <GovermentRoomsUpdate isCreate={false} />;
}
