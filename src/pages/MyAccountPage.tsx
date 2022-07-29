import { MyAccount } from "../components/MyAccount";
import { TopNavigationBar } from "../components/TopNavigationBar";
import useTitle from "../utils/title";

export const MyAccountPage = (): JSX.Element => {
  useTitle('My Account');
  
  return (
    <div>
      <TopNavigationBar />
      <MyAccount/>
    </div>
  )
}