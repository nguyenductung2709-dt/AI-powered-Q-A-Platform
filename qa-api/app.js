import { serve } from "./deps.js";
import * as courseService from  "./services/courseService.js";
import * as questionService from "./services/questionService.js";
import * as answerService from "./services/answerService.js";

let sockets = {};

const handleGetCourses = async(request) => {
  try {
    const courses = await courseService.findAllCourses();
    return new Response(JSON.stringify(courses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error handling get programming assignments request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const handleGetQuestions = async(request) => {
  try {
    const questions = await questionService.findAllQuestions();
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error handling get programming assignments request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const handleGetQuestionsByCourseId = async (request, urlPatternResult) => {
  const courseId = urlPatternResult.pathname.groups.courseId;
  try {
    let course = await courseService.findCourseByCourseId(courseId);
    if (course.length === 0) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    let questions = await questionService.findQuestionsByCourseId(courseId);
    questions.sort((a, b) => {
      const timeA = Math.max(a.created_time, a.last_upvoted_time);
      const timeB = Math.max(b.created_time, b.last_upvoted_time);
      return timeB - timeA; 
    });

    const params = new URL(request.url).searchParams;
    const page = parseInt(params.get("page")) || 1; 
    const limit = 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const resultQuestions = questions.slice(startIndex, endIndex);

    return new Response(JSON.stringify(resultQuestions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


const handleGetQuestionByQuestionId = async(request, urlPatternResult) => {
  const questionId = urlPatternResult.pathname.groups.questionId;
  try {
    const question = await questionService.findQuestionByQuestionId(questionId);
    if (question.length === 0) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(question), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

}

const handleGetAnswersByQuestionId = async(request, urlPatternResult) => {
  const questionId = urlPatternResult.pathname.groups.questionId;
  try {
    const answers = await answerService.findAnswersByQuestionId(questionId);
    answers.sort((a, b) => {
      const timeA = Math.max(a.created_time, a.last_upvoted_time);
      const timeB = Math.max(b.created_time, b.last_upvoted_time);
      return timeB - timeA; 
    });
    
    const params = new URL(request.url).searchParams;
    const page = parseInt(params.get("page")) || 1; 
    const limit = 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const resultAnswers = answers.slice(startIndex, endIndex);

    return new Response(JSON.stringify(resultAnswers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const waitForSocketConnection = (fullId, retries = 10, interval = 100) => {
  return new Promise((resolve, reject) => {
    const checkSocket = (retryCount) => {
      if (sockets[fullId]) {
        console.log(`Socket found for ${fullId}`);
        resolve(sockets[fullId]);
      } else if (retryCount <= 0) {
        console.log(`No socket found for ${fullId} after retries`);
        reject(new Error(`WebSocket connection for ${fullId} not established`));
      } else {
        console.log(`Retrying for ${fullId}, attempts left: ${retryCount}`);
        setTimeout(() => checkSocket(retryCount - 1), interval);
      }
    };

    checkSocket(retries);
  });
};

const handlePostQuestion = async (request) => {
  try {
    const data = await request.json();
    const lastQuestion = await questionService.findLastQuestionByUser(data.userId);
    const lastQuestionTime = lastQuestion[0]?.created_time || 0;
    const currentTime = new Date().getTime();

    if (currentTime - lastQuestionTime < 60000) {
      return new Response(JSON.stringify({ error: "Please wait for a while before posting another question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newData = await questionService.addQuestion(data.courseId, data.title, data.description, data.userId);
    const questionId = newData[0].id;
    const type = "questions";
    const courseId = data.courseId;
    const fullId = `${type}-${courseId}`;
    console.log(`Full ID: ${fullId}`);

    try {
      const socket = await waitForSocketConnection(fullId);
      socket.send(JSON.stringify({ question: newData[0] }));
    } catch (error) {
      console.log(error.message);
    }

    await courseService.addQuestionCount(data.courseId, 1);
    initiateCommentGeneration(questionId, data.description);

    return new Response(JSON.stringify({ response: "Question created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const initiateCommentGeneration = (questionId, description) => {
  console.log("Fetching from LLM API");

  const fetchLLMResponse = (description) => {
    console.log("Processing");
    return new Promise((resolve, reject) => {
      fetch("http://llm-api:7000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: description,
        }),
      })
        .then(response => {
          if (!response.ok) {
            reject(new Error("Failed to fetch from LLM API"));
          } else {
            return response.json();
          }
        })
        .then(responseData => resolve(responseData))
        .catch(error => reject(error));
    });
  };

  Promise.all([
    fetchLLMResponse(description),
    fetchLLMResponse(description),
    fetchLLMResponse(description),
  ])
    .then(responses => {
      console.log("LLM Responses:", responses);

      Promise.all(
        responses.map(response => {
          const str = response[0].generated_text;
          const extractedStr = description;
          let remainder = str.replace(extractedStr, "");
          remainder = remainder.replace(/\n/g, '');
          return answerService.addAnswer(questionId, remainder, "OPT-125M");
        })
      )
        .then(() => {
          questionService.addAnswerCount(questionId, 3)
            .then(() => {
              console.log("Comments generated and added for question ID:", questionId);
            })
            .catch(error => {
              console.error("Error adding answer count:", error);
            });
        })
        .catch(error => {
          console.error("Error adding answers:", error);
        });
    })
    .catch(error => {
      console.error("Error fetching LLM responses:", error);
    });
};

const handlePostAnswer = async(request) => {
  try {
    const data = await request.json();
    const lastAnswer = await answerService.findLastAnswerByUser(data.userId);
    const lastAnswerTime = lastAnswer[0]?.created_time || 0;
    const currentTime = new Date().getTime();

    if (currentTime - lastAnswerTime < 60000) {
      return new Response(JSON.stringify({ error: "Please wait for a while before posting another answer" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newData = await answerService.addAnswer(data.questionId, data.description, data.userId);
    console.log(newData[0]);
    await questionService.addAnswerCount(data.questionId, 1);
  
    const type = "answers";
    const questionId = data.questionId;
    const fullId = `${type}-${questionId}`;
    console.log(fullId)
    if (sockets[fullId]) {
      sockets[fullId].send(
        JSON.stringify({
          answer: newData[0]
        })
      )
    }
    return new Response(JSON.stringify({ response: "Answer created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const handleUpvoteQuestion = async (request, urlPatternResult) => {
  const questionId = urlPatternResult.pathname.groups.questionId;
  try {
    const data = await request.json();
    const question = await questionService.findQuestionByQuestionId(questionId);

    if (question[0].upvote_user_ids && question[0].upvote_user_ids.includes(data.userId)) {
      await questionService.removeUpvoteQuestionId(questionId, data.userId, data.newDate);
      return new Response(JSON.stringify({ message: "Question already upvoted" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await questionService.upVoteQuestion(questionId, data.userId, data.newDate);
    return new Response(JSON.stringify({ message: "Question upvoted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Log the error to the console
    console.error('Error in handleUpvoteQuestion:', error);

    // Return the error response with more detailed information
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const handleDownvoteQuestion = async (request, urlPatternResult) => {
  const questionId = urlPatternResult.pathname.groups.questionId;
  try {
    const data = await request.json();
    const question = await questionService.findQuestionByQuestionId(questionId);
    if (question[0].downvote_user_ids && question[0].downvote_user_ids.includes(data.userId)) {
      await questionService.removeDownvoteQuestionId(questionId, data.userId, data.newDate);
      return new Response("Question already downvoted", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    await questionService.downVoteQuestion(questionId, data.userId, data.newDate);
    return new Response("Question downvoted successfully", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const handleUpvoteAnswer = async (request, urlPatternResult) => {
  const answerId = urlPatternResult.pathname.groups.answerId;
  try {
    const data = await request.json();
    const answer = await answerService.findAnswerByAnswerId(answerId);
    if (answer[0].upvote_user_ids && answer[0].upvote_user_ids.includes(data.userId)) {
      await answerService.removeUpvoteAnswerId(answerId, data.userId, data.newDate);
      return new Response("Answer already upvoted", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    await answerService.upVoteAnswer(answerId, data.userId, data.newDate);
    return new Response("Answer upvoted successfully", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });  
  }
}

const handleDownvoteAnswer = async (request, urlPatternResult) => {
  const answerId = urlPatternResult.pathname.groups.answerId;
  try {
    const data = await request.json();
    const answer = await answerService.findAnswerByAnswerId(answerId);
    if (answer[0].downvote_user_ids && answer[0].downvote_user_ids.includes(data.userId)) {
      await answerService.removeDownvoteAnswerId(answerId, data.userId, data.newDate);
      return new Response("Answer already downvoted", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    await answerService.downVoteAnswer(answerId, data.userId, data.newDate);
    return new Response("Answer downvoted successfully", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const handleDeleteQuestion = async (request, urlPatternResult) => {
  const questionId = urlPatternResult.pathname.groups.questionId;
  try {
    await questionService.deleteQuestion(questionId);
    return new Response("Question deleted successfully", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const handleDeleteAnswer = async (request, urlPatternResult) => {
  const answerId = urlPatternResult.pathname.groups.answerId;
  try {
    await answerService.deleteAnswer(answerId);
    return new Response("Answer deleted successfully", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

const handleLLM = async (request) => {
  const data = await request.json();

  const response = await fetch("http://llm-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

const handleWebSocket = async(request) => {
  console.log("Initialize WebSocket connection");
  const { socket, response } = Deno.upgradeWebSocket(request);
  const params = new URL(request.url).searchParams;
  const type = params.get("type");
  const questionId = params.get("questionId");
  const courseId = params.get("courseId");
  let fullId
  if (courseId) {
    fullId = `${type}-${courseId}`;
  }
  if (questionId) {
    fullId = `${type}-${questionId}`;
  }
  socket.onopen = () => {
    console.log("WebSocket is connected");
  }
  socket.onmessage = (message) => console.log(`Received a message: ${message.data}`);
  socket.onclose = () => {
    console.log("WS closed");
    delete sockets[fullId];
  };
  sockets[fullId] = socket;
  console.log(fullId);
  return response;
}

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/ws" }),
    fn: handleWebSocket,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses" }),
    fn: handleGetCourses,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/questions" }),
    fn: handleGetQuestions,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses/:courseId" }),
    fn: handleGetQuestionsByCourseId,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/questions/:questionId" }),
    fn: handleGetQuestionByQuestionId,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/answers/:questionId" }),
    fn: handleGetAnswersByQuestionId,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/questions" }),
    fn: handlePostQuestion,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/answers" }),
    fn: handlePostAnswer,
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/questions/:questionId/upvote" }),
    fn: handleUpvoteQuestion,
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/questions/:questionId/downvote" }),
    fn: handleDownvoteQuestion,
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/answers/:answerId/upvote" }),
    fn: handleUpvoteAnswer,
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/answers/:answerId/downvote" }),
    fn: handleDownvoteAnswer,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/questions/:questionId" }),
    fn: handleDeleteQuestion,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/answers/:answerId" }),
    fn: handleDeleteAnswer,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/llm" }),
    fn: handleLLM,
  },
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  return await mapping.fn(request, mappingResult);
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
