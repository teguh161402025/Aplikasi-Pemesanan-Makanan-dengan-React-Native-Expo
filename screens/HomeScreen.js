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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconM from 'react-native-vector-icons/MaterialIcons';


const HomeScreen = ({ route, navigation, todos, addTodo, delTodo, UpdateTodo }) => {
  const datascan = todos.filter(a => a.id == 'scanner').map(a => a.data);
  const [docCol, setDocCol] = useState([])
  const [imgUrld, setImgUrld] = useState()
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisiblePesan, setModalVisiblePesan] = useState(false);
  const [modalVisiblePesanadv, setModalVisiblePesanadv] = useState(false);
  const [modalData, setModalData] = useState({})
  const [meja, setMeja] = useState()
  const [idPesan, setIdpesan] = useState('');
  const [pesananlist, setPesananlist] = useState([]);
  const [pesananlength, setPesananLength] = useState(0)
  const [isdiPesan, setisdipesan] = useState(false);
  const [detailHarga, setdetailHarga] = useState(0);
  const [idpesanan, setIdPesanan] = useState('');
  const [pesananKe, setpesananKe] = useState([]);
  const [cekIdChanged, setIdChanged] = useState(false)
  const [jumlah, setjumlah] = useState(1)
  const [data, setData] = useState([])
  const [userRating, setUserRating] = useState([])
  const [rekomen, setRekomen] = useState([])


  const collectionRef = collection(db, "menu");
  const ratingCol = collection(db, "user-rating")
  const tes = "Nasi Goreng"

  useEffect(() => {


    const getMenu = async () => {
      const data = await getDocs(collectionRef);
      const datas = data.docs.map((doc) => ({

        ...doc.data(),
        id: doc.id
      }));
      setDocCol(datas)
      //return datas




    };


    const getRating = async () => {
      const data = await getDocs(ratingCol);
      const datas = data.docs.map((doc) => ({

        ...doc.data()
      }));
      setUserRating(datas)
      return datas




    };

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }


    setIdpesan(result)
    UpdateTodo({
      id: 'idpesan',
      name: auth.currentUser?.displayName,
      email: auth.currentUser?.email,
      id_order: result,
      status_pesanan: 0,
      meja: datascan,
    })

    //  rekomendasi();
    getMenu();
    getRating();


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

  function generateID() {

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result
  }

  function makeid() {


    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    setIdpesan(result)
    addTodo({
      id: 'idpesan',
      data: result
    })
    setModalVisiblePesanadv(false),
      setPesananLength(0),
      UpdateTodo({
        id: 'pesanlength',
        data: pesananlength
      })
    setdetailHarga(0)
    setIdChanged(true)

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

  const storage = getStorage();

  async function ImgUrl() {
    const pathReference = ref(storage, 'gs://rini-bf259.appspot.com/60a9b166c6503.jpeg');
    const geturl = await getDownloadURL(pathReference);



    return geturl
  }


  const getLogPesanan = async () => {
    onSnapshot(q, (doc) => {
      let pesanan = []
      doc.docs.map((snapshot) => {
        pesanan.push({
          ...snapshot.data(),
          id: snapshot.id
        })
      })


      setPesananlist(pesanan)


    })
  }


  const cardcontain = () => {
    if (datascan == 0) {

      return 'Silahkan Scan QR Code dari Meja Anda'
    }
    else {
      return 'Anda Telah terdaftar Di Meja\xa0' + datascan + '\nSilahkan Selanjutnya Untuk Memesan'
    }
  }



  const listPesan = () => {
    if (todos.filter(a => a.status == 0).length > 0) {
      const popup = <View style={{
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        marginBottom: "5%"
      }}>


        <TouchableOpacity onPress={() => setModalVisiblePesanadv(true)} style={styles.popmenu

        }>
          <Text style={{
            color: "white"
          }}>Anda Telah Menambahkan {todos.filter(a => a.status == 0).length} Pesanan</Text>
        </TouchableOpacity>

      </View>

      return popup
    }
  }

  const create = async () => {

    if (datascan == null) {

      alert('Silahkan Scan QR Code dari Meja Anda Untuk Memesan :)')
    }
    else {

      if (idpesanan == '') {

        setpesananKe(idPesan)
        await addDoc(logPesananCol, modalData);
        const docRef = await addDoc(collection(db, "Pesanan"), {

          nama: auth.currentUser?.displayName,
          email: auth.currentUser?.email,
          meja: datascan,
          status: 0,
          pesanan: [idPesan],



        });
        setIdPesanan(docRef.id)

      }
      else {



        if (cekIdChanged == true) {
          const userDoc = doc(db, "Pesanan", idpesanan);
          const newFields = { pesanan: arrayUnion(idPesan) };
          await updateDoc(userDoc, newFields);
          await addDoc(logPesananCol, modalData);
          setIdChanged(false)
        }

        else {
          await addDoc(logPesananCol, modalData);
        }


      }




      setModalVisible(!modalVisible)
      setModalVisiblePesan(true)
      setPesananLength(1 + pesananlength)
      UpdateTodo({
        id: 'pesanlength',
        data: pesananlength
      })
      setdetailHarga(detailHarga + modalData.harga)
    }

  };


  const deletecol = async (col, id, harga) => {
    const userDoc = doc(db, col, id);
    await deleteDoc(userDoc);
    setPesananLength(pesananlength - 1)
    UpdateTodo({
      id: 'pesanlength',
      data: pesananlength
    })
    setdetailHarga(detailHarga - harga)
  };

  function TotalHarga() {
    let totalHarga = 0

    todos.filter(a => a.status == 0).map(a =>

      totalHarga += (parseInt(a.harga) * a.jumlah)

    )


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




  const rekomendasi = () => {

    let similarity = [];
    let mean = [];
    let filter = docCol;
    let rekomendasi = [];
    let meanAuth = 0;
    let rating = []
    rating = userRating.map(a => a.pesanan)
    try {
      console.log(userRating.filter(a => a.email == auth.currentUser?.email).length, auth.currentUser?.email)
      if (userRating.filter(a => a.email == auth.currentUser?.email).length > 0) {

        const indexAuth = userRating.findIndex(a => a.email == auth.currentUser?.email)
        //rumus 1
        for (let a = 0; a < rating.length; a++) {

          if (a != indexAuth) {
            let sum = 0;
            //  console.log(a)
            rating[indexAuth].map(x => {

              for (let b = 0; b < rating[a].length; b++) {

                if (rating[a][b].id == x.id) {
                  sum += rating[a][b].rating / rating[indexAuth].length

                }
              }
            })
            rating[indexAuth].map(x => {
              for (let b = 0; b < rating[a].length; b++) {

                if (rating[a][b].id == x.id) {
                  rating[a][b]['rating'] = rating[a][b].rating - sum
                }
              }
            }
            )
            similarity.push({ pesanan: rating[a], mean: sum, sim: 0 })

          }
          else {

            const sumAuth = rating[a].reduce((partialSum, a) => partialSum + a.rating, 0) / rating[a].length;
            for (let a = 0; a < rating[indexAuth].length; a++) {
              rating[indexAuth][a]['rating'] = rating[indexAuth][a].rating - sumAuth

            }
            similarity.push({ pesanan: rating[a], mean: sumAuth, sim: 0 })
            meanAuth = sumAuth
            // console.log('else'+sumAuth)
            //  console.log('sum main ='+ sum)
          }




        }
        for (let a = 0; a < rating.length; a++) {
          let top = 0;
          let bottom_a = 0;
          let bottom_b = 0;
          if (a != indexAuth) {
            rating[indexAuth].map(x => {

              for (let b = 0; b < rating[a].length; b++) {
                if (rating[a][b].id == x.id) {
                  top += (x.rating * rating[a][b].rating)
                  bottom_a += (Math.pow(x.rating, 2))
                  bottom_b += (Math.pow(rating[a][b].rating, 2))

                }

              }
            }
            )
            // similarity.push({sim:(top/((Math.sqrt(bottom_a))*Math.sqrt(bottom_b)))})
            similarity[a]['sim'] = (top / ((Math.sqrt(bottom_a)) * Math.sqrt(bottom_b)))
          }

        }

        rating[indexAuth].map(b => {
          filter = filter.filter(a => a.id != b.id)

        })

        filter.map(x => {
          let top = 0;
          let bottom = 1;
          let pred = 0;
          similarity.filter(a => a.sim > 0.3).map(b => b.pesanan.map(c => {
            if (c.makanan == x.makanan) {
              //alert('sim')

              top += ((b.sim * (c.rating - b.mean)))
              console.log('top', top, x.makanan)
              bottom *= Math.abs(b.sim)
            }
          }

          )
          )
          console.log(meanAuth, '+', top, '/', bottom)
          pred = ((meanAuth + top) / bottom)

          console.log('pred', pred)
          let v;
          if (meanAuth == 0) {
            v = 2;
          }
          else {
            v = 4;
          }
          if (top != 0) {
            if (pred >= v) {
              rekomendasi.push({
                harga: x.harga,
                id: x.id,
                kategori: x.kategori,
                keterangan: x.keterangan,
                link: x.link,
                makanan: x.makanan,
                rating: x.rating

              })

            }
          }
        })
        console.log('filter', JSON.stringify(filter))
        console.log('rekomen', JSON.stringify(rekomendasi))

        if (rekomendasi.length <= 0) {
          filter.map(x => {
            let top = 0;
            let bottom = 1;
            let pred = 0;
            similarity.filter(a => a.sim > 0.3).map(b => b.pesanan.map(c => {
              if (c.makanan == x.makanan) {

                top += ((b.sim * (c.rating - b.mean)))
                bottom *= Math.abs(b.sim)
              }
            }

            )
            )
            pred = ((meanAuth + top) / bottom)
            let v;
            if (meanAuth == 0) {
              let v = 2;
            }
            else {
              v = 4
            }
            if (pred >= v) {
              rekomendasi.push({
                harga: x.harga,
                id: x.id,
                kategori: x.kategori,
                keterangan: x.keterangan,
                link: x.link,
                makanan: x.makanan,
                rating: x.rating

              })

            }

          })
          //alert(1)
          return rekomendasi.slice(0, 3)
        }
        else {

          return rekomendasi
        }
      }
      else {

        return 1
      }

    } catch (error) {
      console.error("Terjadi kesalahan:", error.message);
    }

  }

  useEffect(() => {
    console.log('perbarui')
    const recommendedItems = rekomendasi();
    setRekomen(recommendedItems);
  }, [userRating]);


  return (

    <View style={styles.container}>
      {


      }
      <View style={{

        width: '100%',
        alignItems: 'center'

      }}>
        <View style={styles.cardscan}>
          <View>
            <Text style={{
              fontSize: 18
            }}>
              Halo, {auth.currentUser?.displayName}

            </Text>
            <Text style={{

            }}>
              {

                cardcontain()
              }

            </Text>
          </View>
          <TouchableOpacity style={
            {

            }
          }
            onPress={() => navigation.navigate('Scanner')}
          >

            <IconM name={'qr-code-scanner'} size={55} color={Colors.primary} />

          </TouchableOpacity>

        </View>
      </View>

      <Text style={{
        padding: 15,
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary
      }}>
        Rekomendasi Untuk Anda
      </Text>

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
      <ScrollView style={{
        height: '100%'
      }}>

        {rekomen === 1 ? <Text style={{
          paddingLeft: 15
        }}>Belum ada rekomendasi nih</Text> :
          rekomen.map((menu) =>

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
                  meja: datascan,
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

        }


      </ScrollView>




      {
        listPesan()
      }

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
  );
}

const mapStateToProps = state => ({
  todos: state.todoReducer.todos
})
export default connect(mapStateToProps, { addTodo, delTodo, UpdateTodo })(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,


  },

  cardscan: {
    flexDirection: 'row',
    width: '95%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 12,
    borderRadius: 10,


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
    height: 120,
    marginTop: 8

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
    fontSize: 16
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
});