import React, { ReactElement } from 'react';
import { Gallery } from './Gallery';

export const AllExamples = (): ReactElement => {
  return  (
    <Gallery gallery={{isAccount: false, isAllSubmissions: false, isAllExamples: true, isReportedCreations: false}}/>
  );
}