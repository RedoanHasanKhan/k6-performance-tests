# 🚀 K6 Performance Testing with CSV Reporting

## 📌 Overview
This project is a **performance testing script** using [K6](https://k6.io/) to test login and search functionalities of the RideAlike application. The test results are logged into a CSV file for better analysis of request failures.

## 📋 Features
- Simulates multiple virtual users (VUs) performing login and search requests.
- Captures request details such as timestamps, response duration, status, and failures.
- Saves results in a structured **CSV report** (`result.csv`).
- Supports **ramp-up, hold, and ramp-down** stages for performance analysis.

## 🛠️ Installation & Setup
### 1️⃣ Install K6
Make sure you have K6 installed on your system:
```sh
brew install k6        # macOS
choco install k6       # Windows (using Chocolatey)
apt install k6         # Linux (Debian/Ubuntu)
```
Or download from the [official K6 website](https://k6.io/docs/getting-started/installation/).

### 2️⃣ Clone this repository
```sh
git clone https://github.com/RedoanHasanKhan/k6-performance-tests
cd k6-performance-test
```

### 3️⃣ Run the Test
```sh
k6 run script.js
```

## 📊 Test Configuration
The test script follows this load testing scenario:
- 🚀 **Ramp-up:** 10s (scaling up to 15 VUs)
- 🔄 **Steady Load:** 10s (holding at 15 VUs)
- 🛑 **Ramp-down:** 2m (gradually stopping)

You can modify these stages in the `options` section of `script.js`:
```js
export const options = {
    stages: [
        { duration: '10s', target: 15 },  // Ramp up
        { duration: '10s', target: 15 },  // Hold
        { duration: '2m', target: 0 },     // Ramp down
    ],
};
```

## 📄 CSV Report Format
The test results are saved in `result.csv` with the following format:
```csv
timestamp,vus,iteration,http_req_url,http_req_method,http_req_duration,http_req_failed,http_req_status
2025-03-11T12:00:00.000Z,1,1,https://api.ridealike.com/v1/user.UserService/Login,POST,120,FAILED,401
2025-03-11T12:00:01.000Z,1,1,https://api.ridealike.com/v1/car.CarService/SearchCar,POST,300,SUCCESS,200
```

## 🔍 Debugging & Logging
If you face issues, enable logging inside `script.js`:
```js
console.log("Login Response:", loginRes.body);
console.log("Search Response:", searchRes.body);
```

## 📌 Contribution
Feel free to submit **pull requests** or report issues in the [GitHub Issues](https://github.com/your-username/k6-performance-test/issues) section.

## 📜 License
This project is licensed under the **MIT License**.

---
🚀 Happy Testing!

