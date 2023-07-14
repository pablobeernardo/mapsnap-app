import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Button,
  Image,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Keyboard } from 'react-native';

const App = () => {
  const [markers, setMarkers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [markerImageUri, setMarkerImageUri] = useState(null);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  const [cameraType, setCameraType] = useState(Camera.Constants.Type['back']);

  
  const handleDeleteConfirmation = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja excluir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteMarker(markerImageUri) },
      ]
    );
  };


  

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const cameraRef = useRef(null);

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão de localização não concedida');
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    const { coords } = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = coords;
    setCurrentLocation({ latitude, longitude });
  };

  const handleAddMarker = () => {
    if (currentLocation && capturedImage) {
      const newMarker = {
        id: markers.length.toString(),
        coordinate: currentLocation,
        imageUri: capturedImage,
        title: '',
        description: '',
      };
      setMarkers([...markers, newMarker]);
    }
    setCameraVisible(false);
  };

  const saveToGallery = async (photoUri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
      console.log('Imagem salva na galeria');
    } catch (error) {
      console.log('Erro ao salvar imagem na galeria:', error);
    }
  };

  const handleOpenCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão da câmera não concedida');
    } else {
      setCameraVisible(true);
    }
  };

  const handleCaptureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      await saveToGallery(photo.uri);

      const newMarker = {
        id: markers.length.toString(),
        coordinate: currentLocation,
        imageUri: photo.uri,
        title: '',
        description: '',
      };
      setMarkers([...markers, newMarker]);

      setCapturedImage(photo.uri);
      setCameraVisible(false);
      handleAddMarker();
    }
  };

  const renderMarkerCallout = (marker) => (
    <TouchableOpacity onPress={dismissKeyboard}>
      <Image source={{ uri: marker.imageUri }} style={styles.markerImage} />
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', color: '#303F9F' }}>
        {marker.title}
      </Text>
    </TouchableOpacity>
  );

  const handleMarkerPress = (marker) => {
    setMarkerImageUri(marker.imageUri);
    setMarkerTitle(marker.title);
    setMarkerDescription(marker.description);
    setModalVisible(true);
  };

  const handleBackToMap = () => {
    setCameraVisible(false);
  };

  const handleDeleteMarker = (imageUri) => {
    const updatedMarkers = markers.filter((marker) => marker.imageUri !== imageUri);
    setMarkers(updatedMarkers);
    setModalVisible(false);
  };

  const handleSaveMarker = () => {
    const updatedMarkers = markers.map((marker) => {
      if (marker.imageUri === markerImageUri) {
        return {
          ...marker,
          title: markerTitle,
          description: markerDescription,
        };
      }
      return marker;
    });

    setMarkers(updatedMarkers);
    setModalVisible(false);
    dismissKeyboard();
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
      {currentLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onPress={() => handleMarkerPress(marker)}
            >
              {renderMarkerCallout(marker)}
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      )}

      {!isCameraVisible && (
        <TouchableOpacity style={styles.buttonContainer} onPress={handleOpenCamera}>
          <View style={styles.iconContainer}>
            <Icon name="camera" size={30} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {isCameraVisible && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          type={cameraType}
          onCameraReady={() => console.log('Câmera pronta')}
          onMountError={(error) => console.log('Erro ao montar a câmera:', error)}
        >
          <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage}>
            <Icon name="camera" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
            <Icon name="flip-camera-ios" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToMap}>
            <Icon name="arrow-back" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </Camera>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer} onPress={dismissKeyboard}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {markerImageUri && (
                <>
                  <Image source={{ uri: markerImageUri }} style={styles.modalImage} />
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Título"
                value={markerTitle}
                onChangeText={setMarkerTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={markerDescription}
                onChangeText={setMarkerDescription}
                multiline={true}
              />
              <View style={{flexDirection:'row' , justifyContent:'space-between'}}>
                <Button title="Salvar" onPress={handleSaveMarker} />
                <Button title="Deletar" onPress={handleDeleteConfirmation} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    marginTop: 320,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: '#303F9F',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default App;