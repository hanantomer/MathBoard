import { LoginTicket } from "google-auth-library";
import { removeCookie } from "typescript-cookie";
import { UserType } from "common/unions";
import { ACCESS_TOKEN_NAME } from "common/globals";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { useUserStore } from "../store/pinia/userStore";
import axiosHelper from "./axiosHelper";
import useApiHelper from "./apiHelper";
import axios from "axios";

const apiHelper = useApiHelper();
const { baseURL } = axiosHelper();

export default function useAuthHelper() {
  async function registerUser(
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
      access_token: null,
      approved: false,
      reset_pasword_token: null,
      lastHeartbeatTime: new Date(),
    };

    return await apiHelper.registerUser(user);
  }

  // this follows ui google with login
  async function authGoogleUser(IdToken: string): Promise<LoginTicket | null> {
    return await apiHelper.authGoogleUser(IdToken);
  }

  async function authLocalUserByUserAndPassword(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    return await apiHelper.authLocalUserByPassword(email, password);
  }

  async function signOut() {
    const userStore = useUserStore();
    removeCookie(ACCESS_TOKEN_NAME);
    userStore.setCurrentUser(null);
  }

  async function sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await axios.post(`${baseURL}/auth/send-reset-password-mail`, {
        email: email,
        origin: window.location.origin,
      });
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

  async function getUserByEmail(email: string): Promise<UserAttributes | null> {
    return await apiHelper.getUserByEmail(email);
  }

  async function getUserByAccessToken(
    email: string,
  ): Promise<UserAttributes | null> {
    return await apiHelper.getUserByAccessToken();
  }

  return {
    authGoogleUser,
    authLocalUserByUserAndPassword,
    registerUser,
    signOut,
    sendPasswordResetEmail,
    resetPassword,
    getUserByEmail,
    getUserByAccessToken,
  };
}
