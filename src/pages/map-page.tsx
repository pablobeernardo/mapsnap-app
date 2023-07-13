import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

const MapPage = ({ navigation, route }) => {
  const { markerId, imageUri } = route.params || {};

  const [markers, setMarkers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    getLocationPermission();
  }, []);

  // Função para obter permissão de localização
  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão de localização não concedida');
    } else {
      getCurrentLocation();
    }
  };

  // Função para obter a localização atual do dispositivo
  const getCurrentLocation = async () => {
    const { coords } = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = coords;
    setCurrentLocation({ latitude, longitude });
  };

  // Função para abrir a página da câmera
  const openCameraPage = () => {
    navigation.navigate('CamPage', { markerId });
  };

  // Função para lidar com o pressionar de um marcador
  const handleMarkerPress = (marker) => {
    // Lógica para lidar com o pressionar do marcador
    console.log('Marcador pressionado:', marker);
  };

  // Função para renderizar o conteúdo do balão de informações do marcador
  const renderMarkerCallout = (marker) => (
    <Callout onPress={() => handleMarkerPress(marker)}>
      <View>
        <Image source={{ uri: marker.imageUri }} style={styles.markerImage} />
        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', color: '#303F9F' }}>
          {marker.title}
        </Text>
      </View>
    </Callout>
  );

  useEffect(() => {
    if (markerId && imageUri && markers.length > 0) {
      const updatedMarkers = markers.map((marker) => {
        if (marker.id === markerId) {
          return { ...marker, imageUri };
        }
        return marker;
      });
      setMarkers(updatedMarkers);
    }
  }, [markerId, imageUri, markers]);

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
            >
              {renderMarkerCallout(marker)}
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      )}

      <TouchableOpacity style={styles.buttonContainer} onPress={openCameraPage}>
        <View style={styles.iconContainer}>
          <Icon name="camera" size={30} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
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
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
});

export default MapPage;
