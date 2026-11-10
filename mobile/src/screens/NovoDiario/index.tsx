import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { StackScreenProps } from '@react-navigation/stack';
import { Field } from '../../components/Field';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthContext } from '../../context/auth.context';
import { criarDiario, type Photo } from '../../services/diarios';
import type { PrivateStackParamsList } from '../../routes';

export function NovoDiarioScreen({ navigation, route }: StackScreenProps<PrivateStackParamsList, 'NovoDiario'>) {
  const { session } = useAuthContext();
  const { obraId, obraNome } = route.params;
  const [foto, setFoto] = useState<Photo | null>(null);
  const [descricao, setDescricao] = useState('');
  const [clima, setClima] = useState('');
  const [efetivo, setEfetivo] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function selecionarFoto(camera: boolean) {
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setError('Autorize a câmera nas configurações ou escolha uma foto da galeria.'); return; }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { setError('Autorize o acesso às fotos ou use a câmera.'); return; }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: false });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
        setError('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir as imagens.');
    }
  }

  async function submit() {
    if (!session) return;
    if (descricao.trim().length < 3) { setError('Descreva o serviço realizado (mínimo de 3 caracteres).'); return; }
    if (efetivo.trim() && (!/^\d+$/.test(efetivo.trim()) || Number(efetivo) < 0)) {
      setError('Informe um número inteiro válido para o efetivo.'); return;
    }
    setBusy(true); setError('');
    try {
      const resposta = await criarDiario(session.token, obraId, { descricao, clima, efetivo, ocorrencias, foto });
      if (!resposta.entrada?.id_diario) {
        setError('O servidor não confirmou o identificador do registro. Consulte o histórico antes de reenviar.');
        return;
      }
      navigation.replace('Resultado', { obraId, obraNome, diarioId: resposta.entrada.id_diario });
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : 'Falha ao enviar.';
      // Em falhas ambíguas, não realizar retry automático nem declarar sucesso.
      setError(mensagem + ' Consulte o histórico antes de tentar novamente para evitar registros repetidos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-fog" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-bold text-navy mb-1">{obraNome}</Text>
        <Text className="text-muted mb-4">Registre o que aconteceu hoje. Foto opcional conforme API atual.</Text>
        <View className="bg-white rounded-2xl border border-line p-3 mb-4">
          {foto ? <Image source={{ uri: foto.uri }} resizeMode="cover" className="w-full h-52 rounded-xl mb-3" /> :
            <Text className="text-muted text-center py-8">Nenhuma foto selecionada</Text>}
          <PrimaryButton title="Tirar foto" onPress={() => { void selecionarFoto(true); }} secondary disabled={busy} />
          <PrimaryButton title="Escolher da galeria" onPress={() => { void selecionarFoto(false); }} secondary disabled={busy} />
        </View>
        <Field label="Descrição do serviço *" placeholder="Ex.: concretagem da laje do 2º pavimento"
          multiline value={descricao} onChangeText={setDescricao} editable={!busy} />
        <Field label="Clima (opcional)" placeholder="Ex.: ensolarado" value={clima} onChangeText={setClima} editable={!busy} />
        <Field label="Efetivo (opcional)" placeholder="Quantidade de trabalhadores" keyboardType="number-pad"
          value={efetivo} onChangeText={setEfetivo} editable={!busy} />
        <Field label="Ocorrências (opcional)" placeholder="Ex.: chuva, atraso ou nenhuma"
          value={ocorrencias} onChangeText={setOcorrencias} multiline editable={!busy} />
        <Text className="text-muted text-xs my-2">
          Nesta versão, clima, efetivo e ocorrências seguem como texto no registro.
          A estrutura de dados específica depende de evolução da API.
        </Text>
        {error ? <Text accessibilityRole="alert" className="text-red-700 mb-3">{error}</Text> : null}
        <PrimaryButton title="Enviar diário" onPress={() => {
          Alert.alert('Confirmar envio', 'O registro será enviado ao servidor e poderá ficar pendente de avaliação.', [
            { text: 'Cancelar', style: 'cancel' }, { text: 'Enviar', onPress: () => { void submit(); } }
          ]);
        }} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
