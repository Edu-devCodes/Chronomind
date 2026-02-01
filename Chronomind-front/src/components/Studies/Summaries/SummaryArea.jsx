import { useState } from "react";
import SummaryInput from "./SummaryInput";
import SavedSummaries from "./SavedSummaries";
import TaskSelector from "../Pomodoro/TaskSelector";

export default function SummaryArea({
  tasks = [],
  selectedTask,
  onSelectTask
}) {
  const [selectedSummary, setSelectedSummary] = useState(null);

  return (
    <div className="summary-area">
      <SummaryInput
        selectedSummary={selectedSummary}
        clearSelected={() => setSelectedSummary(null)}
      />

      <SavedSummaries onSelectSummary={setSelectedSummary} />
    </div>
  );
}

