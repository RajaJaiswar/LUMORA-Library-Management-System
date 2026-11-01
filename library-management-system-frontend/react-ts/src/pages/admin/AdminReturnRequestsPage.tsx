import React from 'react';
import { ReturnRequestsQueue } from '../../components/circulation/ReturnRequestsQueue';

export const AdminReturnRequestsPage: React.FC = () => {
  return <ReturnRequestsQueue role="ADMIN" />;
};

export default AdminReturnRequestsPage;

