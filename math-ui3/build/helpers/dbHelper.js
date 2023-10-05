import { BoardType, NotationType } from "common/enum";
import axios from "axios";
import axiosHelper from "./axiosHelper";
const { baseURL } = axiosHelper();
export default function useDbHelper() {
    function getParentFieldName(boardType) {
        const parentFieldName = boardType == BoardType.LESSON
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
    async function authGoogleUser() {
        const { data } = await axios.get(baseURL + "/users");
        return data;
    }
    // token is taken from cookie. see interceptor at the top of the page
    async function authLocalUserByToken() {
        const res = await axios.get(baseURL + "/users");
        return res?.data;
    }
    async function authLocalUserByPassword(email, password) {
        const res = await axios.get(baseURL + `/users?email=${email}&password=${password}`);
        return res?.data;
    }
    async function registerUser(user) {
        const res = await axios.post(baseURL + "/users", user);
        return res?.data;
    }
    async function addLessonToSharedLessons(lessonUUId, userUUId) {
        // check if exists
        const studentLesson = await axios.get(`/studentlessons?LessonUUId=${lessonUUId}&UserUUId=${userUUId}`);
        if (studentLesson.data.length)
            return;
        await axios.post(baseURL + "/studentlessons", {
            LessonUUId: lessonUUId,
            UserUUId: userUUId,
        });
    }
    async function addLesson(lesson) {
        const savedLesson = await axios.post(baseURL + "/lessons", lesson);
        return savedLesson.data;
    }
    async function addQuestion(question) {
        const { data } = await axios.post(baseURL + "/questions", question);
        return data;
    }
    async function addAnswer(answer) {
        const { data } = await axios.post(baseURL + "/answers", answer);
        return data;
    }
    async function addNotation(notation) {
        const res = await axios.post(baseURL +
            `/${BoardType[notation.boardType].toLowerCase()}${NotationType[notation.notationType].toLowerCase()}s/`, notation);
        return res.data;
    }
    async function updateNotation(notation) {
        const { data } = await axios.put(baseURL +
            `/${BoardType[notation.boardType].toLowerCase()}${NotationType[notation.notationType].toLowerCase()}s/${notation.uuid}`, notation);
        return data;
    }
    async function getLesson(LessonUUId) {
        const { data } = await axios.get(baseURL + "/lessons?uuid=" + LessonUUId);
        return data;
    }
    async function getQuestion(questionUUId) {
        const { data } = await axios.get(baseURL + "/questions?uuid=" + questionUUId);
        return data;
    }
    async function getAnswer(answerUUId) {
        const { data } = await axios.get(baseURL + "/answers?uuid=" + answerUUId);
        return data;
    }
    async function getTeacherLessons(userUUId) {
        const { data } = await axios.get(baseURL + "/lessons?userUUId=" + userUUId);
        return data;
    }
    async function getStudentLessons(userUUId) {
        const { data } = await axios.get(baseURL + "/studentlessons?userUUId=" + userUUId);
        return data;
    }
    async function getQuestions(lessonUUId) {
        const { data } = await axios.get(baseURL + "/questions?LessonUUId=" + lessonUUId);
        return data;
    }
    async function getAnswers(questionUUId) {
        const { data } = await axios.get(baseURL + "/answers?QuestionUUId=" + questionUUId);
        return data;
    }
    async function removeNotation(notation) {
        axios.delete(`${notation.boardType}${notation.notationType}s/${notation.uuid}`); // e.g lessonsymbols/1)
    }
    async function getNotations(notationType, boardType, parentUUId) {
        // e.g lessonsymbols?LessonUUId=1
        //const parentFieldName = getParentFieldName(boardType);
        const uri = baseURL + `/${BoardType[boardType]
            .toLowerCase()}${NotationType[notationType]
            .toLowerCase()}s?uuid=${parentUUId}`;
        const { data } = (await axios.get(uri));
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
//# sourceMappingURL=dbHelper.js.map