import * as React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {useFonts} from "expo-font";
import {useState} from "react";
import lowIcon from "../../assets/icons/low.png";
import mediumIcon from "../../assets/icons/medium.png";
import highIcon from "../../assets/icons/high.png";
import catIcon from "../../assets/icons/cat.png";
import dogIcon from "../../assets/icons/dog.png";
import {dogAvatars, catAvatars} from "../Utilities/avatarComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { DEPLOYHOST } from '@env';
import Toast from 'react-native-root-toast';
import { RootSiblingParent } from 'react-native-root-siblings';
import {resetAuthValues} from "../Utilities/resetAuthValues";
import {activityLevel, breedTypes} from "../Objects/PetProfile";

export default function AddPetProfile({ navigation }) {
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

    const [petName, setPetName] = useState('');
    const [breed, setBreed] = useState(breedTypes.UNSELECTED);
    const [weight, setWeight] = useState('');
    const [activity, setActivity] = useState(activityLevel.DEFAULT);
    const [avatarId, setAvatarId] = useState(-1);

    const backButton = () => {
        navigation.navigate("DrawerHome");
    }

    const handleSubmit = () => {
        // Validation
        if (petName === '') {
            Toast.show('Please enter animal name', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        }
        else if (breed === breedTypes.UNSELECTED) {
            Toast.show('Please choose animal type.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else if (isNaN(+weight) || weight == 0) {
            Toast.show('Please enter a numeric weight.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        }

        // Actually make the request
        AsyncStorage.multiGet(['email', 'token'])
            .then((vals) => {
                const email = vals[0][1];
                const token = vals[1][1];

                if (email == null || token == null) {
                    return logOut();
                }

                const configObject = {
                    headers: {
                        'Authorization': `${token}`
                    }
                }

                const bodyObject = {
                    name: petName,
                    email: email,
                    weight: +weight,
                    activity: activity,
                    picture: avatarId,
                    breed: breed
                }

                try {
                    let url = `http://${DEPLOYHOST}:3000/profile/create`;
                    axios.post(url, bodyObject, configObject)
                        .then(res => {
                            if (res.data.success) {
                                navigation.navigate('DrawerHome');
                            } else {
                                // This shouldn't happen based on current server specs
                                console.log(res.data);
                                Toast.show('Something went wrong. Try again', {
                                    duration: Toast.durations.Error,
                                    backgroundColor: '#DA4167',
                                    hideOnPress: true
                                });
                            }
                        }).catch(err => {
                            console.log(err);
                            if (err.response.status === 401 || err.response.status === 403) {
                                // Unauthorized
                                logOut();
                            } else if (err.response.status === 400) {
                                Toast.show('You already have a pet by this name. Use a new name', {
                                    duration: Toast.durations.Error,
                                    backgroundColor: '#DA4167',
                                    hideOnPress: true
                                });
                            }
                        })
                } catch (err) {
                    // Some error with executing the request.
                    console.log(err);
                    Toast.show('Something went wrong. Try again', {
                        duration: Toast.durations.Error,
                        backgroundColor: '#DA4167',
                        hideOnPress: true
                    });
                }
            })
    }

    const dogAvatarComponents = [];
    for (let i = 0; i<dogAvatars.length; i++) {
        const avatarStyle = {
            backgroundColor: dogAvatars[i].backgroundColor
        }

        dogAvatarComponents.push(
            <TouchableOpacity
                onPress={() => {setAvatarId(i)}}
                key={i}
                style={avatarId === i ? [styles.avatarButton, styles.avatarButtonActive, avatarStyle] : [styles.avatarButton, avatarStyle]}
            >
                <Image
                    style={styles.avatarDogIconImage}
                    source={dogAvatars[i].icon}
                />
            </TouchableOpacity>
        )
    }

    const catAvatarComponents = [];
    for (let i = 0; i<catAvatars.length; i++) {
        const avatarStyle = {
            backgroundColor: catAvatars[i].backgroundColor
        }

        catAvatarComponents.push(
            <TouchableOpacity
                onPress={() => {setAvatarId(i)}}
                key={i}
                style={avatarId === i ? [styles.avatarButton, styles.avatarButtonActive, avatarStyle] : [styles.avatarButton, avatarStyle]}
            >
                <Image
                    style={styles.avatarCatIconImage}
                    source={catAvatars[i].icon}
                />
            </TouchableOpacity>
        )
    }

    if (!fontsLoaded) {
        return (
            <View></View>
        )
    } else {
        return (
            <RootSiblingParent>
                <View style={styles.root}>
                    <TouchableOpacity
                        style={styles.backButtonContainer}
                        onPress={backButton}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} style={styles.backButton} />
                    </TouchableOpacity>
                    <View style={styles.headerRegion}>
                    </View>
                    <View style={styles.inputForm}>
                        <Text style={styles.newPetHeader}>
                            Add New Pet
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Pet Name"
                                onChangeText={newName => setPetName(newName)}
                                value={petName}
                                autoComplete="off"
                                autoCorrect={false}
                            />
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextInput
                                inputMode="numeric"
                                style={[styles.textInput, styles.weightInput]}
                                placeholder="Weight (lbs)"
                                onChangeText={newWeight => setWeight(newWeight)}
                                value={weight}
                                autoCapitalize="none"
                                autoComplete="off"
                                autoCorrect={false}
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.activityInputContainer]}>
                            <TouchableOpacity
                                style={breed === breedTypes.DOG ? [styles.breedInput, styles.breedInputActive] : styles.breedInput}
                                onPress={() => setBreed(breedTypes.DOG)}
                            >
                                <Image
                                    style={styles.breedIconImage}
                                    source={dogIcon}
                                />
                                <Text style={styles.breedIconText}>
                                    Dog
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={breed === breedTypes.CAT ? [styles.breedInput, styles.breedInputActive] : styles.breedInput}
                                onPress={() => setBreed(breedTypes.CAT)}
                            >
                                <Image
                                    style={styles.breedIconImage}
                                    source={catIcon}
                                />
                                <Text style={styles.breedIconText}>
                                    Cat
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputContainer, styles.activityInputContainer]}>
                            <TouchableOpacity
                                style={activity === activityLevel.LOW ? [styles.activityInput, styles.activityInputActive] : styles.activityInput}
                                onPress={() => setActivity(activityLevel.LOW)}
                            >
                                <Image
                                    style={styles.activityIconImage}
                                    source={lowIcon}
                                />
                                <Text style={styles.activityIconText}>
                                    Low Activity
                                </Text>

                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activity === activityLevel.DEFAULT ? [styles.activityInput, styles.activityInputActive] : styles.activityInput}
                                onPress={() => setActivity(activityLevel.DEFAULT)}
                            >
                                <Image
                                    style={styles.activityIconImage}
                                    source={mediumIcon}
                                />
                                <Text style={styles.activityIconText}>
                                    Medium Activity
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activity === activityLevel.HIGH ? [styles.activityInput, styles.activityInputActive] : styles.activityInput}
                                onPress={() => setActivity(activityLevel.HIGH)}
                            >
                                <Image
                                    style={styles.activityIconImage}
                                    source={highIcon}
                                />
                                <Text style={styles.activityIconText}>
                                    High Activity
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={breed !== breedTypes.UNSELECTED ? styles.avatarPickerContainer : styles.avatarPickerContainerSmall}>
                            <Text style={styles.avatarPickerTitle}>
                                Choose an Avatar:
                            </Text>
                            {breed !== breedTypes.UNSELECTED ?
                                <ScrollView
                                    horizontal={true}
                                    contentContainerStyle={styles.avatarScrollView}
                                    automaticallyAdjustContentInsets={false}
                                >
                                    {breed === breedTypes.DOG ? dogAvatarComponents : catAvatarComponents}
                                </ScrollView>
                                :
                                <Text style={styles.avatarEmptyText}>
                                    Select Animal Type to See Avatars
                                </Text>
                            }



                        </View>
                        <View style={styles.inputContainer}>
                            <TouchableOpacity
                                style={styles.addPetButton}
                                onPress={handleSubmit}>
                                <Text style={styles.buttonText}>
                                    Add Pet
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </RootSiblingParent>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#FDFFFC",
    },
    inputForm: {
        display: "flex",
        flexDirection: "column",
        paddingHorizontal: 20
    },
    header: {
        width: "100%",
        height: 70,
        paddingTop: 10,
        backgroundColor: "#8EA604",
        position: "relative",
        display: "flex",
        alignItems: "center",
        flexDirection: "row"
    },
    backButtonContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        height: 30,
        width: 30,
        zIndex: 1
    },
    backButton: {
        color: '#FFFFFF',
        fontSize: 10,
        marginLeft: 8,
    },
    headerText: {
        color: 'white',
        fontSize: 26,
        margin: "auto",
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Medium',
    },
    textInput: {
        color: '#747955',
        fontSize: 16,
        height: 45,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#FDFFFC',
        borderWidth: 2,
        borderColor: "#000000",
        paddingHorizontal: 10,
        marginVertical: 10,
        flexGrow: 1
    },
    addPetButton: {
        fontSize: 16,
        height: 50,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#DA4167',
        paddingHorizontal: 10,
        marginVertical: 10,
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    weightInput: {
        flexGrow: 1
    },
    weightInputContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        alignItems: "center"
    },
    weightInputLabel: {
        fontFamily: "Poppins-Medium",
        fontSize: 15,
        marginHorizontal: 10
    },
    activityInputContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 15
    },
    activityInput: {
        width: "30%",
        borderRadius: 10,
        borderColor: "#000000",
        borderWidth: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 50
    },
    activityInputActive: {
        backgroundColor: "#8EA604",
    },
    activityIconImage: {
        height: 25,
        maxWidth: 35
    },
    breedIconImage: {
        height: 35,
        maxWidth: 50,
        resizeMode: "contain"
    },
    activityIconText: {
        fontFamily: "Poppins-Medium",
        fontSize: 10
    },
    breedIconText: {
        fontFamily: "Poppins-Medium",
        fontSize: 15
    },
    breedInput: {
        width: "40%",
        borderRadius: 10,
        borderColor: "#000000",
        borderWidth: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 70
    },
    breedInputActive: {
        backgroundColor: "#8EA604"
    },
    newPetHeader: {
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF',
        fontSize: 30,
        marginTop: 28,
        marginBottom: 20,
        textAlign: "center"
    },
    avatarPickerTitle: {
        fontFamily: 'Poppins-Medium',
        color: '#000000',
        fontSize: 20
    },
    buttonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        color: '#000000',
    },
    headerRegion: {
        position: "absolute",
        backgroundColor: "#8EA604",
        height: 80,
        width: "100%",
        zIndex: -1
    },
    avatarPickerContainer: {
        width: "100%",
        height: 120
    },
    avatarPickerContainerSmall: {
        width: "100%",
        height: 60
    },
    avatarScrollView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    avatarButton: {
        height: 80,
        width: 80,
        borderRadius: 10000,
        marginRight: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    avatarButtonActive: {
        borderColor: "#000000",
        borderWidth: 3
    },
    avatarDogIconImage: {
        height: 60,
        width: 60
    },
    avatarCatIconImage: {
        height: 50,
        width: 50
    },
    avatarEmptyText: {
        fontSize: 16,
        fontStyle: "italic",
        marginTop: 7
    }
})
