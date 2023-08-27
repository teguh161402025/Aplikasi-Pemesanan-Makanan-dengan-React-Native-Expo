import { StyleSheet, Text, View,TouchableOpacity,Image ,Button, Modal,Pressable,ScrollView, TouchableNativeFeedback} from 'react-native'
import React from 'react';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
 updateProfile,
  signOut,
} from "firebase/auth";
import { auth,db } from '../firebase';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Ionic from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../utilities/Colors'
import Scanner from './Scanner';
import  { Rating, AirbnbRating }  from 'react-native-ratings';
import {collection, doc,getDocs,setDoc,getDoc,addDoc,onSnapshot,deleteDoc,query,where,updateDoc,arrayUnion} from 'firebase/firestore'
import { getStorage, ref,getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import { get } from 'react-native/Libraries/Utilities/PixelRatio';
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from "react-redux";
import { addTodo, delTodo,UpdateTodo } from "../store/actions/todoActions"
import images from '../utilities/Images';

const Akun = ({navigation}) => {
const [histori,setHistori] =useState([])
const logPesananCol = collection(db, "Log-Pesanan")
const[modalHistori,setModalHistori] =useState(false)
const [id,setId]=useState()
 useEffect(() => {
 
   
    const q = query(logPesananCol, where("email", "==", auth.currentUser?.email),where("status_pesanan", "==", 3));
    onSnapshot(q,(doc)=>{
      let pesanan = []
     doc.docs.map((snapshot)=> {
        pesanan.push({...snapshot.data(),
         id: snapshot.id })  })
         
        
       setHistori(pesanan)
           
     
      })
      

   

  }, []);

   const logout = async () => {
    await signOut(auth).then(()=>{
    navigation.replace('Login')
    })
  };

  function TotalHarga(){


let totalHarga = 0
 
histori.filter( a => a.id_order == id).map( a => a.pesanan.map( a =>
  
  totalHarga +=(parseInt(a.harga)*a.jumlah)
 
  ))


  //const totalHarga = totalHargaArray.reduce((accumulator, totalHargaArray) => {
 // return accumulator + totalHargaArray;
 // }, 0)  

return totalHarga
}
const totalHarga = () =>{

  
    const a =<View>
    
    <View style={{
      justifyContent:'space-between',
      flexDirection:'row',
      marginBottom:20,
      width:'100%'        
            }}>
           
            <Text>Total harga  :</Text>

              <Text>Rp.{ TotalHarga()}</Text>
             </View>
              </View>

              return a
            
  

       
}
  return (
    <View style={{flex:1,
    padding:15}}>

    <View style={{
        width:'100%',
        height: '100%',
        backgroundColor:'white',


    }}>
    <View style={{
      padding:30
    }}>
      <Text style={{
        fontSize:20,
        fontWeight:'bold'
      }}>{auth.currentUser?.displayName}</Text>
      <Text style={{
        fontSize:16,
        fontWeight:'400'
      }}>{auth.currentUser?.email}</Text>
    </View>

    <Text style={{
      paddingHorizontal:20,
      fontSize:14,
      fontWeight:'400',
      color:Colors.primary
    }}>Histori Pembelian Anda</Text>
    <View style={{
      height:'50%'
    }}>
    <ScrollView>
    {
      histori.map(a => 
      <TouchableNativeFeedback onPress={()=> {setModalHistori(true),setId(a.id_order)}}>
      <View style={{
        borderBottomWidth:1,
        marginHorizontal:20,
        paddingTop:5,
        paddingBottom:2,
       borderBottomColor:Colors.primary
      }}>

      <Text style={{
        color:'#c7c7c7',
        fontSize:12
      }}>{a.pesanan[0].tanggal}</Text>
      <Text>Anda Melakukan {a.pesanan.length} Pemesanan </Text>
    </View>
    </TouchableNativeFeedback>
      )
    }
  </ScrollView>
  </View>
    <TouchableOpacity
      onPress={logout}
      style={[styles.button, styles.buttonOutline]}
      >
    <Text style={styles.buttonOutlineText}>Log Out</Text>
      </TouchableOpacity>
    </View>

<Modal
        animationType="slide"
        transparent={true}
        visible={modalHistori}
             onRequestClose={() => {
       

          setModalHistori(false);
        }}
      
      >

        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <TouchableNativeFeedback onPress={()=> setModalHistori(false)}>
        <Ionic style={{
          padding:10,
          position:'absolute',
          right:0
        }} name={'close'} size={23} color={ Colors.primary} /> 
          </TouchableNativeFeedback>
         
         <ScrollView  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  
                  style={{
                    width:"80%",
                    height:"60%"
                  }}>  
           {
             
             histori.filter(a => a.id_order == id).map((a => a.pesanan.map( a =>

              
                  
                  
                 <View style={styles.pesanlistcon}>
                 {
                    
                 }
         
                  <Text>
                     {
                     
                       a.makanan
                     }    x{a.jumlah}
                   </Text>
                   <Text>Rp.
                     {
                        a.harga
                    
                     }
                   </Text>
             
         
                    
                 </View>
              
             )))
            
           }
         
 </ScrollView>

 {
                       totalHarga()
                     }
           
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Akun

const styles = StyleSheet.create({
  button:{
marginHorizontal:'10%',
backgroundColor:Colors.primary,
width:'80%',
padding:10,
justifyContent:'center',
alignItems:'center',
borderRadius:10,
height:50,
bottom:20,
position:'absolute'
},
buttonOutline:{
backgroundColor:Colors.primary,



},
buttonOutlineText:{
color:'white',
},

   modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },


 
 pesanlistcon:{
  
   padding:5,
   borderBottomWidth:1,
   borderColor:"gray",
   width:'100%'
 }
})