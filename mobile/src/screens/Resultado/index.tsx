import React from 'react';
import { Text, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { PrivateStackParamsList } from '../../routes';

export function ResultadoScreen({ navigation, route }: StackScreenProps<PrivateStackParamsList, 'Resultado'>) {
  const { diarioId, obraId, obraNome } = route.params;
  return (
    <View className="flex-1 justify-center bg-fog px-6">
      <View className="bg-white border border-line rounded-3xl p-6">
        <Text className="text-3xl text-navy font-bold mb-3">Registro recebido</Text>
        <Text className="text-ink text-lg">Diário #{diarioId}</Text>
        <Text className="text-muted my-3">
          O servidor confirmou o salvamento do registro. Consulte o histórico para acompanhar sua situação de avaliação.
        </Text>
        <PrimaryButton title="Consultar histórico" onPress={() => navigation.replace('Historico', { obraId, obraNome })} />
        <PrimaryButton title="Voltar às obras" secondary onPress={() => navigation.navigate('Obras')} />
      </View>
    </View>
  );
}
