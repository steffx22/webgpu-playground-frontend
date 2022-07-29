import React, { ReactElement } from 'react';
import { Gallery } from './Gallery';

export const MySubmissions = (): ReactElement => {
  return  (
    <Gallery gallery={{isAccount: true, isAllSubmissions: true, isAllExamples: false, isReportedCreations: false}}/>
  );
}