import { AllExamples } from "../components/AllExamples";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const AllExamplesPage = (): JSX.Element => {
  useTitle('Examples');
  
  return (
    <div>
      <TopNavigationBar />
      <div className="navbar-brand" style={{paddingTop: '1em', paddingBottom: '1em', paddingLeft: '5%', textAlign: "left", fontSize: '30px', color: "white"}}>
          All examples
      </div>
      <AllExamples />
    </div>
  )
}