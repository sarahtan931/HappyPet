import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from "expo-font";
import logo from '../../assets/icons/logo.png';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const setAuth = async (data,name) => {
    try {
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('isAuth', 'true');
        await AsyncStorage.setItem('email', data.email);
        await AsyncStorage.setItem('token', data.token);
    } catch (e) {
        console.log('login done')
    }
};

export default function Register({ navigation }) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        const reEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const rePass = /^(?=.*[a-zA-Z\d]).{5,20}[^\<\\\.\&\%\/\>\*\(\)\+\=\{\}\[\]\:\;\'\"\,\^]$/;
        const reName = /^.{1,256}[^\<\\\.\&\%\/\>\*\(\)\+\=\{\}\[\]\:\;\,\!\@\#\$\_\d]$/;

        if (!reName.test(name)) {
            Toast.show('Please enter a valid name.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else if (!reEmail.test(email)) {
            Toast.show('Please enter a valid email.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else if (!rePass.test(password)) {
            Toast.show('Please enter a valid password.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else if (password != confirmPassword) {
            Toast.show('Passwords do not match.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else {
            onSubmit();
        }
    };

    const onSubmit = () => {
        // If the response is successful
        fetch(`http://${DEPLOYHOST}:3000/register`, {
            // Creates a post call with the state info
            method: 'POST',
            body: JSON.stringify({ email: email.toLowerCase(), password: password, name: name }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    // If the response is successful
                    res.json().then(
                        function (data) {
                              // Set all local storage to returned values from DB. Allows them to be accessed from anywhere
                              setAuth(data, name).then(() => {
                                // Routes the logged in user to the proper dashboard based on their catagory in the DB
                                navigation.navigate("DrawerHome")
                            })
                        });
                } else {
                    // If not successful
                    const error = new Error();
                    error.code=res.status;
                    throw error;
                }
            })
            .catch((err) => {
                // Improper email / password handler
                let errorText = '';
                switch (err.code) {
                    case 400:
                        errorText = "You've already registered! Log in instead";
                        break;
                    default:
                        errorText = "Something went wrong. Try again";
                        break;
                }
                Toast.show(errorText, {
                    duration: Toast.durations.Error,
                    backgroundColor: '#DA4167',
                    hideOnPress: true
                });
            });
    };

    if (!fontsLoaded) {
        return (
            <View></View>
        )
    } else {
        return (
            <RootSiblingParent>
                <View style={styles.root}>
                    <Text style={styles.registerHeader}>
                        Welcome!
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Name"
                            onChangeText={newName => setName(newName)}
                            value={name}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Email"
                            onChangeText={newEmail => setEmail(newEmail)}
                            value={email}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Password"
                            onChangeText={newPassword => setPassword(newPassword)}
                            value={password}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Confirm Password"
                            onChangeText={newPassword => setConfirmPassword(newPassword)}
                            value={confirmPassword}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleSubmit}>
                            <Text style={styles.buttonText}>
                                Register
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity
                        onPress={() => { navigation.navigate('Login')}}>
                            <Text style={styles.buttonTextSmall}>
                                Already have an account?
                                <Text style={styles.textUnderline}> Login</Text>
                            </Text>
                        </TouchableOpacity>
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
        backgroundColor: "#8EA604",
        flex: 1,
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
    },
    inputContainer: {
        width: "100%",
    },
    textInput: {
        color: '#747955',
        fontSize: 16,
        height: 45,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#FDFFFC',
        paddingHorizontal: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        flexGrow: 1
    },
    registerButton: {
        fontSize: 16,
        height: 50,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#DA4167',
        paddingHorizontal: 10,
        margin: 10,
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        color: '#FDFFFC',
    },
    buttonTextSmall: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#FDFFFC',
    },
    textUnderline: {
        textDecorationLine: 'underline'
    },
    registerHeader: {
        fontFamily: 'Poppins-Medium',
        color: '#FDFFFC',
        fontSize: 30,
        marginTop: 80,
        textAlign: "left"
    }
})
