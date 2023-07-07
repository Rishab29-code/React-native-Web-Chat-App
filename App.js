//@refresh reset
import React,{useState,useEffect,useCallback} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text,TextInput, View,YellowBox, Button, BackHandler } from 'react-native';
import firebase from 'firebase/compat/app';
import { GiftedChat } from 'react-native-gifted-chat';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'firebase/firestore';
import { QuerySnapshot } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDXSK_pzb8YMR7xaUQiih7-nYeNAvm6bHQ",
  authDomain: "react-native-chatapp-cca0f.firebaseapp.com",
  projectId: "react-native-chatapp-cca0f",
  storageBucket: "react-native-chatapp-cca0f.appspot.com",
  messagingSenderId: "248364410895",
  appId: "1:248364410895:web:cdd5f127b83ac2cbd15b7a"
};
if(firebase.apps.length==0){
  firebase.initializeApp(firebaseConfig)
}
YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])
const db=firebase.firestore()
const chatsRef=db.collection('chats')
export default function App() {
  const [user,setUser]=useState(null);
  const [name,setName]=useState('');
  const [msg,setMsg]=useState([])
  useEffect(()=>{
    readUser()
    const unsubscribe=chatsRef.onSnapshot(QuerySnapshot=>{
      const messageFirestore=QuerySnapshot.docChanges().filter(({type})=>type === 'added').map(({doc})=>{
        const message=doc.data();
        return {...message,createdAt:message.createdAt.toDate()}
      }).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime())
      appendMessages(messageFirestore)
    })
    return ()=>unsubscribe();
  },[])
  async function readUser(){
    const user=await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
    }
  }
  const appendMessages=useCallback((messages)=>{
    setMsg((prevmsg)=>GiftedChat.append(prevmsg,messages))
  },[msg])
  async function handleSend(messages){
    const writes=messages.map((m)=>chatsRef.add(m))
    await Promise.all(writes)
  }
   async function handleButtonPress(){

    const _id=Math.random().toString(36).substring(7)
    const user={_id,name}
    await AsyncStorage.setItem('user',JSON.stringify(user))
    setUser(user)
   
  }
  if(!user){
    return <View style={styles.container}>
      <TextInput style={styles.textInput} placeholder={'Enter your name'} onChangeText={setName}  value={name} />
      <Button title='Enter chat' onPress={handleButtonPress} />
    </View>
  }
  return <GiftedChat messages={msg} user={user} onSend={handleSend}/>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput:{
    height:50,
    width:'100%',
    borderWidth:1,
    padding:15,
    borderColor:'gray',
    marginBottom:5,
  }
});
