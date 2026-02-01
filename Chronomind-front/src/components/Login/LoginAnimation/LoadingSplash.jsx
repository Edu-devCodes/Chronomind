import { useEffect, useState } from "react";
import frame1 from "../../../assets/logo.jpg";
import frame2 from "../../../assets/logo2.png";
import frame3 from "../../../assets/logo.jpg";
import "./splash.css";

export default function LoadingSplash({ onFinish }) {
  const frames = [frame1, frame2, frame3];
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // alternar imagens a cada 350ms
    const anim = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 350);

    // esconder splash depois de 5s
    const timer = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish(); // avisa o pai que terminou
    }, 3000);

    return () => {
      clearInterval(anim);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fire-screen">
      <img src={frames[index]} className="fire-logo" alt="ChronoMind" />

      <div className="fire-rain">
        {[...Array(250)].map((_, i) => {
          const style = {
            "--rand-x": Math.random(),
            "--rand-y": Math.random(),
            "--speed": `${0.7 + Math.random() * 1.5}s`,
          };
          return <div key={i} className="spark" style={style} />;
        })}
      </div>
    </div>
  );
}
