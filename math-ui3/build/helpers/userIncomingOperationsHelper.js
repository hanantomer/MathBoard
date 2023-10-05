import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "common/enum";
import useFeathersHelper from "./feathersHelper";
const notationStore = useNotationStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const feathersHelper = useFeathersHelper();
export default function userIncomingOperations() {
    async function syncIncomingUserOperations() {
        const feathersClient = feathersHelper.init();
        // this will route events from feathers
        await feathersClient.service("authentication").create({
            LessonUUId: this.getCurrentLesson().uuid,
        });
        feathersClient
            .service("notationSync")
            .on("created", (notation) => {
            if (notation.uuid !== userStore.getCurrentUser().uuid &&
                notationStore.getParent().value.type == BoardType.LESSON) {
                notationStore.getNotations().value.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("notationSync")
            .on("updated", (notation) => {
            if (notation.user.uuid !== userStore.getCurrentUser().uuid &&
                this.getParent().boardType === "lesson") {
                notationStore.getNotations().value.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("notationSync")
            .on("removed", (notation) => {
            if (notation.user.uuid !== userStore.getCurrentUser().uuid &&
                this.getParent().boardType === "lesson") {
                notationStore.getNotations().value.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("activeCell")
            .on("updated", (activeCell) => {
            if (
            //activeCell.UserId !== this.getUser().id &&
            notationStore.getParent().value.type === BoardType.LESSON) {
                notationStore.setActiveCell(activeCell);
            }
        });
        if (!this.isTeacher()) {
            feathersClient
                .service("authorization")
                .on("updated", (user) => {
                if (user.uuid === userStore.getCurrentUser().uuid //&&
                //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
                ) {
                    userStore.setAuthorized(user.authorized);
                }
            });
        }
        if (this.isTeacher()) {
            feathersClient
                .service("heartbeat")
                .on("updated", (user) => {
                if (user.uuid != userStore.getCurrentUser().uuid &&
                    notationStore.getParent().value.type === BoardType.LESSON) {
                    studentStore.setStudentHeartbeat(user.uuid);
                }
            });
        }
    }
    return { syncIncomingUserOperations };
}
//# sourceMappingURL=userIncomingOperationsHelper.js.map