import React from 'react';
import { CirculationRegister } from '../../components/circulation/CirculationRegister';

export const AdminCirculationPage: React.FC = () => {
  return <CirculationRegister role="ADMIN" />;
};

export default AdminCirculationPage;

