import React from 'react';
import { BookCatalogue } from '../../components/books/BookCatalogue';

export const MemberBooksPage: React.FC = () => {
  return (
    <BookCatalogue
      title="Book Catalogue"
      subtitle="Search and browse books available in the library collection."
      roleBadge="Member Catalogue"
      badgeTone="blue"
    />
  );
};

export default MemberBooksPage;
