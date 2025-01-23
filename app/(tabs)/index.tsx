import { View, Text } from 'react-native'
import React from 'react'
import className from 'twrnc'//for using tailwindcss
import Tracks from '@/components/Tracks'

const index = () => {
  return (
    <View style={className`flex-1 gap-2`}>      
              <Tracks/>
    </View>
  )
}

export default index