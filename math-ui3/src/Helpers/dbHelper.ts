import { BoardType, NotationType } from "common/unions";
import axios from "axios";
import axiosHelper from "./axiosHelper";
import { NotationAttributes, NotationCreationAttributes } from "common/baseTypes";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { LessonAttributes, LessonCreationAttributes } from "common/lessonTypes";
import { QuestionAttributes, QuestionCreateAttributes } from "common/questionTypes";
import { AnswerAttributes, AnswerCreateAttributes } from "common/answerTypes";
const { baseURL } = axiosHelper();

export default function useDbHelper() {

  function getParentFieldName(boardType: BoardType): string | null {
    const parentFieldName =
      boardType == "LESSON"
        ? "LessonUUId"
        : boardType == "QUESTION"
          ? "QuestionUUId"
          : boardType == "ANSWER"
            ? "AnswerUUId" : null;

    if (boardType == null) {
      throw new Error("Invalid boardType:" + boardType);
    }

    return parentFieldName;
  }

  async function authGoogleUser(): Promise<UserAttributes> {
    const { data } = await axios.get<UserAttributes>(
      baseURL + "/users"
    );
    return data
  }
  // token is taken from cookie. see interceptor at the top of the page
  async function authLocalUserByToken(): Promise<UserAttributes | undefined> {
    const res = await axios.get<UserAttributes>(
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
    user: UserCreationAttributes): Promise<UserAttributes> {
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

    await axios.post(baseURL + "/studentlessons", {
      LessonUUId: lessonUUId,
      UserUUId: userUUId,
    });
  }

  async function addLesson(
    lesson: LessonCreationAttributes
  ): Promise<LessonAttributes> {
    const newLesson = await axios.post<LessonAttributes>(
      baseURL + "/lessons",
      lesson
    );
    return newLesson.data;
  }

  async function addQuestion(question: QuestionCreateAttributes): Promise<QuestionAttributes> {
    const { data } = await axios.post<QuestionAttributes>(
      baseURL + "/questions",
      question
    );
    return data;
  }

  async function addAnswer(answer: AnswerCreateAttributes): Promise<AnswerAttributes> {
    const { data } = await axios.post<AnswerAttributes>(
      baseURL + "/answers",
      answer
    );
    return data;
  }

  async function addNotation(
    notation: NotationCreationAttributes
  ): Promise<NotationAttributes> {
    const res = await axios.post<NotationAttributes>(
      baseURL +
      `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s/`,
      notation
    );
    return res.data;
  }


  async function updateNotation(
    notation: NotationAttributes & {uuid: string}
  ): Promise<NotationAttributes> {
    const { data } = await axios.put<NotationAttributes>(
      baseURL +
        `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s/${notation.uuid}`,
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

  async function removeNotation(
    notation: NotationAttributes
  ) {
    axios.delete(
      `${notation.boardType}${notation.notationType}s/${notation.uuid}`
    ); // e.g lessonsymbols/1)
  }

  async function getNotations<T extends NotationAttributes>(
    notationType: NotationType,
    boardType: string,
    parentUUId: string
  ): Promise<T[]> {
    // e.g lessonsymbols?LessonUUId=1
    //const parentFieldName = getParentFieldName(boardType);
    const uri = baseURL +`/${boardType.toString().toLowerCase()}${notationType.toString().toLowerCase()}s?uuid=${parentUUId}`;
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


