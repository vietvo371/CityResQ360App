module.exports = {
  dependencies: {
    // Temporarily exclude react-native-vision-camera due to compilation issues
    'react-native-vision-camera': {
      platforms: {
        android: null,
      },
    },
  },
};
