import useAuthUtil from "../../math-auth/build/authUtil";
import useDbUtil from "../../math-db/build/dbUtil";
import { UserAttributes } from "../../math-common/build/userTypes";
const authUtil = useAuthUtil();
const dbUtil = useDbUtil();

async function isLessonOwner(
  user: UserAttributes,
  lessonUUId: string,
): Promise<boolean> {
  if (!user?.uuid || !lessonUUId) {
    return false;
  }

  const lesson = await dbUtil.getLesson(lessonUUId);
  if (!lesson) {
    return false;
  }

  const userId =
    user.id ?? (await dbUtil.getIdByUUId("User", user.uuid));
  return lesson.userId === userId;
}

function canTeach(user: UserAttributes | null | undefined): boolean {
  return user?.userType === "TEACHER" || user?.userType === "BOTH";
}

export default {
  getAccessTokenFromCookie: function (
    cookie: any
  ) {
    if (!!cookie)
      return (
        cookie
          .match(
            "(^|;)\\s*access_token\\s*=\\s*([^;]+)"
          )
          ?.pop() || ""
      );
  },

  getUserFromCookie: async function (
    cookie: any
  ): Promise<UserAttributes | null> {
    
    if (!cookie) return null;
    
    let access_token = this.getAccessTokenFromCookie(cookie);
    
    const decodedToken =
      authUtil.validateToken(access_token);
    
    if (!decodedToken) return null;

    const user = await authUtil.getUserByToken(
      decodedToken
    );

    if (!user) {
      console.error(
        `access_token:${access_token} not associated with any user`
      );
      return null;
    }

    return user;
  },

  isLessonOwner,
  canTeach,
};
