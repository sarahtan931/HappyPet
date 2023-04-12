import { React, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { DEPLOYHOST } from '@env';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useIsFocused } from "@react-navigation/native"; 

export default function SearchHistory({ navigation }) {
    const [history, setHistory] = useState(null);
    const isFocused = useIsFocused();
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
                        const res = await axios.get(`http://${DEPLOYHOST}:3000/user/history/${email}`, configObject);
                        if (isSubscribed) {
                            console.log(res.data.reverse())
                            setHistory(res.data)
                        }
                    } catch (err) {
                        console.log('err', err)
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
    }, [isFocused])

    if (!history) {
        return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
    }

    var historyComponents = [];
    let i = 0
    for (const property in history) {
        i += 1;
        historyComponents.push(
            <View key={i}>
                <TouchableOpacity style={styles.historyBox}
                    onPress={() =>
                        navigation.navigate('SearchResults', { searchInput: history[property].search, searchType: history[property].searchType })}>
                    <Text>{history[property].search}</Text>
                    <FontAwesomeIcon icon={faChevronRight} style={styles.backButton} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.root}>
            <Text style={styles.title}>Search History</Text>
            {historyComponents}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    root: { backgroundColor: "white", height: '100%' },
    container: {
        flex: 1,
        justifyContent: "center",
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    title: {
        color: 'black',
        fontSize: 16,
        margin: "auto",
        width: "100%",
        textAlign: "center",
        fontFamily: 'Poppins-Light',
    },
    historyBox: {
        width: '95%',
        backgroundColor: '#F4F4F4',
        marginLeft: '2.5%',
        marginRight: '2.5%',
        marginVertical: 10,
        borderRadius: 25,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20
    }
})