import React from 'react';
import { Text, View } from 'react-native';
import { statusVisivel } from '../shared/types';

export function StatusPill({ status }: { status: string }) {
  const item = statusVisivel(status);
  return (
    <View className="rounded-full self-start px-3 py-1 border border-line bg-fog">
      <Text style={{ color: item.cor, fontWeight: '700' }}>{item.titulo}</Text>
    </View>
  );
}
