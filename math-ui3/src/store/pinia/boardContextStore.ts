import { defineStore } from "pinia";
import { ref, computed } from "vue";

const APP_NAME = "Math Whiteboard";

export type BoardContextLevel =
  | "lesson"
  | "question"
  | "answer"
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
    setLesson,
    setQuestion,
    setAnswerForTeacher,
    setAnswerForStudent,
  };
});
