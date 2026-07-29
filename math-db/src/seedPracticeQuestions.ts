import "reflect-metadata";
import dbUtil from "./dbUtil";

async function main() {
    const db = dbUtil();
    console.log("Syncing practice question bank from templates...");
    await db.syncPracticeQuestionBank();
    console.log("Practice question bank sync complete.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
