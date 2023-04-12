import 'react-native-gesture-handler';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/Pages/Home';
import SearchResults from './src/Pages/SearchResults';
import IngredientExpanded from './src/Pages/IngredientExpanded';
import ProductExpanded from './src/Pages/ProductExpanded';
import ImageCapture from './src/Pages/ImageCapture';
import ImageCaptureVerify from './src/Pages/ImageCaptureVerify';
import AccountSettings from './src/Pages/AccountSettings';
import Login from './src/Pages/Login';
import Register from './src/Pages/Register';
import AddPetProfile from "./src/Pages/AddPetProfile";
import ModifyPetProfile from "./src/Pages/ModifyPetProfile";
import ChangePassword from './src/Pages/ChangePassword';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Favourites from './src/Pages/Favourites';
import FoodExpanded from "./src/Pages/FoodExpanded";
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchHistory from './src/Pages/SearchHistory';
import { LogBox } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// TODO: Change the label in the Navigation Menu for "HappyPet" to "Home"
const DrawerHome = () => (
  <Drawer.Navigator screenOptions={drawerScreenOptions} >
    <Drawer.Screen name="Home" component={HomeScreen} options={{headerTitle: 'HappyPet'}} />
    <Drawer.Screen name="Favourites" component={Favourites} options={{headerTitle: 'HappyPet'}}/>
    <Drawer.Screen name="Search History" component={SearchHistory} options={{headerTitle: 'HappyPet'}}/>
    <Drawer.Screen name="Account Settings" component={AccountSettings} options={{headerTitle: 'HappyPet'}}/>
  </Drawer.Navigator>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf')
  });

  LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
  LogBox.ignoreAllLogs();//Ignore all log notifications

  if (!fontsLoaded) {
    return (
      <View></View>
    )
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          <Stack.Screen name="AddPetProfile" component={AddPetProfile} options={{ headerShown: false }} />
          <Stack.Screen name="ModifyPetProfile" component={ModifyPetProfile} options={{ headerShown: false }} />
          <Stack.Screen name="DrawerHome" component={DrawerHome} options={{ headerShown: false }} />
          <Stack.Screen name="SearchResults" component={SearchResults} options={{ headerShown: false }} />
          <Stack.Screen name="IngredientExpanded" component={IngredientExpanded} options={{ headerShown: false }} />
          <Stack.Screen name="ProductExpanded" component={ProductExpanded} options={{ headerShown: false }} />
          <Stack.Screen name="FoodExpanded" component={FoodExpanded} options={{ headerShown: false }} />
          <Stack.Screen name="ImageCapture" component={ImageCapture} options={{ headerShown: false }} />
          <Stack.Screen name="ImageCaptureVerify" component={ImageCaptureVerify} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const drawerScreenOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: '#8EA604',
    height: 98,
  },
  drawerActiveBackgroundColor: '#8EA604',
  drawerActiveTintColor: 'white',
  headerTintColor: 'white',
  headerTitleStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 26,
    color: 'white',
    paddingTop: 0,
  },
}

