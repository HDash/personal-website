import { experienceData } from "../data/experience";
import Subheading from "./helpers/Subheading";

export default function Experience() {
  return (
    <div>
      <Subheading text="Experience" />
      <div className="opacity-90">
        {experienceData.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="text-sm font-bold opacity-80">{item.company}</div>
            <div className="text-sm opacity-80">{item.location}</div>
            <div className="text-sm opacity-80">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}