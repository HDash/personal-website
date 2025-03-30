import { educationData } from "../data/education";
import Subheading from "./helpers/Subheading";

export default function Education() {
  return (
    <div>
      <Subheading text="Education" />
      <div className="flex flex-col gap-5">
        {educationData.map((edu, index) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row sm:flex-row gap-3"
          >
            <div className="flex flex-col">
              <div className="text-lg font-semibold">{edu.degree}</div>
              <div className="text-sm font-bold opacity-90 mb-1">{edu.institution}</div>
              <div className="text-sm opacity-80">{edu.location}</div>
              <div className="text-sm opacity-80">{edu.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}