import Socials from "../components/Socials.js";
import Name from "../components/Name.js";
import Summary from "../components/Summary.js";
import Skills from "../components/Skills.js";
import Experience from "../components/Experience.js";
import Education from "../components/Education.js";
import Contact from "../components/Contact.js";
import UseThis from "../components/UseThis.js";
import NotableProjects from "../components/NotableProjects.js";
import Publications from "../components/Publications.js";

export default function Home() {
  return (
    <div className="lg:p-30 sm:p-10 p-8 lg:space-y-10 sm:space-y-8 space-y-6 min-w-80 dark:text-white bg-gradient-to-br dark:from-black dark:from-30% dark:to-purple-950 from-white to-teal-100/65">
      <Name />
      <Socials />
      <Summary />
      <Skills />
      <div className="grid lg:grid-cols-2 gap-5">
        <Experience />
        <Education />
      </div>
      <Publications />
      <NotableProjects />

      <hr className="opacity-10"/>
      <div className="space-y-5">
      <Contact />
      <UseThis /> {/* Remove this line to get rid of the "use this template" */}
      </div>
    </div>
  );
}
