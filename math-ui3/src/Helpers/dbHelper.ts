import { BoardType, NotationType } from "../../../math-common/src/enum";
import axios from "axios";
import axiosHelper from "./axiosHelper";
import { UserAttributes, UserCreateAttributes } from "../../../math-db/src/models/user.model";
import { LessonAttributes, LessonCreateAttributes } from "../../../math-db/src/models/lesson/lesson.model";
import { QuestionAttributes, QuestionCreateAttributes } from "../../../math-db/src/models/question/question.model";
import { AnswerAttributes, AnswerCreateAttributes } from "../../../math-db/src/models/answer/answer.model";


import { BaseNotation, BaseCreateNotation } from "../../../math-db/src/models/baseNotation";

export interface Response<T> {
  data: T[];
}

const { baseURL } = axiosHelper();

export default function useDbHelper() {

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

  async function authGoogleUser(): Promise<UserAttributes>  {
      const { data } = await axios.get<Response<UserAttributes>>(
        baseURL + "/users"
      );
      return data.data[0];
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<UserAttributes> {
      const { data } = await axios.get<Response<UserAttributes>>(
        baseURL + "/users"
      );
      return data.data[0];
  }

  async function authLocalUserByPassword(
    email: string,
    password: string
  ): Promise<UserAttributes> {
    const { data } = await axios.get<Response<UserAttributes>>(
      baseURL + `/users?email=${email}&password=${password}`
    );
    return data.data[0];
  }

  async function registerUser(
    user: UserCreateAttributes
  ): Promise<Response<UserCreateAttributes>> {
    const { data } = await axios.post<Response<UserCreateAttributes>>(
      baseURL + "/users",
      user
    );
    return data;
  }


  async function addLessonToSharedLessons(lessonUUId: string, userUUId: string) {

      // check if exists
      const studentLesson = await axios.get(
        `/studentlessons?LessonUUId=${lessonUUId}&UserUUId=${userUUId}`
      );

      if (studentLesson.data.length) return;

      await axios.post(baseURL  + "/studentlessons", {
        LessonUUId: lessonUUId,
        UserUUId: userUUId,
      });
  }

  async function addLesson(
    lesson: LessonCreateAttributes
  ): Promise<LessonAttributes> {
    const { data } = await axios.post<Response<LessonAttributes>>(
      baseURL + "/lessons",
      lesson
    );
    return data.data[0];
  }

  async function addQuestion(question: QuestionCreateAttributes): Promise<QuestionAttributes> {
      const { data } = await axios.post<Response<QuestionAttributes>>(
        baseURL + "/questions",
        question
      );
      return data.data[0];
  }

  async function addAnswer(answer: AnswerCreateAttributes) : Promise<AnswerAttributes> {
      const { data } = await axios.post<Response<AnswerAttributes>>(
        baseURL + "/answers",
        answer
      );
      return data.data[0];
  }

  async function addNotation(notation: BaseCreateNotation): Promise<BaseNotation> {
    const { data } = await axios.post<Response<BaseNotation>>(
      baseURL +
        `/${notation.boardType}${notation.notationType.toLowerCase()}s/`,
      notation
    );
    return data.data[0];
  }


  async function updateNotation(notation: BaseNotation): Promise<BaseNotation> {
    const { data } = await axios.put<Response<BaseNotation>>(
      baseURL +
        `/${notation.boardType}${notation.notationType.toLowerCase()}s/${
          notation.uuid
        }`,
      notation
    );
    return data.data[0];
  }

  async function getLesson(LessonUUId: string) : Promise<LessonAttributes> {
    const { data } = await axios.get<Response<LessonAttributes>>(baseURL + "/lessons?uuid=" + LessonUUId);
    return data.data[0];
  }

  async function getQuestion(questionUUId: string): Promise<QuestionAttributes> {
    const { data } = await axios.get<Response<QuestionAttributes>>(
      baseURL + "/questions?uuid=" + questionUUId
    );
    return data.data[0];
  }

  async function getAnswer(answerUUId: string) : Promise<AnswerAttributes>{
      const { data } = await axios.get<Response<AnswerAttributes>>(baseURL  + "/answers?uuid=" + answerUUId);
      return data.data[0];
  }

  async function getTeacherLessons(userUUId: string) : Promise<LessonAttributes[]>{
     const { data } = await axios.get<Response<LessonAttributes>>(
       baseURL + "/lessons?UserUUId=" + userUUId
    );

    return data.data;
  }

  async function getStudentLessons(userUUId: string): Promise<LessonAttributes[]> {
    const { data } = await axios.get<Response<LessonAttributes>>(
      baseURL + "/studentlessons?UserUUId=" + userUUId
    );

    return data.data;
  }

  async function getQuestions(lessonUUId: string) : Promise<QuestionAttributes[]> {
    const { data } = await axios.get<Response<QuestionAttributes>>(baseURL  + "/questions?LessonUUId=" + lessonUUId)
    return data.data;
  }

  async function getAnswers(questionUUId: string): Promise<AnswerAttributes[]> {
    const { data } = await axios.get<Response<AnswerAttributes>>(
      baseURL + "/answers?QuestionUUId=" + questionUUId
    );

    return data.data;
  }

  async function removeNotation(notation: BaseNotation) {
    axios.delete(
      `${notation.boardType}${notation.notationType}s/${notation.uuid}`
    ); // e.g lessonsymbols/1)
  }

  async function getNotations<T extends BaseNotation>(
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


