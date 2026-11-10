import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusPill } from '../../components/StatusPill';
import { dataLegivel } from '../../shared/types';
import type { PrivateStackParamsList } from '../../routes';

export function DetalheScreen({ route }: StackScreenProps<PrivateStackParamsList, 'Detalhe'>) {
  const { registro, obraNome } = route.params;
  const foto = registro.foto_url || '';
  const apiUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const fotoUrl = /^https?:\/\//.test(foto) ? foto
    : foto.startsWith('/') && apiUrl ? apiUrl + foto : '';

  return (
    <ScrollView className="flex-1 bg-fog" contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text className="text-xl font-bold text-navy">{obraNome}</Text>
      <Text className="text-muted mb-3">Diário #{registro.id_diario} · {dataLegivel(registro.data_registro)}</Text>
      <StatusPill status={registro.status_auditoria} />
      {fotoUrl ? <Image source={{ uri: fotoUrl }} resizeMode="cover" className="w-full h-64 rounded-xl my-5" /> : null}
      <View className="bg-white border border-line rounded-2xl p-4 mt-4">
        <Text className="text-navy font-bold text-base mb-2">Descrição</Text>
        <Text className="text-ink text-base">{registro.descricao}</Text>
        <Text className="text-muted mt-4">Registrado por: {registro.autor?.nome || 'Não informado'}</Text>
        {registro.motivo_reprovacao
          ? <Text className="text-red-700 mt-4">Motivo da reprovação: {registro.motivo_reprovacao}</Text>
          : null}
        {registro.justificativa_gps
          ? <Text className="text-muted mt-4">Observação de localização: {registro.justificativa_gps}</Text>
          : null}
        <Text className="text-muted text-xs mt-4">
          A localização registrada não comprova presença nem substitui a avaliação técnica.
        </Text>
      </View>
    </ScrollView>
  );
}
