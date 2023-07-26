import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Text,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { MarkerEntity } from '../entities/marker-entity';
import { format } from 'date-fns';
import { onValue, ref } from 'firebase/database';
import { db } from '../../firebase-config';


const MapPage = ({ navigation, route }: any) => {
  const { capturedImage } = route.params;
  const [markers, setMarkers] = useState<MarkerEntity[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [markerImageUri, setMarkerImageUri] = useState<string | null>(null);
  const [markerDescription, setMarkerDescription] = useState('');
  const [isEditing, setEditing] = useState(false);
  const [photoDate, setPhotoDate] = useState<string>('');
  const [markerTitle, setMarkerTitle] = useState('');




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
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'dd/MM/yyyy HH:mm:ss');


      const newMarker: MarkerEntity = {
        id: '',
        coords: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        imagePath: capturedImage,
        description: '',
        photoDate: formattedDate,
        title: ''
      };
      setMarkers([...markers, newMarker]);
    }
  };

  const saveToGallery = async (photoUri: string) => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
    } catch (error) {
      Alert.alert('Erro ao salvar imagem na galeria:', error);
    }
  };

  const handleMarkerPress = (marker: MarkerEntity) => {
    setMarkerImageUri(marker.imagePath);
    setMarkerTitle(marker.title);
    setMarkerDescription(marker.description);
    setPhotoDate(marker.photoDate);
    setModalVisible(true);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveMarker = () => {
    const updatedMarkers = markers.map((marker) => {
      if (marker.imagePath === markerImageUri) {
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

  const handleDeleteMarker = (imageUri: string | null) => {
    const updatedMarkers = markers.filter((marker) => marker.imagePath !== imageUri);
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

  async function getPlaces() {
    return onValue(ref(db, '/places'), (snapshot) => {
      try {
        setMarkers([]);
        if (snapshot !== undefined) {
          snapshot.forEach((childSnapshot) => {

            const childkey = childSnapshot.key;
            let childValue = childSnapshot.val();
            childValue.id = childkey;
            setMarkers((places) => [...places, (childValue as MarkerEntity)])
          });
        }
      } catch (e) {
        console.log(e);
      }

    });
  }

  useEffect(() => {

    getPlaces()
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
            {markers.map((marker, index) => (
              <Marker
                key={index.toString()}
                coordinate={marker.coords}
                onPress={() => handleMarkerPress(marker)}
              >
                <View style={styles.markerContainer}>
                  <Image source={{ uri: marker.imagePath }} style={styles.markerImage} />
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        )}

        <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('CamPage')}>
          <MaterialIcons name="camera" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
              <Animatable.View
                style={styles.modalContent}
                animation="fadeInUp"
                duration={500}
                useNativeDriver
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                {markerImageUri && (
                  <Image source={{ uri: markerImageUri }} style={styles.modalImage} />
                )}
                <Text style={styles.dateStyle}>{photoDate}</Text>


                {isEditing ? (
                  <>
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
                      onBlur={dismissKeyboard}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>{markerTitle}</Text>
                    <Text style={styles.modalDescription}>{markerDescription}</Text>
                  </>
                )}
                <View style={styles.modalButtonContainer}>
                  {!isEditing && (
                    <Animatable.View animation="fadeIn" duration={500} delay={200}>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: '#1976D2' }]}
                        onPress={handleEdit}
                      >
                        <Text style={styles.buttonText}>Editar</Text>
                      </TouchableOpacity>
                    </Animatable.View>
                  )}
                  <Animatable.View animation="fadeIn" duration={500} delay={200}>
                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: '#303F9F' }]}
                      onPress={handleSaveMarker}
                    >
                      <Text style={styles.buttonText}>Salvar</Text>
                    </TouchableOpacity>
                  </Animatable.View>
                  <Animatable.View animation="fadeIn" duration={500} delay={300}>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: '#FF0000' }]}
                      onPress={() => handleDeleteMarker(markerImageUri as string)}
                    >
                      <Text style={styles.buttonText}>Deletar</Text>
                    </TouchableOpacity>
                  </Animatable.View>
                </View>
              </Animatable.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
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
  cameraButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: '#303F9F',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
  },
  markerContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    elevation: 5,
  },
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    textAlign: 'center',
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
  editButton: {
    backgroundColor: '#303F9F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#303F9F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#303F9F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  dateStyle: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(0, 0, 0, 0.7)',
    alignSelf: 'flex-end',
    marginBottom: 8,
    marginRight: 5

  },

});

export default MapPage;
