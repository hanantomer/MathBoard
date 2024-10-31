import { BoardType, NotationType } from "common/unions";
import {
  HorizontalLineNotationAttributes,
  NotationAttributes,
  NotationCreationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  CurveNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";
import {
  UserAttributes,
  UserCreationAttributes,
  StudentLessonCreationAttributes,
  StudentLessonAttributes,
} from "common/userTypes";
import { LessonAttributes, LessonCreationAttributes } from "common/lessonTypes";
import {
  QuestionAttributes,
  QuestionCreationAttributes,
} from "common/questionTypes";
import { AnswerAttributes, AnswerCreationAttributes } from "common/answerTypes";
import axios from "axios";
import axiosHelper from "./axiosHelper";
const { baseURL } = axiosHelper();

export default function useDbHelper() {
  const updateCoordinatesInterval = 2000; // while moving selection by arrow, miliseconds to wait before sync
  let lastUpdateCoordinatesTime: number | null = null;
  let updateCoordinatesHandle: number | null = null;

  function getParentFieldName(boardType: BoardType): string | null {
    const parentFieldName =
      boardType == "LESSON"
        ? "lessonUUId"
        : boardType == "QUESTION"
        ? "QuestionUUId"
        : boardType == "ANSWER"
        ? "AnswerUUId"
        : null;

    if (boardType == null) {
      throw new Error("Invalid boardType:" + boardType);
    }

    return parentFieldName;
  }

  async function authGoogleUser(): Promise<UserAttributes> {
    const { data } = await axios.get<UserAttributes>(baseURL + "/users");
    return data;
  }
  // token is taken from cookie. see interceptor in axiosHelper
  async function authLocalUserByToken(): Promise<UserAttributes | undefined> {
    const res = await axios.get<UserAttributes>(baseURL + "/auth");
    return res?.data;
  }

  async function authLocalUserByPassword(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    const res = await axios.post<UserAttributes>(baseURL + `/auth`, {
      email: email,
      password: password,
    });
    return res?.data;
  }

  async function registerUser(
    user: UserCreationAttributes,
  ): Promise<UserAttributes> {
    const res = await axios.post<UserAttributes>(baseURL + "/users", user);
    return res?.data;
  }

  async function addLessonToSharedLessons(
    studentLesson: StudentLessonCreationAttributes,
  ) {
    // check if exists
    const existingStudentLesson = await axios.get(
      baseURL +
        `/studentlessons?lessonUUId=${studentLesson.lesson.uuid}&userUUId=${studentLesson.user.uuid}`,
    );

    if (existingStudentLesson.data) return;

    return await axios.post<StudentLessonAttributes>(
      baseURL + "/studentlessons",
      studentLesson,
    );
  }

  async function addLesson(
    lesson: LessonCreationAttributes,
  ): Promise<LessonAttributes> {
    const newLesson = await axios.post<LessonAttributes>(
      baseURL + "/lessons",
      lesson,
    );
    return newLesson.data;
  }

  async function addQuestion(
    question: QuestionCreationAttributes,
  ): Promise<QuestionAttributes> {
    const newQuestion = await axios.post<QuestionAttributes>(
      baseURL + "/questions",
      question,
    );
    return newQuestion.data;
  }

  async function addAnswer(
    answer: AnswerCreationAttributes,
  ): Promise<AnswerAttributes> {
    const { data } = await axios.post<AnswerAttributes>(
      baseURL + "/answers",
      answer,
    );
    return data;
  }

  async function addNotation(
    notation: NotationCreationAttributes,
  ): Promise<NotationAttributes> {
    const res = await axios.post<NotationAttributes>(
      baseURL +
        `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s/`,
      notation,
    );
    return res.data;
  }

  // change mechanism to either update or create if moved with ctrl
  async function saveMovedNotations(notations: NotationAttributes[]) {
    const currentTime = Date.now();
    if (
      lastUpdateCoordinatesTime == null ||
      lastUpdateCoordinatesTime - currentTime > updateCoordinatesInterval
    ) {
      if (updateCoordinatesHandle) window.clearTimeout(updateCoordinatesHandle);

      updateCoordinatesHandle = window.setTimeout(
        saveMovedNotationsDelayed,
        updateCoordinatesInterval,
        notations,
      );
    }
    lastUpdateCoordinatesTime = Date.now();
  }

  async function saveMovedNotationsDelayed(notations: NotationAttributes[]) {
    notations.forEach(async (notation) => {
      const attributes = getNotationCoordinates(notation);

      lastUpdateCoordinatesTime = null;

      if (!attributes) return;

      if (
        notation.uuid.indexOf("_") ===
        0 /*see cloneSelectedNotations in notationStore*/
      ) {
        // create new
        const { uuid, ...newNotation } = notation;

        if ((newNotation as any).lesson) {
          (newNotation as any).parentUUId = (newNotation as any).lesson.uuid;
          delete (newNotation as any).lesson;
        }

        if ((newNotation as any).question) {
          (newNotation as any).parentUUId = (newNotation as any).question.uuid;
          delete (newNotation as any).question;
        }

        if ((newNotation as any).answer) {
          (newNotation as any).parentUUId = (newNotation as any).answer.uuid;
          delete (newNotation as any).lesson;
        }

        return await axios.post<NotationCreationAttributes>(
          baseURL +
            `/${newNotation.boardType.toLowerCase()}${newNotation.notationType.toLowerCase()}s`,
          newNotation,
        );
      }

      return await axios.put<NotationAttributes>(
        baseURL +
          `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
        { uuid: notation.uuid, ...attributes },
      );
    });
  }

  function getNotationCoordinates(notation: any) {
    const cooerdinates =
      // point
      "col" in notation
        ? {
            col: (notation as any)["col"],
            row: (notation as any)["row"],
          }
        : // line
        "fromCol" in notation && "row" in notation
        ? {
            fromCol: (notation as any)["fromCol"],
            toCol: (notation as any)["toCol"],
            row: (notation as any)["row"],
          }
        : // rect
        "fromRow" in notation && "fromCol" in notation
        ? {
            fromCol: (notation as any)["fromCol"],
            toCol: (notation as any)["toCol"],
            fromRow: (notation as any)["fromRow"],
            toRow: (notation as any)["toRow"],
          }
        : null;

    return cooerdinates;
  }

  /// TODO: check if needed
  async function updateNotationValue(notation: NotationAttributes) {
    if ("value" in notation === false) return null;
    await axios.put<NotationAttributes>(
      baseURL +
        `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
      {
        uuid: notation.uuid,
        value: (notation as any)["value"],
      },
    );
  }

  async function updateNotation(notation: NotationAttributes) {
    await axios.put<NotationAttributes>(
      baseURL +
        `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
      notation,
    );
  }

  async function updateHorizontalLineNotationAttributes(
    lineNotation: HorizontalLineNotationAttributes,
  ) {
    return axios.put(
      baseURL +
        `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
      {
        uuid: lineNotation.uuid,
        x1: lineNotation.x1,
        x2: lineNotation.x2,
        y: lineNotation.y,
      },
    );
  }

  async function updateSqrtNotationAttributes(
    sqrtNotation: SqrtNotationAttributes,
  ) {
    return axios.put(
      baseURL +
        `/${sqrtNotation.boardType.toLowerCase()}${sqrtNotation.notationType.toLowerCase()}s`,
      {
        uuid: sqrtNotation.uuid,
        fromCol: sqrtNotation.fromCol,
        toCol: sqrtNotation.toCol,
        row: sqrtNotation.row,
      },
    );
  }

  async function updateVerticalLineNotationAttributes(
    lineNotation: VerticalLineNotationAttributes,
  ) {
    return axios.put(
      baseURL +
        `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
      {
        uuid: lineNotation.uuid,
        x: lineNotation.x,
        y1: lineNotation.y1,
        y2: lineNotation.y2,
      },
    );
  }

  async function updateSlopeLineNotationAttributes(
    lineNotation: SlopeLineNotationAttributes,
  ) {
    return axios.put(
      baseURL +
        `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
      {
        uuid: lineNotation.uuid,
        x1: lineNotation.x1,
        x2: lineNotation.x2,
        y1: lineNotation.y1,
        y2: lineNotation.y2,
      },
    );
  }

  async function updateCurveNotationAttributes(curve: CurveNotationAttributes) {
    return axios.put(
      baseURL +
        `/${curve.boardType.toLowerCase()}${curve.notationType.toLowerCase()}s`,
      {
        uuid: curve.uuid,
        p1x: curve.p1x,
        p2x: curve.p2x,
        p1y: curve.p1y,
        p2y: curve.p2y,
        cpx: curve.cpx,
        cpy: curve.cpy,
      },
    );
  }

  async function getLesson(lessonUUId: string): Promise<LessonAttributes> {
    const { data } = await axios.get<LessonAttributes>(
      baseURL + "/lessons?lessonUUId=" + lessonUUId,
    );
    return data;
  }

  async function getUser(userUUId: string): Promise<UserAttributes> {
    const { data } = await axios.get<UserAttributes>(
      baseURL + "/students?uuid=" + userUUId,
    );
    return data;
  }

  async function getQuestion(
    questionUUId: string,
  ): Promise<QuestionAttributes> {
    const { data } = await axios.get<QuestionAttributes>(
      baseURL + "/questions?uuid=" + questionUUId,
    );
    return data;
  }

  async function getAnswer(answerUUId: string): Promise<AnswerAttributes> {
    const { data } = await axios.get<AnswerAttributes>(
      baseURL + "/answers?uuid=" + answerUUId,
    );
    return data;
  }

  async function getTeacherLessons(
    userUUId: string,
  ): Promise<LessonAttributes[]> {
    const { data } = await axios.get<LessonAttributes[]>(
      baseURL + "/lessons?userUUId=" + userUUId,
    );

    return data;
  }

  async function getStudentLessons(
    userUUId: string,
  ): Promise<StudentLessonAttributes[]> {
    const { data } = await axios.get<StudentLessonAttributes[]>(
      baseURL + "/studentlessons?userUUId=" + userUUId,
    );

    return data;
  }

  async function getQuestions(
    lessonUUId: string,
  ): Promise<QuestionAttributes[]> {
    const { data } = await axios.get<QuestionAttributes[]>(
      baseURL + "/questions?lessonUUId=" + lessonUUId,
    );
    return data;
  }

  async function getAnswers(questionUUId: string): Promise<AnswerAttributes[]> {
    const { data } = await axios.get<AnswerAttributes[]>(
      baseURL + "/answers?questionUUId=" + questionUUId,
    );

    return data;
  }

  async function removeNotation(notation: NotationAttributes) {
    return axios.delete(
      baseURL +
        `/${notation.boardType.toString().toLowerCase()}${notation.notationType
          .toString()
          .toLowerCase()}s`,
      { data: notation },
    ); // e.g lessonsymbols/1)
  }

  async function getNotations<T extends NotationAttributes>(
    notationType: NotationType,
    boardType: string,
    parentUUId: string,
  ): Promise<T[]> {
    const uri =
      baseURL +
      `/${boardType.toString().toLowerCase()}${notationType
        .toString()
        .toLowerCase()}s?uuid=${parentUUId}`;
    const { data } = await axios.get<T[]>(uri);
    return data;
  }

  return {
    getNotations,
    getAnswers,
    getQuestions,
    getStudentLessons,
    getTeacherLessons,
    getUser,
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
    updateHorizontalLineNotationAttributes,
    updateSqrtNotationAttributes,
    updateVerticalLineNotationAttributes,
    updateSlopeLineNotationAttributes,
    updateCurveNotationAttributes,
    updateNotationValue,
    updateNotation,
    saveMovedNotations,
    removeNotation,
  };
}
