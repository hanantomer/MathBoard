import axios from "axios";
import axiosHelper from "./axiosHelper";
const { baseURL } = axiosHelper();

export default function contactUsHelper(){
  async function contactUs(name: string, email: string, message: string) {
    const contactUsMessage = { name: name, email: email, message: message };
    await axios.post(baseURL + "/contactus", contactUsMessage);
    return;
  }

  return {
    contactUs,
  };
}
