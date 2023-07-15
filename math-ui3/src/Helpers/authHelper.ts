import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "../../../math-common/src/enum";
import User from "../../../math-db/src/models/user.model";
import useDbHelper from "./dbHelper";

const userStore = useUserStore();
const notationStore = useNotationStore();
const dbHelper = useDbHelper();


export default function useAuthHelper() {

  function setUser(user: User) {
    userStore.setUser(user)
  }

  function registerUser(firstName: string, lastName: string, password: string, email: string) {
    let user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = password;
    userStore.registerUser(user);
  }

  function canEdit() {
    return (
      userStore.isTeacher || // teacher in lesson or question
      userStore.authorized || // student in lesson when authorized by teacher
      notationStore.parent.type == BoardType.ANSWER // student writing an  answer
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
    password: string
  ) {
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
    if (this.signedInWithGoogle()) {
      gapi.auth2.getAuthInstance().signOut();
    } else {
      removeCookie("access_token");
    }

    userStore.currentUser = null;
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
};
