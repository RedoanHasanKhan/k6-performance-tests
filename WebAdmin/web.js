import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
    stages: [
        { duration: '10s', target: 15 },  // Ramp up
        { duration: '10s', target: 15 },  // Hold
        { duration: '10s', target: 0 },    // Ramp down
    ],
};

// Store CSV results in an array
let csvResults = ["timestamp,vus,iteration,url,method,duration,failed,status"];

export default function () {
    const timestamp = new Date().toISOString();
    const vus = __VU;
    const iteration = __ITER;

    // 🔹 Login Request
    const loginUrl = "https://api.ridealike.com/v1/user.UserService/Login";
    const loginPayload = JSON.stringify({ Email: "jk@yopmail.com", Password: "Aem@bs23" });
    const loginHeaders = { "Content-Type": "application/json" };
    const loginRes = http.post(loginUrl, loginPayload, { headers: loginHeaders });

    let loginFailed = loginRes.status !== 200 ? 1 : 0; // Mark failure as 1 for easier filtering
    csvResults.push(`${timestamp},${vus},${iteration},${loginUrl},POST,${loginRes.timings.duration},${loginFailed},${loginRes.status}`);

    let jwtToken = null;
    if (loginRes.status === 200) {
        jwtToken = JSON.parse(loginRes.body).JWT;
    }

    // 🔹 Search Car Request (If login succeeds)
    if (jwtToken) {
        const searchUrl = "https://api.ridealike.com/v1/car.CarService/SearchCar";
        const searchPayload = JSON.stringify({
            Address: "21 Basabo Road, Dhaka 1214, Bangladesh",
            FormattedAddress: "21 Basabo Road, Dhaka 1214, Bangladesh",
            Location: { Latitude: 23.7413006, Longitude: 90.432301 },
            TripDuration: {
                StartDateTime: "2025-03-11T23:00:00.000Z",
                EndDateTime: "2025-03-15T18:00:00.000Z"
            },
            StartDateTime: "2025-03-11T18:39:37.260Z",
            EndDateTime: "2025-03-15T18:39:37.260Z",
            PickupTime: 5,
            ReturnTime: 0,
            TotalTripCostRange: { LowerRange: 0, UpperRange: 1000 },
            Range: [0, 1000],
            SortBy: "None",
            Limit: "1000",
            skip: "0"
        });

        const searchHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` };
        const searchRes = http.post(searchUrl, searchPayload, { headers: searchHeaders });

        let searchFailed = searchRes.status !== 200 ? 1 : 0;
        csvResults.push(`${timestamp},${vus},${iteration},${searchUrl},POST,${searchRes.timings.duration},${searchFailed},${searchRes.status}`);
    }

    sleep(1);
}

// 🔹 Save CSV Report
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

