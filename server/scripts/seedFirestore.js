const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); 
const USER_UID = process.env.SEED_USER_UID;

const serviceAccount = require(path.resolve(__dirname, '../firebaseServiceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


if (!USER_UID) {
  throw new Error('❌ SEED_USER_UID is not defined in .env file');
}

const db = admin.firestore();

async function seedData() {
  const applicationsData = [
    {
      jobTitle: 'Frontend Developer',
      company: 'Meta',
      status: 'Applied',
      createdAt: new Date('2025-07-09T22:24:05-04:00'), // Example timestamp
      updatedAt: new Date('2025-07-10T19:34:19-04:00'), // Example timestamp
      dateApplied: '2025-06-12',
      notes: 'Applied through the career portal',
      jobDescription: 'Develop and maintain frontend React applications.',
      applicationLink: 'https://careers.meta.com/job/1234',
      uid: 'uiLyy4NZiCT1OB31j0XUHDqKgei1',
    },
    {
      jobTitle: 'Software Engineer',
      company: 'Google',
      status: 'Interview Completed',
      createdAt: new Date('2025-07-08T12:00:00-04:00'),
      updatedAt: new Date('2025-07-09T15:30:00-04:00'),
      dateApplied: '2025-06-10',
      notes: 'Referred by a friend',
      jobDescription: 'Work on scalable backend services and APIs.',
      applicationLink: 'https://careers.google.com/jobs/5678',
      uid: 'uiLyy4NZiCT1OB31j0XUHDqKgei1',
    },
    {
      jobTitle: 'Full Stack Developer',
      company: 'Amazon',
      status: 'Applied',
      createdAt: new Date('2025-07-07T09:00:00-04:00'),
      updatedAt: new Date('2025-07-08T10:15:00-04:00'),
      dateApplied: '2025-06-11',
      notes: 'Job found on LinkedIn',
      jobDescription: 'Build and maintain full stack applications.',
      applicationLink: 'https://amazon.jobs/en/jobs/91011',
      uid: 'uiLyy4NZiCT1OB31j0XUHDqKgei1',
    },
    // Added for testing Interview Scheduled
    {
      jobTitle: 'Backend Developer',
      company: 'Netflix',
      status: 'Interview Scheduled',
      createdAt: new Date('2025-07-11T10:00:00-04:00'),
      updatedAt: new Date('2025-07-12T11:00:00-04:00'),
      dateApplied: '2025-06-13',
      notes: 'Recruiter reached out via email',
      jobDescription: 'Develop and optimize backend microservices.',
      applicationLink: 'https://jobs.netflix.com/jobs/2222',
      uid: 'uiLyy4NZiCT1OB31j0XUHDqKgei1',
    },
    // Added for explicit Interview Completed
    {
      jobTitle: 'DevOps Engineer',
      company: 'Spotify',
      status: 'Interview Completed',
      createdAt: new Date('2025-07-13T14:00:00-04:00'),
      updatedAt: new Date('2025-07-14T15:00:00-04:00'),
      dateApplied: '2025-06-14',
      notes: 'Interviewed with team lead',
      jobDescription: 'Manage CI/CD pipelines and cloud infrastructure.',
      applicationLink: 'https://spotifyjobs.com/jobs/3333',
      uid: 'uiLyy4NZiCT1OB31j0XUHDqKgei1',
    }
  ];

  console.log('📦 Seeding applications...');
  const applicationRefs = [];

  for (const app of applicationsData) {
    //check duplicate application
    const existing = await db.collection('applications')
      .where('jobTitle','==',app.jobTitle)
      .where('company', '==', app.company)
      .where('uid','==',USER_UID)
      .limit(1)
      .get();
    
    if(!existing.empty){
      console.log(`⚠️ Application "${app.jobTitle}" at "${app.company}" already exists. Skipping.`);
      continue;
    }

    const docRef = await db.collection('applications').add({
      ...app, uid: USER_UID // add uid
    });
    applicationRefs.push({ id: docRef.id, ...app, uid: USER_UID });
  }

  const interviewEntries = [
    {
      applicationJobTitle: 'Frontend Developer',
      questionType: 'Coding',
      question: 'Build a React component for infinite scroll.',
      response: '```jsx\nconst InfiniteScroll = () => {\n  const [items, setItems] = useState([]);\n  // more logic here...\n};\n```',
      type: 'Coding',
      date: '2025-06-15',
      notes: 'Focus on performance and user experience.'
    },
    {
      applicationJobTitle: 'Frontend Developer',
      questionType: 'Behavioral',
      question: 'Tell me about a time you solved a frontend performance issue.',
      response: '**Used code splitting**, lazy loading, and avoided re-renders with `React.memo`.',
      type: 'Behavioral',
      date: '2025-06-17'
    },
    {
      applicationJobTitle: 'Software Engineer',
      questionType: 'System Design',
      question: 'Design a URL shortener service.',
      response: '- Generate unique IDs using Base62\n- Store mapping in DB\n- Use Redis cache for quick lookup\n\n```js\nfunction shorten(url) {\n  const id = generateBase62();\n  db.save(id, url);\n  return id;\n}\n```',
      type: 'System Design',
      date: '2025-06-16'
    },
    {
      applicationJobTitle: 'Software Engineer',
      questionType: 'Coding',
      question: 'Reverse a linked list.',
      response: '```js\nfunction reverse(head) {\n  let prev = null;\n  while (head) {\n    const next = head.next;\n    head.next = prev;\n    prev = head;\n    head = next;\n  }\n  return prev;\n}\n```',
      type: 'Coding',
      date: '2025-06-18'
    },
    {
      applicationJobTitle: 'Full Stack Developer',
      questionType: 'Behavioral',
      question: 'Tell me about a time you worked on a team project.',
      response: 'I **collaborated** with 4 teammates to build a MERN stack app. We used GitHub Projects to manage tasks and had weekly standups.',
      type: 'Behavioral',
      date: '2025-06-17'
    },
    // Unlinked entry: no applicationJobTitle
    {
      interviewName: 'Amazon Behavioral Phone Interview',
      questionType: 'Behavioral',
      question: 'Describe a challenge you faced when working remotely.',
      response: 'I set up async communication strategies like daily standups in Slack and weekly retros.',
      type: 'Behavioral',
      date: '2025-06-20',
      notes: 'Good practice for distributed team settings.'
    }
  ];

  console.log('📦 Seeding interview entries...');
  for (const entry of interviewEntries) {
    if (entry.applicationJobTitle) {
      let matchedApp = applicationRefs.find(app => app.jobTitle === entry.applicationJobTitle);

      // If not found in newly seeded apps, try to query existing app from Firestore
      if (!matchedApp) {
        const existingAppSnap = await db.collection('applications')
          .where('jobTitle', '==', entry.applicationJobTitle)
          .where('uid', '==', USER_UID)
          .limit(1)
          .get();

        if (!existingAppSnap.empty) {
          const doc = existingAppSnap.docs[0];
          matchedApp = { id: doc.id, ...doc.data() };
        } else {
          console.warn(`❗ No matching application found for "${entry.applicationJobTitle}" under uid ${USER_UID}. Skipping interview entry.`);
          continue;
        }
      }

      //check duplicate interview entry
      const existing = await db.collection('interviewEntries')
        .where('question', '==', entry.question)
        .where('jobTitle', '==', matchedApp.jobTitle)
        .where('company', '==', matchedApp.company)
        .where('uid', '==', USER_UID) //check uid
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`⚠️ Interview for "${entry.question}" already exists. Skipping.`);
        continue;
      }

      await db.collection('interviewEntries').add({
        uid: USER_UID, 
        applicationId: matchedApp.id,
        company: matchedApp.company,
        jobTitle: matchedApp.jobTitle,
        questionType: entry.questionType,
        question: entry.question,
        response: entry.response,
        interviewDate: entry.date,
        type: entry.type,
        notes: entry.notes || '',
        createdAt: new Date()
      });
    } else {
      // check unlinked entry
      const existing = await db.collection('interviewEntries')
        .where('interviewName', '==', entry.interviewName || 'Untitled')
        .where('question', '==', entry.question)
        .where('uid', '==', USER_UID)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`⚠️ Unlinked interview "${entry.interviewName}" already exists. Skipping.`);
        continue;
      }

      await db.collection('interviewEntries').add({
        uid: USER_UID, 
        interviewName: entry.interviewName || 'Untitled',
        questionType: entry.questionType,
        question: entry.question,
        response: entry.response,
        interviewDate: entry.date,
        type: entry.type,
        notes: entry.notes || '',
        createdAt: new Date()
      });
    }
  }
  const resumeDataList = [
  {
    uid: USER_UID, // add uid to .env
    tag: 'fullstack',
    fullName: 'Pengfang Chen',
    email: 'pengfangchen@example.com',
    phone: '123-456-7890',
    linkedin: 'https://linkedin.com/in/pengfangchen',
    github: 'https://github.com/pengfangchen',
    website: 'https://pengfang.dev',
    education: [
      {
        school: 'SMU',
        degree: 'M.S. in Computer Science',
        year: '2025',
        location: 'Dallas, TX',
        notes: ''
      }
    ],
    experience: [
      {
        company: 'Meta',
        title: 'Frontend Intern',
        start: '2024-06-07',
        end: '2024-08-09',
        location: 'Menlo Park, CA',
        desc: 'Built internal UI tools using React',
        achievements: 'Improved dev velocity by 40%'
      }
    ],
    projects: [
      {
        name: 'AI Resume Generator',
        tech: 'React, Firebase, OpenAI',
        desc: 'Automatically optimizes resumes using AI',
        github: 'https://github.com/pengfangchen/ai-resume',
        demo: 'https://resume.ai.dev'
      }
    ],
    skills: 'React, Node.js, Firebase, Tailwind CSS',
    awards: [
      {
        name: 'Dean’s List',
        issuer: 'SMU',
        date: '2024-12-09',
        notes: 'Top 10% of class'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: USER_UID,
    tag: 'backend',
    fullName: 'Pengfang Chen',
    email: 'backend@pengfang.dev',
    phone: '987-654-3210',
    linkedin: 'https://linkedin.com/in/pengfangchen',
    github: 'https://github.com/pengfangchen',
    website: 'https://backend.pengfang.dev',
    education: [
      {
        school: 'UT Austin',
        degree: 'B.S. in Environmental Engineering',
        year: '2023',
        location: 'Austin, TX',
        notes: ''
      }
    ],
    experience: [
      {
        company: 'Amazon',
        title: 'Backend Intern',
        start: '2023-06-09',
        end: '2023-08-07',
        location: 'Seattle, WA',
        desc: 'Developed scalable REST APIs',
        achievements: 'Improved API throughput by 2x'
      }
    ],
    projects: [
      {
        name: 'Job Tracker API',
        tech: 'Node.js, Express, Firestore',
        desc: 'Backend service to manage job applications',
        github: 'https://github.com/pengfangchen/job-tracker',
        demo: 'https://jobs.pengfang.dev'
      }
    ],
    skills: 'Node.js, Express, Firestore, Docker',
    awards: [
      {
        name: 'Best Intern Project',
        issuer: 'Amazon',
        date: '2023-08-09',
        notes: 'Recognized for high-impact backend service'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: USER_UID,
    tag: 'ai',
    fullName: 'Pengfang Chen',
    email: 'ai@pengfang.dev',
    phone: '888-888-8888',
    linkedin: 'https://linkedin.com/in/pengfangchen',
    github: 'https://github.com/pengfangchen',
    website: 'https://ai.pengfang.dev',
    education: [
      {
        school: 'Stanford University',
        degree: 'Certificate in AI',
        year: '2024',
        location: 'Stanford, CA',
        notes: 'Focused on NLP and LLM'
      }
    ],
    experience: [
      {
        company: 'OpenAI',
        title: 'AI Research Assistant',
        start: '2024-01-02',
        end: '2024-06-09',
        location: 'Remote',
        desc: 'Assisted in fine-tuning LLM models',
        achievements: 'Helped improve model accuracy by 12%'
      }
    ],
    projects: [
      {
        name: 'InterviewGPT',
        tech: 'OpenAI, LangChain, React',
        desc: 'Simulates behavioral interview with LLM',
        github: 'https://github.com/pengfangchen/interviewgpt',
        demo: 'https://interviewgpt.dev'
      }
    ],
    skills: 'OpenAI API, LangChain, Prompt Engineering, Python',
    awards: [
      {
        name: 'AI Fellowship',
        issuer: 'Stanford',
        date: '2024-05-06',
        notes: 'Awarded for excellence in applied AI'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }];

  const profileData = {
    name: '',
    bio: '',
    location: '',
    skills: '',
    education: '',
    experience: '',
    linkedinId: '',
    leetcodeId: '',
    githubId: '',
    portfolioId: '',
    createdAt: new Date()
  };

  console.log('📦 Seeding resumes...');
  for (const resume of resumeDataList) {
    // check duplicate resume
    const existing = await db.collection('resumes')
      .where('uid', '==', resume.uid)
      .where('tag', '==', resume.tag)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`⚠️ Resume with tag "${resume.tag}" already exists. Skipping.`);
      continue;
    }
    await db.collection('resumes').add(resume);
  }

  console.log('📦 Seeding profile...');
  //check profile duplicate
  const existingProfile = await db.collection('profiles')
    .where('name', '==', profileData.name)
    .limit(1)
    .get();

  if (!existingProfile.empty) {
    console.log(`⚠️ Profile "${profileData.name}" already exists. Skipping.`);
  }else{
    await db.collection('profiles').add(profileData);
  }
  console.log('✅ Seeding complete.');
}

seedData().catch((err) => {
  console.error('❌ Error seeding data:', err);
});