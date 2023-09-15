import axios from "axios";
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
export default function axiosHelper() {
    ///TODO: take from enviroment\
    const baseURL = "http://localhost:8081";
    function handleError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            //error.response.data?.errors.forEach((error: any) => {
            //    console.log(error);
            //});
        }
        else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
        }
        else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
        }
        console.log(error.config);
        return error;
    }
    function initAxiosInterceptors() {
        axios.interceptors.response.use((response) => response, (error) => {
            handleError(error);
        });
        axios.interceptors.request.use(function (config) {
            // const isOAuth =
            //   gapi.auth2.getAuthInstance() != null &&
            //   gapi.auth2.getAuthInstance().currentUser != null &&
            //   gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
            // const access_token = isOAuth
            //   ? `Bearer ${
            //       gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
            //         .id_token
            //     }`
            //   : window.$cookies.get("access_token") != null &&
            //     window.$cookies.get("access_token") != "null" &&
            //     window.$cookies.get("access_token") != "undefined"
            //   ? window.$cookies.get("access_token")
            //   : null;
            const access_token = cookies.get("access_token") != null &&
                cookies.get("access_token") != "null" &&
                cookies.get("access_token") != "undefined"
                ? cookies.get("access_token")
                : null;
            if (access_token != null) {
                console.debug(`sending access_token:${access_token}`);
                config.headers.authorization = access_token;
            }
            return config;
        });
    }
    return { baseURL, initAxiosInterceptors, handleError };
}
//# sourceMappingURL=axiosHelper.js.map
