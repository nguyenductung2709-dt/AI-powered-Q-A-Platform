import { sql } from "../database/database.js";

const findAllCourses = async() => {
    return await sql`SELECT * FROM courses ORDER BY id;`;
};

const findCourseByCourseId = async(courseId) => {
    return await sql`SELECT * FROM courses WHERE id = ${courseId};`;
};

const addQuestionCount = async(courseId, countNumber) => {
    return await sql`
        UPDATE courses
        SET questions_count = questions_count + ${countNumber}
        WHERE id = ${courseId};
    `;
}

export { findAllCourses, findCourseByCourseId, addQuestionCount };