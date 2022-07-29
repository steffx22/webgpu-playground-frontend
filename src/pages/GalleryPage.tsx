import { Gallery } from "../components/Gallery";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const GalleryPage = (): JSX.Element => {
  useTitle('Gallery');
  
  return (
    <div>
      <TopNavigationBar />
      <Gallery gallery={{isAccount: false, isAllSubmissions: false, isAllExamples: false, isReportedCreations: false}}/>
    </div>
  )
}