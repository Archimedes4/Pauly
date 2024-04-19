import { View } from 'react-native';
import React from 'react';
import { Colors } from '@src/constants';
import { ApprovedIcon, DeniedIcon, WarningIcon } from '../Icons';

export default function SubmissionStatusIcon({
  submission,
}: {
  submission: submissionType;
}) {
  return (
    <View style={{ margin: 'auto', marginLeft: 'auto', marginRight: 0 }}>
      {submission.approved ? (
        <View>
          <ApprovedIcon width={14} height={14} />
        </View>
      ) : null}
      {submission.reviewed && !submission.approved ? (
        <View style={{ margin: 'auto', marginRight: 0 }}>
          <DeniedIcon width={14} height={14} />
        </View>
      ) : null}
      {!submission.approved && !submission.reviewed ? (
        <View
          style={{
            margin: 'auto',
            marginLeft: 'auto',
            marginRight: 0,
            borderRadius: 100,
            backgroundColor: Colors.danger,
          }}
        >
          <WarningIcon width={14} height={14} outlineColor={Colors.white} />
        </View>
      ) : null}
    </View>
  );
}
