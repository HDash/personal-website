import { basicData } from "../data/basic.js";

export default function Name() {
  const { bioName, nickname, title } = basicData;

  return (
    <div className="sm:space-y-5 space-y-2">
      <div className="lg:text-6xl sm:text-5xl text-3xl font-extrabold">
        <span>{bioName}</span>
        <span>&nbsp;({nickname})</span>
      </div>
      <div className="sm:text-2xl text-xl opacity-60 font-semibold">
        {title}
      </div>
    </div>
  );
}
