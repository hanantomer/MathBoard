import { decodeCredential } from "vue3-google-login";
import { GoogleUserData } from "common/globals";
import useAuthHelper from "../helpers/authenticationHelper";
import { UserType } from "common/unions";

export default function useGoogleLogin() {
  const authHelper = useAuthHelper();

  const handleGoogleAuth = async (accessToken: string) => {
    const ticket = await authHelper.authGoogleUser(accessToken);
    if (!ticket) {
      throw new Error("Google authentication failed");
    }
    return ticket;
  };

  const decodeGoogleCredential = (credential: string): GoogleUserData => {
    return decodeCredential(credential) as GoogleUserData;
  };


  return {
    handleGoogleAuth,
    decodeGoogleCredential,
  };
}
