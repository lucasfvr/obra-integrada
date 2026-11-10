import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StatusPill } from '../../components/StatusPill';
import { useAuthContext } from '../../context/auth.context';
import { listarDiarios } from '../../services/diarios';
import { dataLegivel, type Diario } from '../../shared/types';
import type { PrivateStackParamsList } from '../../routes';

export function HistoricoScreen({ navigation, route }: StackScreenProps<PrivateStackParamsList, 'Historico'>) {
  const { session } = useAuthContext();
  const [items, setItems] = useState<Diario[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (requestedPage = 1) => {
    if (!session) return;
    setBusy(true); setError('');
    try {
      const result = await listarDiarios(session.token, route.params.obraId, requestedPage);
      setItems(current => requestedPage === 1
        ? result.data
        : [...current.filter(old => !result.data.some(next => old.id_diario === next.id_diario)), ...result.data]);
      setPage(requestedPage);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o histórico.');
    } finally {
      setBusy(false);
    }
  }, [session?.token, route.params.obraId]);

  useFocusEffect(useCallback(() => { void load(1); }, [load]));
  return (
    <View className="flex-1 bg-fog">
      <FlatList data={items} keyExtractor={item => String(item.id_diario)}
        contentContainerStyle={{ padding: 16, paddingBottom: 42, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => { void load(1); }} />}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-xl font-bold text-navy">{route.params.obraNome}</Text>
            <Text className="text-muted">Registros salvos no servidor.</Text>
            {error ? <Text accessibilityRole="alert" className="text-red-700 mt-3">{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Detalhe', { obraId: route.params.obraId, obraNome: route.params.obraNome, registro: item })}
            accessibilityRole="button" className="bg-white border border-line rounded-2xl p-4 mb-3">
            <Text className="font-bold text-navy">Diário #{item.id_diario}</Text>
            <Text className="text-muted my-1">{dataLegivel(item.data_registro)}</Text>
            <Text className="text-ink mb-3" numberOfLines={2}>{item.descricao}</Text>
            <StatusPill status={item.status_auditoria} />
            <Text className="text-orange font-bold mt-2">Ver detalhes</Text>
          </Pressable>
        )}
        ListEmptyComponent={!busy ? <Text className="text-muted text-center py-10">Ainda não há registros nesta obra.</Text> : null}
        ListFooterComponent={
          <View>
            {busy ? <ActivityIndicator color="#EB7437" className="my-4" /> : null}
            {page < totalPages && !busy
              ? <PrimaryButton title="Carregar mais" secondary onPress={() => { void load(page + 1); }} />
              : null}
          </View>
        }
      />
    </View>
  );
}
