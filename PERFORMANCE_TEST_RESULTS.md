# Performance test results

Brief description of the used server: HTTP/1.1 

Brief description of your computer: Macbook Air M1

### Loading the homepage (courses page) (k6 run test-1.js)

http_reqs: 2622

http_req_duration - median: 38.09

http_req_duration - 95th percentile: 64.12ms

### Loading the questions page of Introduction to Programming course (6 questions) (k6 run test-2.js)

http_reqs: 5044

http_req_duration - median: 19.75ms

http_req_duration - 95th percentile: 24.66ms

### Loading the specific page for a question (k6 run test-3.js)

http_reqs: 4344

http_req_duration - median: 22.93ms

http_req_duration - 95th percentile: 39.1ms

### Post questions for course Introduction to Programming (k6 run test-4.js)

http_reqs: 96

http_req_duration - median: 1.09s

http_req_duration - 95th percentile: 1.26s

### Post comments for a question (k6 run test-5.js)

http_reqs: 3917

http_req_duration - median: 25.34ms

http_req_duration - 95th percentile: 48.79ms