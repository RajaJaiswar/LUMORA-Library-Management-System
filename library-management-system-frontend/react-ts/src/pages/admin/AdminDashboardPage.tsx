import React from 'react';
import { StaffDashboard } from '../../components/dashboard/StaffDashboard';

export const AdminDashboardPage: React.FC = () => {
  return <StaffDashboard role="ADMIN" />;
};

export default AdminDashboardPage;
