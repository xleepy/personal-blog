import { readFile } from "@/utilts/fileUtils";
import Code from "../code/Code";

const HolidaysSnippet = async () => {
  const file = await readFile("src/components/holidays/Holidays.tsx");
  return <Code lang="js">{file}</Code>;
};

export default HolidaysSnippet;
