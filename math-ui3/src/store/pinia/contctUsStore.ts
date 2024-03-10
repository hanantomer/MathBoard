import { defineStore } from "pinia";
import axios from "axios";
import axiosHelper from "../../helpers/axiosHelper";
const { baseURL } = axiosHelper();

export const useContactUsStore = defineStore("contactUs", () => {
  async function contactUs(name: string, email: string, message: string) {
    const contactUsMessage = { name: name, email: email, message: message };
    await axios.post(baseURL + "/contactus", contactUsMessage);
    return;
  }

  return {
    contactUs,
  };
});
