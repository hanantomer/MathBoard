import { defineStore } from "pinia";
import User from "../../../../math-db/src/models/user.model";
import { reactive } from "vue";
import dbHelper from "../../Helpers/dbHelper";
const db = dbHelper();

export const useStudentStore = defineStore("studentanswer", () => {

  let students: Map<String, User> = reactive(<Map<String, User>>{});
  let authorizedStudent: User = reactive(<User>{});

  function setAuthorizedStudent(authorizedStudentUUID: string): void {
    this.authorizedStudent = this.students.get(authorizedStudentUUID);
  }

  function setStudentHeartbeat(uuid: string): void {
    let student = students.get(uuid);
    if (student) {
      student.lastHeartbeatTime = new Date();
    }
  }

  return {
    students,
    authorizedStudent,
    setAuthorizedStudent,
    setStudentHeartbeat,
  };
});


/*

/// TODO caller should calculate prev authorized vs current
    //return {
    //  authorizedStudentId: authorizedStudentUUID,
    //  revokedStudentId: prevAuthorizedStudenUUId,
    //};

// context.commit("toggleAuthorization", studentId);

    // let authorizedStudentId = !!helper.findStudentById(
    //   context.state,
    //   studentId
    // ).authorized
    //   ? studentId
    //   : null;

    // let revokedStudentId = null;
    // if (!authorizedStudentId) {
    //   revokedStudentId = studentId;
    // }
    // if (!revokedStudentId && !!prevAuthorizedStudent) {
    //   revokedStudentId = prevAuthorizedStudent.userId;
    // }

    //let prevAuthorizedStudenUUId = this.authorizedStudent?.uuid;



  getters: {
    getStudent: function (state) {
      return (studentId) => {
        return helper.findStudentById(state, studentId);
      };
    },
  },
  mutations: {
    toggleAuthorization(state, studentId) {
      let student = helper.findStudentById(state, studentId);
      state.students
        .filter((s) => s.userId != studentId)
        .forEach((s) => {
          if (!!s.authorized) s.authorized = false;
        });
      student.authorized = student.authorized ? false : true;
    },
    setStudent(state, student) {
      let existingStudent = state.students.find(
        (s) => s.userId === student.userId
      );
      if (!!existingStudent) {
        existingStudent.updateTime = Date.now();
      } else {
        if (!student.imageUrl) {
          student.imageUrl = "https://joeschmoe.io/api/v1/" + student.userId;
        }
        student.updateTime = Date.now();
        state.students.push(student);
      }
    },
  },
  actions: {
    toggleAuthorization(context, studentId) {
      let prevAuthorizedStudent = context.state.students.find(
        (s) => !!s.authorized
      );
      context.commit("toggleAuthorization", studentId);

      let authorizedStudentId = !!helper.findStudentById(
        context.state,
        studentId
      ).authorized
        ? studentId
        : null;

      let revokedStudentId = null;
      if (!authorizedStudentId) {
        revokedStudentId = studentId;
      }
      if (!revokedStudentId && !!prevAuthorizedStudent) {
        revokedStudentId = prevAuthorizedStudent.userId;
      }

      return {
        authorizedStudentId: authorizedStudentId,
        revokedStudentId: revokedStudentId,
      };
    },
    setAuthorization(context, student) {
      context.commit("setStudent", student);
    },
    toggeleStudentAuthorization(context, studentId) {
      context.commit("toggelStudentAuthorization", studentId);
    },
    updateStudentHeartbeat(context, student) {
      context.commit("setStudent", student);
    },
  },
};
*/
