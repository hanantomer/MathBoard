import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findStudentById: function (state, id) {
    return state.students.find((s) => s.userId === id);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    students: [],
  },
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
    async createAccessLink(context, accessLink) {
      return dbSyncMixin.methods.createAccessLink(
        accessLink.ExerciseId,
        accessLink.link
      );
    },
    toggeleStudentAuthorization(context, studentId) {
      context.commit("toggelStudentAuthorization", studentId);
    },
    updateStudentHeartbeat(context, student) {
      context.commit("setStudent", student);
    },
  },
};
