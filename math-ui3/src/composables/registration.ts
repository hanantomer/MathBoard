import { ref, computed } from "vue";
import { UserType } from "common/unions";
import useAuthHelper from "../helpers/authenticationHelper";
import useValidationRules from "./validationRules";

export default function useRegistration(userType: UserType) {
  const authHelper = useAuthHelper();
  const { emailRules, rules, passwordMatch } = useValidationRules();

  const registerForm = ref(null);
  const valid = ref<boolean>(false);
  const firstName = ref("");
  const lastName = ref("");
  const email = ref("");
  const password = ref("");
  const verify = ref("");
  const show1 = ref(false);

  const passwordMatchRule = passwordMatch(password.value, verify.value);

  const registrationTitle = computed(() =>
    userType === "TEACHER" ? "Teacher Registration" : "Student Registration",
  );

  const resetForm = () => {
    registerForm.value = null;
    firstName.value = "";
    lastName.value = "";
    email.value = "";
    password.value = "";
    verify.value = "";
  };

  const performRegister = async () => {
    const formValidated: any = await (registerForm.value as any).validate();
    if (formValidated.valid) {
      const newUser = await authHelper.registerUser(
        firstName.value,
        lastName.value,
        email.value,
        password.value,
        userType,
      );

      if (!newUser) {
        alert("Registration failed: Email already in use.");
        return false;
      }

      resetForm();
      return true;
    }
    return false;
  };

  return {
    registerForm,
    valid,
    firstName,
    lastName,
    email,
    password,
    verify,
    show1,
    emailRules,
    rules,
    passwordMatchRule,
    registrationTitle,
    resetForm,
    performRegister,
  };
}
