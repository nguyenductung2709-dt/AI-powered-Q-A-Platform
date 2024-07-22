CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    questions_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE questions (
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

CREATE INDEX idx_questions_course_id ON questions(course_id);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_time ON questions(created_time);

CREATE TABLE answers (
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

CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_created_time ON answers(created_time);
