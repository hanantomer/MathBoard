import { NotationType } from "common/unions";
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
import axios, { AxiosError } from "axios";
import axiosHelper from "./axiosHelper";
const { baseURL } = axiosHelper();

export default function useApiHelper() {
  const updateCoordinatesInterval = 100; // while moving selection by arrow, miliseconds to wait before sync
  let lastUpdateCoordinatesTime: number | null = null;
  let updateCoordinatesHandle: number | null = null;

  async function log(message: string) {
    try {
      await axios.post(baseURL + "/log", { level: "error", message: message });
    } catch (error) {
      throw new Error(`Failed to log message: ${(error as AxiosError).message}`);
    }
  }

  async function authGoogleUser(): Promise<UserAttributes> {
    try {
      const { data } = await axios.get<UserAttributes>(baseURL + "/users");
      return data;
    } catch (error) {
      throw new Error(`Failed to authenticate Google user: ${(error as AxiosError).message}`);
    }
  }

  async function authLocalUserByToken(): Promise<UserAttributes | undefined> {
    try {
      const res = await axios.get<UserAttributes>(baseURL + "/auth");
      return res?.data;
    } catch (error) {
      throw new Error(`Failed to authenticate user by token: ${(error as AxiosError).message}`);
    }
  }

  async function authLocalUserByPassword(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    try {
      const res = await axios.post<UserAttributes>(baseURL + `/auth`, {
        email: email,
        password: password,
      });
      return res?.data;
    } catch (error) {
      throw new Error(`Failed to authenticate user ${email}: ${(error as AxiosError).message}`);
    }
  }

  async function registerUser(
    user: UserCreationAttributes,
  ): Promise<UserAttributes> {
    try {
      const res = await axios.post<UserAttributes>(baseURL + "/users", user);
      return res?.data;
    } catch (error) {
      throw new Error(`Failed to register user: ${(error as AxiosError).message}`);
    }
  }

  async function addLessonToSharedLessons(
    studentLesson: StudentLessonCreationAttributes,
  ) {
    try {
      const existingStudentLesson = await axios.get(
        baseURL +
          `/studentlessons?lessonUUId=${studentLesson.lesson.uuid}&userUUId=${studentLesson.user.uuid}`,
      );

      if (existingStudentLesson.data) return;

      return await axios.post<StudentLessonAttributes>(
        baseURL + "/studentlessons",
        studentLesson,
      );
    } catch (error) {
      throw new Error(`Failed to add lesson to shared lessons: ${(error as AxiosError).message}`);
    }
  }

  async function addLesson(
    lesson: LessonCreationAttributes,
  ): Promise<LessonAttributes> {
    try {
      const newLesson = await axios.post<LessonAttributes>(
        baseURL + "/lessons",
        lesson,
      );
      return newLesson.data;
    } catch (error) {
      throw new Error(`Failed to add lesson: ${(error as AxiosError).message}`);
    }
  }

  async function addQuestion(
    question: QuestionCreationAttributes,
  ): Promise<QuestionAttributes> {
    try {
      const newQuestion = await axios.post<QuestionAttributes>(
        baseURL + "/questions",
        question,
      );
      return newQuestion.data;
    } catch (error) {
      throw new Error(`Failed to add question: ${(error as AxiosError).message}`);
    }
  }

  async function addAnswer(
    answer: AnswerCreationAttributes,
  ): Promise<AnswerAttributes> {
    try {
      const { data } = await axios.post<AnswerAttributes>(
        baseURL + "/answers",
        answer,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to add answer: ${(error as AxiosError).message}`);
    }
  }

  async function addNotation(
    notation: NotationCreationAttributes,
  ): Promise<NotationAttributes> {
    try {
      const res = await axios.post<NotationAttributes>(
        baseURL +
          `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s/`,
        notation,
      );
      return res.data;
    } catch (error) {
      throw new Error(`Failed to add notation: ${(error as AxiosError).message}`);
    }
  }

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
        try {
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
        } catch (error) {
          throw new Error(`Failed to save moved notations: ${(error as AxiosError).message}`);
        }
      }

      try {
        return await axios.put<NotationAttributes>(
          baseURL +
            `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
          { uuid: notation.uuid, ...attributes },
        );
      } catch (error) {
        throw new Error(`Failed to save moved notations: ${(error as AxiosError).message}`);
      }
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
        : // horizontal line
        "p1x" in notation && "p2x" in notation && "py" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            py: (notation as any)["py"],
          }
        : // vertical line
        "px" in notation && "p1y" in notation && "p2y" in notation
        ? {
            px: (notation as any)["px"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
          }
        : // sloped line
        "p1x" in notation &&
          "p2x" in notation &&
          "p1y" in notation &&
          "p2y" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
          }
        : // sloped line
        "p1x" in notation &&
          "p2x" in notation &&
          "p1y" in notation &&
          "p2y" in notation &&
          "cpx" in notation &&
          "cpy" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
            cpx: (notation as any)["cpx"],
            cpy: (notation as any)["cpy"],
          }
        : null;

    return cooerdinates;
  }

  async function updateNotationValue(notation: NotationAttributes) {
    if ("value" in notation === false) return null;
    try {
      await axios.put<NotationAttributes>(
        baseURL +
          `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
        {
          uuid: notation.uuid,
          value: (notation as any)["value"],
        },
      );
    } catch (error) {
      throw new Error(`Failed to update notation value: ${(error as AxiosError).message}`);
    }
  }

  async function updateNotation(notation: NotationAttributes) {
    try {
      await axios.put<NotationAttributes>(
        baseURL +
          `/${notation.boardType.toLowerCase()}${notation.notationType.toLowerCase()}s`,
        notation,
      );
    } catch (error) {
      throw new Error(`Failed to update notation: ${(error as AxiosError).message}`);
    }
  }

  async function updateHorizontalLineNotationAttributes(
    lineNotation: HorizontalLineNotationAttributes,
  ) {
    try {
      return axios.put(
        baseURL +
          `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
        {
          uuid: lineNotation.uuid,
          p1x: lineNotation.p1x,
          p2x: lineNotation.p2x,
          py: lineNotation.py,
        },
      );
    } catch (error) {
      throw new Error(`Failed to update horizontal line notation attributes: ${(error as AxiosError).message}`);
    }
  }

  async function updateSqrtNotationAttributes(
    sqrtNotation: SqrtNotationAttributes,
  ) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to update sqrt notation attributes: ${(error as AxiosError).message}`);
    }
  }

  async function updateVerticalLineNotationAttributes(
    lineNotation: VerticalLineNotationAttributes,
  ) {
    try {
      return axios.put(
        baseURL +
          `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
        {
          uuid: lineNotation.uuid,
          px: lineNotation.px,
          p1y: lineNotation.p1y,
          p2y: lineNotation.p2y,
        },
      );
    } catch (error) {
      throw new Error(`Failed to update vertical line notation attributes: ${(error as AxiosError).message}`);
    }
  }

  async function updateSlopeLineNotationAttributes(
    lineNotation: SlopeLineNotationAttributes,
  ) {
    try {
      return axios.put(
        baseURL +
          `/${lineNotation.boardType.toLowerCase()}${lineNotation.notationType.toLowerCase()}s`,
        {
          uuid: lineNotation.uuid,
          p1x: lineNotation.p1x,
          p2x: lineNotation.p2x,
          p1y: lineNotation.p1y,
          p2y: lineNotation.p2y,
        },
      );
    } catch (error) {
      throw new Error(`Failed to update slope line notation attributes: ${(error as AxiosError).message}`);
    }
  }

  async function updateCurveNotationAttributes(curve: CurveNotationAttributes) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to update curve notation attributes: ${(error as AxiosError).message}`);
    }
  }

  async function getLesson(lessonUUId: string): Promise<LessonAttributes> {
    try {
      const { data } = await axios.get<LessonAttributes>(
        baseURL + "/lessons?lessonUUId=" + lessonUUId,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to get lesson ${lessonUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getUser(userUUId: string): Promise<UserAttributes> {
    try {
      const { data } = await axios.get<UserAttributes>(
        baseURL + "/students?uuid=" + userUUId,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to get user ${userUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getQuestion(
    questionUUId: string,
  ): Promise<QuestionAttributes> {
    try {
      const { data } = await axios.get<QuestionAttributes>(
        baseURL + "/questions?uuid=" + questionUUId,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to get question ${questionUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getAnswer(answerUUId: string): Promise<AnswerAttributes> {
    try {
      const { data } = await axios.get<AnswerAttributes>(
        baseURL + "/answers?uuid=" + answerUUId,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to get answer ${answerUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getTeacherLessons(
    userUUId: string,
  ): Promise<LessonAttributes[]> {
    try {
      const { data } = await axios.get<LessonAttributes[]>(
        baseURL + "/lessons?userUUId=" + userUUId,
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to get teacher lessons for user ${userUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getStudentLessons(
    userUUId: string,
  ): Promise<StudentLessonAttributes[]> {
    try {
      const { data } = await axios.get<StudentLessonAttributes[]>(
        baseURL + "/studentlessons?userUUId=" + userUUId,
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to get student lessons for user ${userUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getQuestions(
    lessonUUId: string,
  ): Promise<QuestionAttributes[]> {
    try {
      const { data } = await axios.get<QuestionAttributes[]>(
        baseURL + "/questions?lessonUUId=" + lessonUUId,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to get questions for lesson ${lessonUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function getAnswers(questionUUId: string): Promise<AnswerAttributes[]> {
    try {
      const { data } = await axios.get<AnswerAttributes[]>(
        baseURL + "/answers?questionUUId=" + questionUUId,
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to get answers for question ${questionUUId}: ${(error as AxiosError).message}`);
    }
  }

  async function removeNotation(notation: NotationAttributes) {
    try {
      return axios.delete(
        baseURL +
          `/${notation.boardType.toString().toLowerCase()}${notation.notationType
            .toString()
            .toLowerCase()}s`,
        { data: notation },
      );
    } catch (error) {
      throw new Error(`Failed to remove notation: ${(error as AxiosError).message}`);
    }
  }

  async function getNotations<T extends NotationAttributes>(
    notationType: NotationType,
    boardType: string,
    parentUUId: string,
  ): Promise<T[]> {
    try {
      const uri =
        baseURL +
        `/${boardType.toString().toLowerCase()}${notationType
          .toString()
          .toLowerCase()}s?uuid=${parentUUId}`;
      const { data } = await axios.get<T[]>(uri);
      return data;
    } catch (error) {
      throw new Error(`Failed to get notations for ${boardType} ${notationType}: ${(error as AxiosError).message}`);
    }
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
    log
  };
}
