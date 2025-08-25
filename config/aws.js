const AWS = require("aws-sdk");
require("dotenv").config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Create Rekognition service object
const rekognition = new AWS.Rekognition();

// Face comparison function
const compareFaces = async (sourceImage, targetImage) => {
  try {
    const params = {
      SourceImage: {
        Bytes: sourceImage,
      },
      TargetImage: {
        Bytes: targetImage,
      },
      SimilarityThreshold: 90.0, // Minimum similarity percentage
      QualityFilter: "AUTO",
    };

    const result = await rekognition.compareFaces(params).promise();

    if (result.FaceMatches && result.FaceMatches.length > 0) {
      const similarity = result.FaceMatches[0].Similarity;
      return {
        success: true,
        similarity: similarity,
        isMatch: similarity >= 90.0,
        message: `Face similarity: ${similarity.toFixed(2)}%`,
      };
    } else {
      return {
        success: false,
        similarity: 0,
        isMatch: false,
        message: "No face matches found",
      };
    }
  } catch (error) {
    console.error("AWS Rekognition Error:", error);
    return {
      success: false,
      similarity: 0,
      isMatch: false,
      message: "Face comparison failed",
      error: error.message,
    };
  }
};

// Detect faces in image
const detectFaces = async (imageBytes) => {
  try {
    const params = {
      Image: {
        Bytes: imageBytes,
      },
      Attributes: ["ALL"],
    };

    const result = await rekognition.detectFaces(params).promise();

    if (result.FaceDetails && result.FaceDetails.length > 0) {
      return {
        success: true,
        faceCount: result.FaceDetails.length,
        message: `Detected ${result.FaceDetails.length} face(s)`,
      };
    } else {
      return {
        success: false,
        faceCount: 0,
        message: "No faces detected in image",
      };
    }
  } catch (error) {
    console.error("AWS Face Detection Error:", error);
    return {
      success: false,
      faceCount: 0,
      message: "Face detection failed",
      error: error.message,
    };
  }
};

module.exports = {
  rekognition,
  compareFaces,
  detectFaces,
};
