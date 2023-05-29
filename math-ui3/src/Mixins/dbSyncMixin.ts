import { BoardType, NotationType } from "../../../math-common/src/enum";
import axios from "axios";
import { baseURL, initAxiosInterceptors } from "./axiosInterceptors"
import { onMounted } from "vue";
import User from "../../../math-db/src/models/user.model";
import Lesson from "../../../math-db/src/models/lesson/lesson.model";
import Question from "../../../math-db/src/models/question/question.model";
import Answer from "../../../math-db/src/models/answer/answer.model";

import {
  Notation,
  QuestionResponse,
  LessonResponse,
  UserResponse,
  AnswerResponse,
} from "./responseTypes";


// Object.defineProperty(String.prototype, "capitalize", {
//   value: function () {
//     return this.charAt(0).toUpperCase() + this.slice(1);
//   },
//   enumerable: false,
// });


export function dbSync() {

  onMounted(() => {
    initAxiosInterceptors();
  });

  function getParentFieldName(boardType: BoardType) {
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
    return parentFieldName;
  }

  async function authGoogleUser(): Promise<UserResponse> {
      const { data } = await axios.get<UserResponse>(baseURL + "/users");
      return data;
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<UserResponse> {
      const { data } = await axios.get(baseURL + "/users");
      return data;
  }

  async function authLocalUserByPassword(
    email: string,
    password: string
  ): Promise<UserResponse> {
    const { data } = await axios.get<UserResponse>(
      baseURL + `/users?email=${email}&password=${password}`
    );
    return data;
  }

  async function registerUser(user: User) : Promise<UserResponse> {
      const { data } = await axios.post(baseURL + "/users", user);
      return data;
  }


  async function addLessonToSharedLessons(lessonUUId: string, userId: number) {

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
  }

  async function addLesson(lesson: Lesson): Promise<LessonResponse> {
      const { data } = await axios.post<LessonResponse>(
        baseURL + "/lessons",
        lesson
      );
      return data;
  }

  async function addQuestion(question: Question): Promise<QuestionResponse> {
      const { data } = await axios.post<QuestionResponse>(
        baseURL + "/questions",
        question
      );
      return data;
  }

  async function addAnswer(answer: Answer) : Promise<AnswerResponse> {
      const { data } = await axios.post<AnswerResponse>(
        baseURL + "/answers",
        answer
      );
      return data;
  }

  async function updateNotation(notation: any) {
    const { data } = await axios.put(
      `/${notation.boardType}${notation.type.toLowerCase()}s/${notation.id}`,
      notation
    );
    return data;
  }

  async function getLesson(LessonUUId: string) : Promise<LessonResponse> {
    const { data } = await axios.get<LessonResponse>(baseURL + "/lessons?uuid=" + LessonUUId);
    return data;
  }

  async function getQuestion(questionUUId: string): Promise<QuestionResponse> {
    const { data } = await axios.get<QuestionResponse>(
      baseURL + "/questions?uuid=" + questionUUId
    );
    return data;
  }

  async function getAnswer(answerUUId: string) {
      const { data } = await axios.get(baseURL  + "/answers?uuid=" + answerUUId);
      return data;
  }

  async function getTeacherLessons(userId: number) {
    return axios.get(baseURL  + "/lessons?UserId=" + userId);
  }

  async function getStudentLessons(userId: number) {
      return await axios.get(baseURL  + "/studentlessons?UserId=" + userId);
  }

  async function getQuestions(lessonUUId: string) {
    return lessonUUId
      ? axios.get(baseURL  + "/questions?LessonUUId=" + lessonUUId)
      : axios.get(baseURL  + "/questions");
  }

  async function getAnswers(questionUUId: string) {
    const { data } = await axios.get<QuestionResponse>(baseURL + "/answers?QuestionUUId=" + questionUUId)
    return data;
  }

  async function removeNotation(notation: Notation) {
    axios.delete(`${notation.boardType}${notation.notationType}s/${notation.id}`); // e.g lessonsymbols/1)
  }

  async function getNotations<T>(
    notationType: NotationType,
    boardType: BoardType,
    parentUUId: string
  ): Promise<T> {
      // e.g lessonsymbols?LessonUUId=1
      const parentFieldName = getParentFieldName(boardType);
      const uri = `${boardType}${notationType}s?${parentFieldName}=${parentUUId}`;
      const { data } = (await axios.get<T>(uri));
      return data
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
    removeNotation,
  };
}


