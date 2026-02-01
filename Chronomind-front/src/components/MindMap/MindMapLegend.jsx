import React from "react";
import {
  Target,
  Zap,
  CheckSquare,
  Lightbulb
} from "lucide-react";

export default function MindMapLegend() {
  return (
    <div className="mindmap-legend">

      <h3>Legenda</h3>

      <ul>

        <li>
          <Target className="icon goal" />
          Meta
        </li>

        <li>
          <Zap className="icon habit" />
          Hábito
        </li>

        <li>
          <CheckSquare className="icon task" />
          Task
        </li>

        <li>
          <Lightbulb className="icon idea" />
          Ideia
        </li>

      </ul>

    </div>
  );
}
