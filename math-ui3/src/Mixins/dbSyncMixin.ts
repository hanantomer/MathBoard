import { BoardType, NotationType } from "../../../math-common/src/enum";
import { useCookies } from "vue3-cookies";
import { onMounted } from "vue";
import User from "../../../math-db/src/models/user.model";
import Lesson from "../../../math-db/src/models/lesson/lesson.model";
import Question from "../../../math-db/src/models/question/question.model";
import Answer from "../../../math-db/src/models/answer/answer.model";
import axios from "axios";

const { cookies } = useCookies();

interface GetUserResponse {
  data: User[];
}

interface GetLessonResponse {
  data: Lesson[];
}
interface GetQuestionResponse {
  data: Question[];
}
interface GetAnswerResponse {
  data: Answer[];
}


// Object.defineProperty(String.prototype, "capitalize", {
//   value: function () {
//     return this.charAt(0).toUpperCase() + this.slice(1);
//   },
//   enumerable: false,
// });


export default function dbSync() {
  // TODO use enviroment variable
  const baseURL = "http://localhost:8081";

  //var axios: any;

  onMounted(() => {
    //axios = axios.create({
      // TODO use enviroment variable
      //baseURL: "http://localhost:8081",
    //}//);

    axios.interceptors.request.use(function (config: any) {
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
  });

  /// TOD avoid biolerplate - move to interceptor
  function handleError(error: any) {
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
    return null;
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
  //     const { data } =await axios.get(query);
  //     return res?.data?.length > 0 ? res.data[0] : null;
  //   } catch (error) {
  //     handleError(error);
  //   }
  // }


  async function authGoogleUser(): Promise<GetUserResponse> {
    try {
      const { data } = await axios.get<GetUserResponse>(baseURL + "/users");
      return data;
    } catch (error) {
      handleError(error);
      return {data: []};
    }
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<GetUserResponse> {
    try {
      const { data } = await axios.get(baseURL + "/users");
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function authLocalUserByPassword(
    email: string,
    password: string
  ): Promise<GetUserResponse> {
    try {
      const { data } = await axios.get(
        baseURL + `/users?email=${email}&password=${password}`
      );
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function registerUser(user: User) : Promise<GetUserResponse> {
    try {
      const { data } = await axios.post(baseURL + "/users", user);
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }


  async function addLessonToSharedLessons(lessonUUId: string, userId: number) {
    try {
      // check if exists
      const studentLesson = await axios.get(
        `/studentlessons?LessonUUId=${lessonUUId}&UserId=${userId}`
      );
      console.debug(studentLesson);

      if (studentLesson.data.length) return;

      return await axios.post(baseURL  + "/studentlessons", {
        LessonUUId: lessonUUId,
        UserId: userId,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async function addLesson(lesson: Lesson): Promise<GetLessonResponse> {
    try {
      const { data } = await axios.post<GetLessonResponse>(
        baseURL + "/lessons",
        lesson
      );
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function addQuestion(question: Question): Promise<GetQuestionResponse> {
    try {
      const { data } = await axios.post<GetQuestionResponse>(
        baseURL + "/questions",
        question
      );
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function addAnswer(answer: Answer) : Promise<GetAnswerResponse> {
    try {
      const { data } = await axios.post<GetAnswerResponse>(
        baseURL + "/answers",
        answer
      );
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function updateNotation(notation: any) {
    const { data } =await axios.put(
      `/${notation.boardType}${notation.type.toLowerCase()}s/${notation.id}`,
      notation
    );
    return data;
//      ? { ...res.data, type: notation.type, LessonUUId: notation.LessonUUId }
//      : null;
  }

  async function removeNotation(notation: any) {
    /// TODO find a way to get current user
    //if (this.getUser().id != notation.UserId) {
    //  return;
    //}
    try {
      axios.delete(
        `${notation.boardType}${notation.type}s/${notation.id}`
      ); // e.g lessonsymbols/1)
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getLesson(LessonUUId: string) : Promise<GetLessonResponse> {
    try {
      const { data } = await axios.get<GetLessonResponse>(baseURL + "/lessons?uuid=" + LessonUUId);
      return data;
    } catch (error) {
      handleError(error);
      return {data: []}
    }
  }

  async function getQuestion(questionUUId: string): Promise<GetQuestionResponse> {
    try {
      const { data } = await axios.get<GetQuestionResponse>(
        baseURL + "/questions?uuid=" + questionUUId
      );
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getAnswer(answerUUId: string) {
    try {
      const { data } = await axios.get(baseURL  + "/answers?uuid=" + answerUUId);
      return data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getTeacherLessons(userId: number) {
    try {
      return axios.get(baseURL  + "/lessons?UserId=" + userId);
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getStudentLessons(userId: number) {
    try {
      return await axios.get(baseURL  + "/studentlessons?UserId=" + userId);
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getQuestions(lessonUUId: string) {
    try {
      return lessonUUId
        ? axios.get(baseURL  + "/questions?LessonUUId=" + lessonUUId)
        : axios.get(baseURL  + "/questions");
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getAnswers(questionUUId: string) {
    try {
      return questionUUId
        ? axios.get(baseURL  + "/answers?QuestionUUId=" + questionUUId)
        : axios.get(baseURL  + "/answers").data;
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  }

  async function getNotations(
    notationType: NotationType,
    boardType: BoardType,
    parentUUId: string
  ) {
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

      return axios.get(uri);
    } catch (error) {
      handleError(error);
      return { data: [] };
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
    updateNotation,
    removeNotation
  }
}
