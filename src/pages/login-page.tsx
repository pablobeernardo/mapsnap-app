import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getStorageData, setStorageData } from '../shared/secury-storage';

const LoginPage = ({ navigation }) => {
  const [author, setAuthor] = useState('');

  useEffect(() => {
    getAuthor();

  }, []);

  async function getAuthor() {
    const localAuthor = await getStorageData['author'];
    if (localAuthor) {
      navigation.navigate('MapPage');
    }
  };

  function login() {
    setStorageData('author', author);

    navigation.navigate('MapPage');

  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image source={require('./../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.appName}>MapSnap</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do usuário"
        value={author}
        onChangeText={setAuthor}
      />
      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303F9F',
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 30,
    marginBottom: 150,
    color: 'white'
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 50,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
});

export default LoginPage;