import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from "expo-font";
import Header from '../Components/Header';
import axios from 'axios';
import SearchResultSingular from '../Components/SearchResultSingular';
import ProductExpanded from './ProductExpanded';
import DoesNotExist from '../Components/DoesNotExist';
import {DEPLOYHOST} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchResults({ route, navigation }) {
    const { searchInput, searchType } = route.params;
    const [foodLookup, setFoodLookup] = useState(null);
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

                    try{
                        let url = ""
                        let foodsByName;
                        // If user inputs by name, lookup products by name.
                        if (searchType == 'name') {
                            try{
                                url = `http://${DEPLOYHOST}:3000/search/${searchInput}`;
                                const res = await axios.get(url, configObject);
                                foodsByName = res.data;
                                body = {"type": "name", "item": searchInput}
                                url = `http://${DEPLOYHOST}:3000/user/history/add/${email}`;
                                await axios.post(url, body, configObject)
                            }catch(err){
                                if (err.response.status === 401 || err.response.status === 403) {
                                    // Unauthorized
                                    logOut();
                                }
                                setError(true);
                            }
                        } else { // If user inputs by upc, lookup products by UPC.
                            try{
                                url = `http://${DEPLOYHOST}:3000/search/upc/${searchInput}`;
                                const res = await axios.get(url, configObject);
                                foodsByName = [res.data];

                                body = {"type": "upc", "item": searchInput}
                                await axios.post(`http://${DEPLOYHOST}:3000/user/history/add/${email}`, body, configObject)
                            } catch(err){
                                if (err.response.status === 401 || err.response.status === 403) {
                                    // Unauthorized
                                    logOut();
                                }
                                setError(true)
                            }
                        }
                        if (isSubscribed) {
                            setFoodLookup(foodsByName);
                        }
                    } catch {
                        setError(true)
                    }
                })
        }

        fetchData()
            .catch(console.error);

        return () => isSubscribed = false;
    }, [])

    if (error){
        return (<DoesNotExist navigation={navigation}></DoesNotExist>)
    }
    // If foods or fonts have not loaded return a loading indicator.
    if (!foodLookup || !fontsLoaded) {
        return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
    }

    // Iterate through the returned foods and create a component for each food.
    var searchResultComponents = [];
    for (let i = 0; i < foodLookup.length; i++) {
        const currentFood = foodLookup[i];
        let url = "";
        // If the food is an ingredient, update URL to point to spoonacular.
        if (currentFood.isIngredient == true) {
            url = `https://spoonacular.com/cdn/ingredients_100x100/${currentFood.image}`;
        } else {
            url = currentFood.image;
        }
        // Create component for each food.
        searchResultComponents.push(
            <View key={i}>
                <SearchResultSingular name={currentFood.name} url={url} navigation={navigation} id={currentFood.id} isIngredient={currentFood.isIngredient} searchInput={searchInput} searchType={searchType}></SearchResultSingular>
            </View>
        );
    }

    return (
        <View>
            <Header lastPage={"DrawerHome"} navigation={navigation}></Header>
            <ScrollView style={styles.homeContainer} contentContainerStyle={{ paddingBottom: 50 }}>
                <Text style={styles.resultLengthText}>{foodLookup.length} Results for {searchInput}</Text>
                {searchResultComponents}
            </ScrollView>
        </View>)
}

const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#8EA604",
        flex: 1
    },
    homeContainer: {
        width: "100%",
        height: "100%",
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 60,
        flexGrow: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        justifyContent: "center"
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    resultLengthText: {
        color: 'black',
        fontSize: 16,
        margin: "auto",
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Light',
    }
});
