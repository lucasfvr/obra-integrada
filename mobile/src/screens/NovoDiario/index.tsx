import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { StackScreenProps } from '@react-navigation/stack';
import { Field } from '../../components/Field';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthContext } from '../../context/auth.context';
import { criarDiario, type Photo } from '../../services/diarios';
import { preparePhoto } from '../../services/photos';
import { clearDraft, loadDraft, saveDraft } from '../../services/drafts';
import { podeRegistrarDiario } from '../../shared/permissions';
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
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');

  useEffect(() => {
    if (!session) return;
    let active = true;
    void loadDraft(session.user.id, obraId).then(value => {
      if (!active) return;
      if (value) {
        setDescricao(value.descricao);
        setClima(value.clima);
        setEfetivo(value.efetivo);
        setOcorrencias(value.ocorrencias);
        setDraftMessage('Rascunho de texto restaurado. Selecione a foto novamente.');
      }
    }).catch(() => { if (active) setDraftMessage('Não foi possível restaurar o rascunho.'); })
      .finally(() => { if (active) setDraftLoaded(true); });
    return () => { active = false; };
  }, [obraId, session?.user.id]);

  useEffect(() => {
    if (!draftLoaded || !session) return;
    const userId = session.user.id;
    const timer = setTimeout(() => {
      void saveDraft(userId, obraId, { descricao, clima, efetivo, ocorrencias })
        .catch(() => setDraftMessage('Não foi possível salvar o rascunho neste aparelho.'));
    }, 800);
    return () => clearTimeout(timer);
  }, [draftLoaded, session?.user.id, obraId, descricao, clima, efetivo, ocorrencias]);

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
        setFoto(preparePhoto(asset));
        setError('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir as imagens.');
    }
  }

  async function submit() {
    if (!session) return;
    if (!podeRegistrarDiario(session.user)) {
      setError('Seu perfil não possui permissão para criar diários.');
      return;
    }
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
      await clearDraft(session.user.id, obraId).catch(() => {});
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
        <Text className="text-muted text-xs mb-3">O texto do rascunho é salvo neste aparelho; a foto precisa ser selecionada novamente.</Text>
        {draftMessage ? <Text className="text-muted mb-3">{draftMessage}</Text> : null}
        <View className="bg-white rounded-2xl border border-line p-3 mb-4">
          {foto ? <Image source={{ uri: foto.uri }} resizeMode="cover" className="w-full h-52 rounded-xl mb-3" /> :
            <Text className="text-muted text-center py-8">Nenhuma foto selecionada</Text>}
          <PrimaryButton title="Tirar foto" onPress={() => { void selecionarFoto(true); }} secondary disabled={busy} />
          <PrimaryButton title="Escolher da galeria" onPress={() => { void selecionarFoto(false); }} secondary disabled={busy} />
        </View>
        <Field label="Descrição do serviço *" placeholder="Ex.: concretagem da laje do 2º pavimento"
          multiline maxLength={900} value={descricao} onChangeText={setDescricao} editable={!busy && draftLoaded} />
        <Field label="Clima (opcional)" placeholder="Ex.: ensolarado" maxLength={80} value={clima} onChangeText={setClima} editable={!busy && draftLoaded} />
        <Field label="Efetivo (opcional)" placeholder="Quantidade de trabalhadores" keyboardType="number-pad"
          maxLength={7} value={efetivo} onChangeText={setEfetivo} editable={!busy && draftLoaded} />
        <Field label="Ocorrências (opcional)" placeholder="Ex.: chuva, atraso ou nenhuma"
          maxLength={300} value={ocorrencias} onChangeText={setOcorrencias} multiline editable={!busy && draftLoaded} />
        <Text className="text-muted text-xs my-2">
          Nesta versão, clima, efetivo e ocorrências seguem como texto no registro.
          A estrutura de dados específica depende de evolução da API.
        </Text>
        {error ? <Text accessibilityRole="alert" className="text-red-700 mb-3">{error}</Text> : null}
        <PrimaryButton title="Enviar diário" onPress={() => {
          Alert.alert('Confirmar envio', 'O registro será enviado ao servidor e poderá ficar pendente de avaliação.', [
            { text: 'Cancelar', style: 'cancel' }, { text: 'Enviar', onPress: () => { void submit(); } }
          ]);
        }} loading={busy} disabled={!draftLoaded || !podeRegistrarDiario(session?.user)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
