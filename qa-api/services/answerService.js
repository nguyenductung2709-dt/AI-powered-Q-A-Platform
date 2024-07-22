import { sql } from "../database/database.js";

const findAllAnswers = async() => {
    return await sql`SELECT * FROM answers;`;
}

const findAnswersByQuestionId = async(questionId) => {
    return await sql`SELECT * FROM answers WHERE question_id = ${questionId};`;
}

const findAnswerByAnswerId = async(answerId) => {
    return await sql`SELECT * FROM answers WHERE id = ${answerId};`;
}

const findLastAnswerByUser = async(userId) => {
    return await sql`SELECT * FROM answers WHERE user_id = ${userId} ORDER BY created_time DESC LIMIT 1`;
}

const addAnswer = async(questionId, description, userId) => {
    return await sql`
        INSERT INTO answers (question_id, description, user_id)
        VALUES (${questionId}, ${description}, ${userId})
        RETURNING *;
    `;
}

const removeUpvoteAnswerId = async(answerId, userVoteId, newDate) => {
    return await sql`
        UPDATE answers
        SET 
            upvotes = upvotes - 1,
            upvote_user_ids = array_remove(upvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${answerId} 
        AND array_position(upvote_user_ids, ${userVoteId}) IS NOT NULL;
    `;
};


const removeDownvoteAnswerId = async (answerId, userVoteId, newDate) => {
    return await sql`
        UPDATE answers
        SET 
            upvotes = upvotes + 1,
            downvote_user_ids = array_remove(downvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${answerId}
        AND array_position(downvote_user_ids, ${userVoteId}) IS NOT NULL;
    `;
};

const upVoteAnswer = async (id, userVoteId, newDate) => {
    return await sql`
        UPDATE answers
        SET 
            upvotes = upvotes + (CASE
                WHEN ${userVoteId} = ANY(downvote_user_ids) THEN 2
                ELSE 1
            END),
            upvote_user_ids = array_append(upvote_user_ids, ${userVoteId}),
            downvote_user_ids = array_remove(downvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${id};
    `;
};

const downVoteAnswer = async (id, userVoteId, newDate) => {
    return await sql`
        UPDATE answers
        SET 
            upvotes = upvotes - (CASE
                WHEN ${userVoteId} = ANY(upvote_user_ids) THEN 2
                ELSE 1
            END),
            downvote_user_ids = array_append(downvote_user_ids, ${userVoteId}),
            upvote_user_ids = array_remove(upvote_user_ids, ${userVoteId}),
            last_upvoted_time = ${newDate}
        WHERE id = ${id};
    `;
};

const deleteAnswer = async(id) => {
    return await sql`
        DELETE FROM answers
        WHERE id = ${id};
    `;
}

export { findAllAnswers, findAnswersByQuestionId, findAnswerByAnswerId, findLastAnswerByUser, removeUpvoteAnswerId, removeDownvoteAnswerId, addAnswer, upVoteAnswer, downVoteAnswer, deleteAnswer };