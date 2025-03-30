import Socials from "@/components/Socials.js";
import Name from "../components/Name.js";
import Summary from "@/components/Summary.js";
import Skills from "@/components/Skills.js";
import Experience from "@/components/Experience.js";
import Education from "@/components/Education.js";

export default function Home() {
  return (
    <div className="lg:p-30 sm:p-10 p-8 lg:space-y-10 sm:space-y-8 space-y-6 min-w-80 dark:text-white bg-gradient-to-br dark:from-black dark:from-30% dark:to-purple-950 from-white to-cyan-50">
      <Name />
      <Socials />
      <Summary />
      <Skills />
      <Experience />
      <Education />
    </div>
  );
}
