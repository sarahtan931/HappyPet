import { View, Text, StyleSheet, TextInput } from 'react-native'
import { useState } from 'react';
import React from 'react'
import Header from '../Components/Header';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPLOYHOST  } from '@env';
import axios from 'axios';
import {resetAuthValues} from "../Utilities/resetAuthValues";

export default function ChangePassword({ navigation }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newDupPassword, setnewDupPassword] = useState('');
    function logOut() {
        resetAuthValues().then(() => {
            navigation.navigate('Login');
        });
    }

    function changePassword() {
        const rePass = /^(?=.*[a-zA-Z\d]).{5,20}[^\<\\\.\&\%\/\>\*\(\)\+\=\{\}\[\]\:\;\'\"\,\^]$/;
       
        if (newPassword != newDupPassword) {
            Toast.show('Make sure your passwords match', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else if (!rePass.test(newPassword)) {
            Toast.show('Please enter a valid password.', {
                duration: Toast.durations.Error,
                backgroundColor: '#DA4167',
                hideOnPress: true
            });
        } else {
            AsyncStorage.multiGet(['email', 'token'])
            .then((vals) => {
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

                const body = {
                    "email": email,
                    "password": oldPassword,
                    "newpassword": newPassword
                }

                try{
                    let url = `http://${DEPLOYHOST}:3000/login/changepassword`;
                    axios.post(url, body, configObject)
                        .then(res => {
                            Toast.show('Successfully Changed Password', {
                                duration: Toast.durations.Error,
                                backgroundColor: '#8EA604',
                                hideOnPress: true
                            });
                        }).catch(err => {
                            if (err.response.status === 401 || err.response.status === 403) {
                                // Unauthorized
                                logOut();
                            }
                        });

                } catch(err){
                    Toast.show('Error Changing Password', {
                        duration: Toast.durations.Error,
                        backgroundColor: '#DA4167',
                        hideOnPress: true
                    });
                }
            }).catch(err => {
            })
        }
    }

    return (
        <RootSiblingParent>
            <View>
                <Header lastPage={"ChangePassword"} navigation={navigation}></Header>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter old password"
                        onChangeText={newPassword => setOldPassword(newPassword)}
                        value={oldPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter new password"
                        onChangeText={newPassword => setNewPassword(newPassword)}
                        value={newPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Re-enter new password"
                        onChangeText={newPassword => setnewDupPassword(newPassword)}
                        value={newDupPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                    />
                </View>
                <TouchableOpacity
                    style={styles.changePasswordButton}
                    onPress={changePassword}>
                    <Text style={styles.buttonText}>
                        Change Password
                    </Text>
                </TouchableOpacity>
            </View>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    root: {
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "#FDFFFC",
        flex: 1,
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20
    },
    buttonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        color: '#000000'
    },
    changePasswordButton: {
        fontSize: 16,
        height: 50,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#D8DDB8',
        paddingHorizontal: 10,
        margin: 10,
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
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
})