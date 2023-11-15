import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType, UesrType } from "common/unions";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import useDbHelper from "./dbHelper";
const dbHelper = useDbHelper();

export default function useAuthHelper() {
  function setUser(user: UserAttributes) {
    const userStore = useUserStore(); // initilize lazy here to allow loading of module before [inia has initialized
    userStore.setCurrentUser(user);
  }

  function registerUser(
    firstName: string,
    lastName: string,
    password: string,
    email: string,
    userType: UesrType,
  ) {
    const userStore = useUserStore();
    let user: UserCreationAttributes = {
      userType: userType,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      imageUrl: "",
      access_token: "",
      authorized: false,
      lastHeartbeatTime: new Date(),
    };
    userStore.registerUser(user);
  }

  function canEdit() {
    const userStore = useUserStore();
    const notationStore = useNotationStore();
    return (
      userStore.isTeacher() || // teacher in lesson or question
      userStore.getAuthorized() || // student in lesson when authorized by teacher
      notationStore.getParent().type == "ANSWER" // student writing an answer
    );
  }

  async function authGoogleUser() {
    return await dbHelper.authGoogleUser();
  }

  async function authLocalUserByToken() {
    return await dbHelper.authLocalUserByToken();
  }

  async function authLocalUserByUserAndPassword(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    return await dbHelper.authLocalUserByPassword(email, password);
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
    userStore.setCurrentUser(new Object() as UserAttributes);
  }

  /*async function  getGoogleUser() {
      let auth2 = await gapi.auth2.init();
      if (!auth2.currentUser.get().isSignedIn()) {
        return;
      }
      let googleUser: any = {};
      let userProfile = auth2.currentUser.get().getBasicProfile();
      googleUser.name = userProfile.getName();
      googleUser.email = userProfile.getEmail();
      googleUser.imageUrl = userProfile.getImageUrl();
      googleUser.id_token = auth2.currentUser.get().getAuthResponse().id_token;
      return googleUser;
  };*/

  return {
    //getGoogleUser,
    setUser,
    registerUser,
    authLocalUserByToken,
    authLocalUserByUserAndPassword,
    signOut,
    signedInLocally,
    signedInWithGoogle,
    getToken,
    authGoogleUser,
    canEdit,
  };
}
