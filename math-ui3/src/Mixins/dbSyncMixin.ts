import BoardType from "../../../math-common/boardType";
import axios from "axios";
import { useCookies } from "vue3-cookies";
import { User } from "../../../math-db/src/models/user";
import { Lesson } from "../../../math-db/src/models/1_lesson/lesson";

const { cookies } = useCookies();


///TODO move to module
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
    cookies.get("access_token") != null &&
    cookies.get("access_token") != "null" &&
    cookies.get("access_token") != "undefined"
      ? cookies.get("access_token")
      : null;

  if (access_token != null) {
    console.debug(`sending access_token:${access_token}`);
    config.headers.authentication = access_token;
  }

  return config;
});

export default function () {

  function handleError(error : any) {
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

  // async function getNotationByCoordinates(notation) {
  //   const endpoint = `${notation.boardType}${notation.type}s`; // e.g lessonsymbols
  //   const parentIdFieldName = `${notation.boardType.capitalize()}uuid`; // e.g lessonId
  //   const parentIdValue = notation[parentIdFieldName]; // e.g lessonId value
  //   const row = notation.row;
  //   const col =
  //     notation.type === "symbol" || notation.type === "power"
  //       ? notation.col
  //       : notation.fromCol;
  //   const colFieldName =
  //     notation.type === "symbol" || notation.type === "power"
  //       ? "col"
  //       : "fromCol";

  //   try {
  //     const query = `/${endpoint.toLocaleLowerCase()}?${parentIdFieldName}=${parentIdValue}&row=${row}&${colFieldName}=${col}`;
  //     const res = await axiosInstnce.get(query);
  //     return res?.data?.length > 0 ? res.data[0] : null;
  //   } catch (error) {
  //     handleError(error);
  //   }
  // }

  async function authGoogleUser() {
    try {
      const res = await axiosInstnce.get("/users");
      console.debug(`authGoogleUser:${JSON.stringify(res)}`);
      return res ? res.data[0] : null;
    } catch (error) {
      this.handleError(error);
    }
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken() {
    try {
      const res = await axiosInstnce.get("/users");
      return res ? res.data : null;
    } catch (error) {
      handleError(error);
    }
  }

  async function authLocalUserByPassword(email: string, password: string) {
    try {
      const res = await axiosInstnce.get(
        `/users?email=${email}&password=${password}`
      );
      console.debug(`authLocalUserByPassword:${JSON.stringify(res)}`);
      return res ? res.data : null;
    } catch (error) {
      handleError(error);
    }
  }

  async function registerUser(user: User) {
    try {
      await axiosInstnce.post("/users", user);
      console.debug(`registerUser:${JSON.stringify(user)}`);
    } catch (error) {
      handleError(error);
    }
  }

  async function addLesson(lesson: Lesson) {
    try {
      console.debug(`adding lesson:${lesson.name}`);
      return await axiosInstnce.post("/lessons", lesson);
    } catch (error) {
      handleError(error);
    }
  }

  async function addLessonToSharedLessons(lessonUUId, userId) {
    try {
      // check if exists
      const studentLesson = await axiosInstnce.get(
        `/studentlessons?LessonUUId=${lessonUUId}&UserId=${userId}`
      );
      console.debug(studentLesson);

      if (studentLesson.data.length) return;

      return await axiosInstnce.post("/studentlessons", {
        LessonUUId: lessonUUId,
        UserId: userId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async function addQuestion(question) {
    try {
      return await axiosInstnce.post("/questions", question);
    } catch (error) {
      this.handleError(error);
    }
  }

  async function addAnswer(answer) {
    try {
      return await axiosInstnce.post("/answers", answer);
    } catch (error) {
      this.handleError(error);
    }
  }

  async function saveNotation(notation) {
    console.debug("dbsync:" + notation.value);
    const res = await axiosInstnce.post(
      `/${notation.boardType}${notation.type.toLowerCase()}s`,
      notation
    );
    return res
      ? { ...res.data, type: notation.type, LessonUUId: notation.LessonUUId }
      : null;
  }

  async function updateNotation(notation) {
    const res = await axiosInstnce.put(
      `/${notation.boardType}${notation.type.toLowerCase()}s/${notation.id}`,
      notation
    );
    return res
      ? { ...res.data, type: notation.type, LessonUUId: notation.LessonUUId }
      : null;
  }

  async function removeNotation(notation) {
    /// TODO find a way to get current user
    //if (this.getUser().id != notation.UserId) {
    //  return;
    //}
    try {
      axiosInstnce.delete(
        `${notation.boardType}${notation.type}s/${notation.id}`
      ); // e.g lessonsymbols/1)
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getLesson(LessonUUId) {
    try {
      const res = await axiosInstnce.get("/lessons?uuid=" + LessonUUId);
      return res ? res.data[0] : null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getQuestion(questionUUId) {
    try {
      const res = await axiosInstnce.get("/questions?uuid=" + questionUUId);
      return res ? res.data[0] : null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getAnswer(answerUUId) {
    try {
      const res = await axiosInstnce.get("/answers?uuid=" + answerUUId);
      return res ? res.data[0] : null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getTeacherLessons(userId) {
    try {
      return axiosInstnce.get("/lessons?UserId=" + userId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getStudentLessons(userId) {
    try {
      return await axiosInstnce.get("/studentlessons?UserId=" + userId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getQuestions(lessonUUId) {
    try {
      return lessonUUId
        ? axiosInstnce.get("/questions?LessonUUId=" + lessonUUId)
        : axiosInstnce.get("/questions");
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getAnswers(questionUUId) {
    try {
      return questionUUId
        ? axiosInstnce.get("/answers?QuestionUUId=" + questionUUId)
        : axiosInstnce.get("/answers");
    } catch (error) {
      this.handleError(error);
    }
  }

  async function getNotations(notationType, boardType, parentUUId) {
    try {
      // e.g lessonsymbols?LessonUUId=1
      const parentFieldName =
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

      const uri = `${boardType}${notationType}s?${parentFieldName}=${parentUUId}`;

      return axiosInstnce.get(uri);
    } catch (error) {
      this.handleError(error);
    }
  }

  return {
//    getNotationByCoordinates,
    getNotations,
    getAnswers,
    getQuestions,
    getStudentLessons,
    getTeacherLessons,
    getAnswer,
    getQuestion,
    getLesson,
    authGoogleUser,
    authLocalUserByToken,
    authLocalUserByPassword,
    registerUser,
    addLesson,
    addLessonToSharedLessons,
    addQuestion,
    addAnswer,
    saveNotation,
    updateNotation,
    removeNotation
  }
}
