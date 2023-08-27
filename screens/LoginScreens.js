import { StyleSheet, Text, View, TextInput,TouchableOpacity,KeyboardAvoidingView } from 'react-native'
import React, {useState,useEffect} from 'react'
import Colors from '../utilities/Colors'
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



const LoginScreens = ({navigation}) => {

   const[name,setName]=  useState ("");

  const [email,setEmail]= useState("");
  const[pass,setPass]=  useState ("");



useEffect(()=>{
const unsub = onAuthStateChanged(auth,(user) => {
  if(user){
    navigation.replace('tabs')
  }
})
return unsub;
})
 

   const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        email,
        pass,
      )
   
      console.log(user);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View
    style={styles.container}
    behavior="padding"
    >
    <View style={styles.inputcontainer}
    >

    <TextInput
    placeholder='Email'
    value={email}
    onChangeText={text=> setEmail(text)}
    style={styles.input}
    >

    </TextInput>


 <TextInput
    placeholder='Password'
   value={pass}
  onChangeText={text=> setPass(text)}
    style={styles.input}
    secureTextEntry
    >

    </TextInput>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
      onPress={login}
      style={styles.button}
      >
    <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

        <TouchableOpacity
      onPress={() => navigation.navigate('Register')}
      style={[styles.button, styles.buttonOutline]}
      >
    <Text style={styles.buttonOutlineText}>Register</Text>
      </TouchableOpacity>

    </View>
   </View>
  )
}

export default LoginScreens

const styles = StyleSheet.create({
container:{
  flex:1,
  justifyContent:'center',
  alignItems:'center'
},
inputcontainer:{
width:'70%',

},
input:{
  backgroundColor:'white',
  paddingHorizontal:15,
  paddingVertical:10,
  borderRadius:10,
  marginTop: 15
},
buttonContainer:{
  width:'60%',
  marginTop:20,


 

},
button:{
marginTop:10,
backgroundColor:Colors.primary,
width:'100%',
padding:10,
justifyContent:'center',
alignItems:'center',
borderRadius:10,

},
buttonOutline:{
backgroundColor:'white',
borderWidth:1,
borderColor: Colors.primary

},
buttonOutlineText:{
color:Colors.primary,
},
buttonText:{
color:'white'

},
})