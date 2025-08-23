
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/dashboard/stats?uid=${user?.uid || ''}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchStats();
    }
  }, [user,BASE_URL]);

  if (loading) return <p className="p-8">Loading dashboard...</p>;
  if (!dashboardData) return <p className="p-8 text-red-600">Failed to load dashboard data.</p>;

  const {
    totalApplications,
    interviewsCompleted,
    successRate,
    applicationData,
    interviewData,
    recentActivities,
    upcomingEvents,
    resumePerformance
  } = dashboardData;

  // Find the number of interviews scheduled from applicationData
  const CustomBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">{item.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CustomPieChart = ({ data }) => {
    console.log('Pie chart data:', data); // Debug log
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Handle edge cases
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-500 text-4xl">📊</span>
            </div>
            <p className="text-gray-500 text-sm">No applications yet</p>
          </div>
        </div>
      );
    }

    // If only one category has data, show a simple circle
    const nonZeroData = data.filter(item => item.value > 0);
    if (nonZeroData.length === 1) {
      const singleItem = nonZeroData[0];
      return (
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4" 
                 style={{ backgroundColor: singleItem.color }}>
              <span className="text-white text-2xl font-bold">{singleItem.value}</span>
            </div>
            <p className="text-gray-600 font-medium">{singleItem.name}</p>
          </div>
        </div>
      );
    }

    let cumulativePercentage = 0;

    const paths = data.map((item) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      cumulativePercentage += percentage;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      const largeArcFlag = percentage > 50 ? 1 : 0;

      const x1 = 100 + 80 * Math.cos(startAngleRad);
      const y1 = 100 + 80 * Math.sin(startAngleRad);
      const x2 = 100 + 80 * Math.cos(endAngleRad);
      const y2 = 100 + 80 * Math.sin(endAngleRad);

      const pathData = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      return {
        path: pathData,
        color: item.color,
        name: item.name,
        value: item.value
      };
    });

    return (
      <div className="flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="40" fill="white" />
          {paths.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'applied': return 'bg-blue-50 text-blue-600';
      case 'completed': return 'bg-green-50 text-green-600';
      case 'scheduled': return 'bg-orange-50 text-orange-600';
      case 'updated': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getEventColor = (color) => {
    switch(color) {
      case 'blue': return 'border-l-blue-500 bg-blue-50';
      case 'green': return 'border-l-green-500 bg-green-50';
      case 'purple': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              &lt;/&gt;
            </div>
            <span className="text-xl font-semibold text-gray-900">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard title="Total Applications" value={totalApplications} icon="📄" bg="blue" />
          <MetricCard title="Interviews" value={interviewsCompleted} icon="✅" bg="green" />
          <MetricCard title="Success Rate" value={`${successRate}%`} icon="📈" bg="purple" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Application Tracker">
            <div className="flex flex-col justify-between min-h-[280px]">
                {applicationData && applicationData.length > 0 ? (
                    <>
                        <CustomPieChart data={applicationData} />
                        <Legend items={applicationData} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <span className="text-gray-500 text-4xl">📊</span>
                            </div>
                            <p className="text-gray-500 text-center">
                                No applications yet.<br />
                                <span className="text-sm">Add your first application to see insights here.</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </ChartCard>

        <ChartCard title="Interview Insights">
            <div className="flex flex-col justify-between min-h-[280px]">
                {interviewData.length > 0 ? (
                    <>
                        <CustomBarChart data={interviewData} />
                        <Legend items={interviewData} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <p className="text-gray-500 text-center">
                            No interview insights yet.<br />
                            <span className="text-sm">Start adding interview entries to see insights here.</span>
                        </p>
                    </div>
                )}
            </div>
        </ChartCard>
        </div>

        {/* Activity + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Recent Activity">
            <div className="max-h-64 overflow-y-auto pr-2">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className={`flex items-center space-x-3 mb-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <span>{activity.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.date} <span className="ml-2">({activity.time})</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Upcoming Events">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500">No interviews scheduled.</p>
            ) : (
              <div className={upcomingEvents.length > 3 ? "max-h-64 overflow-y-auto pr-2" : ""}>
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className={`border-l-4 pl-4 py-3 mb-3 ${getEventColor(event.color)}`}>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      Scheduled: {event.date}{event.time ? ` at ${event.time}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{event.type}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Resume Performance */}
        <Card title="Resume Performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
            <PerformanceItem icon="📄" value={resumePerformance.resumeVersions} label="Resume Versions" />
            <PerformanceItem icon="📈" value={resumePerformance.interviewRate} label="Interview Rate" />
            <PerformanceItem icon="🔗" value={resumePerformance.linkedApplications} label="Linked Applications" />
          </div>
          
          {/* Resume Tags */}
          {resumePerformance.resumeTags && resumePerformance.resumeTags.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resume Versions:</h4>
              <div className="flex flex-wrap gap-2">
                {resumePerformance.resumeTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Reusable Components
const MetricCard = ({ title, value, icon, bg }) => {
  const bgClass = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50'
  }[bg];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Legend = ({ items }) => {
  return (
    <div className="space-y-2 mt-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-gray-600">{item.name}</span>
          </div>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const PerformanceItem = ({ icon, value, label }) => (
  <div>
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
      <span className="text-3xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

export default Dashboard;
