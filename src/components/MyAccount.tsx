import React, { ReactElement } from 'react';
import './MyAccount.css';
import { Gallery } from './Gallery';

export const MyAccount = (): ReactElement => {
  return  (
    <Gallery gallery={{isAccount: true, isAllSubmissions: false, isAllExamples: false, isReportedCreations: false}}/>
  );
}