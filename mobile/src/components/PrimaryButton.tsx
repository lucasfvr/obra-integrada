import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export function PrimaryButton({
  title, onPress, disabled, loading, secondary
}: {
  title: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      accessible accessibilityRole="button" accessibilityLabel={title}
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      className={'min-h-14 rounded-xl px-5 items-center justify-center my-2 ' +
        (secondary ? 'bg-white border border-line' : 'bg-orange') +
        (disabled ? ' opacity-50' : '')}
    >
      {loading ? <ActivityIndicator color={secondary ? '#17233C' : 'white'} /> :
        <Text className={'text-base font-bold ' + (secondary ? 'text-navy' : 'text-white')}>{title}</Text>}
    </TouchableOpacity>
  );
}
