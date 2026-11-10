import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuthContext } from '../../context/auth.context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Field } from '../../components/Field';
import type { PublicStackParamsList } from '../../routes';

export function LoginScreen(_props: StackScreenProps<PublicStackParamsList, 'Login'>) {
  const { handleAuthenticate } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!username.trim() || !password) { setError('Informe seu usuário ou e-mail e senha.'); return; }
    setBusy(true); setError('');
    try {
      await handleAuthenticate(username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-fog" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <View className="bg-navy rounded-3xl px-6 py-10 mb-6">
          <Text className="text-white text-3xl font-bold">Obra Integrada</Text>
          <Text className="text-white text-base mt-2">Diário de obra em um só lugar.</Text>
        </View>
        <Text className="text-ink text-2xl font-bold mb-4">Acessar sua conta</Text>
        <Field label="Usuário ou e-mail" value={username} onChangeText={setUsername}
          autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
          autoComplete="username" editable={!busy} accessibilityLabel="Usuário ou e-mail" />
        <Field label="Senha" value={password} onChangeText={setPassword}
          secureTextEntry autoComplete="password" editable={!busy} accessibilityLabel="Senha" />
        {error ? <Text accessibilityRole="alert" className="text-red-700 mb-3">{error}</Text> : null}
        <PrimaryButton title="Entrar" onPress={() => { void submit(); }} loading={busy} />
        <Text className="text-muted mt-4 text-sm text-center">
          A conta e as permissões são administradas pela construtora.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
