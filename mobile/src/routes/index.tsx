import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { Diario } from '../shared/types';
import { useAuthContext } from '../context/auth.context';
import { PrimaryButton } from '../components/PrimaryButton';
import { LoginScreen } from '../screens/Login';
import { ObrasScreen } from '../screens/Obras';
import { NovoDiarioScreen } from '../screens/NovoDiario';
import { HistoricoScreen } from '../screens/Historico';
import { DetalheScreen } from '../screens/Detalhe';
import { ResultadoScreen } from '../screens/Resultado';

export type PublicStackParamsList = { Login: undefined };
export type PrivateStackParamsList = {
  Obras: undefined;
  NovoDiario: { obraId: number; obraNome: string };
  Historico: { obraId: number; obraNome: string };
  Detalhe: { obraId: number; obraNome: string; registro: Diario };
  Resultado: { obraId: number; obraNome: string; diarioId: number };
};

const PublicStack = createStackNavigator<PublicStackParamsList>();
const PrivateStack = createStackNavigator<PrivateStackParamsList>();
const options = { headerStyle: { backgroundColor: '#17233C' }, headerTintColor: '#FFFFFF', headerTitleStyle: { fontWeight: 'bold' as const } };

export function NavigationRoutes() {
  const { session, loading, startupError, retryStartup } = useAuthContext();
  if (loading) return <View className="flex-1 items-center justify-center bg-fog"><ActivityIndicator size="large" color="#EB7437" /></View>;
  if (startupError) {
    return (
      <View className="flex-1 bg-fog justify-center px-6">
        <Text className="text-navy text-xl font-bold mb-3">Sessão indisponível</Text>
        <Text className="text-ink mb-5">{startupError}</Text>
        <PrimaryButton title="Tentar novamente" onPress={() => { void retryStartup(); }} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {session ? (
        <PrivateStack.Navigator screenOptions={options}>
          <PrivateStack.Screen name="Obras" component={ObrasScreen} options={{ title: 'Minhas obras' }} />
          <PrivateStack.Screen name="NovoDiario" component={NovoDiarioScreen} options={{ title: 'Registrar o dia' }} />
          <PrivateStack.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Histórico' }} />
          <PrivateStack.Screen name="Detalhe" component={DetalheScreen} options={{ title: 'Detalhes do diário' }} />
          <PrivateStack.Screen name="Resultado" component={ResultadoScreen} options={{ title: 'Enviado', gestureEnabled: false }} />
        </PrivateStack.Navigator>
      ) : (
        <PublicStack.Navigator screenOptions={{ headerShown: false }}>
          <PublicStack.Screen name="Login" component={LoginScreen} />
        </PublicStack.Navigator>
      )}
    </NavigationContainer>
  );
}
