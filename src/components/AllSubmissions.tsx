import React, { ReactElement } from 'react';
import './AllSubmissions.css';
import { Gallery } from './Gallery';

export const AllSubmissions = (): ReactElement => {
  return  (
    <Gallery gallery={{isAccount: false, isAllSubmissions: true, isAllExamples: false, isReportedCreations: false}}/>
  );
}