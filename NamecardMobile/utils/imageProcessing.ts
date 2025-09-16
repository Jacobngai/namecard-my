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

    // First, get image info and fix orientation
    const image = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log(`📐 Original image dimensions: ${image.width}x${image.height}`);

    // Frame dimensions on screen (matching CameraScreen.tsx)
    // The frame is 80% of screen width and 50% of that width for height
    const FRAME_WIDTH_RATIO = 0.8;
    const FRAME_HEIGHT_RATIO = 0.5;

    // Calculate the frame position relative to the full camera view
    // The frame is centered on screen
    const frameWidthOnScreen = screenWidth * FRAME_WIDTH_RATIO;
    const frameHeightOnScreen = frameWidthOnScreen * FRAME_HEIGHT_RATIO;

    // The camera view fills the entire screen height minus header and controls
    // We need to map screen coordinates to image coordinates
    const screenAspectRatio = screenWidth / screenHeight;
    const imageAspectRatio = image.width / image.height;

    let cropX: number;
    let cropY: number;
    let cropWidth: number;
    let cropHeight: number;

    // Check if image needs rotation (common issue with phone cameras)
    const isRotated = imageAspectRatio < 1 && screenAspectRatio > 1;

    if (isRotated) {
      console.log('🔄 Image appears to be rotated, applying rotation fix...');

      // Rotate the image 90 degrees clockwise first
      const rotatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ rotate: -90 }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // Recalculate with rotated dimensions
      const rotatedWidth = rotatedImage.width;
      const rotatedHeight = rotatedImage.height;

      // Calculate crop area based on frame position
      // The frame is centered, so calculate margins
      const horizontalMargin = (1 - FRAME_WIDTH_RATIO) / 2;
      const verticalCenterRatio = 0.5; // Frame is vertically centered

      cropWidth = rotatedWidth * FRAME_WIDTH_RATIO;
      cropHeight = cropWidth * FRAME_HEIGHT_RATIO;
      cropX = rotatedWidth * horizontalMargin;
      cropY = (rotatedHeight - cropHeight) / 2;

      console.log(`✂️ Cropping rotated image: x=${cropX}, y=${cropY}, w=${cropWidth}, h=${cropHeight}`);

      // Apply crop to rotated image
      const finalResult = await ImageManipulator.manipulateAsync(
        rotatedImage.uri,
        [
          {
            crop: {
              originX: Math.max(0, Math.round(cropX)),
              originY: Math.max(0, Math.round(cropY)),
              width: Math.min(Math.round(cropWidth), rotatedWidth),
              height: Math.min(Math.round(cropHeight), rotatedHeight),
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

      console.log(`✅ Auto-crop completed: ${finalResult.width}x${finalResult.height}`);

      return {
        uri: finalResult.uri,
        width: finalResult.width,
        height: finalResult.height,
      };
    } else {
      // Image is already in correct orientation
      console.log('📸 Image orientation is correct, applying crop...');

      // Calculate crop area for correctly oriented image
      const horizontalMargin = (1 - FRAME_WIDTH_RATIO) / 2;

      cropWidth = image.width * FRAME_WIDTH_RATIO;
      cropHeight = cropWidth * FRAME_HEIGHT_RATIO;
      cropX = image.width * horizontalMargin;
      cropY = (image.height - cropHeight) / 2;

      console.log(`✂️ Cropping: x=${cropX}, y=${cropY}, w=${cropWidth}, h=${cropHeight}`);

      // Apply crop
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
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

      console.log(`✅ Auto-crop completed: ${manipResult.width}x${manipResult.height}`);

      return {
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      };
    }
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

/**
 * Enhance image for better OCR results
 */
export async function enhanceForOCR(imageUri: string): Promise<string> {
  try {
    // Apply image enhancements for better OCR
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Increase contrast and brightness slightly
        // Note: Expo doesn't support advanced filters,
        // so we're limited to basic operations
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Image enhancement failed:', error);
    return imageUri;
  }
}