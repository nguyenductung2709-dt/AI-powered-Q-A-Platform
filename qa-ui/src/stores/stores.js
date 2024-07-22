import { readable, writable } from "svelte/store";
import { formatDate } from "../utils/formatDate";

function generateUUID() {
  const crypto = window.crypto || window.msCrypto; 
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40; 
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

let user = localStorage.getItem("userUuid");

if (!user) {
  user = generateUUID();
  localStorage.setItem("userUuid", user);
}

export const userUuid = readable(user);
export const courses = writable([]);
export const answers = writable([]);
export const questions = writable([]);
export const numAnswers = writable(null);
export const isQuestionFormVisible = writable(false);

async function fetchCourses() {
  const response = await fetch("/api/courses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  courses.set(data.map(course => ({
    ...course,
    formattedDate: formatDate(course.created_time)
  })));
};

fetchCourses();
