import { StyleSheet, Text, View, TouchableOpacity, Button, Image, Modal, Pressable, ScrollView, TouchableNativeFeedback } from 'react-native'
import React from 'react';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, db } from '../firebase';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Colors from '../utilities/Colors'
import Scanner from './Scanner';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { async } from '@firebase/util';
import { connect } from "react-redux";
import { addTodo, delTodo, UpdateTodo, deleteById } from "../store/actions/todoActions"
import * as Animatable from 'react-native-animatable';

const Tagihan = ({ todos, addTodo, delTodo, UpdateTodo, route, navigation, deleteById }) => {

  const [ratingv, setratingv] = useState('0');
  const [pesananlist, setPesananlist] = useState([]);
  const [idPesan, setIdpesan] = useState([])
  const [dataPesanan, setDataPesanan] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [ratingPesan, setRatingPesan] = useState(0)
  const [dataArray, setDataArray] = useState(0)
  const [modalToast, setModalToast] = useState(false)
  const [modalThx, setModalThx] = useState(false)
  const ratingCompleted = (rating) => {
    setratingv(rating)
  }

  useEffect(() => {
    const getTagihan = () => {


    }

    const getDataPesanan = () => {


      let pesanan = []
      pesananlist.map((a) =>
        a.pesanan.map((b) =>

          onSnapshot(query(collection(db, "LogPesanan"), where("id_pesanan", "==", b)), (doc) => {

            doc.docs.map((snapshot) => {
              setDataPesanan([...dataPesanan, snapshot.data()])
              pesanan.push({
                ...snapshot.data(),
                id: snapshot.id
              })
            })


            setDataPesanan(pesanan)


          })
        )


      )

    }

    getTagihan()
    getDataPesanan()
  }, [])

  function generateID() {

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result
  }



  const commitToDB = async () => {
    const dataUser = todos.filter(a => a.email == auth.currentUser?.email)
    await updateDoc(doc(db, "Log-Pesanan", dataUser[0].id_order), { status_pesanan: 2 });

  }

  const updateRatingDB = async () => {

    if (ratingPesan > 0) {
      const collectionRef = collection(db, "menu");
      const collectionUserRating = collection(db, "user-rating");
      const dataDB = await getDocs(collectionRef);
      const datasDB = dataDB.docs.map((doc) => ({

        ...doc.data(),
        id: doc.id
      }));


      const data = todos.filter(a => a.status == 1)
      const ratingDB = (datasDB.filter(a => a.id == data[dataArray].id)[0].rating)
      const finalrating = (ratingDB + ratingPesan) / 2

      const ratingUserDB = await getDocs(collectionUserRating);
      const ratingUsersDB = ratingUserDB.docs.map((doc) => ({

        ...doc.data()
      }));
      if (ratingUsersDB.filter(a => a.email == auth.currentUser?.email).length > 0) {
        console.log(ratingUsersDB.filter(a => a.email == auth.currentUser?.email).map(a => a.pesanan)[0].filter(a => a.id == data[dataArray].id).length)
        if (ratingUsersDB.filter(a => a.email == auth.currentUser?.email).map(a => a.pesanan)[0].filter(a => a.id == data[dataArray].id).length) {
          console.log('if')
          const user_rating = ratingUsersDB.map(a => a.pesanan)
          const index = user_rating[0].findIndex(a => a.id == data[dataArray].id)
          console.log(user_rating[0], index, data[dataArray].id, ratingUsersDB.map(a => a.pesanan.filter(a => a.id == data[dataArray].id)))
          ratingUsersDB[0].pesanan[index].rating = ratingPesan
          await setDoc(doc(db, "user-rating", auth.currentUser?.email), {
            ...ratingUsersDB
          }
          );
        }
        else {
          console.log('else')
          const userDoc = doc(db, "user-rating", auth.currentUser?.email);
          const newFields = {
            pesanan: arrayUnion({
              makanan: data[dataArray].makanan,
              id: data[dataArray].id,
              rating: ratingPesan
            })
          };
          await updateDoc(userDoc, newFields);
        }


      }
      else {
        console.log('<1')
        await setDoc(doc(db, "user-rating", auth.currentUser?.email), {

          email: auth.currentUser?.email,
          nama: auth.currentUser?.displayName,

          pesanan: [{
            makanan: data[dataArray].makanan,
            id: data[dataArray].id,
            rating: ratingPesan
          }]
        });
      }

      await updateDoc(doc(db, "menu", data[dataArray].id), { rating: Math.ceil(finalrating) });
      setRatingPesan(0)
      if (dataArray == todos.filter(a => a.status == 1).length - 1) {
        setDataArray(0)
        setModalVisible(!modalVisible)
        data.map(a => deleteById(a.id))
        const user = todos.filter(a => a.id == 'idpesan')
        user[0].id_order = generateID()
        UpdateTodo(user)

        deleteById('scanner')
        setModalThx(true)
        setTimeout(() => { setModalThx(false) }, 3000)

      }
      else {
        setDataArray(dataArray + 1)
      }

    }

    else {
      alert('Beri Rating Dulu Dongs :(')
    }


  }
  const logout = async () => {
    await signOut(auth).then(() => {
      navigation.replace('Login')
    })
  };
  const giveRating = () => {

    const data = todos.filter(a => a.status == 1)
    const reviews = ['Belum ada Penilaian', 'Gak enak', 'Biasa aja', 'Lumayan', 'Enak', 'Enak Banget']

    const view = <View style={styles.centeredView}>
      <View style={styles.modalView}>

        <Text style={{
          fontWeight: '600',
          fontSize: 20,
          paddingBottom: 15
        }}>Yuk ! Beri Penilaian Dulu ! </Text>
        <Image style={{
          height: "40%",
          width: "80%",
          borderRadius: 10
        }} source={{
          uri: data.length > 0 ? data[dataArray].link : ''
        }} />
        <Text style={{ fontWeight: 'bold', paddingVertical: 20, fontSize: 15 }}>{data.length > 0 ? data[dataArray].makanan : ''}</Text>

        <Rating
          type='star'
          ratingCount={5}
          imageSize={30}
          onFinishRating={(a) => setRatingPesan(a)}
          startingValue={ratingPesan}
          reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great', 'tes']}
          //onFinishRating={dataArray < data.length ?  setDataArray(dataArray+1) : {modalVisible(false), setDataArray(0)} }
          style={{ alignItems: "flex-start" }}

        />

        <Text style={{ fontSize: 16, marginTop: 5, color: '#f1c40f', fontWeight: '700' }}>{reviews[ratingPesan]}</Text>

        {
          data.length === dataArray + 1 ? <TouchableOpacity
            style={[styles.button, styles.buttonBack]}
            onPress={async () => {
              await updateRatingDB();
              setTimeout(() => {
                logout()
              }, 3000);
            }}
          >

            <Text style={styles.textback}>Beri Nilai dan Bayar</Text>
          </TouchableOpacity>
            :
            <TouchableOpacity
              style={[styles.button, styles.buttonBack]}
              onPress={() => { updateRatingDB() }}
            >

              <Text style={styles.textback}>Beri Nilai</Text>
            </TouchableOpacity>
        }

      </View>
    </View>

    return view
  }

  function TotalHarga() {

    let totalHarga = 0

    todos.filter(a => a.status == 1).map(a =>

      totalHarga += (parseInt(a.harga) * a.jumlah)

    )
    return totalHarga
  }

  const Tagihan = () => {

    const data = todos.filter(a => a.status == 1)




    const view = <View style={{


      padding: 10
    }}>

      <View style={{
        backgroundColor: "white",
        width: "100%",
        height: '100%',
      }}>

        {
          data.map(a =>

            <View style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: Colors.primary

            }}>
              <View style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between'
              }}>
                <Text>{a.makanan}</Text>
                <Text>x {a.jumlah}</Text>
              </View>

              <Text>Rp.{a.harga}</Text>


            </View>


          )

        }
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',

        }}>


          <View style={{
            padding: 15,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <Text>Total Tagihan :</Text>
            <Text>Rp.{TotalHarga()}</Text>
          </View>

          <View style={{
            marginBottom: 20,
            alignItems: 'center',
            flexDirection: "column",
            padding: 15,
          }}>
            <Pressable style={[styles.btn, { backgroundColor: Colors.primary }]} onPress={() => { commitToDB(), setModalToast(true) }}>
              <Text style={[styles.btnContainer, { color: 'white' }]}>Bayar Pesanan</Text>
            </Pressable>


          </View>
        </View>
      </View>

    </View>

    const viewNothing = <View style={{


      padding: 10
    }}>

      <View style={{
        backgroundColor: "white",
        width: "100%",
        height: '100%',
        justifyContent: 'center'

      }}>

        <View style={{

          alignItems: "center",
          width: '100%',

        }}>

          <Text style={{
            fontWeight: '600',
            fontSize: 20,
            color: 'gray',
            textAlign: 'center'

          }}>Yah..., Kamu Belum Melakukan Pemesanan</Text>

          <Icon name='emoticon-sad-outline' size={100} color={'gray'} />
        </View>

      </View>

    </View>


    if (data.length > 0) {
      return view
    }
    else {
      return viewNothing
    }

  }

  const rupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(number);
  }
  return (
    <View>

      {
        Tagihan()
      }







      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >

        <Animatable.View style={{
          alignItems: 'center',
          paddingTop: '15%'
        }} animation={'pulse'}
        >

          {
            giveRating()
          }
        </Animatable.View>
      </Modal>



      <Modal

        transparent={true}
        visible={modalToast}
        onRequestClose={() => {


          setModalToast(!modalToast);
        }}
      >
        <Animatable.View animation="pulse" style={{
          alignItems: 'center',
          paddingTop: '30%'
        }}>
          <View style={{
            width: 300,
            height: 300,
            backgroundColor: 'white',
            elevation: 1,
            borderRadius: 10
          }}>
            <View style={{
              alignItems: 'center',
              paddingTop: '10%'
            }}>

              <Animatable.View animation={'bounceIn'}>
                <Icon name='check-circle-outline' size={100} color='#67c750' />
              </Animatable.View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold'
              }}> Yeay !!! </Text>
              <Text style={{
                padding: '5%',
                fontSize: 14,
                textAlign: 'center',
              }}> Selanjutnya Lakukan Pembayaran di Kasir </Text>
              <TouchableNativeFeedback onPress={() => {
                setModalToast(!modalToast),
                  setTimeout(() => { setModalVisible(true) }, 500);
              }}>
                <Text style={{
                  padding: 20,
                  fontWeight: 'bold',
                  fontSize: 20
                }}>OKE</Text>
              </TouchableNativeFeedback>
            </View>


          </View>

        </Animatable.View>
      </Modal>


      <Modal

        transparent={true}
        visible={modalThx}
        onRequestClose={() => {


          setModalToast(!modalThx);
        }}
      >
        <Animatable.View animation="pulse" style={{
          alignItems: 'center',
          paddingTop: '30%'
        }}>
          <View style={{
            width: 300,
            height: 300,
            backgroundColor: 'white',
            elevation: 1,
            borderRadius: 10
          }}>
            <View style={{
              alignItems: 'center',
              paddingTop: '10%'
            }}>

              <Animatable.View animation={'bounceIn'}>
                <IconAnt name='smileo' size={100} color='#67c750' />
              </Animatable.View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold'
              }}> Yeay !!! </Text>
              <Text style={{
                padding: '5%',
                fontSize: 14,
                textAlign: 'center',
              }}> Terimakasih telah Melakukan Penilaian </Text>

            </View>


          </View>

        </Animatable.View>
      </Modal>

    </View>
  )
}

const mapStateToProps = state => ({
  todos: state.todoReducer.todos
})
export default connect(mapStateToProps, { addTodo, delTodo, UpdateTodo, deleteById })(Tagihan);


const styles = StyleSheet.create({
  btn: {
    padding: 15,
    borderRadius: 10,
    width: '80%',

  },
  btnContainer: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  popmenu: {
    flexDirection: 'row',
    width: '95%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 12,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: Colors.primary,
  },

  menu: {
    backgroundColor: 'white',
    width: '30%',
    height: 90,
    elevation: 2,
    borderRadius: 10,
    marginRight: 15,

  },
  menuText: {
    fontWeight: 'bold',
    color: Colors.primary,
    paddingLeft: 2
  },
  menuIco: {
    width: '100%',
    alignItems: 'flex-end',
    height: '80%',
    justifyContent: 'flex-end',

  },
  titleText: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 17,
    marginLeft: '5%',
    marginTop: 20
  },


  cardmenu: {
    backgroundColor: 'white',
    flexDirection: 'row',
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    justifyContent: 'space-between',
    elevation: 2,
    height: 100,
    marginTop: 5

  },
  imgmenu: {
    width: '40%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 15,
  },

  cardcontainer: {
    padding: 10,
    width: "60%"

  },

  cardText: {
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 15
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 5,
    padding: 10,

    width: 200,
    height: 50,
    marginTop: 15
  },
  popmenu: {
    flexDirection: 'row',
    width: '95%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 12,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: Colors.primary
  },
  buttonBuy: {
    backgroundColor: Colors.primary,
  },


  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16
  },
  textback: {

    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
    paddingLeft: 2
  },
  modalText: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },

  pesanlistcon: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "gray"
  }
})