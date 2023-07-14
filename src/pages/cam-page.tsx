import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const CamPage = ({navigation}) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type['back']);
  const cameraRef = useRef(null);

  const handleCaptureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      navigation.navigate('MapPage', { capturedImage: photo.uri });
    }
  };

  const toggleCameraType = () => {
    setCameraType((prevType) =>
      prevType === Camera.Constants.Type['back']
        ? Camera.Constants.Type['front']
        : Camera.Constants.Type['back']
    );
  };

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={cameraType} />
      <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage}>
        <Text style={styles.captureButtonText}>Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
        <Text style={styles.toggleButtonText}>Toggle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
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
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'flex-end',
    backgroundColor: '#303F9F',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
    right: 10,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default CamPage;