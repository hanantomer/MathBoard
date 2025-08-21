<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="headline">Take a Photo</v-card-title>
      <v-card-text>
        <v-file-input
          label="Select a photo"
          accept="image/*"
          prepend-icon="mdi-camera"
          capture="camera"
          @change="fileSelected"
          :clearable="false"
        ></v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="uploadPhoto"
          :disabled="!photoFile"
          block
        >
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import useApiHelper from "../helpers/apiHelper";
import { FeathersHelper } from "../helpers/feathersHelper";

const props = defineProps({
  userUUId: { type: String, required: true },
  lessonUUId: { type: String, required: true },
});

const apiHelper = useApiHelper();

// Reactive state
const photoFile = ref(null);
//const sessionId = ref("");
const snackbar = ref({
  show: false,
  text: "",
  color: "",
});

// Method to show the snackbar
const showSnackbar = (text: string, color: string) => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

function fileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    photoFile.value = file;
    //alert("File selected: " + file.name);
    // Process the captured image file
    // console.log("Captured file:", file);
    // // Example: Display the image
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   // You can store e.target.result in a data property to display the image
    //   console.log("Image URL:", e.target.result);
    // };
    // reader.readAsDataURL(file);
  }
}

async function uploadPhoto() {
  if (!photoFile.value) {
    showSnackbar("No photo selected", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("photo", photoFile.value);

  processImage(URL.createObjectURL(photoFile.value))
    .then(({ base64, dimensions }) => {
      showSnackbar("Photo uploaded successfully!", "success");
      photoFile.value = null; // Clear the input
      let feathersClient = FeathersHelper.getInstance(
        props.userUUId,
        props.lessonUUId,
      );
      feathersClient!.service("imageLoaded").update(
        null,
        {
          lessonUUId: props.lessonUUId,
          base64: base64,
          width: dimensions.width,
          height: dimensions.height,
        },
        {},
      );
    })
    .catch((error) => {
      showSnackbar("Upload failed: " + error.message, "error");
    });
}


function processImage(
  url: string,
): Promise<{ base64: string; dimensions: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS if needed

    img.onload = () => {
      // Convert to base64
      // Calculate new dimensions maintaining aspect ratio
      let newWidth = img.width;
      let newHeight = img.height;
      const maxDimension = 600;

      if (img.width > maxDimension || img.height > maxDimension) {
        if (img.width > img.height) {
          newWidth = maxDimension;
          newHeight = Math.floor((img.height * maxDimension) / img.width);
        } else {
          newHeight = maxDimension;
          newWidth = Math.floor((img.width * maxDimension) / img.height);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const base64String = canvas.toDataURL("image/png");

      resolve({
        base64: base64String,
        dimensions: {
          width: newWidth,
          height: newHeight,
        },
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image:"));
    };

    img.src = url;
  });
}

</script>

<style scoped>
/* Optional: Add custom styles here if needed */
</style>
