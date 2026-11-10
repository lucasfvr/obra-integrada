import * as SecureStore from 'expo-secure-store';

export type TextDraft = { descricao: string; clima: string; efetivo: string; ocorrencias: string };
const key = (userId: number, obraId: number) => 'obra_draft_' + userId + '_' + obraId;

// Apenas o texto. A foto não é persistida e deve ser selecionada novamente.
export async function loadDraft(userId: number, obraId: number): Promise<TextDraft | null> {
  const text = await SecureStore.getItemAsync(key(userId, obraId));
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    if (!data || typeof data.descricao !== 'string') return null;
    return {
      descricao: data.descricao,
      clima: String(data.clima || ''),
      efetivo: String(data.efetivo || ''),
      ocorrencias: String(data.ocorrencias || ''),
    };
  } catch { return null; }
}
export async function saveDraft(userId: number, obraId: number, draft: TextDraft) {
  await SecureStore.setItemAsync(key(userId, obraId), JSON.stringify(draft));
}
export async function clearDraft(userId: number, obraId: number) {
  await SecureStore.deleteItemAsync(key(userId, obraId));
}
