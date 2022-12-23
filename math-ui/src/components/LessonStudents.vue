<template>
  <div>
    <v-card>
      <v-card-title> <h5>Online Students</h5></v-card-title>
      <v-card-text>
        <template v-if="!!students.length">
          <v-list>
            <v-list-item-group active-class="activestudent" color="indigo">
              <v-list-item v-for="student in students" :key="student.id">
                <v-list-item-avatar>
                  <v-img :src="student.imageUrl"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="$getStudentDisplayName(student)"
                  ></v-list-item-title>
                </v-list-item-content>
                <v-btn
                  class="[mx-2]"
                  fab
                  dark
                  x-small
                  color="green"
                  v-on:click="$toggleStudentAuthorization(student)"
                >
                  <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </template>
        <p v-else>No stuedents have yet shown up to this class</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";

export default {
  mixins: [userOperationsOutgoingSyncMixin],
  computed: {
    ...mapState({
      students: (state) => {
        return state.studentStore.students;
      },
    }),
  },
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
    }),
    ...mapActions({
      toggleAuthorization: "toggleAuthorization",
    }),
    $getStudentDisplayName(student) {
      return student.firstName + " " + student.lastName;
    },
    $toggleStudentAuthorization: function (student) {
      this.toggleAuthorization(student.userId).then((authorization) => {
        this.userOperationsMixin_syncOutgoingAuthUser(
          authorization.authorizedStudentId,
          authorization.revokedStudentId
        );
      });
    },
  },
};
</script>

<style>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
</style>
