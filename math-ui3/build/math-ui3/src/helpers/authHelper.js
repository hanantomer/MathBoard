import { getCookie, removeCookie } from "typescript-cookie";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "../../../math-common/src/enum";
import useDbHelper from "./dbHelper";
//const userStore = useUserStore();
//const notationStore = useNotationStore();
const dbHelper = useDbHelper();
export default function useAuthHelper() {
    function setUser(user) {
        const userStore = useUserStore();
        userStore.setUser(user);
    }
    function registerUser(firstName, lastName, password, email, userType) {
        const userStore = useUserStore();
        let user = {
            userType: userType,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            imageUrl: "",
            access_token: "",
            authorized: false,
            uuid: "",
            lastHeartbeatTime: new Date(),
        };
        userStore.registerUser(user);
    }
    function canEdit() {
        const userStore = useUserStore();
        const notationStore = useNotationStore();
        return (userStore.isTeacher || // teacher in lesson or question
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
    async function authLocalUserByUserAndPassword(email, password) {
        return await dbHelper.authLocalUserByPassword(email, password);
    }
    function getToken() {
        const access_token = `${gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
            ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
                .id_token
            : getCookie("access_token")}`;
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
        }
        else {
            removeCookie("access_token");
        }
        userStore.currentUser = new Object();
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
;
//# sourceMappingURL=authHelper.js.map
