import { sql } from "../database/database.js";

const findAllQuestions = async() => {
    return await sql`SELECT * FROM questions;`;
}

const findQuestionsByCourseId = async(courseId) => {
    return await sql`SELECT * FROM questions WHERE course_id = ${courseId};`;
}

const findQuestionByQuestionId = async(questionId) => {
    return await sql`SELECT * FROM questions WHERE id = ${questionId};`;
}

const findLastQuestionByUser = async(userId) => {
    return await sql`SELECT * FROM questions WHERE user_id = ${userId} ORDER BY created_time DESC LIMIT 1`;
}

const addQuestion = async(courseId, title, description, userId) => {
    return await sql`
        INSERT INTO questions (course_id, title, description, user_id)
        VALUES (${courseId}, ${title}, ${description}, ${userId})
        RETURNING *;
    `;
}

const addAnswerCount = async(questionId, countNumber) => {
    return await sql`
        UPDATE questions
        SET answers_count = answers_count + ${countNumber}
        WHERE id = ${questionId};
    `;
}

const removeUpvoteQuestionId = async(questionId, userVoteId, newDate) => {
    return await sql`
        UPDATE questions
        SET 
            upvotes = upvotes - 1,
            upvote_user_ids = array_remove(upvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${questionId}
        AND array_position(upvote_user_ids, ${userVoteId}) IS NOT NULL;
    `;
}

const removeDownvoteQuestionId = async(questionId, userVoteId, newDate) => {
    return await sql`
        UPDATE questions
        SET 
            upvotes = upvotes + 1,
            downvote_user_ids = array_remove(downvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${questionId}
        AND array_position(downvote_user_ids, ${userVoteId}) IS NOT NULL;
    `;
}

const upVoteQuestion = async (id, userVoteId, newDate) => {
    return await sql`
        UPDATE questions
        SET 
            upvotes = upvotes + CASE 
                WHEN ${userVoteId} = ANY(downvote_user_ids) THEN 2
                ELSE 1
            END,
            upvote_user_ids = array_append(upvote_user_ids, ${userVoteId}),
            downvote_user_ids = array_remove(downvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${id};
    `;
};

const downVoteQuestion = async (id, userVoteId, newDate) => {
    return await sql`
        UPDATE questions
        SET 
            upvotes = upvotes - CASE 
                WHEN ${userVoteId} = ANY(upvote_user_ids) THEN 2
                ELSE 1
            END,
            downvote_user_ids = array_append(downvote_user_ids, ${userVoteId}),
            upvote_user_ids = array_remove(upvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${id};
    `;
};

const deleteQuestion = async(id) => {
    return await sql`
        DELETE FROM questions
        WHERE id = ${id};
    `;
}

export { findAllQuestions, findQuestionsByCourseId, findQuestionByQuestionId, findLastQuestionByUser, addQuestion, addAnswerCount, removeUpvoteQuestionId,removeDownvoteQuestionId,upVoteQuestion, downVoteQuestion, deleteQuestion };