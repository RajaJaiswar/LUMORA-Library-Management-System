import React from 'react';
import { BorrowRequestsQueue } from '../../components/circulation/BorrowRequestsQueue';

export const AdminBorrowRequestsPage: React.FC = () => {
  return <BorrowRequestsQueue role="ADMIN" />;
};

export default AdminBorrowRequestsPage;
