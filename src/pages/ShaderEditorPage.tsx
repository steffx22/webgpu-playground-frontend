import { ShaderEditor } from "../components/ShaderEditor";
import { TopNavigationBar } from "../components/TopNavigationBar";

// TODO: make this take creation name as argument 
export const ShaderEditorPage = (): JSX.Element => {
  return (
    <div style={{ display: "table", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopNavigationBar />
      <ShaderEditor shaderEditor={{isReported: false}} />
    </div>
  )
}