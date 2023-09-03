import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
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
            if (notation.uuid !== userStore.currentUser.uuid &&
                notationStore.parent.type == 0 /* BoardType.LESSON */) {
                notationStore.notations.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("notationSync")
            .on("updated", (notation) => {
            if (notation.user.uuid !== userStore.currentUser.uuid &&
                this.getParent().boardType === "lesson") {
                notationStore.notations.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("notationSync")
            .on("removed", (notation) => {
            if (notation.user.uuid !== userStore.currentUser.uuid &&
                this.getParent().boardType === "lesson") {
                notationStore.notations.set(notation.uuid, notation);
            }
        });
        feathersClient
            .service("activeCell")
            .on("updated", (activeCell) => {
            if (
            //activeCell.UserId !== this.getUser().id &&
            notationStore.parent.type === 0 /* BoardType.LESSON */) {
                notationStore.setActiveCell(activeCell);
            }
        });
        if (!this.isTeacher()) {
            feathersClient
                .service("authorization")
                .on("updated", (user) => {
                if (user.uuid === userStore.currentUser.uuid //&&
                //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
                ) {
                    userStore.setUserWriteAuthorization(user.authorized);
                }
            });
        }
        if (this.isTeacher()) {
            feathersClient
                .service("heartbeat")
                .on("updated", (user) => {
                if (user.uuid != userStore.currentUser.uuid &&
                    notationStore.parent.type === 0 /* BoardType.LESSON */) {
                    studentStore.setStudentHeartbeat(user.uuid);
                }
            });
        }
    }
    return { syncIncomingUserOperations };
}
//# sourceMappingURL=userIncomingOperationsHelper.js.map