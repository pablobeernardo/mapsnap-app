import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const CamPage = ({ navigation, route }) => {
  const cameraRef = useRef(null);
  const { markerId } = route.params || {};

  // Função para salvar a imagem capturada na galeria do dispositivo
  const saveToGallery = async (photoUri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
      console.log('Imagem salva na galeria');
    } catch (error) {
      console.log('Erro ao salvar imagem na galeria:', error);
    }
  };

  // Função para voltar à página do mapa
  const goBackToMap = () => {
    navigation.goBack();
  };

  // Função para capturar uma imagem usando a câmera
  const handleCaptureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      await saveToGallery(photo.uri);

      // Aqui você pode tratar a imagem capturada conforme necessário

      goBackToMap();
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        type={Camera.Constants.Type['back']}
        onCameraReady={() => console.log('Câmera pronta')}
        onMountError={(error) => console.log('Erro ao montar a câmera:', error)}
      >
        <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage}>
          <Icon name="camera" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBackToMap}>
          <Icon name="arrow-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#303F9F',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: '#303F9F',
    borderRadius: 20,
    padding: 10,
    elevation: 5,
  },
});

export default CamPage;
