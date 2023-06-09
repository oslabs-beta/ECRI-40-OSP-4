import React, { FC } from 'react';
import './Dashboard.scss';

interface DashboardProps {
  url: string;
}

const Dashboard: FC<DashboardProps> = ({ url }) => {
  console.log('url dashboard', url);

  return (
    <div className="dashboard-container">
      <iframe src={url} className="dashboard"></iframe>
    </div>
  );
};

export default Dashboard;
