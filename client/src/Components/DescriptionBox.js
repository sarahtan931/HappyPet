import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useFonts } from "expo-font";
import { ScrollView } from 'react-native-gesture-handler';

export default function DescriptionBox(props) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });

    if (!fontsLoaded) {
        return (<View></View>)
    }

    let contentStyle = styles.contentText;
    if (props.title == "Ingredients"){
        contentStyle = styles.contentTextIngredients;
    }

    return (
        <View style={styles.background}>
            <View style={styles.titleBox}>
                <Text style={styles.labelText}>{props.title}</Text>
            </View>
            <ScrollView style={styles.contentBackground}>
                <Text style={contentStyle}>
                    {props.content}
                    </Text>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    background: {
        backgroundColor: '#D8DDB8',
        height: 350,
        width: '90%',
        borderRadius: 20,
        display: 'flex',
        margin: 'auto',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 10,
    },
    contentBackground: {
        backgroundColor: 'white',
        borderRadius: 20,
        height: 260,
        marginBottom: 20,
        padding: 10,
        width: '90%',
        overflow: 'scroll',
    },
    contentTextIngredients: {
        fontSize: 16,
        fontFamily: 'Poppins-Light',
        textTransform: 'capitalize',
    },
    contentText:{    
        fontSize: 16,
        fontFamily: 'Poppins-Light'
    },
    titleBox: {
        marginVertical: 20,
    },
    labelText: {
        color: 'black',
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        textTransform: 'capitalize',
    },
})