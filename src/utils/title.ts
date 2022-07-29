import { useEffect, useRef } from "react"


export default function useTitle(title: string, prevailOnMount = false) {
  const defaultTitle = useRef("WebGPU Playground")
  
  useEffect(() => {
    document.title = `${title} | ${defaultTitle.current}`
  }, [title]);

  useEffect(() => () => {
    if (!prevailOnMount) {
      document.title = defaultTitle.current;
    }
  }, [prevailOnMount])
}