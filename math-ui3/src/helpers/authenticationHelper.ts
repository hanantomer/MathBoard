import { LoginTicket } from "google-auth-library";
import { removeCookie } from "typescript-cookie";
import { UserType } from "common/unions";
import {
  ACCESS_TOKEN_NAME,
  GoogleUserData,
  validateCookiesEnabled,
} from "common/globals";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { useUserStore } from "../store/pinia/userStore";
import axiosHelper from "./axiosHelper";
import useApiHelper from "./apiHelper";
import axios from "axios";
import { decodeCredential } from "vue3-google-login";
import { useCookies } from "vue3-cookies";

const cookies = useCookies().cookies;
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

    const createdUser = await apiHelper.registerUser(user);
    cookies.set(ACCESS_TOKEN_NAME, createdUser.access_token!, "7d");
    return createdUser;
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

  async function handleGoogleUserRegistration(
    response: any,
    userType: UserType,
  ): Promise<UserAttributes | null> {
    if (!validateCookiesEnabled()) return null;

    const ticket = await authGoogleUser(response.credential);

    if (!ticket) return null;

    const userData = decodeCredential(response.credential) as GoogleUserData;

    // will be used later for subsequent api calls
    cookies.set(ACCESS_TOKEN_NAME, ticket as any, "7d");

    let storedUser = await getUserByEmail(userData.email);
    if (!storedUser || storedUser.userType !== userType) {
      storedUser = await registerUser(
        userData.name.split(" ")[0],
        userData.name.split(" ")[1] || "",
        userData.email,
        "", // password is not relevant for google users
        userType,
      );
    }

    if (!storedUser) {
      alert("Registration failed: Email already in use.");
      return null;
    }

    return storedUser!;
  }

  return {
    handleGoogleUserRegistration,
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
