import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
 updateProfile,
  signOut,
} from "firebase/auth";
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionic from 'react-native-vector-icons/Ionicons';
import HomeScreen from './HomeScreen';
import Akun from './Akun';
import Tagihan from './Tagihan';
import Menu from './Menu';
import Colors from '../utilities/Colors';

const Home = ({navigation}) => {
    const logout = async () => {
    await signOut(auth).then(()=>{
    navigation.replace('Login')
    })
  };

  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
    screenOptions={({route})=>({
      tabBarIcon:({focused, size ,colour})=>{
        let iconName;
        if(route.name === 'Home'){
          iconName =  focused ? 'home' : 'home-outline'
        }
        else if (route.name === 'Menu'){
          iconName =  focused ? 'clipboard' : 'clipboard-outline'
        }
         else if (route.name === 'Tagihan'){
          iconName =  focused ? 'wallet' : 'wallet-outline'
        }
         else if (route.name === 'Akun'){
          iconName =  focused ? 'person' : 'person-outline'
        }
      return <Ionic name={iconName} size={size} color={focused ? Colors.primary : "gray"} />
      }, tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: 'gray',
    })}
    >
      <Tab.Screen name="Home" component={HomeScreen}></Tab.Screen>
        <Tab.Screen name="Menu" component={Menu}></Tab.Screen>
         <Tab.Screen name="Tagihan" component={Tagihan}></Tab.Screen>
          <Tab.Screen name="Akun" component={Akun}></Tab.Screen>
    </Tab.Navigator>

  )
}

export default Home

const styles = StyleSheet.create({})