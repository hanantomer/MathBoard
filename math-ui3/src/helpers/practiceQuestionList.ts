import { PracticeQuestionListItem } from "common/practiceQuestionTypes";
import { PRACTICE_QUESTION_TEMPLATES } from "common/practiceQuestionTemplates";
import { UserAttributes } from "common/userTypes";

const PLACEHOLDER_USER = {
  uuid: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  access_token: null,
  reset_pasword_token: null,
  imageUrl: "",
  userType: "TEACHER",
  approved: true,
} as UserAttributes;

/** Instant catalog rows from bundled templates so the list is never empty while the API loads. */
export function practiceListItemsFromTemplates(
  subject: string,
): Map<string, PracticeQuestionListItem> {
  const next = new Map<string, PracticeQuestionListItem>();
  for (const template of PRACTICE_QUESTION_TEMPLATES) {
    if (template.subject !== subject) continue;
    next.set(template.uuid, {
      uuid: template.uuid,
      practiceUUId: template.uuid,
      name: template.name,
      subject: template.subject,
      user: PLACEHOLDER_USER,
    });
  }
  return next;
}
