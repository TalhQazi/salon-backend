const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { compareFaces, detectFaces } = require("../config/aws");

// Convert image to base64
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Image to Base64 conversion error:", error);
    return null;
  }
};

// Convert base64 to buffer
const base64ToBuffer = (base64String) => {
  try {
    return Buffer.from(base64String, "base64");
  } catch (error) {
    console.error("Base64 to Buffer conversion error:", error);
    return null;
  }
};

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

    // Ensure only one face in each image
    if (storedFaceDetection.faceCount > 1) {
      return {
        success: false,
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
      return {
        success: true,
        similarity: comparisonResult.similarity,
        isMatch: true,
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
      return {
        success: false,
        similarity: comparisonResult.similarity,
        isMatch: false,
        message: `Face verification failed. Similarity: ${comparisonResult.similarity.toFixed(
          2
        )}%`,
        error: "LOW_SIMILARITY",
      };
    }
  } catch (error) {
    console.error("Enhanced face comparison error:", error);
    return {
      success: false,
      similarity: 0,
      isMatch: false,
      message: "Face comparison process failed",
      error: error.message,
    };
  }
};

// Validate image quality for face recognition
const validateImageForFaceRecognition = (imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    // Check file size (should be between 10KB and 5MB)
    if (fileSizeInMB < 0.01 || fileSizeInMB > 5) {
      return {
        valid: false,
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
    };
  }
};

// Clean up temporary images
const cleanupTempImage = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Temporary image cleaned up:", imagePath);
    }
  } catch (error) {
    console.error("Image cleanup error:", error);
  }
};

module.exports = {
  imageToBase64,
  base64ToBuffer,
  enhancedFaceComparison,
  validateImageForFaceRecognition,
  cleanupTempImage,
};
