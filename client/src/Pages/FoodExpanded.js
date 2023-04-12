import { useFonts } from "expo-font";
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "react-native-root-toast";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { RootSiblingParent } from 'react-native-root-siblings';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEPLOYHOST } from '@env';
import { Food } from "../Objects/Food";
import catIcon from "../../assets/icons/cat.png";
import dogIcon from "../../assets/icons/dog.png";
import { safetyClassification } from "../Objects/Food";
import { toTitleCase } from "../Utilities/textTransformations";
import FavouriteButton from "../Components/FavouriteButton";
import Header from "../Components/Header";
import NutritionDetails from "../Components/NutritionDetails";

const petTypes = {
    DOG: 'dog',
    CAT: 'cat',
    UNSELECTED: ''
}

export default function FoodExpanded({ route, navigation }) {
    const name = route.params.name;
    const id = route.params.id;
    const ingredient = route.params.isIngredient;
    const searchInput = route.params.searchInput;
    const searchType = route.params.searchType;
    const url = route.params.url;
    const [foodObtained, setFoodObtained] = useState(false);
    const [food, setFood] = useState({})
    const [petSelected, setPetSelected] = useState(petTypes.UNSELECTED);

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

    const backButton = () => {
        navigation.navigate("SearchResults", { searchInput, searchType });
    }

    const getFood = () => {
        // Get authentication information.
        AsyncStorage.multiGet(['email', 'token'])
            .then((vals) => {
                const email = vals[0][1];
                const token = vals[1][1];

                if (email == null || token == null) {
                    logOut();
                }

                const configObject = {
                    headers: {
                        'Authorization': `${token}`
                    }
                }

                // Now it depends on if it is an ingredient or a product
                if (ingredient) {
                    // Ingredient
                    try {
                        const url = `http://${DEPLOYHOST}:3000/search/info/ingredients/id/${id}`;
                        axios.get(url, configObject)
                            .then((res) => {
                                setFood(Food.bodyToFood(res.data, email, ingredient, name));
                                setFoodObtained(true);
                            }).catch((err) => {
                                if (err.response != null && err.response.status === 401 || err.response.status === 403) {
                                    // Unauthorized
                                    logOut();
                                } else {
                                    Toast.show('Something went wrong. Try again', {
                                        duration: Toast.durations.Error,
                                        backgroundColor: '#DA4167',
                                        hideOnPress: true
                                    });
                                }
                            });
                    } catch (err) {
                        console.log(err);
                        Toast.show('Something went wrong. Try again', {
                            duration: Toast.durations.Error,
                            backgroundColor: '#DA4167',
                            hideOnPress: true
                        });
                    }
                } else {
                    // Product
                    try {
                        const url = `http://${DEPLOYHOST}:3000/search/info/products/${id}`;
                        axios.get(url, configObject)
                            .then((res) => {
                                setFood(Food.bodyToFood(res.data, email, ingredient, name));
                                setFoodObtained(true);
                            }).catch((err) => {
                                if (err.response != null && err.response.status === 401 || err.response.status === 403) {
                                    // Unauthorized
                                    logOut();
                                } else {
                                    Toast.show('Something went wrong. Try again', {
                                        duration: Toast.durations.Error,
                                        backgroundColor: '#DA4167',
                                        hideOnPress: true
                                    });
                                }
                            });
                    } catch (err) {
                        console.log(err);
                        Toast.show('Something went wrong. Try again', {
                            duration: Toast.durations.Error,
                            backgroundColor: '#DA4167',
                            hideOnPress: true
                        });
                    }
                }
            })
    }

    useEffect(() => {
        if (!foodObtained) {
            getFood();
        }
    });

    let safetyBackgroundStyleDogs = {
        backgroundColor: food.safetyDogs === safetyClassification.SAFE ? "#b8d8be" : food.safetyDogs === safetyClassification.CAUTION ? "#fdfd96" : food.safetyDogs === safetyClassification.NOTSAFE ? "#ff6961" : "#dcdee0"
    }
    let safetyTextStyleDogs = {
        color: food.safetyDogs === safetyClassification.SAFE ? "#287036" : food.safetyDogs === safetyClassification.CAUTION ? "#d97511" : food.safetyDogs === safetyClassification.NOTSAFE ? "#a81d16" : "#000000"
    }

    let safetyBackgroundStyleCats = {
        backgroundColor: food.safetyCats === safetyClassification.SAFE ? "#b8d8be" : food.safetyCats === safetyClassification.CAUTION ? "#fdfd96" : food.safetyCats === safetyClassification.NOTSAFE ? "#ff6961" : "#dcdee0"
    }
    let safetyTextStyleCats = {
        color: food.safetyCats === safetyClassification.SAFE ? "#287036" : food.safetyCats === safetyClassification.CAUTION ? "#d97511" : food.safetyCats === safetyClassification.NOTSAFE ? "#a81d16" : "#000000"
    }

    const generateDescriptionText = (problemIngredients, safety) => {
        // console.log(problemIngredients);
        if (safety === safetyClassification.SAFE) {
            return `There are no known ingredients in this food that are unsafe for ${petSelected === petTypes.DOG ? "dogs" : "cats"}`;
        } else {
            if (problemIngredients == null) {
                return "More details are unavailable at this time"
            }

            let descriptionString = '';
            let ingredientString = ''
            for (let i =0 ; i<problemIngredients.length; i++) {
                // console.log(problemIngredients[i]);
                ingredientString += `Ingredient Name: ${toTitleCase(problemIngredients[i].name)}\n`;
                ingredientString += `Safety: ${problemIngredients[i].safety === safetyClassification.CAUTION ? "Caution!" : "Not Safe"}\n`;
                ingredientString += `Description: ${problemIngredients[i].description}\n\n`;

                descriptionString += ingredientString;
                ingredientString = '';
            }

            descriptionString = descriptionString.trim();

            return descriptionString;
        }
    }

    let petTextComponent;

    if (petSelected === petTypes.UNSELECTED) {
        petTextComponent = (
            <Text style={styles.safetyText}>
                Select pet type to see more
            </Text>
        );
    } else if (petSelected === petTypes.CAT) {
        if (food.safetyCats === safetyClassification.UNSURE) {
            petTextComponent = (<View style={styles.descriptionContainer}>
                <Text style={styles.unsureText}>
                    No further details are available.
                </Text>
            </View>)
        } else {
            petTextComponent = (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.safetyDescriptionTextHeader}>
                        Safety Details
                    </Text>
                    <Text style={styles.safetyDescriptionText}>
                        {generateDescriptionText(food.problemIngredientsCats, food.safetyCats)}
                    </Text>
                </View>
            )
        }
    } else {
        // Dog
        if (food.safetyDogs === safetyClassification.UNSURE) {
            petTextComponent = (<View style={styles.descriptionContainer}>
                <Text style={styles.unsureText}>
                    No further details are available.
                </Text>
            </View>)
        } else {
            petTextComponent = (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.safetyDescriptionTextHeader}>
                        Safety Details
                    </Text>
                    <Text style={styles.safetyDescriptionText}>
                        {generateDescriptionText(food.problemIngredientsDogs, food.safetyDogs)}
                    </Text>
                </View>
            )
        }
    }

    return (
        <RootSiblingParent>
            <View styles={styles.root}>
               <Header navigation={navigation}></Header>

                <ScrollView style={styles.foodView}>
                    <View style={styles.foodHeaderContainer}>
                        <View style={styles.foodTitleContainer}>
                            <Text style={styles.foodHeaderText}>
                                {toTitleCase(name)}
                            </Text>
                        </View>
                        <Image
                            style={styles.petImage}
                            source={{
                                uri: url,
                            }}
                        />

                    </View>
                    <View style={styles.favButtonBox}>
                        <FavouriteButton
                            id={id}
                            name={name}
                            isSafeDog={food.safetyDogs}
                            isSafeCat={food.safetyCats}
                            imageUrl={url}
                            isIngredient={ingredient}></FavouriteButton>
                    </View>
                    <View style={styles.safetyContainer}>
                        <Text style={styles.safetyContainerHeader}>
                            Safety Information
                        </Text>
                        <View style={styles.safetyButtonsContainer}>
                            <TouchableOpacity style={[styles.safetyButton, petSelected === petTypes.DOG ? styles.safetyButtonActive : {}]} onPress={() => petSelected === petTypes.UNSELECTED || petSelected === petTypes.CAT ? setPetSelected(petTypes.DOG) : setPetSelected(petTypes.UNSELECTED)}>
                                <Text style={styles.safetyButtonTitle}>
                                    Dog
                                </Text>
                                <Image
                                    style={styles.safetyDogIcon}
                                    source={dogIcon}
                                />
                                <View style={[styles.safetyLabel, safetyBackgroundStyleDogs]}>
                                    <Text style={[styles.safetyLabelText, safetyTextStyleDogs]}>
                                        {food.safetyDogs === safetyClassification.SAFE ? "Safe" : food.safetyDogs === safetyClassification.CAUTION ? "Caution" : food.safetyDogs === safetyClassification.NOTSAFE ? "Not Safe" : "Unsure"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.safetyButton, petSelected === petTypes.CAT ? styles.safetyButtonActive : {}]} onPress={() => petSelected === petTypes.UNSELECTED || petSelected === petTypes.DOG ? setPetSelected(petTypes.CAT) : setPetSelected(petTypes.UNSELECTED)}>
                                <Text style={styles.safetyButtonTitle}>
                                    Cat
                                </Text>
                                <Image
                                    style={styles.safetyCatIcon}
                                    source={catIcon}
                                />
                                <View style={[styles.safetyLabel, safetyBackgroundStyleCats]}>
                                    <Text style={[styles.safetyLabelText, safetyTextStyleCats]}>
                                        {food.safetyCats === safetyClassification.SAFE ? "Safe" : food.safetyCats === safetyClassification.CAUTION ? "Caution" : food.safetyCats === safetyClassification.NOTSAFE ? "Not Safe" : "Unsure"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.centerText}>
                            {petTextComponent}
                        </View>
                    </View>
                    {
                        food.nutrition != null ?
                            <View style={styles.nutritionContainer}>
                                <Text style={styles.safetyContainerHeader}>
                                    Nutrition
                                </Text>
                                <NutritionDetails
                                    //servings={{number: 1, size: 100, unit:'g'}}
                                    petList={food.petProfiles}
                                    nutrition={food.nutrition}
                                    servings={food.servings}
                                ></NutritionDetails>
                            </View>
                            :
                            <View style={[styles.nutritionContainer]}>
                                <Text style={styles.safetyContainerHeader}>
                                    Nutrition
                                </Text>
                                <Text style={styles.emptyNutritionText}>
                                    Further Nutrition Information Unavailable
                                </Text>
                            </View>
                    }



                </ScrollView>
            </View>
        </RootSiblingParent>
    );
}

const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#FDFFFC",
    },
    backButton: {
        color: '#FFFFFF',
        fontSize: 10,
        marginLeft: 8,
    },
    backButtonContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        height: 30,
        width: 30,
        zIndex: 1
    },
    headerRegion: {
        position: "absolute",
        backgroundColor: "#8EA604",
        height: 80,
        width: "100%",
        zIndex: -1
    },
    newPetHeader: {
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF',
        fontSize: 30,
        marginTop: 28,
        marginBottom: 20,
        textAlign: "center",
    },
    foodView: {
        paddingHorizontal: 20,
        height: "100%",
        paddingBottom: 200
    },
    foodHeaderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
    },
    foodHeaderText: {
        fontSize: 20,
        color: "#000000",
        fontFamily: "Poppins-Medium",
    },
    safetyContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: "100%",
    },
    nutritionContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: "100%",
        paddingBottom: 200
    },
    safetyText: {
        fontSize: 20,
        fontStyle: "italic",
        color: "#000000",
        marginTop: 10
    },
    safetyButtonsContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10,
    },
    safetyButton: {
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "#000000",
        backgroundColor: "#F0F0F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: 140,
        width: 140,
        paddingBottom: 5,
        paddingTop: 3
    },
    safetyButtonActive: {
        backgroundColor: "#8EA604",
    },
    safetyButtonTitle: {
        fontSize: 20,
        fontFamily: "Poppins-Medium",
    },
    safetyDogIcon: {
        height: 40,
        resizeMode: "contain",
        flexGrow: 1,
        marginVertical: 5,
        maxWidth: 90,
    },
    safetyCatIcon: {
        height: 40,
        maxWidth: 80,
        resizeMode: "contain",
        flexGrow: 1,
        marginVertical: 5
    },
    safetyLabel: {
        borderRadius: 1000,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 5
    },
    safetyLabelText: {
        fontSize: 15,
        fontFamily: "Poppins-Medium"
    },
    petImage: {
        width: 130,
        height: 130,
        borderRadius: 15,
        resizeMode: 'contain',
        flexShrink: 0
    },
    foodTitleContainer: {
        paddingHorizontal: 10,
        flex: 1
    },
    centerText: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    safetyContainerHeader: {
        fontSize: 25,
        color: "#000000",
        textDecorationLine: "underline"
    },
    safetyDescriptionTextHeader: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 5,
        fontStyle: "italic",
        textDecorationLine: "underline"
    },
    favButtonBox: {
        display: 'flex',
        alignItems: 'center'
    },
    emptyNutritionText: {
        fontSize: 15,
        fontStyle: "italic",
        marginTop: 10
    },
    unsureText: {
        paddingVertical: 10,
        fontSize: 16
    }

})
