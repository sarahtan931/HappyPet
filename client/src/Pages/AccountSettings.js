import * as React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../../assets/icons/logo.png';
import { resetAuthValues } from "../Utilities/resetAuthValues";
import { DEPLOYHOST } from '@env';
import axios from 'axios';
import Toast from 'react-native-root-toast';

export default function AccountSettings({ navigation }) {
    function logOut() {
        resetAuthValues().then(() => {
            navigation.navigate('Login');
        });
    }

    function deleteAccount() {
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

                try {
                    let url = `http://${DEPLOYHOST}:3000/login/deleteaccount/${email}`;
                    console.log('url', url)
                    axios.delete(url, configObject)
                        .then(res => {
                            console.log('succesfully deleted account')
                            navigation.navigate('Login');
                        }).catch(err => {
                            console.log(err)
                            if (err.response.status === 401 || err.response.status === 403) {
                                // Unauthorized
                                logOut();
                            }
                        });

                } catch (err) {
                    console.log(err)
                    Toast.show('Error Deleting Account', {
                        duration: Toast.durations.Error,
                        backgroundColor: '#DA4167',
                        hideOnPress: true
                    });
                }
            }).catch(err => {
            })
    }

    return (
        <View style={styles.root}>
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => { navigation.navigate('ChangePassword') }}>
                    <Text style={styles.blackButtonText}>
                        Change Password
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logOut}>
                    <Text style={styles.blackButtonText}>
                        Log Out
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.logoContainer}>
                <Image
                    style={styles.logoImage}
                    source={logo}
                />
            </View>
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteAccount}>
                    <Text style={styles.buttonText}>
                        Delete Account
                    </Text>
                </TouchableOpacity>
            </View>
        </View>)

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
    inputContainer: {
        width: "100%",
    },
    deleteButton: {
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
        justifyContent: "center",
    },
    logoutButton: {
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
    buttonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        color: '#FDFFFC'
    },
    blackButtonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        color: '#000000'
    },
    logoImage: {
        width: 150,
        height: 170,
    },
    logoContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        marginVertical: 20,
    },
})
