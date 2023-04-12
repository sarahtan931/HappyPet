import { View, Text, StyleSheet, TextInput } from 'react-native'
import { React, useState, useEffect } from 'react'
import { useFonts } from "expo-font";
import { ScrollView } from 'react-native-gesture-handler';
import PetProfileResult from './PetProfileResult';

export default function NutritionDetails(props) {
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf')
    });
    const [pets, setPets] = useState(null);
    const [servings, setServings] = useState('1');
    const [petComponents, setPetComponents] = useState([]);
    const nutrition = props.nutrition;
    const servingsInformation = props.servings;
    //console.log(nutrition);
    //console.log(servingsInformation);
    //console.log(props.petList);
    console.log(props.servings)

    useEffect(()=>{
		//setPets([{name: "Milo", calories: 100, protein: 30, fat: 20, carbs: 10, units: 'g'}]);
        setPets(props.petList);
        if (pets) {
            let newPetComponents = [];
            for (let i=0; i < pets.length; i++) {
                newPetComponents.push(
                    <PetProfileResult
                        key={pets[i].name}
                        petName={pets[i].name}
                        petImageIndex={pets[i].imageIndex}
                        limit={pets[i].nutritionMaximums}
                        //nutrition={{calories: 50, protein: 20, fat: 10, carbs: 5, units: 'g'}}
                        nutrition={nutrition}
                        numServings={servings}
                        breed={pets[i].breed}
                    ></PetProfileResult>
                )
            }
            setPetComponents(newPetComponents);
        }
	}, [props.petList, servings])

    // useEffect(() => {
    //
    // }, [servings])
    

    if (!fontsLoaded) {
        return (<View></View>)
    }

    let contentStyle = styles.contentText;

    if(servingsInformation == null || pets == null || nutrition == null) {
        return (<View></View>)
    }

    return (
        <View style={styles.container}>
            <View style={styles.servingSizeContainer}>
                <Text style={styles.servingSizeHeader}>Nutrition Details</Text>
                <Text style={styles.servingSizeText}>
                    Serving Size: {servingsInformation.number != null && servingsInformation.size != null ? servingsInformation.number*servingsInformation.size : ''}{servingsInformation.unit != null ? servingsInformation.unit : ''}
                </Text>
                <View style={styles.servingsInputContainer}>
                    <Text style={styles.servingInputLabel}>
                       # of Servings:
                    </Text>
                    <TextInput
                        style={styles.servingTextInput}
                        inputMode="numeric"
                        placeholder="1"
                        value={servings}
                        onChangeText={newServings => setServings(newServings)}
                    />
                </View>
            </View>
            <View style={styles.petContainer}>
                {petComponents}
            </View>
        </View>
    )

    //
    // return (
    //     <View style={styles.background}>
    //         <View style={styles.titleBox}>
    //             <Text style={styles.labelText}>Nutrition Details</Text>
    //         </View>
    //         <Text style={contentStyle}>
    //             Serving Size: {servingsInformation.number*servingsInformation.size}{servingsInformation.units}
    //         </Text>
    //         <Text>
    //             Number of Servings:
    //             <View>
    //             <TextInput
    //                 inputMode="numeric"
    //                 placeholder="1"
    //                 value={servings}
    //                 onChangeText={newServings => setServings(newServings)}
    //             />
    //             </View>
    //         </Text>
    //         <View>
    //             {petComponents}
    //         </View>
    //     </View>
    // )
}


const styles = StyleSheet.create({
    servingSizeContainer: {
        width: "100%",
        paddingVertical: 10
    },
    servingSizeHeader: {
        fontSize: 20,
        fontWeight: "bold",
        paddingBottom: 5
    },
    servingSizeText: {
        fontSize: 16,
        paddingBottom: 5
    },
    servingsInputContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        alignItems: "center"
    },
    servingInputLabel: {
        fontSize: 16,
        paddingRight: 5
    },
    servingTextInput: {
        color: '#747955',
        fontSize: 16,
        height: 45,
        borderRadius: 10,
        fontFamily: 'Poppins-Medium',
        backgroundColor: '#FDFFFC',
        paddingHorizontal: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        flexGrow: 1,
        textAlign: "center"
    },
    petContainer: {
        paddingBottom: 100
    }



    // background: {
    //     width: "100%"
    // },
    // contentBackground: {
    //     backgroundColor: 'white',
    //     borderRadius: 20,
    //     height: 260,
    //     marginBottom: 20,
    //     padding: 10,
    //     width: '90%',
    //     overflow: 'scroll',
    // },
    // contentTextIngredients: {
    //     fontSize: 16,
    //     fontFamily: 'Poppins-Light',
    //     textTransform: 'capitalize',
    // },
    // contentText:{
    //     fontSize: 16,
    //     fontFamily: 'Poppins-Light'
    // },
    // titleBox: {
    //     marginVertical: 20,
    // },
    // labelText: {
    //     color: 'black',
    //     fontSize: 20,
    //     fontFamily: 'Poppins-Medium',
    //     textTransform: 'capitalize',
    // },
})
