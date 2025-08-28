<<<<<<< HEAD
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { compareFaces, detectFaces } = require('../config/aws');
=======
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { compareFaces, detectFaces } = require("../config/aws");
>>>>>>> master

// Convert image to base64
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
<<<<<<< HEAD
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Image to Base64 conversion error:', error);
=======
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Image to Base64 conversion error:", error);
>>>>>>> master
    return null;
  }
};

// Convert base64 to buffer
const base64ToBuffer = (base64String) => {
  try {
<<<<<<< HEAD
    return Buffer.from(base64String, 'base64');
  } catch (error) {
    console.error('Base64 to Buffer conversion error:', error);
=======
    return Buffer.from(base64String, "base64");
  } catch (error) {
    console.error("Base64 to Buffer conversion error:", error);
>>>>>>> master
    return null;
  }
};

<<<<<<< HEAD
// Resolve local file path or remote URL to Buffer
async function resolveToBuffer(inputPathOrUrl) {
  try {
    if (!inputPathOrUrl) return null;
    const isUrl = /^https?:\/\//i.test(inputPathOrUrl);
    if (isUrl) {
      const response = await axios.get(inputPathOrUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    }
    // Local path
    return fs.readFileSync(inputPathOrUrl);
  } catch (err) {
    console.error('Error resolving image to buffer:', err.message);
    return null;
  }
}

// Enhanced face comparison with detailed logging (supports URL or local path)
const enhancedFaceComparison = async (storedImageInput, loginImageInput) => {
  try {
    console.log('Starting face comparison process...');
    
    // Resolve both images to buffers
    const storedImageBuffer = await resolveToBuffer(storedImageInput);
    const loginImageBuffer = await resolveToBuffer(loginImageInput);

    if (!storedImageBuffer || !loginImageBuffer) {
      return {
        success: false,
        similarity: 0,
        isMatch: false,
        message: 'Could not read image(s) for comparison',
        error: 'IMAGE_READ_FAILED'
      };
    }
    
    // Detect faces in stored image
    console.log('Detecting faces in stored image...');
    const storedFaceDetection = await detectFaces(storedImageBuffer);
    
    if (!storedFaceDetection.success) {
      return {
        success: false,
        message: 'No faces detected in stored image',
        error: 'STORED_IMAGE_NO_FACE'
      };
    }
    
    // Detect faces in login image
    console.log('Detecting faces in login image...');
    const loginFaceDetection = await detectFaces(loginImageBuffer);
    
    if (!loginFaceDetection.success) {
      return {
        success: false,
        message: 'No faces detected in login image',
        error: 'LOGIN_IMAGE_NO_FACE'
      };
    }
    
=======
// Enhanced face comparison with detailed logging
const enhancedFaceComparison = async (storedImagePath, loginImagePath) => {
  try {
    console.log("Starting face comparison process...");

    // Handle both local paths and URLs for stored image
    let storedImageBuffer;
    if (storedImagePath.startsWith("http")) {
      // Download image from URL (Cloudinary)
      const response = await axios.get(storedImagePath, {
        responseType: "arraybuffer",
      });
      storedImageBuffer = Buffer.from(response.data);
    } else {
      // Read local file
      storedImageBuffer = fs.readFileSync(storedImagePath);
    }

    // Login image is always a local file
    const loginImageBuffer = fs.readFileSync(loginImagePath);

    // Detect faces in stored image
    console.log("Detecting faces in stored image...");
    const storedFaceDetection = await detectFaces(storedImageBuffer);

    if (!storedFaceDetection.success) {
      return {
        success: false,
        message: "No faces detected in stored image",
        error: "STORED_IMAGE_NO_FACE",
      };
    }

    // Detect faces in login image
    console.log("Detecting faces in login image...");
    const loginFaceDetection = await detectFaces(loginImageBuffer);

    if (!loginFaceDetection.success) {
      return {
        success: false,
        message: "No faces detected in login image",
        error: "LOGIN_IMAGE_NO_FACE",
      };
    }

>>>>>>> master
    // Ensure only one face in each image
    if (storedFaceDetection.faceCount > 1) {
      return {
        success: false,
<<<<<<< HEAD
        message: 'Multiple faces detected in stored image. Please use an image with only one face.',
        error: 'STORED_IMAGE_MULTIPLE_FACES'
      };
    }
    
    if (loginFaceDetection.faceCount > 1) {
      return {
        success: false,
        message: 'Multiple faces detected in login image. Please use an image with only one face.',
        error: 'LOGIN_IMAGE_MULTIPLE_FACES'
      };
    }
    
    // Compare faces
    console.log('Comparing faces...');
    const comparisonResult = await compareFaces(storedImageBuffer, loginImageBuffer);
    
    if (comparisonResult.success && comparisonResult.isMatch) {
      console.log(`Face verification successful! Similarity: ${comparisonResult.similarity}%`);
=======
        message:
          "Multiple faces detected in stored image. Please use an image with only one face.",
        error: "STORED_IMAGE_MULTIPLE_FACES",
      };
    }

    if (loginFaceDetection.faceCount > 1) {
      return {
        success: false,
        message:
          "Multiple faces detected in login image. Please use an image with only one face.",
        error: "LOGIN_IMAGE_MULTIPLE_FACES",
      };
    }

    // Compare faces
    console.log("Comparing faces...");
    const comparisonResult = await compareFaces(
      storedImageBuffer,
      loginImageBuffer
    );

    if (comparisonResult.success && comparisonResult.isMatch) {
      console.log(
        `Face verification successful! Similarity: ${comparisonResult.similarity}%`
      );
>>>>>>> master
      return {
        success: true,
        similarity: comparisonResult.similarity,
        isMatch: true,
<<<<<<< HEAD
        message: `Face verification successful! Similarity: ${comparisonResult.similarity.toFixed(2)}%`,
        confidence: comparisonResult.similarity >= 95 ? 'HIGH' : comparisonResult.similarity >= 90 ? 'MEDIUM' : 'LOW'
      };
    } else {
      console.log(`Face verification failed. Similarity: ${comparisonResult.similarity}%`);
=======
        message: `Face verification successful! Similarity: ${comparisonResult.similarity.toFixed(
          2
        )}%`,
        confidence:
          comparisonResult.similarity >= 95
            ? "HIGH"
            : comparisonResult.similarity >= 90
            ? "MEDIUM"
            : "LOW",
      };
    } else {
      console.log(
        `Face verification failed. Similarity: ${comparisonResult.similarity}%`
      );
>>>>>>> master
      return {
        success: false,
        similarity: comparisonResult.similarity,
        isMatch: false,
<<<<<<< HEAD
        message: `Face verification failed. Similarity: ${comparisonResult.similarity.toFixed(2)}%`,
        error: 'LOW_SIMILARITY'
      };
    }
    
  } catch (error) {
    console.error('Enhanced face comparison error:', error);
=======
        message: `Face verification failed. Similarity: ${comparisonResult.similarity.toFixed(
          2
        )}%`,
        error: "LOW_SIMILARITY",
      };
    }
  } catch (error) {
    console.error("Enhanced face comparison error:", error);
>>>>>>> master
    return {
      success: false,
      similarity: 0,
      isMatch: false,
<<<<<<< HEAD
      message: 'Face comparison process failed',
      error: error.message
=======
      message: "Face comparison process failed",
      error: error.message,
>>>>>>> master
    };
  }
};

// Validate image quality for face recognition
const validateImageForFaceRecognition = (imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
<<<<<<< HEAD
    
=======

>>>>>>> master
    // Check file size (should be between 10KB and 5MB)
    if (fileSizeInMB < 0.01 || fileSizeInMB > 5) {
      return {
        valid: false,
<<<<<<< HEAD
        message: 'Image size should be between 10KB and 5MB',
        error: 'INVALID_FILE_SIZE'
      };
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(imagePath).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: 'Only JPG, JPEG, and PNG images are supported',
        error: 'INVALID_FILE_TYPE'
      };
    }
    
    return {
      valid: true,
      message: 'Image validation passed',
      fileSize: fileSizeInMB.toFixed(2) + ' MB',
      extension: fileExtension
    };
    
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      valid: false,
      message: 'Image validation failed',
      error: error.message
=======
        message: "Image size should be between 10KB and 5MB",
        error: "INVALID_FILE_SIZE",
      };
    }

    // Check file extension
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(imagePath).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: "Only JPG, JPEG, and PNG images are supported",
        error: "INVALID_FILE_TYPE",
      };
    }

    return {
      valid: true,
      message: "Image validation passed",
      fileSize: fileSizeInMB.toFixed(2) + " MB",
      extension: fileExtension,
    };
  } catch (error) {
    console.error("Image validation error:", error);
    return {
      valid: false,
      message: "Image validation failed",
      error: error.message,
>>>>>>> master
    };
  }
};

// Clean up temporary images
const cleanupTempImage = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
<<<<<<< HEAD
      console.log('Temporary image cleaned up:', imagePath);
    }
  } catch (error) {
    console.error('Image cleanup error:', error);
=======
      console.log("Temporary image cleaned up:", imagePath);
    }
  } catch (error) {
    console.error("Image cleanup error:", error);
>>>>>>> master
  }
};

module.exports = {
  imageToBase64,
  base64ToBuffer,
  enhancedFaceComparison,
  validateImageForFaceRecognition,
<<<<<<< HEAD
  cleanupTempImage
}; 
=======
  cleanupTempImage,
};
>>>>>>> master
