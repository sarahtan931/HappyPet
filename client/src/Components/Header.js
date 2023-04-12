import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useFonts } from "expo-font";
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Header(props) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });

    if (fontsLoaded) {
        return (
            <View>
                <View style={styles.top}></View>
                <View style={styles.header}>
                    <View style={styles.flexView}>
                        <TouchableOpacity onPress={() =>
                            props.navigation.goBack()
                        }>
                            <FontAwesomeIcon icon={faChevronLeft} style={styles.backButton} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.flexView} onPress={() =>
                            props.navigation.navigate('Home')
                        }>
                        <Text style={styles.titleText}>HappyPet</Text>
                    </TouchableOpacity>
                    <View style={styles.flexView}></View>
                </View>
            </View>
        )
    }
    return (<View></View>)
}


const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#8EA604",
        flex: 1
    },
    header: {
        width: "100%",
        height: 43,
        backgroundColor: "#8EA604",
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    top: {
        height: 53,
        backgroundColor: "#8EA604",
    },
    titleText: {
        color: 'white',
        fontSize: 26,
        margin: "auto",
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Medium',
    },
    backButton: {
        color: 'white',
        fontSize: 10,
        marginLeft: 8,
    },
    flexView: {
        flex: 1
    }
});
