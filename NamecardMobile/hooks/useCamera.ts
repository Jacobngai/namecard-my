import { useState, useEffect, useRef } from 'react';
import { Camera, type CameraType, CameraCapturedPicture } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Request media library permission
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const toggleCameraType = () => {
    setType(current =>
      current === 'back' ? 'front' : 'back'
    );
  };

  const takePicture = async (): Promise<CameraCapturedPicture | null> => {
    if (!cameraRef.current || isProcessing) return null;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        exif: true,
      });

      // Process image for better OCR results
      const processedImage = await processImageForOCR(photo.uri);

      return {
        ...photo,
        uri: processedImage.uri,
      };
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageForOCR = async (imageUri: string) => {
    try {
      // Optimize image for OCR
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1920 } }, // Resize to max width while maintaining aspect ratio
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Error processing image:', error);
      return { uri: imageUri };
    }
  };

  const saveToGallery = async (imageUri: string) => {
    if (!hasMediaLibraryPermission) {
      console.warn('No media library permission');
      return null;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      const album = await MediaLibrary.getAlbumAsync('NAMECARD.MY');

      if (album === null) {
        await MediaLibrary.createAlbumAsync('NAMECARD.MY', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return asset;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return null;
    }
  };

  return {
    hasPermission,
    hasMediaLibraryPermission,
    type,
    isProcessing,
    cameraRef,
    toggleCameraType,
    takePicture,
    saveToGallery,
  };
};