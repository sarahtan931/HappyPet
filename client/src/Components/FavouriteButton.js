import { React, useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons'
import { faStar as favStar } from '@fortawesome/free-solid-svg-icons';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';


export default function FavouriteButton(props) {
    const [isFav, setIsFav] = useState(false);
    const [icon, setIcon] = useState(faStar);

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
                        const res = await axios.get(`http://${DEPLOYHOST}:3000/user/favourites/${email}`, configObject);
                        if (isSubscribed) {
                            if (res.data.hasOwnProperty(props.id)) {
                                setIsFav(true);
                                setIcon(favStar);
                            }
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

    function addToFavourites(email, configObject) {
        const body = {
            "id": props.id,
            "name": props.name,
            "isSafeDog": props.isSafeDog,
            "isSafeCat": props.isSafeCat,
            "imageUrl": props.imageUrl,
            "isIngredient": props.isIngredient,
        };
        let url = `http://${DEPLOYHOST}:3000/user/favourites/add/${email}`;
        axios.post(url, body, configObject)
            .then(res => {
                /*
                Toast.show('Successfully added to Favourites', {
                    duration: Toast.durations.Error,
                    backgroundColor: '#8EA604',
                    hideOnPress: true
                });*/
                setIcon(favStar);
                setIsFav(true);
            }).catch(err => {
                if (err && err.response.status === 400) {
                    Toast.show('Already added to Favourites', {
                        duration: Toast.durations.Error,
                        backgroundColor: '#8EA604',
                        hideOnPress: true
                    });
                }
                else if (err.response.status === 401 || err.response.status === 403) {
                    // Unauthorized
                    logOut();
                }
            });
    }

    function deleteFromFavourites(email, configObject) {
        const body = {
            "id": props.id
        };
        let url = `http://${DEPLOYHOST}:3000/user/favourites/delete/${email}`;
        axios.post(url, body, configObject)
            .then(res => {
                setIcon(faStar);
                setIsFav(false);
            }).catch(err => {
                if (err && err.response.status === 400) {
                }
                else if (err.response.status === 401 || err.response.status === 403) {
                    // Unauthorized
                    logOut();
                }
            });
    }

    function updateFavorites() {
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
                    if (isFav) {
                        deleteFromFavourites(email, configObject);
                    } else {
                        addToFavourites(email, configObject);
                    }
                } catch (err) {
                    Toast.show('Error Adding to Favourites', {
                        duration: Toast.durations.Error,
                        backgroundColor: '#DA4167',
                        hideOnPress: true
                    });
                }
            }).catch(err => {
                console.log(err)
            })
    }

    return (
        <RootSiblingParent>
            <TouchableOpacity style={styles.favoriteButton} onPress={updateFavorites}>
                <FontAwesomeIcon icon={icon} style={styles.iconText}></FontAwesomeIcon>
                <Text style={styles.favText}>
                    {
                        icon === faStar ?
                           "Add to Favourites" :
                           "Remove From Favourites"
                    }


                </Text>
            </TouchableOpacity>
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
    favoriteButton: {
        backgroundColor: '#D8DDB8',
        height: 40,
        borderRadius: 15,
        display: 'flex',
        margin: 'auto',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    favText: {
        color: 'black',
        fontSize: 16,
        margin: "auto",
        fontFamily: 'Poppins-Medium',
        textTransform: 'capitalize',
    },
    iconText: {
        marginRight: 10,
        fontSize: 20,
    }
});
