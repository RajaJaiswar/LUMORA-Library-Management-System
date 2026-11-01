import React from 'react';
import { BookCatalogue } from '../../components/books/BookCatalogue';

export const LibrarianCataloguePage: React.FC = () => {
  return (
    <BookCatalogue
      title="Book Catalogue"
      subtitle="Inspect catalogued titles, ISBNs, and stock copy levels."
      roleBadge="Librarian Catalogue"
      badgeTone="purple"
    />
  );
};

export default LibrarianCataloguePage;
