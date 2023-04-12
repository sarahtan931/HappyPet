import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../Components/Header';
import { useFonts } from "expo-font";
import axios from 'axios';
import NotSafeLabel from '../Components/NotSafeLabel';
import CautionLabel from '../Components/CautionLabel';
import SafeLabel from '../Components/SafeLabel';
import DescriptionBox from '../Components/DescriptionBox';
import DoesNotExist from '../Components/DoesNotExist';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootSiblingParent } from 'react-native-root-siblings';
import FavouriteButton from '../Components/FavouriteButton';

// Function to return the description. 
function getDescriptionBoxDog(ingredientLookup) {
    if (ingredientLookup.description_dogs.length > 2) {
        return [true, (<DescriptionBox title={"Description Dogs"} content={ingredientLookup.description_dogs}></DescriptionBox>)]
    }
    // If the description does not exist, return a 'Coming Soon' page.
    return [false, (<View><Text style={styles.noInfo}>Oops! We do not have this information yet. Use caution and seek other sources to verify this food's safety before feeding it to your pet.</Text></View>)]
}
function getDescriptionBoxCat(ingredientLookup) {
    if (ingredientLookup.description_cats.length > 2) {
        return [true, (<DescriptionBox title={"Description Cats"} content={ingredientLookup.description_cats}></DescriptionBox>)]
    }
    // If the description does not exist, return a 'Coming Soon' page.
    return [false, (<View><Text style={styles.noInfo}>Oops! We do not have this information yet. Use caution and seek other sources to verify this food's safety before feeding it to your pet.</Text></View>)]
}

export default function IngredientExpanded({ route, navigation }) {
    const name = route.params.name;
    const [ingredientLookup, setIngredientLookup] = useState(null);
    const [error, setError] = useState(false);
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });

    function logOut() {
        resetAuthValues().then(() => {
            navigation.navigate('Login');
        });
    }

    useEffect(() => {
        let isSubscribed = true;
        const fetchData = async () => {
            // Call backend to retreive ingredient information.
            AsyncStorage.multiGet(['email', 'token'])
                .then(async (vals) => {
                    const email = vals[0][1];
                    const token = vals[1][1];

                    if (email == null || token == null) {
                        throw new Error('Unauthenticated');
                    }

                    const configObject = {
                        headers: {
                            'Authorization': `${token}`
                        }
                    }

                    try {
                        const res = await axios.get(`http://${DEPLOYHOST}:3000/search/info/ingredients/${name}`, configObject);
                        if (isSubscribed) {
                            setIngredientLookup(res.data);
                        }
                    } catch (err) {
                        if (err.response.status === 401 || err.response.status === 403) {
                            // Unauthorized
                            logOut();
                        }
                        setError(true);
                    }
                })
        }

        fetchData()
            .catch(console.error);
        return () => isSubscribed = false;
    }, [])

    if (error) {
        return (<DoesNotExist navigation={navigation}></DoesNotExist>)
    }

    // If the ingredient information or the fonts have not been loaded return a loading indicator.
    if (!ingredientLookup || !fontsLoaded) {
        return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
    }

    let [hasIngredientDog, descriptionBoxDog] = getDescriptionBoxDog(ingredientLookup);
    let [hasIngredientCat, descriptionBoxCat] = getDescriptionBoxCat(ingredientLookup);
    let safetyLabelDog = null;
    let safetyLabelCat = null;

    // If the ingredient is safe and exists in the database add a 'Safe' label.
    if (ingredientLookup.safety_dogs == "safe" && hasIngredientDog) {
        safetyLabelDog = <SafeLabel></SafeLabel>;
    } else if (ingredientLookup.safety_dogs == "notsafe" && hasIngredientDog) { // If the ingredient is not safe and in the database add a 'Not Safe' label.
        safetyLabelDog = <NotSafeLabel></NotSafeLabel>
    } else { // Default to 'Caution' label.
        safetyLabelDog = <CautionLabel></CautionLabel>
    }

    // If the ingredient is safe and exists in the database add a 'Safe' label.
    if (ingredientLookup.safety_cats == "safe" && hasIngredientCat) {
        safetyLabelCat = <SafeLabel></SafeLabel>;
    } else if (ingredientLookup.safety_cats == "notsafe" && hasIngredientCat) { // If the ingredient is not safe and in the database add a 'Not Safe' label.
        safetyLabelCat = <NotSafeLabel></NotSafeLabel>
    } else { // Default to 'Caution' label.
        safetyLabelCat = <CautionLabel></CautionLabel>
    }

    return (
        <RootSiblingParent>
            <View style={styles.background}>
                <ScrollView>
                    <Header navigation={route.params.navigation}></Header>
                    <Text style={styles.ingredientTitle}>{name}</Text>
                    <FavouriteButton
                        id={route.params.id}
                        name={route.params.name}
                        isSafeDog={ingredientLookup.safety_dogs}
                        isSafeCat={ingredientLookup.safety_cats}
                        imageUrl={route.params.url}
                        isIngredient={true}></FavouriteButton>
                    {safetyLabelDog}
                    {descriptionBoxDog}
                    {safetyLabelCat}
                    {descriptionBoxCat}
                </ScrollView>
            </View>
        </RootSiblingParent>
    )
}


const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#8EA604",
        flex: 1
    },
    background: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
    ,
    container: {
        flex: 1,
        justifyContent: "center",
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    ingredientTitle: {
        color: 'black',
        fontSize: 24,
        margin: "auto",
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Medium',
        textTransform: 'capitalize',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    noInfo: {
        fontSize: 16,
        fontFamily: 'Poppins-Light',
        marginTop: 10,
    }
});
