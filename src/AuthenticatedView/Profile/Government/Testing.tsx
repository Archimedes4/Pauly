import { View, Text, Button, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function Testing() {
    const [graphUrl, setGraphUrl] = useState<string>("")
    return (
        <View>
            <Text>Testing</Text>
            <TextInput />
            <Button title="Test" />
        </View>
    )
}