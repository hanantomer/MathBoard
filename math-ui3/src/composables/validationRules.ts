import { computed } from "vue";

export default function useValidationRules() {
  const emailRules = [
    (v: string) => !!v || "Required",
    (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
  ];

  const rules = {
    required: (value: string) => !!value || "Required.",
    min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
    validMail: (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
  };

  const passwordMatch = (password: string, verify: string) =>
    computed(() => {
      return () => password === verify || "Password must match";
    });

  return {
    emailRules,
    rules,
    passwordMatch,
  };
}
