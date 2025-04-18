import { getCookie, removeCookie } from "typescript-cookie";
import { UserType } from "common/unions";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { useUserStore } from "../store/pinia/userStore";
import axiosHelper from "./axiosHelper";
import useApiHelper from "./apiHelper";
import axios from "axios";

const apiHelper = useApiHelper();
const { baseURL } = axiosHelper();

export default function useAuthHelper() {
  function registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,

    userType: UserType,
  ) {
    let user: UserCreationAttributes = {
      userType: userType,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      imageUrl: "",
      access_token: "",
      approved: false,
      reset_pasword_token: null,
      lastHeartbeatTime: new Date(),
    };
    const userStore = useUserStore();
    userStore.registerUser(user);
  }

  async function authGoogleUser() {
    return await apiHelper.authGoogleUser();
  }

  async function authLocalUserByToken() {
    return await apiHelper.authLocalUserByToken();
  }

  async function authLocalUserByUserAndPassword(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    return await apiHelper.authLocalUserByPassword(email, password);
  }

  function getToken() {
    const access_token = `${
      gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
        ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
            .id_token
        : getCookie("access_token")
    }`;
    return access_token;
  }

  function signedInWithGoogle() {
    return false;
    //return (
    //  gapi.auth2.getAuthInstance() &&
    //  gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
    //);
  }

  function signedInLocally() {
    return getCookie("access_token");
  }

  async function signOut() {
    const userStore = useUserStore();
    if (this.signedInWithGoogle()) {
      gapi.auth2.getAuthInstance().signOut();
    } else {
      removeCookie("access_token");
    }
    userStore.setCurrentUser(null);
  }

  async function sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await axios.post(`${baseURL}/auth/send-reset-password-mail`, { email:email, origin:window.location.origin });
    } catch (error) {
      throw new Error(`Failed to send reset email: ${error}`);
    }
  }

  async function resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await axios.post(`${baseURL}/auth/reset-password`, {
        token,
        password: newPassword,
      });
    } catch (error) {
      throw new Error(`Failed to reset password: ${error}`);
    }
  }

  return {
    registerUser,
    authLocalUserByToken,
    authLocalUserByUserAndPassword,
    signOut,
    signedInLocally,
    signedInWithGoogle,
    getToken,
    authGoogleUser,
    sendPasswordResetEmail,
    resetPassword,
  };
}
