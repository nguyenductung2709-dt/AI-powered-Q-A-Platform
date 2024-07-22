INSERT INTO courses (title, description, questions_count) VALUES
    ('Introduction to Programming', 'Learn the basics of programming languages.', 2),
    ('Data Structures and Algorithms', 'Explore advanced data structures and algorithms.', 1),
    ('Web Development', 'Build modern web applications using HTML, CSS, and JavaScript.', 0);

INSERT INTO questions (course_id, title, description, user_id, answers_count) VALUES
    (1, 'What is a variable?', 'Explain the concept of variables in programming.', 'user123', 2),
    (1, 'How to use loops?', 'Discuss different types of loops and their usage.', 'user456', 1),
    (2, 'What are linked lists?', 'Describe the properties and usage of linked lists.', 'user789', 0);

INSERT INTO answers (question_id, description, user_id) VALUES
    (1, 'A variable is a placeholder for storing data in a program.', 'user456'),
    (1, 'Variables can hold different types of data such as numbers or text.', 'user789'),
    (2, 'Loops are used for repeating a block of code until a certain condition is met.', 'user123');