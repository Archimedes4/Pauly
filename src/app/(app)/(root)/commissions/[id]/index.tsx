import React from 'react';
import { Redirect, useGlobalSearchParams } from 'expo-router';
import { CommissionsMain } from '..';

export default function CommissionsID() {
  const { id } = useGlobalSearchParams();
  if (typeof id === 'string') {
    console.log(id)
    return <CommissionsMain commissionId={id} />;
  }
  console.log("redirect")
  return <Redirect href="/commissions" />;
}
