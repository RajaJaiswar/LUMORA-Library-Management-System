import React from 'react';
import { BookCatalogue } from '../../components/books/BookCatalogue';

export const AdminBooksPage: React.FC = () => {
  return (
    <BookCatalogue
      title="Book Management"
      subtitle="Complete institutional book repository and stock records (Read-Only Catalogue)."
      roleBadge="Admin Catalogue"
      badgeTone="indigo"
    />
  );
};

export default AdminBooksPage;
