import { BoardType, NotationType } from "../../../math-common/src/enum";
import axios from "axios";
import axiosHelper from "./axiosHelper";
import { onMounted } from "vue";
import User from "../../../math-db/src/models/user.model";
import Lesson from "../../../math-db/src/models/lesson/lesson.model";
import Question from "../../../math-db/src/models/question/question.model";
import Answer from "../../../math-db/src/models/answer/answer.model";

import {
  Notation,
  Response
} from "./responseTypes";

const {baseURL, handleError, initAxiosInterceptors } = axiosHelper();

export default function useDbHelper() {

  ///TODO: move to main
  onMounted(() => {
    initAxiosInterceptors();
  });

  function getParentFieldName(boardType: BoardType) : string | null {
    const parentFieldName =
      boardType == BoardType.LESSON
        ? "LessonUUId"
        : boardType == BoardType.QUESTION
        ? "QuestionUUId"
        : boardType == BoardType.ANSWER
        ? "AnswerUUId" : null;

    if (boardType == null) {
      throw new Error("Invalid boardType:" + boardType);
    }

    return parentFieldName;
  }

  async function authGoogleUser(): Promise<User>  {
      const { data } = await axios.get<Response<User>>(baseURL + "/users");
      return data.data[0];
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<User> {
      const { data } = await axios.get<Response<User>>(baseURL + "/users");
      return data.data[0];
  }

  async function authLocalUserByPassword(
    email: string,
    password: string
  ): Promise<User> {
    const { data } = await axios.get<Response<User>>(
      baseURL + `/users?email=${email}&password=${password}`
    );
    return data.data[0];
  }

  async function registerUser(user: User) : Promise<User> {
      const { data } = await axios.post<Response<User>>(
        baseURL + "/users",
        user
      );
      return data.data[0];
  }


  async function addLessonToSharedLessons(lessonUUId: string, userId: number) {

      // check if exists
      const studentLesson = await axios.get(
        `/studentlessons?LessonUUId=${lessonUUId}&UserId=${userId}`
      );
      console.debug(studentLesson);

      if (studentLesson.data.length) return;

      await axios.post(baseURL  + "/studentlessons", {
        LessonUUId: lessonUUId,
        UserId: userId,
      });
  }

  async function addLesson(lesson: Lesson): Promise<Lesson> {
      const { data } = await axios.post<Response<Lesson>>(
        baseURL + "/lessons",
        lesson
      );
      return data.data[0];
  }

  async function addQuestion(question: Question): Promise<Question> {
      const { data } = await axios.post<Response<Question>>(
        baseURL + "/questions",
        question
      );
      return data.data[0];
  }

  async function addAnswer(answer: Answer) : Promise<Answer> {
      const { data } = await axios.post<Response<Answer>>(
        baseURL + "/answers",
        answer
      );
      return data.data[0];
  }

  async function addNotation(notation: Notation): Promise<Notation> {
    const { data } = await axios.post<Response<Notation>>(
      baseURL +
        `/${notation.boardType}${notation.notationType.toLowerCase()}s/`,
      notation
    );
    return data.data[0];
  }


  async function updateNotation(notation: Notation): Promise<Notation> {
    const { data } = await axios.put<Response<Notation>>(
      baseURL +
        `/${notation.boardType}${notation.notationType.toLowerCase()}s/${
          notation.id
        }`,
      notation
    );
    return data.data[0];
  }

  async function getLesson(LessonUUId: string) : Promise<Lesson> {
    const { data } = await axios.get<Response<Lesson>>(baseURL + "/lessons?uuid=" + LessonUUId);
    return data.data[0];
  }

  async function getQuestion(questionUUId: string): Promise<Question> {
    const { data } = await axios.get<Response<Question>>(
      baseURL + "/questions?uuid=" + questionUUId
    );
    return data.data[0];
  }

  async function getAnswer(answerUUId: string) : Promise<Answer>{
      const { data } = await axios.get<Response<Answer>>(baseURL  + "/answers?uuid=" + answerUUId);
      return data.data[0];
  }

  async function getTeacherLessons(userUUId: string) : Promise<Lesson[]>{
     const { data } = await axios.get<Response<Lesson>>(
       baseURL + "/lessons?UserUUId=" + userUUId
    );

    return data.data;
  }

  async function getStudentLessons(userUUId: string): Promise<Lesson[]> {
    const { data } = await axios.get<Response<Lesson>>(
      baseURL + "/studentlessons?UserUUId=" + userUUId
    );

    return data.data;
  }

  async function getQuestions(lessonUUId: string) : Promise<Question[]> {
    const { data } = await axios.get<Response<Question>>(baseURL  + "/questions?LessonUUId=" + lessonUUId)
    return data.data;
  }

  async function getAnswers(questionUUId: string): Promise<Answer[]> {
    const { data } = await axios.get<Response<Answer>>(
      baseURL + "/answers?QuestionUUId=" + questionUUId
    );

    return data.data;
  }

  async function removeNotation(notation: Notation) {
    axios.delete(`${notation.boardType}${notation.notationType}s/${notation.id}`); // e.g lessonsymbols/1)
  }

  async function getNotations<T extends Notation>(
    notationType: NotationType,
    boardType: BoardType,
    parentUUId: string
  ): Promise<T[]> {
      // e.g lessonsymbols?LessonUUId=1
      const parentFieldName = getParentFieldName(boardType);
      const uri = `${boardType}${notationType}s?${parentFieldName}=${parentUUId}`;
      const { data } = (await axios.get<Response<T>>(uri));
      return data.data
  }

  return {
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
    addNotation,
    updateNotation,
    removeNotation,
  };
}


