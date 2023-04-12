import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFonts } from "expo-font";
import logo from '../../assets/icons/logo.png';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const setAuth = async (data) => {
    try {
        console.log(data)
        await AsyncStorage.setItem('name', data.name);
        await AsyncStorage.setItem('isAuth', 'true');
        await AsyncStorage.setItem('email', data.email);
        await AsyncStorage.setItem('token', data.token);
    } catch (e) {
        console.log('login done')
    }
};

export default function Login({ navigation }) {
    useEffect(() => {
        readItemFromStorage();
      }, []);

    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const readItemFromStorage = async () => {
        try {
          const isAuth = await AsyncStorage.getItem('isAuth');
          const email = await AsyncStorage.getItem('email');
          const name = await AsyncStorage.getItem('name')
          const isToken = await AsyncStorage.getItem('token');
          if (isAuth && email && name){
            navigation.navigate("DrawerHome")
          }
        } catch (e) {
          console.log('Done.')
        }
      };
   
    const handleSubmit = () => {
        const reEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const rePass = /^(?=.*[a-zA-Z\d]).{5,20}[^\<\\\.\&\%\/\>\*\(\)\+\=\{\}\[\]\:\;\'\"\,]$/;
        if (reEmail.test(email) && rePass.test(password)) {
            onSubmit();
        } else {
            Toast.show('Please enter valid inputs', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        }
    };

    const onSubmit = () => {
        fetch(`http://${DEPLOYHOST}:3000/login`, {
            // Creates a post call with the state info
            method: 'POST',
            body: JSON.stringify({ email: email.toLowerCase(), password: password }),
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
                            setAuth(data).then(() => {
                                // Routes the logged in user to the proper dashboard based on their catagory in the DB
                                navigation.navigate("DrawerHome")
                            })
                        });
                } else {
                    // If not successful
                    const error = new Error(res.error);
                    throw error;
                }
            })
            .catch((err) => {
                // Improper email / password handler
                Toast.show('Please input a valid email and password.', {
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
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logoImage}
                        source={logo}
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
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleSubmit}>
                        <Text style={styles.buttonText}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={() => { navigation.navigate('Register') }}>
                        <Text style={styles.buttonTextSmall}>
                            Dont have an account?
                            <Text style={styles.textUnderline}> Register</Text>
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
    logoContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        marginTop: 80,
        margin: 10
    },
    logoImage: {
        width: 150,
        height: 170,
    },
    inputContainer: {
        width: "100%",
    },
    textInput: {
        color: '#747955',
        fontSize: 16,
        height: 50,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#FDFFFC',
        paddingHorizontal: 10,
        margin: 10,
        flexGrow: 1
    },
    loginButton: {
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
        color: '#FDFFFC'
    },
    buttonTextSmall: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#FDFFFC'
    },
    textUnderline: {
        textDecorationLine: 'underline'
    }
})
