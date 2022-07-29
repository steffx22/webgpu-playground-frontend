import { AllSubmissions } from "../components/AllSubmissions";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const AllSubmissionsPage = (): JSX.Element => {
  useTitle('Submissions');
  
  return (
    <div>
      <TopNavigationBar />
      <div className="navbar-brand" style={{paddingTop: '1em', paddingBottom: '1em', paddingLeft: '5%', textAlign: "left", fontSize: '30px', color: "white"}}>
          All submissions
      </div>
      <AllSubmissions />
    </div>
  )
}