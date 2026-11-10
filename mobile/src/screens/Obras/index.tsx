import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthContext } from '../../context/auth.context';
import { listarObras } from '../../services/obras';
import type { Obra } from '../../shared/types';
import { podeRegistrarDiario } from '../../shared/permissions';
import type { PrivateStackParamsList } from '../../routes';

export function ObrasScreen({ navigation }: StackScreenProps<PrivateStackParamsList, 'Obras'>) {
  const { session, handleLogout } = useAuthContext();
  const [obras, setObras] = useState<Obra[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true); setError('');
    try {
      setObras(await listarObras(session.token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar obras.');
    } finally {
      setBusy(false); setRefreshing(false);
    }
  }, [session?.token]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const renderObra = ({ item }: { item: Obra }) => (
    <View className="bg-white border border-line rounded-2xl p-4 mb-3">
      <Text className="text-lg font-bold text-navy">{item.nome}</Text>
      <Text className="text-muted mb-3">{[item.cidade, item.estado].filter(Boolean).join(' / ') || 'Localização não informada'}</Text>
      <Text className="text-ink mb-2">{item.tb_status?.nome || 'Status da obra não informado'}</Text>
      {podeRegistrarDiario(session?.user)
        ? <PrimaryButton title="Registrar o dia" onPress={() => navigation.navigate('NovoDiario', { obraId: item.id_obra, obraNome: item.nome })} />
        : <Text className="text-muted my-2">Seu perfil permite consultar, mas não criar registros.</Text>}
      <PrimaryButton title="Consultar histórico" secondary onPress={() => navigation.navigate('Historico', { obraId: item.id_obra, obraNome: item.nome })} />
    </View>
  );

  return (
    <View className="flex-1 bg-fog">
      <FlatList data={obras} keyExtractor={(item) => String(item.id_obra)}
        renderItem={renderObra}
        contentContainerStyle={{ padding: 16, paddingBottom: 48, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-navy">Olá, {session?.user.nome || 'usuário'}</Text>
            <Text className="text-muted">Selecione uma obra para registrar ou acompanhar os serviços.</Text>
            <Pressable onPress={() => { void handleLogout().catch(() => setError('Não foi possível encerrar a sessão.')); }}
              accessibilityRole="button" accessibilityLabel="Sair da conta" className="self-end py-3 px-2">
              <Text className="text-orange font-bold">Sair da conta</Text>
            </Pressable>
            {error ? <Text accessibilityRole="alert" className="text-red-700 mb-2">{error}</Text> : null}
            {busy && !refreshing ? <ActivityIndicator color="#EB7437" className="my-3" /> : null}
          </View>
        }
        ListEmptyComponent={!busy ? <Text className="text-center text-muted py-10">Nenhuma obra vinculada. Caso esteja incorreto, consulte o responsável pelo acesso.</Text> : undefined}
      />
    </View>
  );
}
