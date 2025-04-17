import { projectsData } from "../data/projects";
import Subheading from "./helpers/Subheading";

export default function NotableProjects() {
  return (
    <div>
      <Subheading text="Notable Projects" />
      <div className="grid lg:grid-cols-2 gap-5">
        {projectsData.map((project, index) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row sm:flex-row gap-3"
          >
            <div className="flex flex-col">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  className="text-lg font-bold opacity-90 mb-1 flex items-center hover:opacity-60"
                >
                  <span>{project.name}</span>
                  <span className="text-xs opacity-30 ml-1"> →</span>
                </a>
              ) : (
                <div className="text-lg font-bold">{project.name}</div>
              )}
              <div className="text-sm opacity-80">{project.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
