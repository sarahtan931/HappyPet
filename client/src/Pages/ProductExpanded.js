import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import Header from '../Components/Header';
import { useFonts } from "expo-font";
import axios from 'axios';
import NotSafeLabel from '../Components/NotSafeLabel';
import CautionLabel from '../Components/CautionLabel';
import SafeLabel from '../Components/SafeLabel';
import DescriptionBox from '../Components/DescriptionBox';
import { ScrollView } from 'react-native-gesture-handler';
import DoesNotExist from '../Components/DoesNotExist';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootSiblingParent } from 'react-native-root-siblings';
import FavouriteButton from '../Components/FavouriteButton';

// Helper function to get 'Caution' elements that the product contains. If these elements do not exist, return an empty view.
function getContainsElementDog(productLookup) {
    let cautionIngredients = "";
    for (let pIngredient of productLookup.problemIngredients_dogs) {
        cautionIngredients += pIngredient.name + ", ";
    }
    if (cautionIngredients.length > 2) {
        cautionIngredients = cautionIngredients.slice(0, -2);
        return (<View style={styles.containsBox}>
            <Text style={styles.containsLabel}>Contains:</Text>
            <ScrollView style={styles.pIngredientBox}>
                <Text style={styles.pIngredientText}>{cautionIngredients}</Text>
            </ScrollView>
        </View>)
    }
    return (<View></View>)
}

// Helper function to get 'Caution' elements that the product contains. If these elements do not exist, return an empty view.
function getContainsElementCat(productLookup) {
    let cautionIngredients = "";
    for (let pIngredient of productLookup.problemIngredients_cats) {
        cautionIngredients += pIngredient.name + ", ";
    }
    if (cautionIngredients.length > 2) {
        cautionIngredients = cautionIngredients.slice(0, -2);
        return (<View style={styles.containsBox}>
            <Text style={styles.containsLabel}>Contains:</Text>
            <ScrollView style={styles.pIngredientBox}>
                <Text style={styles.pIngredientText}>{cautionIngredients}</Text>
            </ScrollView>
        </View>)
    }
    return (<View></View>)
}

// Helper function to get the ingredients in the product.
function getIngredientsBox(productLookup) {
    let ingredientsList = "";
    // Iterating through the ingredients and adding it to a string.
    for (let ingredient of productLookup.ingredients) {
        ingredientsList += ingredient.name + ", ";
    }
    // If the ingredients exist, return a description box with the ingredients.
    if (ingredientsList.length > 2) {
        ingredientsList = ingredientsList.slice(0, -2);
        return [true, (<DescriptionBox title={"Ingredients"} content={ingredientsList}></DescriptionBox>)]
    }
    // If the ingredients dont exist, return a warning to the user.
    return [false, (<View><Text style={styles.noInfo}>Oops! We do not have this information yet. Use caution and seek other sources to verify this food's safety before feeding it to your pet.</Text></View>)]
}

export default function ProductExpanded({ route, navigation }) {
    const name = route.params.name;
    const id = route.params.id;
    const [error, setError] = useState(false);
    const [productLookup, setproductLookup] = useState(null);
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
            // Calling backend function to get products by Id.
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
                        const res = await axios.get(`http://${DEPLOYHOST}:3000/search/info/products/${id}`, configObject);
                        if (isSubscribed) {
                            setproductLookup(res.data);
                        }
                    } catch (err) {
                        if (err.response.status === 401 || err.response.status === 403) {
                            // Unauthorized
                            logOut();
                        }
                        setError(true)
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

    // If the product information or the fonts have not been loaded return a loading indicator.
    if (!productLookup || !fontsLoaded) {
        return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
    }

    let containsElementDog = getContainsElementDog(productLookup)
    let containsElementCat = getContainsElementCat(productLookup)
    let [hasIngredients, ingredientsBox] = getIngredientsBox(productLookup)

    let safetyLabelDog = null;
    let safetyLabelCat = null;
    // If the product is safe and exists in the database add a 'Safe' label.
    if (productLookup.safety_dogs == "safe" && hasIngredients) {
        safetyLabelDog = <SafeLabel></SafeLabel>
    } else if (productLookup.safety_dogs == "notsafe" && hasIngredients) {  // If the product is not safe and in the database add a 'Not Safe' label.
        safetyLabelDog = <NotSafeLabel></NotSafeLabel>
    } else { // Default to 'Caution' label.
        safetyLabelDog = <CautionLabel></CautionLabel>
    }
    // If the product is safe and exists in the database add a 'Safe' label.
    if (productLookup.safety_cats == "safe" && hasIngredients) {
        safetyLabelCat = <SafeLabel></SafeLabel>
    } else if (productLookup.safety_cats == "notsafe" && hasIngredients) {  // If the product is not safe and in the database add a 'Not Safe' label.
        safetyLabelCat = <NotSafeLabel></NotSafeLabel>
    } else { // Default to 'Caution' label.
        safetyLabelCat = <CautionLabel></CautionLabel>
    }

    return (
        <RootSiblingParent>
            <ScrollView >
                <View style={styles.background}>
                    <Header navigation={route.params.navigation}></Header>
                    <FavouriteButton
                        id={route.params.id}
                        name={route.params.name}
                        isSafeDog={productLookup.safety_dogs}
                        isSafeCat={productLookup.safety_cats}
                        imageUrl={route.params.url}
                        isIngredient={false}></FavouriteButton>
                    <Text style={styles.ingredientTitle}>{name}</Text>

                    {safetyLabelDog}
                    {containsElementDog}
                    {safetyLabelCat}
                    {containsElementCat}
                    {ingredientsBox}
                </View>
            </ScrollView>
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
    containsBox: {
        height: 80,
        width: '100%',
        paddingHorizontal: '5%',
    },
    containsLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
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
    productTitle: {
        marginHorizontal: 20,
        display: 'flex'
    },
    pIngredientBox: {
        height: 60,
        borderRadius: 15,
        padding: 10,
        width: '100%',
        backgroundColor: '#E0DFDF'
    },
    pIngredientText: {
        fontSize: 16,
        fontFamily: 'Poppins-Light',
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
