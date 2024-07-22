import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  const userId = uuidv4();
  const questionId = 1;
  const description = "It's easy just google it";

  const data = {
    questionId,
    description,
    userId
  };

  http.post('http://localhost:7800/api/answers', JSON.stringify(data));
}