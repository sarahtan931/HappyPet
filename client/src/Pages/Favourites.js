import { React, useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { DEPLOYHOST } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavouriteSingular from '../Components/FavouriteSingular';
import { useIsFocused } from "@react-navigation/native"; 

export default function Favourites({navigation}) {
  const [favourites, setFavourites] = useState(null);
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
            const res = await axios.get(`http://${DEPLOYHOST}:3000/user/favourites/${email}`, configObject);
            if (isSubscribed) {
              setFavourites(res.data)
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
  }, [isFocused])

  if (!favourites) {
    return (<View style={[styles.container, styles.horizontal]}><ActivityIndicator size="large" color="##8EA604"></ActivityIndicator></View>)
  }
  // Iterate through the returned favourites and create a component for each food.
  var favouritesComponents = [];
  let i = 0
  for (const property in favourites) {
    i+=1;
    const id = property;
    const name = favourites[property].name;
    const isSafeDog = favourites[property].isSafeDog;
    const isSafeCat = favourites[property].isSafeCat;
    const imageUrl = favourites[property].imageUrl;
    const isIngredient = favourites[property].isIngredient
   
    favouritesComponents.push(
      <View key={i}>
        <FavouriteSingular id={id} name={name} isSafeDog={isSafeDog} isSafeCat={isSafeCat} imageUrl={imageUrl} isIngredient={isIngredient} navigation={navigation}></FavouriteSingular>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>

<Text style={styles.title}>{i} Favourites </Text>
      {favouritesComponents}
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  root:{backgroundColor:"white"},
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
}
})