import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreens from './screens/LoginScreens';
import Home from './screens/Home';
import Register from './screens/Register';
import Scanner from './screens/Scanner';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider} from "react-redux";
import store from "./store"
import MenuKategori from './screens/MenuKategori';
const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
export default function App() {

  return (
    <Provider store={store}>
     <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{headerShown: false} } name="Login" component={LoginScreens} />
               <Stack.Screen options={{headerShown: false} } name="Register" component={Register}/>
                <Stack.Screen options={{headerShown: false} }  name="tabs" component={Home}/>
                   <Stack.Screen  options={{headerShown: false} }  name="Scanner" component={Scanner}/>
                    <Stack.Screen  options={{headerShown: false} }  name="MenuKategori" component={MenuKategori}/>
      </Stack.Navigator>
  
    </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
