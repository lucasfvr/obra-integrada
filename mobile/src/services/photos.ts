import type * as ImagePicker from 'expo-image-picker';
import type { Photo } from './diarios';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function preparePhoto(asset: ImagePicker.ImagePickerAsset): Photo {
  const name = (asset.fileName || '').toLowerCase();
  const ext = (name.match(/\.[a-z0-9]+$/) || [])[0] || '';
  const mime = asset.mimeType?.toLowerCase() || (
    ext === '.png' ? 'image/png' :
    ext === '.webp' ? 'image/webp' :
    ext === '.gif' ? 'image/gif' :
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ''
  );
  const normalizedExt = ext === '.jpeg' ? '.jpg' : ext;
  if (!TYPES[mime] || (ext && TYPES[mime] !== normalizedExt)) {
    throw new Error('Formato de imagem inválido. Selecione JPG, PNG ou WEBP.');
  }
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error('A foto ultrapassa 5 MB. Selecione uma imagem menor.');
  }
  return { uri: asset.uri, mimeType: mime, fileName: 'diario-' + Date.now() + TYPES[mime] };
}
