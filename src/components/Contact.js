import { basicData } from "../data/basic";
import Image from "next/image.js";

export default function Contact() {
  const { email } = basicData;
  return (
    <>
      <a
        href={`mailto:${email}`}
        className="flex flex-row items-center justify-center space-x-2 dark:bg-purple-950/75 dark:hover:bg-purple-900/75 bg-teal-100/75 hover:bg-teal-200/50 p-3 rounded-3xl"
      >
        <span>
          <Image
            className="dark:invert"
            src={`./envelope.svg`} // Path to the SVG in the public folder
            alt="Email Icon"
            width={17}
            height={17}
          />
        </span>
        <span className="font-bold text-lg">Contact Me</span>
      </a>
    </>
  );
}
