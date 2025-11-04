import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CropResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Auto-crop business card from image
 * This function crops exactly to the frame boundaries shown on camera screen
 */
export async function autoCropBusinessCard(imageUri: string): Promise<CropResult> {
  try {
    console.log('🔄 Starting auto-crop process...');

    // First, normalize image orientation based on EXIF data
    // This ensures the image is always displayed correctly regardless of device orientation
    const normalizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Apply EXIF orientation normalization
        // This automatically rotates the image based on its EXIF orientation tag
        { resize: { width: 2000 } } // Resize to max width while preserving aspect ratio
      ],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.9
      }
    );

    const image = normalizedImage;

    console.log(`📐 Original image dimensions: ${image.width}x${image.height}`);

    // Frame dimensions on screen (matching CameraScreen.tsx)
    // The frame is 80% of screen width and 60% of that width for height (increased by 20%)
    const FRAME_WIDTH_RATIO = 0.8;
    const FRAME_HEIGHT_RATIO = 0.6;

    // Calculate crop dimensions based on the normalized image
    // The frame is centered and takes up 80% of width
    const horizontalMargin = (1 - FRAME_WIDTH_RATIO) / 2;

    // Calculate crop area
    const cropWidth = image.width * FRAME_WIDTH_RATIO;
    const cropHeight = cropWidth * FRAME_HEIGHT_RATIO;
    const cropX = image.width * horizontalMargin;
    const cropY = (image.height - cropHeight) / 2; // Center vertically

    console.log(`✂️ Cropping normalized image: x=${Math.round(cropX)}, y=${Math.round(cropY)}, w=${Math.round(cropWidth)}, h=${Math.round(cropHeight)}`);

    // Apply crop to the normalized image
    const croppedResult = await ImageManipulator.manipulateAsync(
      image.uri,
      [
        {
          crop: {
            originX: Math.max(0, Math.round(cropX)),
            originY: Math.max(0, Math.round(cropY)),
            width: Math.min(Math.round(cropWidth), image.width),
            height: Math.min(Math.round(cropHeight), image.height),
          },
        },
        // Resize for optimal OCR
        {
          resize: {
            width: 1200,
          },
        },
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log(`✅ Auto-crop completed: ${croppedResult.width}x${croppedResult.height}`);

    return {
      uri: croppedResult.uri,
      width: croppedResult.width,
      height: croppedResult.height,
    };
  } catch (error) {
    console.error('❌ Auto-crop failed:', error);
    // If crop fails, return original image
    return {
      uri: imageUri,
      width: 0,
      height: 0,
    };
  }
}
