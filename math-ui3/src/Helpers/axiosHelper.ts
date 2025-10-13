import axios from "axios";
import { useCookies } from "vue3-cookies";
import { useRouter } from "vue-router";
import { baseURL, imagesURL } from "../../../math-common/src/globals";

const { cookies } = useCookies();

export default function axiosHelper() {
  function handleError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    console.error(error.config);
    return error;
  }

  function initAxiosInterceptors() {
    axios.interceptors.request.use(
      function (config: any) {
        const access_token =
          cookies.get("access_token") != null &&
          cookies.get("access_token") != "null" &&
          cookies.get("access_token") != "undefined"
            ? cookies.get("access_token")
            : null;

        if (!access_token && window.location.pathname != "/login") {
          cookies.remove("access_token");

          const router = useRouter();

          // Redirect to login
          router.push("/login");
          return Promise.reject(new Error("No access token"));
        }

        config.headers.authorization = access_token;
        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );
  }

  return { baseURL, imagesURL, initAxiosInterceptors, handleError };
}
