import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useFonts } from "expo-font";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

export default function NotSafeLabel() {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });

    if (!fontsLoaded) {
        return (<View></View>)
    }
    return (
        <View style={styles.labelBackground}>
            <FontAwesomeIcon style={styles.iconText} icon={faX}></FontAwesomeIcon>
            <Text style={styles.labelText}>Not Safe</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    labelBackground: {
        backgroundColor: '#FFD4DF',
        height: 40,
        width: '40%',
        borderRadius: 15,
        display: 'flex',
        margin: 'auto',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
    },
    labelText: {
        color: 'black',
        fontSize: 20,
        margin: "auto",
        fontFamily: 'Poppins-Light',
        textTransform: 'capitalize',
    },
    iconText: {
        marginRight: 15,
        color:'red',
        fontSize: 20,
    }
})