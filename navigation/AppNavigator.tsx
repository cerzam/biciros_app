import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar pantallas
import DashboardScreen from '../screens/HomeScreen';
import SalesScreen from '../screens/SalesScreen';
import CreateSaleScreen from '../screens/CreateSaleScreen';
import EditSaleScreen from '../screens/EditSaleScreen';

// Importar tipos
import { Sale } from '../hooks/useSales';

// Definir tipos de navegación - SOLO Stack, sin Tabs
export type RootStackParamList = {
  Dashboard: undefined;
  Sales: undefined;
  CreateSale: undefined;
  EditSale: { sale: Sale };
  // Agrega más pantallas aquí cuando las crees
  // Services: undefined;
  // Products: undefined;
  // Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navegador principal (sin Bottom Tabs de React Navigation)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Dashboard"
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="CreateSale" component={CreateSaleScreen} />
        <Stack.Screen name="EditSale" component={EditSaleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}