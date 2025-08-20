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

  apiHelper
    .uploadImage(formData)
    .then((imageName: string) => {
      showSnackbar("Photo uploaded successfully!", "success");
      photoFile.value = null; // Clear the input
      let feathersClient = FeathersHelper.getInstance(
        props.userUUId,
        props.lessonUUId,
      );
      feathersClient!.service("imageLoaded").update(
        null,
        {
          imageName: imageName,
          lessonUUId: props.lessonUUId,
        },
        {},
      );
    })
    .catch((error) => {
      showSnackbar("Upload failed: " + error.message, "error");
    });
}

// Lifecycle hook to run on component mount
onMounted(() => {
  //  feathersClient = FeathersHelper.getInstance(props.userUUId, props.lessonUUId);
});
</script>

<style scoped>
/* Optional: Add custom styles here if needed */
</style>
