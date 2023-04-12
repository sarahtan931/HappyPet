import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Header from './Header'

export default function DoesNotExist(props) {
  return (
    <View>
      <Header navigation={props.navigation}></Header>
      <Text style={styles.noInfo}>Oops! We do not have this product's UPC in our catalog yet. Try searching by name instead. Sorry for the inconvenience!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    noInfo:{
        fontSize: 16,
        fontFamily: 'Poppins-Light',
        marginTop: 10,
        textAlign: 'center'
    }
})
