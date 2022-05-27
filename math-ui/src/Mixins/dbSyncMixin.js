const axios = require("axios");
const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

axiosInstnce.interceptors.request.use(function (config) {
  const isOAuth =
    gapi.auth2.getAuthInstance() != null &&
    gapi.auth2.getAuthInstance().currentUser != null &&
    gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();

  const access_token = isOAuth
    ? `Bearer ${
        gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
          .id_token
      }`
    : window.$cookies.get("access_token") != null &&
      window.$cookies.get("access_token") != "null" &&
      window.$cookies.get("access_token") != "undefined"
    ? window.$cookies.get("access_token")
    : null;

  if (access_token != null) {
    console.debug(`sending access_token:${access_token}`);
    config.headers.authentication = access_token;
  }
  access_token;

  return config;
});

function handleError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
}

async function getSymbolByCoordinates(row, col) {
  try {
    let res = await axiosInstnce.get(
      "/lessonsymbols?row=" + row + "&col=" + col
    );
    return !!res ? res.data[0] : null;
  } catch (error) {
    handleError(error);
  }
}

module.exports = {
  methods: {
    createAccessLink: async function (lessonId, link) {
      try {
        let res = await axiosInstnce.post("/accessLink", {
          LessonId: lessonId,
          link: link,
        });
        return res.data;
      } catch (error) {
        handleError(error);
      }
    },
    authGoogleUser: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authGoogleUser:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByToken: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authLocalUserByToken:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByPassword: async function (email, password) {
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}&password=${password}`
        );
        console.debug(`authLocalUserByPassword:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    registerUser: async function (user) {
      try {
        await axiosInstnce.post("/users", user);
        console.debug(`registerUser:${JSON.stringify(user)}`);
      } catch (error) {
        handleError(error);
      }
    },
    addLesson: async function (lesson) {
      try {
        return axiosInstnce.post("/lessons", lesson);
      } catch (error) {
        handleError(error);
      }
    },
    saveSymbol: async function (symbol) {
      let symbolAtCoordinates = await getSymbolByCoordinates(
        symbol.row,
        symbol.col
      );

      let res = null;
      if (!!symbolAtCoordinates) {
        res = await axiosInstnce.put(
          "/lessonsymbols/" + symbolAtCoordinates.id,
          symbol
        );
      } else {
        res = await axiosInstnce.post("/lessonsymbols", symbol);
      }

      return res ? { ...res.data, type: symbol.type } : null;
    },
    removeNotation: async function (notation) {
      try {
        axiosInstnce.delete("/lessonsymbols/" + notation.id);
      } catch (error) {
        handleError(error);
      }
    },
    getLesson: async function (lessonId) {
      try {
        let res = await axiosInstnce.get("/lessons?id=" + lessonId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },

    getAllLessons: async function (user) {
      console.log(user);
      try {
        return axiosInstnce.get("/lessons?UserId=" + user.id);
      } catch (error) {
        handleError(error);
      }
    },
    getAllSymbols: async function (lessonId) {
      try {
        let res = await axiosInstnce.get("/lessonsymbols?LessonId=" + lessonId);
        return res.data;
      } catch (error) {
        handleError(error);
      }
    },
  },
};
