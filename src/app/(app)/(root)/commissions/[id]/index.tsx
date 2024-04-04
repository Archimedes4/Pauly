import React from 'react';
import { Redirect, useGlobalSearchParams } from 'expo-router';
import { CommissionsMain } from '..';

export default function CommissionsID() {
  const { id } = useGlobalSearchParams();
  if (typeof id === 'string') {
    return <CommissionsMain commissionId={id} />;
  }
  return <Redirect href="/commissions" />;
}
