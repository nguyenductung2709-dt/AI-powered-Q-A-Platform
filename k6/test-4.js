import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  const userId = uuidv4();
  const courseId = 1;
  const title = "Bug";
  const description = "What is a bug in programming?";

  const data = {
    courseId,
    title,
    description,
    userId
  };

  http.post('http://localhost:7800/api/questions', JSON.stringify(data));
}