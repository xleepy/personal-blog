import { readFile } from "@/utilts/fileUtils";
import Code from "../code/Code";

const TimerSnippet = async () => {
  const file = await readFile("src/components/pomodoro-challenge/Timer.tsx");
  return <Code lang="js">{file}</Code>;
};

export default TimerSnippet;
