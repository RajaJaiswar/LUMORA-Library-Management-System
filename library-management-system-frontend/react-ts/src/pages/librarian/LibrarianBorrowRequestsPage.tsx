import React from 'react';
import { BorrowRequestsQueue } from '../../components/circulation/BorrowRequestsQueue';

export const LibrarianBorrowRequestsPage: React.FC = () => {
  return <BorrowRequestsQueue role="LIBRARIAN" />;
};

export default LibrarianBorrowRequestsPage;
