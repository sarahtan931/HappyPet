import {View, Text, StyleSheet, Image} from 'react-native'
import React from 'react'
import { useFonts } from "expo-font";
import { ScrollView } from 'react-native-gesture-handler';
import petIcon from '../../assets/icons/pawprints.png';
import {toTitleCase} from "../Utilities/textTransformations";
import {breedTypes} from "../Objects/PetProfile";
import {dogAvatars, catAvatars, defaultBackgroundColor} from "../Utilities/avatarComponents";

export default function PetProfileResult(props) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });
    const nutrition = props.nutrition;
    const numServings = props.numServings;
    const limit = props.limit;
    const imageIndex = props.petImageIndex;
    const petName = props.petName;
    const breed = props.breed;

    if (!fontsLoaded) {
        return (<View></View>)
    }

    let petImageBackgroundColor;
    let avatarIcon;

    if (imageIndex == null || imageIndex == -1) {
        avatarIcon = petIcon;
        petImageBackgroundColor = {backgroundColor: defaultBackgroundColor};
    }
    else if (breed === breedTypes.CAT) {
        const avatar = catAvatars[imageIndex];
        petImageBackgroundColor = {backgroundColor: avatar.backgroundColor};
        avatarIcon = avatar.icon;
    } else {
        const avatar = dogAvatars[imageIndex];
        petImageBackgroundColor = {backgroundColor: avatar.backgroundColor};
        avatarIcon = avatar.icon;
    }

    return (
        <View style={styles.petContainer}>
            <View style={styles.petImageContainer}>
                <View style={[styles.petImageBackground, petImageBackgroundColor]}>
                    <Image
                        style={styles.petIconImage}
                        source={avatarIcon}
                    />
                </View>
            </View>
            <View style={styles.nutritionInformation}>
                <Text style={styles.petName}>
                    {toTitleCase(petName)}
                </Text>
                <Text style={styles.nutritionFact}>
                    Calories: {(nutrition.calories*numServings*100/limit.calories).toFixed(0)}%, ({(nutrition.calories*numServings).toFixed(0)} cal / {limit.calories.toFixed(0)} cal)
                </Text>
                <Text style={styles.nutritionFact}>
                    Fat: {(nutrition.fat*numServings*100/limit.fat).toFixed(0)}%, ({(nutrition.fat*numServings).toFixed(0)} {nutrition.units} / {limit.fat.toFixed(0)} {limit.units})
                </Text>
                <Text style={styles.nutritionFact}>
                    Protein: {(nutrition.protein*numServings*100/limit.protein).toFixed(0)}%, ({(nutrition.protein*numServings).toFixed(0)} {nutrition.units} / {limit.protein.toFixed(0)} {limit.units})
                </Text>
                <Text style={styles.nutritionFact}>
                    Carbs: {(nutrition.carbs*numServings*100/limit.carbs).toFixed(0)}%, ({(nutrition.carbs*numServings).toFixed(0)} {nutrition.units} / {limit.carbs.toFixed(0)} {limit.units})
                </Text>

            </View>

        </View>
    )


    // return (
    //     <View style={styles.background}>
    //         <View style={styles.titleBox}>
    //             <Text style={styles.labelText}>{toTitleCase(petName)}</Text>
    //         </View>
    //         <Text style={contentStyle}>
    //             Calories: {(nutrition.calories*numServings*100/limit.calories).toFixed(0)}%, ({nutrition.calories*numServings} cal / {limit.calories.toFixed(0)} cal)
    //         </Text>
    //         <Text style={contentStyle}>
    //             Fat: {(nutrition.fat*numServings*100/limit.fat).toFixed(0)}%, ({nutrition.fat*props.numServings} {nutrition.units} / {limit.fat.toFixed(0)} {limit.units})
    //         </Text>
    //         <Text style={contentStyle}>
    //             Protein: {(nutrition.protein*numServings*100/limit.protein).toFixed(0)}%, ({nutrition.protein*numServings} {nutrition.units} / {limit.protein.toFixed(0)} {limit.units})
    //         </Text>
    //         <Text style={contentStyle}>
    //             Carbs: {(nutrition.carbs*numServings*100/limit.carbs).toFixed(0)}%, ({nutrition.carbs*numServings} {nutrition.units} / {limit.carbs.toFixed(0)} {limit.units})
    //         </Text>
    //     </View>
    // )
}


const styles = StyleSheet.create({
    petContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingBottom: 20
    },
    petImageContainer: {
        width: 80,
    },
    petImageBackground: {
        borderRadius: 1000,
        width: 64,
        height: 64,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    petIconImage: {
        width: 40,
        height: 40
    },
    nutritionInformation: {
        flexGrow: 1
    },
    petName: {
        fontFamily: "Poppins-Medium",
        fontSize: 20,
    },
})
