# Database schema, indexes, and database denormalization

## Database schema:

Because courses and questions are one-to-many relationships => I have a course_id foreign key in table questions.

Because questions and answers are one-to-many relationships => I have a question_id foreign key in table answers.

Every other properties are essential for the functionality of the web application.

TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    questions_count INTEGER NOT NULL DEFAULT 0
);

TABLE questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    upvote_user_ids TEXT[],
    downvote_user_ids TEXT[],
    created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_upvoted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers_count INTEGER NOT NULL DEFAULT 0
);

TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    description TEXT,
    user_id TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    upvote_user_ids TEXT[],
    downvote_user_ids TEXT[],
    created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_upvoted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

## Database indexes justification:

    + index on table questions:

        idx_questions_course_id: Improves query performance when retrieving questions for a specific course.

        idx_questions_user_id: Enhances query speed when fetching questions created by a specific user.

        idx_questions_created_time: Speeds up retrieval of questions based on their creation time, useful for sorting and filtering by date.

    + index on table answers:

        idx_answers_question_id: Improves query performance when retrieving answers for a specific question.

        idx_answers_user_id: Enhances query speed when fetching answers created by a specific user.

        idx_answers_created_time: Speeds up retrieval of answers based on their creation time, useful for sorting and filtering by date.

## Database denormalization:
    
    + upvote_user_ids and downvote_user_ids:

        Stored as arrays within the questions and answers tables.

        Enables quick access to the list of users who have upvoted or downvoted without needing to join with another table.

        Reduces complexity and speeds up read operations for upvote/downvote data.
    
    + questions_count and answers_count:

        Stored directly in the courses and questions tables respectively.

        Avoids the need for COUNT queries during frequent operations, improving performance for operations displaying the number of 
        questions or answers.

# Caching descisions:

## For table courses
    
    - Because the content in courses are really dynamic (questions_count) => caching will make false data in UI

## For table questions

    - Because the content in questions are really dynamic (questions_count) => caching will make false data in UI
    
## For table answers

    - Because the content in answers are really dynamic (questions_count) => caching will make false data in UI
