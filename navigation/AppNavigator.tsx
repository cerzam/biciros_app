import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar pantallas
import DashboardScreen from '../screens/HomeScreen';
import SalesScreen from '../screens/SalesScreen';
import CreateSaleScreen from '../screens/CreateSaleScreen';
import EditSaleScreen from '../screens/EditSaleScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ConfigScreen from '../screens/ConfigScreen';

// Importar tipos
import { Sale } from '../hooks/useSales';

// Definir tipos de navegación
export type RootStackParamList = {
  Dashboard: undefined;
  Sales: undefined;
  CreateSale: undefined;
  EditSale: { sale: Sale };
  Services: undefined;
  Products: undefined;
  Config: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navegador principal
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
        initialRouteName="Dashboard"
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="CreateSale" component={CreateSaleScreen} />
        <Stack.Screen name="EditSale" component={EditSaleScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Config" component={ConfigScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}