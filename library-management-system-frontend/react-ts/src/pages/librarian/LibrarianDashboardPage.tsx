import React from 'react';
import { StaffDashboard } from '../../components/dashboard/StaffDashboard';

export const LibrarianDashboardPage: React.FC = () => {
  return <StaffDashboard role="LIBRARIAN" />;
};

export default LibrarianDashboardPage;
