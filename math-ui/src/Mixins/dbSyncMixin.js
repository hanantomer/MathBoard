const NotationType = require("./notationType");
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

module.exports = {
  methods: {
    handleError: function (error) {
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
    },
    getNotationByCoordinates: async function (notation) {
      let endpoint = `${notation.boardType}${notation.type}s`; // e.g lessonsymbols
      let parentIdFieldName = `${notation.boardType.capitalize()}Id`; // e.g lessonId
      let parentIdValue = notation[parentIdFieldName]; // e.g lessonId value
      let row = notation.row;
      let col =
        notation.type === "symbol" || notation.type === "power"
          ? notation.col
          : notation.fromCol;
      let colFieldName =
        notation.type === "symbol" || notation.type === "power"
          ? "col"
          : "fromCol";

      try {
        let query = `/${endpoint.toLocaleLowerCase()}?${parentIdFieldName}=${parentIdValue}&row=${row}&${colFieldName}=${col}`;
        let res = await axiosInstnce.get(query);
        return res?.data?.length > 0 ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    createAccessLink: async function (lessonId, link) {
      try {
        let res = await axiosInstnce.post("/accessLink", {
          LessonId: lessonId,
          link: link,
        });
        return res.data;
      } catch (error) {
        this.handleError(error);
      }
    },
    authGoogleUser: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authGoogleUser:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    authLocalUserByToken: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authLocalUserByToken:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
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
        this.handleError(error);
      }
    },
    registerUser: async function (user) {
      try {
        await axiosInstnce.post("/users", user);
        console.debug(`registerUser:${JSON.stringify(user)}`);
      } catch (error) {
        this.handleError(error);
      }
    },
    addLesson: async function (lesson) {
      try {
        console.debug(`adding lesson:${lesson.name}`);
        return await axiosInstnce.post("/lessons", lesson);
      } catch (error) {
        this.handleError(error);
      }
    },
    addQuestion: async function (question) {
      try {
        return await axiosInstnce.post("/questions", question);
      } catch (error) {
        this.handleError(error);
      }
    },
    saveNotation: async function (notation) {
      res = await axiosInstnce.post(
        `/${notation.boardType}${notation.type.toLowerCase()}s`,
        notation
      );
      return res ? { ...res.data, type: notation.type } : null;
    },
    updateNotation: async function (notation) {
      return await axiosInstnce.put(
        `/${notation.boardType}${notation.type.toLowerCase()}s/${notation.id}`,
        notation
      );
    },
    removeNotation: async function (notation) {
      try {
        axiosInstnce.delete(
          `${notation.boardType}${notation.type}s/${notation.id}`
        ); // e.g lessonsymbols/1)
      } catch (error) {
        this.handleError(error);
      }
    },
    getLesson: async function (lessonId) {
      try {
        let res = await axiosInstnce.get("/lessons?id=" + lessonId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    getQuestion: async function (questionId) {
      try {
        let res = await axiosInstnce.get("/questions?id=" + questionId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    getLessons: async function (userId) {
      try {
        return axiosInstnce.get("/lessons?UserId=" + userId);
      } catch (error) {
        this.handleError(error);
      }
    },
    getQuestions: async function (lessonId) {
      try {
        return axiosInstnce.get("/questions?LessonId=" + lessonId);
      } catch (error) {
        this.handleError(error);
      }
    },
    getNotations: function (parent, notationType) {
      try {
        // e.g lessonsymbols?id=1
        return axiosInstnce.get(
          `${
            parent.boardType
          }${notationType}s?${parent.boardType.capitalize()}Id=${parent.id}`
        );
      } catch (error) {
        this.handleError(error);
      }
    },
  },
};
