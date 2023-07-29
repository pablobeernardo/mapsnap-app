import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamPage from './src/pages/cam-page';
import MapPage from './src/pages/map-page';
import MarkerPage from './src/pages/marker-image-page';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='MapPage' screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CamPage" component={CamPage} />
        <Stack.Screen name="MapPage" component={MapPage} initialParams={{ capturedImage: null }} />
        <Stack.Screen name="Marker"  component={MarkerPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
