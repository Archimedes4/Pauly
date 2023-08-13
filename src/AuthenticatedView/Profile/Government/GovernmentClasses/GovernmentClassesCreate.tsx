import { View, Text, TextInput, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';
import { useMsal } from '@azure/msal-react';

declare global {
    type microsoftUserType = {
        id: string
        displayName: string
    }
}

export default function GovernmentClassesCreate() {
    const pageData = useContext(accessTokenContent);
    const { instance, accounts } = useMsal();
    const [teacherNameSearch, setTeacherNameSearch] = useState<string>("")
    const [teachers, setTeachers] = useState<microsoftUserType[]>([])
    const [selectedTeacher, setSelectedTeacher] = useState<microsoftUserType | undefined>(undefined)
    async function getUsers() {
        //TO DO on deploy ment make only teachers instead of searching users search group
        const result = await callMsGraph(pageData.accessToken, (teacherNameSearch === "") ? "https://graph.microsoft.com/v1.0/users/":"https://graph.microsoft.com/v1.0/users/?$filter=startswith(displayName,'" + encodeURI(teacherNameSearch) + "')", instance, accounts)
        if (result.ok){
            const data = await result.json()
            console.log(data)
            //TO DO check if this is safe
            if (data["value"].length !== undefined){
                var newTeachers: microsoftUserType[] = []
                for (let index = 0; index < data["value"].length; index++){
                    newTeachers.push({
                        id: data["value"][index]["id"],
                        displayName: data["value"][index]["displayName"]
                    })
                }
                setTeachers(newTeachers)
            }  else {
                //TO DO handle error this shouldn't be possible and most likly means that pauly is in need of an update
            }
        } else {
            //TO DO handle error
            console.log(result)
        }
    }
    async function getRootClasses() {
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/800202d8-1f51-4df4-ac39-08da7357ca89/items?expand=field", instance, accounts)
        if (result.ok){
            const data = await result.json()
            console.log(data)
        } else {
            //TO DO failed to get root classes
            console.log("Failed to get root classes")
        }
    }
    useEffect(() => {
        getUsers()
    }, [teacherNameSearch])
    
  return (
    <View>
        <Text>GovernmentClassesCreate</Text>
        <View>
            <Text>Teacher Name</Text>
            <Text>Selected Teacher: {(selectedTeacher !== undefined) ? selectedTeacher.displayName:"NO TEACHER HAS BEEN SELECTED!"}</Text>
            <TextInput value={teacherNameSearch} onChangeText={(e) => {setTeacherNameSearch(e)}}/>
            {teachers.map((Teacher) => (
                <Pressable onPress={() => {setSelectedTeacher(Teacher)}}>
                    <Text>{Teacher.displayName}</Text>
                </Pressable>
            ))
            }

        </View>
    </View>
  )
}