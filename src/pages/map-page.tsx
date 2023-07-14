import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Button, Text, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';

const MapPage = ({navigation, route}) => {
  
  const { capturedImage } = route.params;
  const [markers, setMarkers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [markerImageUri, setMarkerImageUri] = useState(null);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de localização não concedida');
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
  };

  const saveToGallery = async (photoUri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
      Alert.alert('Imagem salva na galeria');
    } catch (error) {
      Alert.alert('Erro ao salvar imagem na galeria:', error);
    }
  };

  const handleMarkerPress = (marker) => {
    setMarkerImageUri(marker.imageUri);
    setMarkerTitle(marker.title);
    setMarkerDescription(marker.description);
    setModalVisible(true);
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

  const handleDeleteMarker = (imageUri) => {
    const updatedMarkers = markers.filter((marker) => marker.imageUri !== imageUri);
    setMarkers(updatedMarkers);
    setModalVisible(false);
    dismissKeyboard();
  };

  const handleAddMarkerAndSaveToGallery = async () => {
    if (currentLocation && capturedImage) {
      await saveToGallery(capturedImage);
      handleAddMarker();
    }
  };

  useEffect(() => {
    handleAddMarkerAndSaveToGallery();
  }, [currentLocation, capturedImage]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                <Image source={{ uri: marker.imageUri }} style={styles.markerImage} />
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        )}

        <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('CamPage')}>
          <MaterialIcons name="camera" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {markerImageUri && (
                <Image source={{ uri: markerImageUri }} style={styles.modalImage} />
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
                onBlur={dismissKeyboard} // Fechar o teclado quando o campo perder o foco
              />
              <View style={styles.modalButtonContainer}>
                <Button title="Salvar" onPress={handleSaveMarker} />
                <Button title="Deletar" onPress={() => handleDeleteMarker(markerImageUri)} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MapPage;