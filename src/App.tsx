import './App.css';
import { ShaderEditorPage } from "./pages/ShaderEditorPage";
import { MyAccountPage } from "./pages/MyAccountPage";
import { ReportedCreationsPage } from "./pages/ReportedCreationsPage";
import { ReportedCreationPage } from "./pages/ReportedCreationPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { GalleryPage } from './pages/GalleryPage';
import { AllSubmissionsPage } from './pages/AllSubmissionsPage';
import { MySubmissionsPage } from './pages/MySubmissionsPage';
import { AllExamplesPage } from './pages/AllExamplesPage';

export const endpoint = "https://webgpu-backend.herokuapp.com/"
export const userKey = "user-uid"
export const userName = "user-name"
export const admin = "admin"
export const reason = "reason"

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/reportedcreations" exact component={() => <ReportedCreationsPage />} />
          <Route path="/reportedcreation/:ownerId?/:name?" exact component={() => <ReportedCreationPage/>}/>
          <Route path="/editshader/:isSubmission?/:ownerId?/:name?" exact component={() => <ShaderEditorPage />} />
          <Route path="/" exact component={() => <GalleryPage />}/>
          <Route path="/myaccount" exact component={() => <MyAccountPage />}/>
          <Route path="/mysubmissions" exact component={() => <MySubmissionsPage />}/>
          <Route path="/allsubmissions" exact component={() => <AllSubmissionsPage />}/>
          <Route path="/allexamples" exact component={() => <AllExamplesPage />}/>
        </Switch>
      </Router> 
    </div>
  );
}

export default App;
