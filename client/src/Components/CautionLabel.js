import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useFonts } from "expo-font";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function CautionLabel() {
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
            <FontAwesomeIcon style={styles.iconText} icon={faExclamationTriangle}></FontAwesomeIcon>
            <Text style={styles.labelText}>Caution</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    labelBackground: {
        backgroundColor: '#FFF1C0',
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
        color:'#FFC700',
        fontSize: 20,
    }
})