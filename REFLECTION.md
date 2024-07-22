# Key design decisions:

## APIs:
    - GET /courses: get all courses available
    - GET /courses/:courseId: get all questions that belongs to course with id = courseId
    - GET /questions/:questionId: get question by questionId
    - GET /answers/:questionId: get all answers that belong to question with id = questionId
    - POST /questions: create new question
    - POST /answers: create new answer
    - PUT /questions/:questionId/upvote: upvote a question
    - PUT /questions/:questionId/downvote: downvote a question
    - PUT /answers/:answerId/upvote: upvote an answer
    - PUT /answers/:answerId/downvote: downvote an answer
    - POST /llm: post question to llm to get answer

## UI design decisions:
    I used SSR and searchParams for url path because it doesn't require predefined parameters in URL.
    - /: homepage, contains courses
    - /courses?id=? : course page, contains questions
    - /questions?id=?: question page, contains question and answers

## Real-time communication:
    I used WebSocket for real-time communication between frontend and backend for QuestionForm and AnswerForm
    - sockets[questions-courseId]: communicate for getting question after adding from backend
    - sockets[answer-questionId]: communicate for getting answer after adding from backend

## Reflection of possible improvements that should be done to improve the performance:
    - Thinking about some way to more probably paging the data because now, I fetch them and paging them by their indices but not by page
    in database.