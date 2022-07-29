import { Gallery } from "../components/Gallery";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const ReportedCreationsPage = (): JSX.Element => {
  useTitle('Reported Creations');
  
  return (
    <div>
      <TopNavigationBar />
      <Gallery gallery={{isAccount: false, isAllSubmissions: false, isAllExamples: false, isReportedCreations: true}}/>
    </div>
  )
}