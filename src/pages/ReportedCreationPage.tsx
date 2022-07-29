import { ShaderEditor } from "../components/ShaderEditor";
import { TopNavigationBar } from "../components/TopNavigationBar";

export const ReportedCreationPage = (): JSX.Element => {
  return (
    <div style={{ display: "table", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopNavigationBar />
      <ShaderEditor shaderEditor={{isReported: true}} />
    </div>
  )
}