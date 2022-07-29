import { MySubmissions } from "../components/MySubmissions";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const MySubmissionsPage = (): JSX.Element => {
  useTitle('My submissions');
  
  return (
    <div>
      <TopNavigationBar />
      <div className="navbar-brand" style={{paddingTop: '1em', paddingBottom: '1em', paddingLeft: '5%', textAlign: "left", fontSize: '30px', color: "white"}}>
          My submissions
      </div>
      <MySubmissions />
    </div>
  )
}