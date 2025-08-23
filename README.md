# DevApply  
**Track job applications, log interview questions, and analyze your tech interview journey.**

Built by engineers, for engineers.  
DevApply is a full-stack web application designed to help software engineers track job applications and document real interview experiences — including coding questions, system design prompts, and behavioral notes.
- Frontend: https://frontend-dot-devapply-d2503.uc.r.appspot.com
- Backend: https://devapply-d2503.uc.r.appspot.com
---

## 🚀 Features

### ✅ Core Features (Implemented)
- 📝 **Job Application Tracker** – Manage companies, roles, status, links, and application stages with detailed tracking
- 💬 **Interview Journal** – Record and organize real coding, system design, and behavioral questions with detailed notes
- 🤖 **AI-Powered Mock Interviews** – Practice with AI-generated questions tailored to your resume and job applications
- 📊 **Analytics Dashboard** – Visualize trends in your interview history, application status, and performance metrics
- 📄 **Resume Builder & Version Tracking** – Create, edit, and manage multiple resume versions with AI-powered suggestions
- 🔍 **Question History** – Browse and filter your past interview questions with AI analysis and solutions
- 👤 **User Profile Management** – Manage your personal information and preferences
- 🔐 **Authentication System** – Secure login/signup with Firebase Authentication

### 🎯 AI Features
- **Smart Question Generation** – AI generates contextual interview questions based on your resume and job descriptions
- **Answer Analysis** – Get detailed feedback on your interview responses with scoring and improvement suggestions
- **Solution Generation** – Receive model answers and solutions for coding and system design questions
- **Resume Enhancement** – AI-powered suggestions to improve your resume content and structure
- **Similar Question Generation** – Get additional practice questions similar to ones you've encountered

### 📈 Advanced Features
- **Application Status Tracking** – Monitor your job applications through various stages
- **Interview Scheduling** – Keep track of upcoming and past interviews
- **Code Editor Integration** – Built-in code editor with syntax highlighting for coding questions
- **Export & Sharing** – Export your interview history and resume data
- **Search & Filter** – Advanced filtering and search capabilities across all your data

---

## 🛠️ Tech Stack


### Frontend
- **Framework:** React 18.3.1 with React Router DOM 6.30.1
- **Styling:** Tailwind CSS 3.4.1 with custom components
- **Code Editor:** Monaco Editor, CodeMirror integration
- **Charts:** Highcharts for data visualization
- **Markdown:** React Markdown with syntax highlighting
- **Testing:** Jest, React Testing Library

### Backend
- **Runtime:** Node.js with Express.js 5.1.0
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Authentication
- **AI Integration:** OpenAI GPT models (GPT-4, GPT-3.5-turbo)
- **Testing:** Jest with Supertest

### Development & Deployment
- **Version Control:** GitHub
- **Package Manager:** npm
- **Environment:** Environment variables with .env files
- **Deployment:** Google cloud Platform

---

## 🤝 Team

This project is developed by USFCA students as part of CS-590
Team: Padmaja Mohanty, Pengfang Chen, Xuan Lin
Sponsor: Marisa Tania [@mt-cs](https://github.com/mt-cs)

---

## 📂 Getting Started


### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase account
- OpenAI API key (for AI features)

> Setup instructions and environment config.
### Installation

1. Clone the repo
```bash
git clone https://github.com/dev-apply/devapply.git
cd devapply
```

2. Install Dependencies
Install the required packages for both the frontend and backend:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```
3. Configure Firebase
To connect to Firestore:

    1.Go to Firebase Console and create a project.

    2.Enable Cloud Firestore under Build > Firestore Database.

    3.Navigate to Project Settings > Service Accounts, click Generate new private key, and download the JSON file.

    4.Save the file as:
    ```bash
    server/firebaseServiceAccountKey.json
    ```

4. Set Up Environment Variables  
   Configure `.env` files for both frontend and backend environments.
   Use `.env.example` templates  
   Both the `server/` and `client/` directories include a `.env.example` file.
   You should copy them to actual `.env` files and fill in your own values:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
   Then edit each `.env` file with your own keys and settings.
   `server/.env` example:
   ```bash
   OPENAI_API_KEY=your-api-key-here
   OPENAI_MODEL=your-model-name-here  # e.g. gpt-4o, gpt-4, or gpt-3.5-turbo
   PORT=your-port-here  # e.g. 3001
   SEED_USER_UID=your_seed_user_uid
   ```
   `client/.env` example:

   ```bash
   REACT_APP_API_URL=your-backend-url-here  # e.g. http://localhost:3001
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```
   ⚠️ `.env` files are listed in `.gitignore` to avoid committing sensitive information.

5. Seed Mock Data (Optional)
To populate the database with sample job applications and interview entries:

```bash
cd server
node scripts/seedFirestore.js
```
6. Start the Backend Server
```bash
cd server
node index.js
```
The backend will run on: http://localhost:3001

7. Start the Frontend App
```bash
cd client
npm run start
```
The frontend will be available at: http://localhost:3000 (now I just have journalPage and interviewPage.)

8. Access the Application
Open your browser and go to: http://localhost:3000/journal or http://localhost:3000/interview
You should now see the journalPage and interviewPage running locally

9. Run Backend Tests
```bash
cd server
npm test                    # Run all tests
```

---

## 📁 Project Structure

```
devapply/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   └── firebase.js    # Firebase configuration
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── ai/               # AI integration modules
│   ├── scripts/          # Utility scripts
│   ├── tests/            # Backend tests
│   └── package.json
└── README.md
```

## ☁️ Deployment – Google Cloud Platform (App Engine)
The application is deployed on **Google Cloud Platform (App Engine)** with **frontend** and **backend** as separate services.  

1.Prerequisites
- Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Authenticate with your Google Cloud account
```bash
  gcloud auth login
```
- Set your project:
```bash
  gcloud config set project <your-project-id>
```
2.Backend Deployment
- Navigate to `server/`:
```bash
  cd server
```
- Create an `app.yaml`:(remember to add this file to `.gitignore`)
```bash
  runtime: nodejs20
  env: standard
  service: default

  instance_class: F1

  env_variables:
    NODE_ENV: "production"
    OPENAI_API_KEY: your-api-key-here
    OPENAI_MODEL: your-model-name-here

  entrypoint: node index.js

  handlers:
  - url: /.*
    script: auto
```
- Deploy:  
```bash
gcloud app deploy
```
3.Frontend Deployment
- Navigate back to project root :
```bash
cd ..
```
- Create app.yaml in the root folder:  
```bash
runtime: nodejs20
env: standard
service: frontend
instance_class: F1

env_variables:
  NODE_ENV: "production"

handlers:
  - url: /(.*\..+)$
    static_files: client/build/\1
    upload: client/build/.*

  - url: /.*
    static_files: client/build/index.html
    upload: client/build/index.html
```
- Create cloudbuild.yaml in the root folder: 
```bash
steps:
  - name: "gcr.io/cloud-builders/npm"
    dir: "client"
    args: ["install"]

  - name: "gcr.io/cloud-builders/npm"
    dir: "client"
    args: ["run", "build"]

artifacts:
  files:
    - client/build/**
```
- Deploy :
```bash
gcloud app deploy app.yaml
```
4.Accessing Services
- Frontend: https://frontend-dot-devapply-d2503.uc.r.appspot.com
- Backend: https://devapply-d2503.uc.r.appspot.com

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

To run the test:
Run a specific test file: Use the following command, replacing <test_name> with the file name:
npm test <test_name>

Run all tests once (no watch mode):
npm test -- --watchAll=false

for backend
npm install --save-dev supertest
cd server
npm test
