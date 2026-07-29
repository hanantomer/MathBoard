import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { PRACTICE_BLANK_UUID } from "../../helpers/practiceBoardAdapter";

const APP_NAME = "Math Whiteboard";

export type BoardContextLevel =
  | "lesson"
  | "question"
  | "answer"
  | "practice"
  | "practice-list"
  | "lessons-list"
  | "questions-list"
  | "answers-list"
  | "none";

export type BoardBreadcrumb = {
  text: string;
  to?: { name: string; params?: Record<string, string> };
};

export const useBoardContextStore = defineStore("boardContext", () => {
  const level = ref<BoardContextLevel>("none");
  const chipLabel = ref("");
  const breadcrumbs = ref<BoardBreadcrumb[]>([]);

  const chipColor = computed(() => {
    switch (level.value) {
      case "lesson":
        return "orange";
      case "question":
        return "teal-lighten-1";
      case "answer":
        return "amber-lighten-1";
      case "practice":
        return "light-green-lighten-1";
      case "practice-list":
      case "lessons-list":
      case "questions-list":
      case "answers-list":
        return "blue-grey-lighten-2";
      default:
        return "grey";
    }
  });

  const documentTitle = computed(() => {
    if (level.value === "none") {
      return "";
    }
    const trail = breadcrumbs.value.map((b) => b.text).filter(Boolean);
    const main = trail.length ? trail.join(" › ") : chipLabel.value;
    return `[${chipLabel.value}] ${main} | ${APP_NAME}`;
  });

  function clear() {
    level.value = "none";
    chipLabel.value = "";
    breadcrumbs.value = [];
  }

  function setLessonsList() {
    level.value = "lessons-list";
    chipLabel.value = "Lessons";
    breadcrumbs.value = [{ text: "Select or create a lesson" }];
  }

  function setQuestionsList() {
    level.value = "questions-list";
    chipLabel.value = "Questions";
    breadcrumbs.value = [{ text: "Select a lesson and question" }];
  }

  function setAnswersList() {
    level.value = "answers-list";
    chipLabel.value = "Answers";
    breadcrumbs.value = [{ text: "Review student submissions" }];
  }

  function setPracticeList() {
    level.value = "practice-list";
    chipLabel.value = "Practice";
    breadcrumbs.value = [{ text: "Pick a subject and question" }];
  }

  function setPracticeSession(
    subject: string,
    questionName: string,
    questionUUId: string,
  ) {
    level.value = "practice";
    chipLabel.value = "Practice";
    breadcrumbs.value = [
      {
        text: subject,
        to: { name: "practice" },
      },
      {
        text: questionName,
        to:
          questionUUId === PRACTICE_BLANK_UUID
            ? { name: "practiceBlank" }
            : { name: "practiceQuestion", params: { questionUUId } },
      },
    ];
  }

  function setPracticeBlankSession() {
    setPracticeSession("Blank sheet", "Paste or upload image", PRACTICE_BLANK_UUID);
  }

  function setPracticeQuestionEditor(
    subject: string,
    questionName: string,
    questionUUId: string,
  ) {
    level.value = "question";
    chipLabel.value = "Practice question";
    breadcrumbs.value = [
      {
        text: subject,
        to: { name: "practice" },
      },
      {
        text: questionName,
        to: { name: "question", params: { questionUUId } },
      },
    ];
  }

  function setLesson(lessonName: string, lessonUUId: string) {
    level.value = "lesson";
    chipLabel.value = "Lesson";
    breadcrumbs.value = [
      {
        text: lessonName,
        to: { name: "lesson", params: { lessonUUId } },
      },
    ];
  }

  function setQuestion(
    lessonName: string,
    lessonUUId: string,
    questionName: string,
    questionUUId: string,
  ) {
    level.value = "question";
    chipLabel.value = "Question";
    breadcrumbs.value = [
      {
        text: lessonName,
        to: { name: "lesson", params: { lessonUUId } },
      },
      {
        text: questionName,
        to: { name: "question", params: { questionUUId } },
      },
    ];
  }

  function setAnswerForTeacher(
    lessonName: string,
    lessonUUId: string,
    questionName: string,
    questionUUId: string,
    studentLabel: string,
    answerUUId: string,
  ) {
    level.value = "answer";
    chipLabel.value = "Answer";
    breadcrumbs.value = [
      {
        text: lessonName,
        to: { name: "lesson", params: { lessonUUId } },
      },
      {
        text: questionName,
        to: { name: "question", params: { questionUUId } },
      },
      {
        text: studentLabel,
        to: { name: "answer", params: { answerUUId } },
      },
    ];
  }

  function setAnswerForStudent(
    lessonName: string,
    lessonUUId: string,
    questionName: string,
    questionUUId: string,
    answerUUId: string,
  ) {
    level.value = "answer";
    chipLabel.value = "Answer";
    breadcrumbs.value = [
      {
        text: lessonName,
        to: { name: "lesson", params: { lessonUUId } },
      },
      {
        text: questionName,
        to: { name: "question", params: { questionUUId } },
      },
      {
        text: "Your submission",
        to: { name: "answer", params: { answerUUId } },
      },
    ];
  }

  return {
    level,
    chipLabel,
    breadcrumbs,
    chipColor,
    documentTitle,
    clear,
    setLessonsList,
    setQuestionsList,
    setAnswersList,
    setPracticeList,
    setPracticeSession,
    setPracticeBlankSession,
    setPracticeQuestionEditor,
    setLesson,
    setQuestion,
    setAnswerForTeacher,
    setAnswerForStudent,
  };
});
