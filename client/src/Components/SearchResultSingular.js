import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { useFonts } from "expo-font";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SearchResultSingular(props) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });

    const name = props.name;
    const url = props.url;
    const searchInput = props.searchInput;
    const searchType = props.searchType;
    const navigation = props.navigation;
    if (fontsLoaded) {
        const params = {
            name: name, 
            url: props.url,
            navigation: navigation,
            id: props.id,
            isIngredient: props.isIngredient
        }

        let expandedParams = {
            isIngredient: params.isIngredient,
            name: params.name,
            id: params.id,
            searchInput,
            searchType,
            url
        }

        return (
            <View>
            <TouchableOpacity onPress={() => navigation.navigate('FoodExpanded', expandedParams)}>
            <View style={styles.background}>
                <Image
                    style={styles.petImage}
                    source={{
                        uri: url,
                    }}
                />
                <Text style={styles.resultText}>{name}</Text>
                <FontAwesomeIcon icon={faChevronRight} style={styles.backButton}/>
            </View>
            </TouchableOpacity>
            </View>
        )
    }
return <View></View>;
}

const styles = StyleSheet.create({
    petImage: {
        width: 130,
        height: 130,
        margin: 12,
        borderRadius: 15,
        resizeMode: 'contain'
    },
    background: {
        width: '95%',
        backgroundColor: '#F4F4F4',
        marginLeft: '2.5%',
        marginRight: '2.5%',
        marginVertical: 10,
        borderRadius: 25,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    resultText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Poppins-Light',
        width: '45%',
        textTransform: 'capitalize',
    },
    backButton: {
        color: 'black',
        fontSize: 12
    },
})
