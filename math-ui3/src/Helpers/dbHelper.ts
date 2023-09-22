import { BoardType, NotationType } from "common/enum";
import { capitalize } from "common/utils";
import axios from "axios";
import axiosHelper from "./axiosHelper";
import { BaseNotation } from "common/baseTypes";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { LessonAttributes, LessonCreateAttributes } from "common/lessonTypes";
import { QuestionAttributes, QuestionCreateAttributes } from "common/questionTypes";
import { AnswerAttributes, AnswerCreateAttributes } from "common/answerTypes";
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
    const { data }   = await axios.get<UserAttributes>(
        baseURL + "/users"
      );
      return data
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<UserAttributes | undefined> {
    const res  = await axios.get<UserAttributes>(
        baseURL + "/users"
      );
      return res?.data;
  }

  async function authLocalUserByPassword(
    email: string,
    password: string
  ): Promise<UserAttributes | null> {
    const res = await axios.get<UserAttributes>(
      baseURL + `/users?email=${email}&password=${password}`
    );
    return res?.data;
  }

  async function registerUser(
    user: UserCreationAttributes ): Promise<UserAttributes> {
    const res = await axios.post<UserAttributes>(
      baseURL + "/users",
      user
    );
    return res?.data;
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
    const savedLesson = await axios.post<LessonAttributes>(
      baseURL + "/lessons",
      lesson
    );
    return savedLesson.data;
  }

  async function addQuestion(question: QuestionCreateAttributes): Promise<QuestionAttributes> {
      const { data } = await axios.post<QuestionAttributes>(
        baseURL + "/questions",
        question
      );
      return data;
  }

  async function addAnswer(answer: AnswerCreateAttributes) : Promise<AnswerAttributes> {
      const { data } = await axios.post<AnswerAttributes>(
        baseURL + "/answers",
        answer
      );
      return data;
  }

  async function addNotation(notation: BaseNotation): Promise<BaseNotation> {
    const { data } = await axios.post<BaseNotation>(
      baseURL +
        `/${
          notation.boardType
        }${NotationType[notation.notationType].toLowerCase()}s/`,
      notation
    );
    return data;
  }


  async function updateNotation(notation: BaseNotation): Promise<BaseNotation> {
    const { data } = await axios.put<BaseNotation>(
      baseURL +
        `/${notation.boardType}${NotationType[notation.notationType].toLowerCase()}s/${
          notation.uuid
        }`,
      notation
    );
    return data;
  }

  async function getLesson(LessonUUId: string) : Promise<LessonAttributes> {
    const { data } = await axios.get<LessonAttributes>(baseURL + "/lessons?uuid=" + LessonUUId);
    return data;
  }

  async function getQuestion(questionUUId: string): Promise<QuestionAttributes> {
    const { data } = await axios.get<QuestionAttributes>(
      baseURL + "/questions?uuid=" + questionUUId
    );
    return data;
  }

  async function getAnswer(answerUUId: string) : Promise<AnswerAttributes>{
      const { data } = await axios.get<AnswerAttributes>(baseURL  + "/answers?uuid=" + answerUUId);
      return data;
  }

  async function getTeacherLessons(userUUId: string) : Promise<LessonAttributes[]>{
     const { data } = await axios.get<LessonAttributes[]>(
       baseURL + "/lessons?userUUId=" + userUUId
    );

    return data;
  }

  async function getStudentLessons(userUUId: string): Promise<LessonAttributes[]> {
    const { data } = await axios.get<LessonAttributes[]>(
      baseURL + "/studentlessons?userUUId=" + userUUId
    );

    return data;
  }

  async function getQuestions(lessonUUId: string) : Promise<QuestionAttributes[]> {
    const { data } = await axios.get<QuestionAttributes[]>(baseURL  + "/questions?LessonUUId=" + lessonUUId)
    return data;
  }

  async function getAnswers(questionUUId: string): Promise<AnswerAttributes[]> {
    const { data } = await axios.get<AnswerAttributes[]>(
      baseURL + "/answers?QuestionUUId=" + questionUUId
    );

    return data;
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
    //const parentFieldName = getParentFieldName(boardType);
    const uri = baseURL +`/${BoardType[boardType]
      .toString()
      .toLowerCase()}${notationType
      .toString()
      .toLocaleLowerCase()}s?uuid=${parentUUId}`;
    const { data } = (await axios.get<T[]>(uri));
    return data;
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


