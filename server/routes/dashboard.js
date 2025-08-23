const express = require('express');
const router = express.Router();
const db = require('../firebase');

router.get('/stats', async (req, res) => {
  try {
    const { uid } = req.query;

    let applicationSnapshot;
    if (uid) {
      console.log('Filtering applications by user ID:', uid);
      applicationSnapshot = await db.collection('applications').where('uid', '==', uid).get();
    } else {
      console.log('❌ Missing user ID for applications fetch');
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const applications = applicationSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })); 

    // Fetch resumes from Firestore - filter by user ID if provided
    let resumeSnapshot;
    if (uid) {
      resumeSnapshot = await db.collection('resumes').where('uid', '==', uid).get();
    } else {
      resumeSnapshot = await db.collection('resumes').get();
    }
    
    const resumes = resumeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let interviewSnapshot;
    if (uid) {
      interviewSnapshot = await db.collection('interviewEntries').where('uid', '==', uid).get();
    } else {
      interviewSnapshot = await db.collection('interviewEntries').get();
    }
    const interviewEntries = interviewSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const uniqueResumeTags = [...new Set(resumes.map(resume => resume.tag || 'Untitled').filter(Boolean))];
    const uniqueResumeCount = uniqueResumeTags.length;
    const totalApplications = applications.length;
    
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const interviewsCompleted = applications.filter(app => {
      const status = app.status?.toLowerCase() || '';
      return status === 'interview scheduled' || status === 'interview completed';
    }).length;

    const offers = statusCounts['offer'] || statusCounts['accepted'] || 0;
    const successRate = totalApplications > 0 ? (offers / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviewsCompleted / totalApplications) * 100 : 0;
    const linkedApplications = applications.filter(app => app.resume || app.resumeId).length;

    // Prepare application data for chart
    const applicationData = [
      { name: 'Applied', value: statusCounts['applied'] || 0, color: '#60A5FA' },
      { name: 'Interview Scheduled', value: statusCounts['interview scheduled'] || 0, color: '#A855F7' },
      { name: 'Interview Completed', value: statusCounts['interview completed'] || 0, color: '#818CF8' },
      { name: 'Offer', value: offers, color: '#34D399' },
      { name: 'Rejection', value: statusCounts['rejected'] || statusCounts['rejection'] || 0, color: '#c86024ff' }
    ];

    // Count interview entries by question type
    const interviewTypeCounts = interviewEntries.reduce((acc, entry) => {
      const type = entry.questionType || entry.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Prepare interview data for chart
    let interviewData;
    if (Object.keys(interviewTypeCounts).length === 0) {
      interviewData = [
        { name: 'Coding', value: 0, color: getInterviewTypeColor('Coding') },
        { name: 'System Design', value: 0, color: getInterviewTypeColor('System Design') },
        { name: 'Behavioral', value: 0, color: getInterviewTypeColor('Behavioral') }
      ];
    } else {
      const allTypes = ['Coding', 'System Design', 'Behavioral'];
      interviewData = allTypes.map(type => ({
        name: type,
        value: interviewTypeCounts[type] || 0,
        color: getInterviewTypeColor(type)
      }));
    }


    const recentActivities = applications
      .sort((a, b) => {
        const aDate = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt || a.dateApplied);
        const bDate = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt || b.dateApplied);
        return bDate - aDate;
      })
      .slice(0, 5)
      .map(app => {
        const createdAtDate = app.createdAt && typeof app.createdAt.toDate === 'function' ? app.createdAt.toDate() : new Date(app.createdAt || app.dateApplied);
        return {
          icon: '📩',
          text: `Applied to ${app.company}`,
          time: getTimeAgo(createdAtDate),
          date: isNaN(createdAtDate) ? (app.dateApplied || 'Date not set') : createdAtDate.toLocaleString(),
          type: 'applied'
        };
      });

    // Get upcoming events
    const upcomingEvents = applications
      .filter(app => {
        const status = app.status?.toLowerCase() || '';
        return status === 'interview scheduled';
      })
      .map(app => {
        let dateStr = 'Date not set';
        let timeStr = 'Time not set';
        if (app.dateApplied) {
          const dt = new Date(app.dateApplied);
          if (!isNaN(dt)) {
            dateStr = dt.toLocaleDateString();
            timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
        return {
          title: `Interview with ${app.company}`,
          date: dateStr,
          time: timeStr,
          type: app.status,
          color: 'blue'
        };
      });

    res.json({
      totalApplications,
      interviewsCompleted,
      successRate: Math.round(successRate * 100) / 100,
      applicationData,
      interviewData,
      recentActivities,
      upcomingEvents,
      resumePerformance: {
        resumeVersions: uniqueResumeCount,
        resumeTags: uniqueResumeTags,
        interviewRate: Math.round(interviewRate * 100) / 100 + '%',
        linkedApplications: linkedApplications
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

// Helper function to get color for interview type
function getInterviewTypeColor(type) {
  switch (type) {
    case 'Coding':
      return '#60A5FA'; 
    case 'System Design':
      return '#818CF8'; 
    case 'Behavioral':
      return '#34D399'; 
    case 'Technical':
      return '#F59E0B'; 
    case 'Problem Solving':
      return '#EF4444';
    default:
      return '#6B7280'; 
  }
}

module.exports = router;
