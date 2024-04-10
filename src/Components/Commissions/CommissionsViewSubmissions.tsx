import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import getSubmissions from '@src/utils/commissions/getSubmissions'
import store from '@src/redux/store'
import { loadingStateEnum } from '@src/constants'
import SubmissionStatusIcon from './SubmissionStatusIcon'

export default function CommissionsViewSubmissions({
  commissionId
}:{
  commissionId: string
}) {
  const [submissionState, setSubmissionState] = useState<loadingStateEnum>(loadingStateEnum.loading);
  const [submissions, setSubmissions] = useState<submissionType[]>([])
  async function loadSubmissions() {
    const result = await getSubmissions({
      url: `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${
        store.getState().paulyList.commissionSubmissionsListId
      }/items?expand=fields&$select=id&$filter=fields/commissionId%20eq%20'${commissionId}'&fields/userId%20eq%20'${store.getState().microsoftProfileData.id}'`
    })
    if (result.result === loadingStateEnum.success) {
      setSubmissions(result.data)
    }
    setSubmissionState(result.result)
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  if (submissionState === loadingStateEnum.loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    )
  }
  if (submissionState === loadingStateEnum.failed) {
    <View>
      <Text>Something went wrong and Pauly couldn’t get your submissions.</Text>
    </View>
  }
  return (
    <FlatList
      data={submissions}
      renderItem={(submission) => (
        <View style={{flexDirection: 'row', margin: 2}}>
          <Text>{new Date(submission.item.submissionTime).toLocaleString('en-us', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          })}
          </Text>
          <SubmissionStatusIcon submission={submission.item}/>
        </View>
      )}
      ListEmptyComponent={() => (
        <View>
          <Text>You have not made any submissions.</Text>
        </View>
      )}
    />
  )
}