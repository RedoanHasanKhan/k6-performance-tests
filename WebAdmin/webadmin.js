import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom trend metric for tracking login response times
let loginDuration = new Trend('login_duration');

export const options = {
    stages: [
        { duration: '10s', target: 5 },  // Ramp up to 1000 users
        { duration: '10s', target: 5 },   // Keep 1000 users for 1 min
        { duration: '10s', target: 0 },     // Ramp down
      ],
};

export default function () {
  const url = 'https://api.ridealike.com/v1/user.UserService/Login';
  
  // Define your login payload
  const payload = JSON.stringify({
    email: 'salekinnewaz0@gmail.com',
    password: 'Ridealike1234',
  });

  // Set the headers
  const headers = { 'Content-Type': 'application/json' };

  // Send the POST request to login
  const res = http.post(url, payload, { headers: headers });

  // Track the response time with a custom trend
  loginDuration.add(res.timings.duration);

  // Check that the status is 200 OK
  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(1); // Simulate a user sleeping for 1 second
}
//import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export function handleSummary(data) {
    let csvHeader = 'timestamp,vus,iteration,http_req_url,http_req_method,http_req_duration,http_req_failed,http_req_status\n';
    let csvRows = '';

    // Iterate through each VU and track failures
    for (let i = 0; i < data.metrics.iterations.values.count; i++) {
        let timestamp = Date.now();
        let vus = data.metrics.vus.values.value;
        let iteration = i + 1; // Start from 1
        let url = "https://webadmin.ridealike.com/auth/login";
        let method = "POST";
        let duration = data.metrics.http_req_duration.values.avg;
        let failed = data.metrics.http_req_failed.values.fails;
        let status = failed > 0 ? "FAILED" : "SUCCESS";

        csvRows += `${timestamp},${vus},${iteration},${url},${method},${duration},${failed},${status}\n`;
    }

    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'result.csv': csvHeader + csvRows, // Save CSV file
    };
}
