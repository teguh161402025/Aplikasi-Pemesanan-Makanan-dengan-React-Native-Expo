import { StyleSheet, Text, View, TouchableOpacity, Image, Button, Modal, Pressable, ScrollView, TouchableNativeFeedback } from 'react-native'
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
import Ionic from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../utilities/Colors'
import Scanner from './Scanner';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import { get } from 'react-native/Libraries/Utilities/PixelRatio';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from "react-redux";
import { addTodo, delTodo, UpdateTodo } from "../store/actions/todoActions"
import images from '../utilities/Images';

const Menu = ({ route, navigation, todos, addTodo, delTodo, UpdateTodo }) => {
  const [docCol, setDocCol] = useState([])
  const [imgUrld, setImgUrld] = useState()
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisiblePesan, setModalVisiblePesan] = useState(false);
  const [modalVisiblePesanadv, setModalVisiblePesanadv] = useState(false);
  const [modalData, setModalData] = useState({})
  const [meja, setMeja] = useState()
  const [idPesan, setIdpesan] = useState('');
  const [pesananlist, setPesananlist] = useState([]);
  const [isdiPesan, setisdipesan] = useState(false);
  const [detailHarga, setdetailHarga] = useState(0);
  const [idpesanan, setIdPesanan] = useState('');
  const [pesananKe, setpesananKe] = useState([]);
  const [cekIdChanged, setIdChanged] = useState(false)
  const datascan = todos.filter(a => a.id == 'scanner').map(a => a.data);
  const [pesananlength, setPesananLength] = useState(0)
  const [jumlah, setjumlah] = useState(1)
  useEffect(() => {

    const collectionRef = collection(db, "menu");
    const getMenu = async () => {
      const data = await getDocs(collectionRef);
      const datas = data.docs.map((doc) => ({

        ...doc.data(),
        id: doc.id
      }));
      setDocCol(datas)
      return datas

    };

    getMenu();

  }, []);

  const amount = () => {



    const view = <View style={{
      flexDirection: 'row',

    }}>
      <TouchableNativeFeedback onPress={jumlah > 1 ? () => setjumlah(jumlah - 1) : () => setjumlah(1)}>
        <View>
          <Icon name={'minus-box'} size={20} color={Colors.primary} />
        </View>
      </TouchableNativeFeedback>
      <Text style={{
        width: 40,
        textAlign: 'center',

      }}>{jumlah}</Text>
      <TouchableNativeFeedback onPress={() => setjumlah(jumlah + 1)}>
        <View>
          <Icon name={'plus-box'} size={20} color={Colors.primary} />
        </View>
      </TouchableNativeFeedback>
    </View>






    return view


  }
  const commitToDB = async () => {


    const dataUser = todos.filter(a => a.email == auth.currentUser?.email)
    // dataUser[0]['status_pesanan'] = 1
    // UpdateTodo(dataUser[0])
    const dataPesanan = todos.filter(a => a.status == 0)
    const dataPesananOld = todos.filter(a => a.status == 1)

    for (let a = 0; a < dataPesanan.length; a++) {

      if (dataPesananOld.length > 0) {


        for (let b = 0; b < dataPesananOld.length; b++) {

          if (dataPesanan[a]['id'] === dataPesananOld[b]['id']) {
            dataPesananOld[b]['jumlah'] = parseInt(dataPesanan[a]['jumlah']) + parseInt(dataPesananOld[b]['jumlah'])

            UpdateTodo(dataPesananOld[b])
          }
          else {
            dataPesanan[a]['status'] = 1
            UpdateTodo(dataPesanan[a])
          }

        }
      }
      else {
        dataPesanan[a]['status'] = 1
        UpdateTodo(dataPesanan[a])
      }
    }


    //await addDoc(logPesananCol, modalData);
    const id = todos.filter(a => a.id == 'idpesan').map(a => a.id_order)
    const dataPesananCommit = todos.filter(a => a.status == 1)
    //alert(JSON.stringify(dataPesananCommit))
    console.log(dataPesananCommit)
    console.log(id[0])
    await setDoc(doc(db, "Log-Pesanan", id[0]), {

      ...dataUser[0], pesanan: dataPesananCommit

    });

    setModalVisiblePesanadv(false)
    setPesananLength(0)

  }
  function generateID() {

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result
  }

  const addDataPesanan = async () => {
    if (datascan == 0) {

      alert('Silahkan Scan QR Code dari Meja Anda Untuk Memesan :)')
    }
    else {

      setModalVisible(!modalVisible)
      setModalVisiblePesan(true)
      setdetailHarga(detailHarga + modalData.harga)
      addTodo({ ...modalData, jumlah: jumlah })


    }





  }


  function TotalHarga() {
    let totalHargaArray = []

    let totalHarga = 0

    todos.filter(a => a.status == 0).map(a =>

      totalHarga += (parseInt(a.harga) * a.jumlah)

    )


    //const totalHarga = totalHargaArray.reduce((accumulator, totalHargaArray) => {
    // return accumulator + totalHargaArray;
    // }, 0)  

    return totalHarga
  }
  const totalHarga = () => {

    if (todos.filter(a => a.status == 0).length > 0) {
      const a = <View>

        <View style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginBottom: 20

        }}>{

          }
          <Text>Total harga  :</Text>{

          }
          <Text>Rp.{TotalHarga()}</Text>
        </View>
        <Pressable
          style={[styles.button, styles.buttonBuy]}
          onPress={commitToDB}
        >

          <Text style={styles.textStyle}>Tambah Pesanan</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonBack]}
          onPress={() => setModalVisiblePesanadv(false)}
        >

          <Text style={styles.textback}>Kembali</Text>
        </Pressable></View>

      return a

    }
    else {
      const a = <View>

        <Text style={{

        }}>Anda Belum Menambahkan Pesanan </Text>

        <Pressable
          style={[styles.button, styles.buttonBack]}
          onPress={() => setModalVisiblePesanadv(false)}
        >

          <Text style={styles.textback}>Kembali</Text>
        </Pressable></View>

      return a
    }

  }

  const listPesan = () => {

    if (todos.filter(a => a.status == 0).length > 0) {

      const popup = <View style={{
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        marginBottom: "5%",
      }}>


        <TouchableOpacity onPress={() => setModalVisiblePesanadv(true)} style={styles.popmenu

        }>
          {

          }
          <Text style={{
            color: "white"
          }}>Anda Telah Menambahkan {todos.filter(a => a.status == 0).length} Pesanan</Text>
        </TouchableOpacity>

      </View>

      return popup
    }
  }
  return (
    <View style={{ flex: 1 }}>

      <View style={{
        padding: '5%',
        flexDirection: "row"
      }}>

        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 1,
          kategoriName: 'Aneka Makanan',
          image: images.kategoriBanner.kategori1
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>Makanan</Text>
            <View style={styles.menuIco}>
              <Icon name={'rice'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 2,
          kategoriName: 'Camilan',
          image: images.kategoriBanner.kategori2
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>Camilan</Text>
            <View style={styles.menuIco}>
              <Icon name={'cupcake'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 3,
          kategoriName: 'Minuman',
          image: images.kategoriBanner.kategori3
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>Minuman</Text>
            <View style={styles.menuIco}>
              <Icon name={'glass-wine'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>

      </View>
      <View style={{
        paddingHorizontal: '5%',
        flexDirection: "row"
      }}>
        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 4,
          kategoriName: 'Pasta',
          image: images.kategoriBanner.kategori4
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>Pasta</Text>
            <View style={styles.menuIco}>
              <Icon name={'bowl'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 5,
          kategoriName: 'Burger',
          image: images.kategoriBanner.kategori5
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>Burger</Text>
            <View style={styles.menuIco}>
              <Icon name={'hamburger'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>

        <TouchableNativeFeedback onPress={() => navigation.navigate('MenuKategori', {
          kategori: 6,
          kategoriName: 'Kopi',
          image: images.kategoriBanner.kategori6
        })}>
          <View style={styles.menu}>
            <Text style={styles.menuText}>coffe</Text>
            <View style={styles.menuIco}>
              <Icon name={'coffee'} size={50} color={Colors.primary} />
            </View>

          </View>
        </TouchableNativeFeedback>

      </View>

      <Text style={styles.titleText}>Menu Baru</Text>
      <ScrollView style={{ height: '100%' }}>
        {
          docCol.map((menu) =>

            <TouchableOpacity style={styles.cardmenu} onPress={
              () => {
                setModalVisible(true), setModalData({

                  makanan: menu.makanan,
                  harga: menu.harga,
                  rating: menu.rating,
                  link: menu.link,
                  deskripsi: menu.keterangan,
                  id_pesanan: generateID(),
                  id: menu.id,
                  pemesan: auth.currentUser?.displayName,
                  email_pembeli: auth.currentUser?.email,
                  tanggal: Date(Date.now()).toString(),
                  meja: datascan[0],
                  status: 0

                }), todos.filter(a => a.makanan == menu.makanan).filter(a => a.status == 0)
                  .map(a => parseInt(a.jumlah)) != "" ? setjumlah(todos.filter(a => a.makanan == menu.makanan)
                    .map(a => parseInt(a.jumlah))) : setjumlah(1)
              }}>

              <View style={styles.cardcontainer}>
                <Text style={styles.cardText}> {menu.makanan} </Text>

                <Rating
                  type='star'
                  ratingCount={5}
                  imageSize={15}
                  startingValue={menu.rating}
                  readonly={true}
                  style={{ alignItems: "flex-start" }}
                />
                <Text style={[styles.cardText, {
                  marginTop: 10,
                  position: 'absolute',
                  marginLeft: 15,
                  bottom: 0
                }]}>Rp.{menu.harga} </Text>
              </View>

              <Image source={{
                uri: menu.link
              }} style={styles.imgmenu} />
            </TouchableOpacity>
          )

        }</ScrollView>
      {
        listPesan()
      }

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {


          setModalVisible(!modalVisible);
        }}
      >


        <View style={styles.centeredView}>
          <View style={styles.modalView}>

            <Image style={{
              height: "35%",
              width: "80%",
              borderRadius: 10
            }} source={{
              uri: modalData.link
            }} />
            <Rating
              type='star'
              ratingCount={5}
              imageSize={20}
              startingValue={modalData.rating}
              readonly={true}

              style={{
                marginVertical: 15
              }}
            />
            <Text style={styles.modalText}>{modalData.makanan}</Text>
            <Text style={styles.modalText}>Rp.{modalData.harga}</Text>
            <Text style={{
              textAlign: "center",
              color: "gray"
            }}>"{modalData.deskripsi}"</Text>


            <View style={{
              width: '100%',
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginTop: 15,
              paddingHorizontal: 15


            }}>
              <Text>Jumlah  :</Text>
              {
                amount()
              }
            </View>



            <Pressable
              style={[styles.button, styles.buttonBuy]}
              onPress={addDataPesanan}
            >

              <Text style={styles.textStyle}>Tambah Pesanan</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonBack]}
              onPress={() => setModalVisible(!modalVisible)}
            >

              <Text style={styles.textback}>Kembali</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisiblePesanadv}

      >
        {

        }
        <View style={styles.centeredView}>
          <View style={styles.modalView}>

            <ScrollView showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}

              style={{
                width: "80%",
                height: "60%"
              }}>
              {

                todos.filter(a => a.status == 0).map((a =>




                  <View style={styles.pesanlistcon}>
                    {

                    }
                    <View style={{}}>
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
                    <TouchableOpacity onPress={() => { delTodo(a.id_pesanan); }}>
                      <Ionic name={'close-circle-sharp'} size={23} color={Colors.primary} />
                    </TouchableOpacity>

                  </View>

                ))

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

const mapStateToProps = state => ({
  todos: state.todoReducer.todos
})
export default connect(mapStateToProps, { addTodo, delTodo, UpdateTodo })(Menu);

const styles = StyleSheet.create({
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