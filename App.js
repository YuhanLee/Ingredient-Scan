import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";

import * as MediaLibrary from "expo-media-library";

import * as ImagePicker from "expo-image-picker";

import { FontAwesome } from "@expo/vector-icons";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [photo, setPhoto] = useState(undefined);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      const {
        status: mediaSaveStatus,
      } = await MediaLibrary.requestPermissionsAsync();
      const {
        status: imagePickerStatus,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setHasPermission(
        status === "granted" &&
          mediaSaveStatus === "granted" &&
          imagePickerStatus === "granted",
      );
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: onPictureSaved });
    }
  };

  const savePhoto = () => {
    // Ths saves the photo to the user's media library
    MediaLibrary.saveToLibraryAsync(photo.uri);
    alert("saved photo");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setPhoto({ uri: result.uri, ...photo });
    }
  };

  const uploadImage = () => {
    // I tried uploading the image to imgur to see if I'm getting the same fileType error and it is so.
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Client-ID 37adb1e780207d4");

    var formdata = new FormData();
    formdata.append("image", JSON.stringify(photo));

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("https://api.imgur.com/3/image", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  const searchPhoto = async () => {
    // Upload image to imgur -- this isn't necessary,it is just to see if I could send an uploaded imgur url to OCR and not have an error
    // uploadImage();

    var formdata = new FormData();
    formdata.append("language", "eng");
    formdata.append("isOverlayRequired", "false");
    formdata.append("url", photo.uri);
    formdata.append("iscreatedsearchablepdf", "false");
    formdata.append("issearchablepdfhidetextlayer", "false");
    var myHeaders = new Headers();
    myHeaders.append("apikey", "8f9600623b88957");
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    fetch("https://api.ocr.space/parse/image", requestOptions)
      .then((response) => response.text())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.log("****");
        console.log(error);
      });
  };

  const redoPhoto = () => {
    setPhoto(undefined);
  };

  const onPictureSaved = (photo) => {
    setPhoto(photo);
  };

  if (photo?.uri) {
    return (
      <SafeAreaView style={styles.buttonSafeArea}>
        <Image
          style={[styles.fullScreen, styles.picturePreview]}
          source={{ uri: photo.uri }}
        />

        <FontAwesome
          name="undo"
          size={30}
          color="#FFF"
          onPress={redoPhoto}
          style={styles.centerButton}
        />
        <FontAwesome name="save" size={30} color="#FFF" onPress={savePhoto} />
        <FontAwesome name="image" size={30} color="#FFF" onPress={pickImage} />
        <FontAwesome
          name="search"
          size={30}
          color="#FFF"
          onPress={searchPhoto}
        />
      </SafeAreaView>
    );
  }
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ratio="16:9"
        ref={(ref) => {
          this.camera = ref;
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back,
              );
            }}
          >
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => takePicture()}>
            <Text style={styles.text}>Take</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonSafeArea: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 50,
    paddingVertical: 50,
    justifyContent: "space-between",
  },
  centerButton: {
    marginBottom: 30,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    color: "white",
  },

  fullScreen: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  picturePreview: {
    resizeMode: "contain",
  },
});
