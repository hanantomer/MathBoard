import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStudentStore } from "../store/pinia/studentStore";
import { useUserStore } from "../store/pinia/userStore";
import { COLLABORATION } from "../constants/helpCopy";

export function useStudentJoinNotifications() {
  const route = useRoute();
  const studentStore = useStudentStore();
  const userStore = useUserStore();
  const snackbar = ref(false);
  const snackbarText = ref("");
  let knownIds = new Set<string>();

  watch(
    () => studentStore.getStudents(),
    (students) => {
      if (route.name !== "lesson" || !userStore.isTeacher()) {
        knownIds = new Set(students.map((s) => s.uuid));
        return;
      }
      for (const student of students) {
        if (knownIds.has(student.uuid)) {
          continue;
        }
        const name =
          `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
        snackbarText.value = name
          ? COLLABORATION.studentJoinedToast(name)
          : COLLABORATION.studentJoinedToastGeneric;
        snackbar.value = true;
      }
      knownIds = new Set(students.map((s) => s.uuid));
    },
    { deep: true },
  );

  watch(
    () => route.name,
    () => {
      knownIds = new Set(studentStore.getStudents().map((s) => s.uuid));
    },
  );

  return { snackbar, snackbarText };
}
