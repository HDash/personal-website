import Image from "next/image.js";
import { basicData } from "../data/basic.js";

export default function Socials() {
  const { links } = basicData;
  const { linkedin, github, orcid } = links;

  const socialElement = (icon, text, link) => {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 hover:opacity-50 opacity-90 flex flex-row items-center space-x-2 dark:text-white"
      >
        <Image
          className="dark:invert"
          src={`/${icon}.svg`} // Path to the SVG in the public folder
          alt={icon}
          width={17}
          height={17}
        />
        <span className="font-semibold">{text}</span>
      </a>
    );
  };

  return (
    <div className="flex flex-row space-x-5">
      {socialElement("linkedin", "LinkedIn", linkedin)}
      {socialElement("github", "GitHub", github)}
      {socialElement("orcid", "ORCID", orcid)}
    </div>
  );
}
