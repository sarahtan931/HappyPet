import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Image, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { PetProfile } from '../Objects/PetProfile';
import cameraIcon from '../../assets/icons/camera.png';
import petIcon from '../../assets/icons/pawprints.png';
import plusIcon from '../../assets/icons/plus.png';
import { useFonts } from "expo-font";
import * as ImagePicker from 'expo-image-picker';
import { DEPLOYHOST  } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import {resetAuthValues} from "../Utilities/resetAuthValues";
import {dogAvatars, catAvatars, defaultBackgroundColor} from "../Utilities/avatarComponents";
import {breedTypes} from "../Objects/PetProfile";

export default function HomeScreen({ navigation }) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [pets, setPets] = useState([]);
    const [petsDownloaded, setPetsDownloaded] = useState(false);
    const [imageToBeProcessed, setImageToBeProcessed] = useState(false);

    function logOut() {
        resetAuthValues().then(() => {
            navigation.navigate('Login');
        });
    }

    AsyncStorage.getItem("name").then((value) => {
        setName(value)
    })
    // const petName = "Milo"; // To be replaced with the dog profile name, likely through a prop.
    // const petImageUri = "https://images.dog.ceo/breeds/terrier-toy/n02087046_4809.jpg";

    const showAlert = (message, actionButtonMessage = '', actionButtonCallback = null) => {
        Alert.alert(
            'Alert!',
            message,
            actionButtonCallback != null ? [{ text: 'OK', onPress: () => console.log('OK Pressed') }, { text: actionButtonMessage, onPress: actionButtonCallback }] : [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }

    // Source: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    const openCamera = async () => {
        // Ask the user for the permission to access the camera
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            showAlert("You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync();

        // Explore the result
        console.log(result);

        if (!result.canceled) {
            const path = result.assets[0]["uri"]
            setImageToBeProcessed(true);
            handleUploadPhoto(path)

            console.log(path);
        } else {
            showAlert("No image captured or selected");
        }
    }

    const handleUploadPhoto = (pickedImagePath) => {
        // Infer the type of the image
        const match = /\.(\w+)$/.exec(pickedImagePath);
        const type = match ? `image/${match[1]}` : `image`;
        let status = undefined;

        fetch(`http://${DEPLOYHOST}:3000/api/barcode`, {
            method: 'POST',
            body: createFormData({ "name": pickedImagePath, "type": type, "uri": pickedImagePath }, {}),
        })
            .then((response) => {
                console.log(response.status);
                status = response.status;

                return response.json();
            })
            .then((response) => {
                if (status === 201) {
                    // TODO: Handle Non UPC barcodes.
                    setText(response.barcodeValue);
                    setImageToBeProcessed(false);
                    showAlert('Scan successful!');
                } else {
                    showAlert("Oops! Something went wrong. Try your scan again.");
                }
                setImageToBeProcessed(false);
            })
            .catch((error) => {
                setImageToBeProcessed(false);
                showAlert("Oops! Something went wrong. Try your scan again.");
                console.error('error', error);
            });
    };

    const createFormData = (photo, body = {}) => {
        if (photo.uri == null) {
            console.log('No photo selected');
            return;
        }

        console.log(photo);

        const data = new FormData();

        data.append('photo', {
            name: photo.name,
            type: photo.type,
            uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        });

        Object.keys(body).forEach((key) => {
            data.append(key, body[key]);
        });

        return data;
    }

    const getPetProfiles = () => {
        AsyncStorage.multiGet(['email', 'token'])
            .then((vals) => {
                const email = vals[0][1];
                const token = vals[1][1];

                if (email == null || token == null) {
                    throw new Error('Unauthenticated'); // TODO - handle redirect on unauth.
                }

                const configObject = {
                    headers: {
                        'Authorization': `${token}`
                    }
                }

                try{
                    let url = `http://${DEPLOYHOST}:3000/profile/getall/${email}`;
                    axios.get(url, configObject)
                        .then(res => {
                            setPets(res.data.map((obj) => new PetProfile(obj.name, obj.email, obj.weight, obj.activity, obj.breed, obj.picture)));
                            setPetsDownloaded(true);
                        }).catch(err => {
                            if (err.response.status === 401 || err.response.status === 403) {
                                // Unauthorized
                                logOut();
                            }
                            setPets(null);
                            setPetsDownloaded(true);
                        });

                } catch(err){
                    // Some error with the actual request calling
                    setPets(null);
                    setPetsDownloaded(true);
                }
            })
            .catch(err => {
                setPets(null);
                setPetsDownloaded(true);
            })
    }

    useEffect(() => {
        if (!petsDownloaded) {
            getPetProfiles();
        }
    });

    useEffect(() => {
        return navigation.addListener("focus", () => {
            setPets([]);
            setPetsDownloaded(false);
        });
    }, [navigation])

    const petProfileClickedHandler = (petObject) => {
        navigation.navigate('ModifyPetProfile', petObject)
    }
    const petProfileAddHandler = () => {
        navigation.navigate('AddPetProfile');
    }
    const petProfileReload = () => {
        getPetProfiles();
    }

    let petProfileErrorMessage;
    if (pets == null) {
        petProfileErrorMessage = (
            <TouchableOpacity
                onPress={petProfileReload}
                style={styles.petProfileErrorRegion}
            >
                <Text
                    style={styles.petProfileErrorText}
                >
                    Looks like something went wrong. Click to reload.
                </Text>
            </TouchableOpacity>
        )
    } else {
        petProfileErrorMessage = null;
    }

    const petComponents = [];
    let idCounter = 1;
    if (pets != null && petsDownloaded) {
        for (let i=0; i < pets.length; i++) {
            // Get correct style and image.
            let backgroundColor;
            let avatarIcon;
            if (pets[i].imageIndex != null) {
                backgroundColor = pets[i].breed === breedTypes.DOG ? dogAvatars[pets[i].imageIndex].backgroundColor : catAvatars[pets[i].imageIndex].backgroundColor;
                avatarIcon = pets[i].breed === breedTypes.DOG ? dogAvatars[pets[i].imageIndex].icon : catAvatars[pets[i].imageIndex].icon;
            } else {
                avatarIcon = petIcon
                backgroundColor = defaultBackgroundColor;
            }

            // Create style object
            let avatarStyle = {
                backgroundColor
            }

            // Add pet component
            petComponents.push(
                <View
                    style={i === pets.length - 1 ? [styles.petProfileButtonContainer, styles.lastPetContainer] : styles.petProfileButtonContainer}
                    key={idCounter++}
                >
                    <TouchableOpacity
                        onPress={() => petProfileClickedHandler(pets[i])}
                        style={[styles.petProfileButton, avatarStyle]}

                    >
                        <Image
                            style={styles.petIconImage}
                            source={avatarIcon}
                        />
                    </TouchableOpacity>
                    <Text
                        style={styles.petProfileLabel}
                    >
                        {toTitleCase(pets[i].name)}
                    </Text>
                </View>

            )
        }

        const defaultColorStyle = {backgroundColor: defaultBackgroundColor};

        // Add in a final one to the start for adding a new pet
        petComponents.unshift(
            <View
                style={styles.petProfileButtonContainer}
                key={idCounter++}
            >
                <TouchableOpacity
                    onPress={petProfileAddHandler}
                    style={[styles.petProfileButton, defaultColorStyle]}
                    key={0}
                >
                    <Image
                        style={styles.plusIconImage}
                        source={plusIcon}
                    />
                </TouchableOpacity>
                <Text
                    style={styles.petProfileLabel}
                >
                    Add Pet
                </Text>
            </View>


        )
    }


    if (imageToBeProcessed) {
        return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
    }

    if (!fontsLoaded) {
        return (
            <View></View>
        )
    } else {
        return (
            <View style={styles.root}>
                <ScrollView style={styles.homeContainer} contentContainerStyle={{ paddingBottom: 50 }}>
                    <Text
                        style={styles.subtitle}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                    >
                        Hey {name}!
                    </Text>

                    <View style={styles.searchContainer}>
                        <Text
                            style={styles.searchContainerText}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        >
                            Start Your Search
                        </Text>
                        <View style={styles.searchInputContainer}>
                            <TextInput
                                style={styles.searchTextInput}
                                placeholder="E.g. Oranges"
                                onChangeText={newText => setText(newText)}
                                value={text}
                            />
                            <TouchableOpacity
                                style={styles.cameraButtonContainer}
                                activeOpacity={.5}
                                onPress={openCamera}
                            >
                                <Image
                                    style={styles.cameraButtonImage}
                                    source={cameraIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.searchButton}
                            activeOpacity={.5}
                            onPress={() =>
                                navigation.navigate('SearchResults', { searchInput: text, searchType: 'name' })
                            }
                        >
                            <Text style={styles.searchButtonText}>
                                Search by Name
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.searchButtonNoMargin}
                            activeOpacity={.5}
                            onPress={() =>
                                navigation.navigate('SearchResults', { searchInput: text, searchType: 'upc' })
                            }
                        >
                            <Text style={styles.searchButtonText}>
                                Search by UPC
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.petProfileContainer}>
                        <Text style={styles.petProfileTitle}>
                            Your Pets
                        </Text>

                        {pets == null ? petProfileErrorMessage :
                            <ScrollView
                                horizontal={true}
                                style={styles.petProfileScrollView}
                            >
                                {petComponents}
                            </ScrollView>
                        }

                        {/*<Image*/}
                        {/*    style={styles.petImage}*/}
                        {/*    source={{*/}
                        {/*        uri: petImageUri*/}
                        {/*    }}*/}
                        {/*/>*/}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#8EA604",
        flex: 1
    },
    petProfileButtonContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 20
    },
    lastPetContainer: {
        marginRight: 40
    },
    petProfileLabel: {
        color: "white",
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        marginTop: 5,
        maxWidth: 80,
        height: 36,
        textAlign: "center",
        textOverflow: "ellipsis"
    },
    petProfileScrollView: {
        width: "100%",
        height: 120,
        paddingLeft: 20,
        paddingRight: 20
    },
    petProfileButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10000,
        width: 75,
        height: 75,
    },
    petProfileErrorRegion: {
        width: '100%',
    },
    petProfileErrorText: {
        color: 'white',
        fontSize: 18,
        padding: 5,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        position: "block"
    },
    petIconImage: {
        width: 48,
        height: 48
    },
    plusIconImage: {
        width: 32,
        height: 32
    },
    titleText: {
        color: 'white',
        fontSize: 45,
        paddingTop: 10,
        paddingBottom: 10,
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Medium',
    },
    homeContainer: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexGrow: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        justifyContent: "center",
        height: '100%'
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    subtitle: {
        color: '#8EA604',
        fontSize: 35,
        paddingBottom: 20
    },
    searchContainerText: {
        color: 'black',
        fontSize: 30,
        paddingBottom: 5,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    searchInputContainer: {
        flexDirection: "row",
        width: "100%",
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: "space-between"
    },
    searchTextInput: {
        color: '#747955',
        fontSize: 16,
        height: 50,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#FDFFFC',
        paddingHorizontal: 10,
        marginRight: 10,
        flexGrow: 1,
        flexBasis: 0
    },
    cameraButtonContainer: {
        width: 35,
        height: 35,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 10
    },
    cameraButtonImage: {
        width: 25,
        height: 25
    },
    searchButton: {
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    searchButtonNoMargin: {
        color: '#747955',
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        width: "100%",
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    searchButtonText: {
        fontFamily: 'Poppins-Medium',
    },
    text: {
        color: 'white',
        fontSize: 35,
        padding: 10,
        fontFamily: 'Poppins-Medium',
    },
    searchContainer: {
        backgroundColor: "#D8DDB8",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        marginBottom: 20
    },
    petProfileContainer: {
        borderRadius: 10,
        paddingVertical: 10,
        backgroundColor: '#DA4167'
    },
    petProfileTitle: {
        color: 'black',
        fontSize: 30,
        paddingBottom: 5,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    // TODO: Fix the height issues here.
    petImage: {
        width: '100%',
        height: 300
    }
});
