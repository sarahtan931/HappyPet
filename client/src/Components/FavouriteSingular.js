import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import dogImage from '../../assets/icons/dog.png';
import catImage from '../../assets/icons/cat.png';


export default function FavouriteSingular(props) {
  let expandedParams = {
    isIngredient: props.isIngredient, // Get if ingredient
    name: props.name,
    id: props.id,
    url: props.imageUrl
  }

  let safetyLabelDog = null;
  if (props.isSafeDog == "" || props.isSafeDog == "caution") {
    safetyLabelDog = <View style={styles.caution}><Image source={dogImage} style={styles.image}></Image><Text style={styles.safetyText}>Caution</Text></View>
  } else if (props.isSafeDog == "safe") {
    safetyLabelDog = <View style={styles.safe}><Image source={dogImage} style={styles.image}></Image><Text style={styles.safetyText}>{props.isSafeDog}</Text></View>
  } else {
    safetyLabelDog = <View style={styles.notsafe}><Image source={dogImage} style={styles.image}></Image><Text style={styles.safetyText}>Not Safe</Text></View>
  }

  let safetyLabelCat = null;
  if (props.isSafeCat == "" || props.isSafeCat == "caution") {
    safetyLabelCat = <View style={styles.caution}><Image source={catImage} style={styles.cimage}></Image><Text style={styles.safetyText}>Caution</Text></View>
  } else if (props.isSafeCat == "safe") {
    safetyLabelCat = <View style={styles.safe}><Image source={catImage} style={styles.cimage}></Image><Text style={styles.safetyText}>{props.isSafeCat}</Text></View>
  } else {
    safetyLabelCat = <View style={styles.notsafe}><Image source={catImage} style={styles.cimage}></Image><Text style={styles.safetyText}>Not Safe</Text></View>
  }

  return (
    <View>
      <TouchableOpacity onPress={() => props.navigation.navigate('FoodExpanded', expandedParams)}>
        <View style={styles.background}>
          <Image
            style={styles.petImage}
            source={{
              uri: props.imageUrl,
            }}
          />
          <View style={styles.resultText}>
            <Text style={styles.nameText}>{props.name}</Text>
            {safetyLabelDog}
            {safetyLabelCat}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  petImage: {
    width: 130,
    height: 130,
    margin: 12,
    borderRadius: 15,
  },
  background: {
    width: '95%',
    backgroundColor: '#F4F4F4',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    marginVertical: 10,
    borderRadius: 25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  nameText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textTransform: 'capitalize',
  },
  resultText: {
    width: '60%',
  },
  backButton: {
    color: 'black',
    fontSize: 12
  },
  safetyText: {
    textTransform: 'capitalize',
  },
  caution: {
    backgroundColor: '#FFF1C0',
    height: 40,
    width: '80%',
    borderRadius: 15,
    display: 'flex',
    margin: 'auto',
    justifyContent: 'left',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  safe: {
    backgroundColor: '#D8DDB8',
    height: 40,
    width: '80%',
    borderRadius: 15,
    display: 'flex',
    margin: 'auto',
    justifyContent: 'left',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  notsafe: {
    backgroundColor: '#FFD4DF',
    height: 40,
    width: '80%',
    borderRadius: 15,
    display: 'flex',
    margin: 'auto',
    justifyContent: 'left',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  image: {
    height: 30,
    width: 30,
    marginRight: 14,
    marginLeft: 10
  },
  cimage: {
    height: 30,
    width: 40,
    marginRight: 8,
    marginLeft:8
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