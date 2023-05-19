declare const _default: {
    isTeacher: (userId: number, lessonId: number) => Promise<boolean>;
    findUserAnswer(userId: number, questionId: number): Promise<any>;
    getIdByUUID(model: string, uuid: string): Promise<any>;
    getUUIDById(model: string, id: number): Promise<any>;
    getLesson(lessonUUId: string): Promise<any>;
    getNotation(id: number, url: string): Promise<any>;
};
export default _default;
