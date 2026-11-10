import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

export function Field({ label, multiline, ...props }: TextInputProps & { label: string }) {
  return (
    <View className="mb-3">
      <Text className="text-ink font-semibold mb-2">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#738196"
        className={'bg-white border border-line rounded-xl px-4 text-base text-ink ' +
          (multiline ? 'min-h-28 py-3 text-top' : 'min-h-14')}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}
