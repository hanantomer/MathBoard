<template>
  <v-dialog v-model="show" width="1000" height="800" persistent>
    <v-card style="overflow-y: hidden">
      <v-card-title>
        {{ registrationTitle }}
      </v-card-title>
      <v-card-text>
        <v-form ref="registerForm" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="4">
              <v-text-field
                data-cy="register_fname"
                v-model="firstName"
                :rules="[rules.required]"
                label="First Name"
                maxlength="20"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                data-cy="register_lname"
                v-model="lastName"
                :rules="[rules.required]"
                label="Last Name"
                maxlength="20"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                data-cy="register_email"
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                data-cy="register_password"
                v-model="password"
                :rules="[rules.required, rules.min]"
                :type="show1 ? 'text' : 'password'"
                label="Password"
                hint="At least 8 characters"
                counter
                @click:append="show1 = !show1"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                data-cy="register_verify"
                block
                v-model="verify"
                :rules="[rules.required, passwordMatch]"
                :type="'password'"
                label="Confirm Password"
                counter
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row v-show="userType == 'TEACHER'">
            <v-col cols="12">
              <v-card>
                <v-card-title> Terms and Conditions </v-card-title>
                <v-card-text style="height: 110px; overflow-y: auto">
                  <h4>Introduction</h4>
                  <p>
                    These Website Standard Terms and Conditions written on this
                    webpage shall manage your use of our website, Mathboard
                    accessible at https://www.mathboard.com.
                  </p>
                  <p>
                    These Terms will be applied fully and affect to your use of
                    this Website. By using this Website, you agreed to accept
                    all terms and conditions written in here. You must not use
                    this Website if you disagree with any of these Website
                    Standard Terms and Conditions.
                  </p>
                  <h4>Intellectual Property Rights</h4>
                  <p>
                    Other than the content you own, under these Terms, Mathboard
                    and/or its licensors own all the intellectual property
                    rights and materials contained in this Website.
                  </p>
                  <p>
                    You are granted limited license only for purposes of viewing
                    the material contained on this Website.
                  </p>
                  <h4>Restrictions</h4>
                  <p>
                    You are specifically restricted from all of the following:
                  </p>
                  <ul>
                    <li>publishing any Website material in any other media;</li>
                    <li>
                      selling, sublicensing and/or otherwise commercializing any
                      Website material;
                    </li>
                    <li>
                      publicly performing and/or showing any Website material;
                    </li>
                    <li>
                      using this Website in any way that is or may be damaging
                      to this Website;
                    </li>
                    <li>
                      using this Website in any way that impacts user access to
                      this Website;
                    </li>
                    <li>
                      using this Website contrary to applicable laws and
                      regulations, or in any way may cause harm to the Website,
                      or to any person or business entity;
                    </li>
                    <li>
                      engaging in any data mining, data harvesting, data
                      extracting or any other similar activity in relation to
                      this Website;
                    </li>
                    <li>
                      using this Website to engage in any advertising or
                      marketing.
                    </li>
                  </ul>
                  <p>
                    Certain areas of this Website are restricted from being
                    access by you and Mathboard may further restrict access by
                    you to any areas of this Website, at any time, in absolute
                    discretion. Any user ID and password you may have for this
                    Website are confidential and you must maintain
                    confidentiality as well.
                  </p>
                  <h4>Your Content</h4>
                  <p>
                    In these Website Standard Terms and Conditions, "Your
                    Content" shall mean any audio, video text, images or other
                    material you choose to display on this Website. By
                    displaying Your Content, you grant Mathboard a
                    non-exclusive, worldwide irrevocable, sub licensable license
                    to use, reproduce, adapt, publish, translate and distribute
                    it in any and all media.
                  </p>
                  <p>
                    Your Content must be your own and must not be invading any
                    third-party's rights. Mathboard reserves the right to remove
                    any of Your Content from this Website at any time without
                    notice.
                  </p>
                  <h4>No warranties</h4>
                  <p>
                    This Website is provided "as is," with all faults, and
                    Mathboard express no representations or warranties, of any
                    kind related to this Website or the materials contained on
                    this Website. Also, nothing contained on this Website shall
                    be interpreted as advising you.
                  </p>
                  <h4>Limitation of liability</h4>
                  <p>
                    In no event shall Mathboard, nor any of its officers,
                    directors and employees, shall be held liable for anything
                    arising out of or in any way connected with your use of this
                    Website whether such liability is under contract. Mathboard,
                    including its officers, directors and employees shall not be
                    held liable for any indirect, consequential or special
                    liability arising out of or in any way related to your use
                    of this Website.
                  </p>
                  <h4>Indemnification</h4>
                  <p>
                    You hereby indemnify to the fullest extent Mathboard from
                    and against any and/or all liabilities, costs, demands,
                    causes of action, damages and expenses arising in any way
                    related to your breach of any of the provisions of these
                    Terms.
                  </p>
                  <h4>Severability</h4>
                  <p>
                    If any provision of these Terms is found to be invalid under
                    any applicable law, such provisions shall be deleted without
                    affecting the remaining provisions herein.
                  </p>
                  <h4>Variation of Terms</h4>
                  <p>
                    Mathboard is permitted to revise these Terms at any time as
                    it sees fit, and by using this Website you are expected to
                    review these Terms on a regular basis.
                  </p>
                  <h4>Assignment</h4>
                  <p>
                    The Mathboard is allowed to assign, transfer, and
                    subcontract its rights and/or obligations under these Terms
                    without any notification. However, you are not allowed to
                    assign, transfer, or subcontract any of your rights and/or
                    obligations under these Terms.
                  </p>
                  <h4>Entire Agreement</h4>
                  <p>
                    These Terms constitute the entire agreement between
                    Mathboard and you in relation to your use of this Website,
                    and supersede all prior agreements and understandings.
                  </p>
                  <h4>Governing Law & Jurisdiction</h4>
                  <p>
                    These Terms will be governed by and interpreted in
                    accordance with the laws of the Israel, and you submit to
                    the non-exclusive jurisdiction of courts located in Israel
                    for the resolution of any disputes.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-show="userType == 'TEACHER'">
            <v-col class="d-flex" cols="12" align-end>
              <v-checkbox
                data-cy="register_accept_terms"
                v-model="acceptedTerms"
                label="I accept the above terms and condtions."
              >
              </v-checkbox>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex" cols="12" align-end>
              <v-btn
                :disabled="!acceptedTerms && userType == 'TEACHER'"
                data-cy="register_signup"
                color="indigo-darken-3"
                variant="flat"
                @click="register"
                >Sign Up</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import useAuthHelper from "../helpers/authenticationHelper";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { UserType } from "common/unions";
const route = useRoute();

const authHelper = useAuthHelper();
let registerForm = ref(null);
let acceptedTerms = ref(false);
let show = ref(false);
let valid = ref(false);
let firstName = ref("");
let lastName = ref("");
let email = ref("");
let password = ref("");
let verify = ref("");
const emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = ref(false);
let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
};

const passwordMatch = computed(() => {
  return () => password.value === verify.value || "Password must match";
});

const emit = defineEmits(["registered"]);

let userType = ref<UserType>("TEACHER");

let redirectAfterLogin: string = "";

let registrationTitle = computed(() =>
  userType.value == "TEACHER" ? "Teacher Registration" : "Student Registration",
);

watch(
  route,
  (params) => {
    if (params.name === "register") {
      redirectAfterLogin = params.query?.from?.toString() || "";
      userType.value = redirectAfterLogin ? "STUDENT" : "TEACHER";
      show.value = true;
    }
  },
  { flush: "pre", immediate: true },
);

async function register() {
  let formVlidated: any = await (registerForm.value as any).validate();
  if (formVlidated.valid) {
    authHelper.registerUser(
      firstName.value,
      lastName.value,
      email.value,
      password.value,
      userType.value as UserType,
    );

    registerForm.value = null;
    show.value = false;
    emit("registered", redirectAfterLogin);
  }
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
