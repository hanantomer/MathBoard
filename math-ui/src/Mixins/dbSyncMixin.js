const BoardType = require("./boardType").default;
const axios = require("axios");
const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

axiosInstnce.interceptors.request.use(function (config) {
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

  const access_token =
    window.$cookies.get("access_token") != null &&
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
      let parentIdFieldName = `${notation.boardType.capitalize()}uuid`; // e.g lessonId
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
    authGoogleUser: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authGoogleUser:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    // the token is taken from cookie. see interceptor at the top of the page
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
        return !!res ? res.data : null;
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
    addLessonToSharedLessons: async function (lessonUUId, userId) {
      try {
        // check if exists
        let studentLesson = await axiosInstnce.get(
          `/studentlessons?LessonUUId=${lessonUUId}&UserId=${userId}`
        );
        console.debug(studentLesson);

        if (!!studentLesson.data.length) return;

        return await axiosInstnce.post("/studentlessons", {
          LessonUUId: lessonUUId,
          UserId: userId,
        });
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
    addAnswer: async function (answer) {
      try {
        return await axiosInstnce.post("/answers", answer);
      } catch (error) {
        this.handleError(error);
      }
    },

    saveNotation: async function (notation) {
      console.debug("dbsync:" + notation.value);
      let res = await axiosInstnce.post(
        `/${notation.boardType}${notation.type.toLowerCase()}s`,
        notation
      );
      return res
        ? { ...res.data, type: notation.type, LessonUUId: notation.LessonUUId }
        : null;
    },
    updateNotation: async function (notation) {
      let res = await axiosInstnce.put(
        `/${notation.boardType}${notation.type.toLowerCase()}s/${notation.id}`,
        notation
      );
      return res
        ? { ...res.data, type: notation.type, LessonUUId: notation.LessonUUId }
        : null;
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
    getLesson: async function (LessonUUId) {
      try {
        let res = await axiosInstnce.get("/lessons?uuid=" + LessonUUId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    getQuestion: async function (questionUUId) {
      try {
        let res = await axiosInstnce.get("/questions?uuid=" + questionUUId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },
    getAnswer: async function (answerUUId) {
      try {
        let res = await axiosInstnce.get("/answers?uuid=" + answerUUId);
        return !!res ? res.data[0] : null;
      } catch (error) {
        this.handleError(error);
      }
    },

    getTeacherLessons: async function (userId) {
      try {
        return axiosInstnce.get("/lessons?UserId=" + userId);
      } catch (error) {
        this.handleError(error);
      }
    },
    getStudentLessons: async function (userId) {
      try {
        return await axiosInstnce.get("/studentlessons?UserId=" + userId);
      } catch (error) {
        this.handleError(error);
      }
    },
    getQuestions: async function (lessonUUId) {
      try {
        return !!lessonUUId
          ? axiosInstnce.get("/questions?LessonUUId=" + lessonUUId)
          : axiosInstnce.get("/questions");
      } catch (error) {
        this.handleError(error);
      }
    },
    getAnswers: async function (questionUUId) {
      try {
        return !!questionUUId
          ? axiosInstnce.get("/answers?QuestionUUId=" + questionUUId)
          : axiosInstnce.get("/answers");
      } catch (error) {
        this.handleError(error);
      }
    },
    getNotations: function (notationType, boardType, parentUUId) {
      try {
        // e.g lessonsymbols?LessonUUId=1
        let parentFieldName =
          boardType == BoardType.LESSON
            ? "LessonUUId"
            : boardType == BoardType.QUESTION
            ? "QuestionUUId"
            : boardType == BoardType.ANSWER
            ? "AnswerUUId"
            : null;

        if (boardType == null) {
          throw new Error("Invalid boardType:" + boardType);
        }

        let uri = `${boardType}${notationType}s?${parentFieldName}=${parentUUId}`;

        return axiosInstnce.get(uri);
      } catch (error) {
        this.handleError(error);
      }
    },
  },
};
