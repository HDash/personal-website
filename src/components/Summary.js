import { basicData } from "../data/basic";
import Subheading from "./helpers/Subheading";

export default function Summary() {
  const { summary } = basicData;

  return (
    <div>
      {/* <Subheading text="Profile Summary" /> */}
      <div className="opacity-90">
        {summary}
      </div>
    </div>
  );
}