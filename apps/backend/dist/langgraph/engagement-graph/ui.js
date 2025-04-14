"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/backend/src/langgraph/engagement-graph/ui.tsx
const react_1 = require("react");
// import "./styles.css"; // optional, if you want local style overrides or tailwind imports
// Toggle for sponsor goals with design tokens
const SponsorGoalToggle = (props) => {
    const [current, setCurrent] = (0, react_1.useState)(props.defaultValue || props.options[0]?.value);
    return (<div className="flex flex-col space-y-2">
      <div className="text-md font-semibold text-text-primary">{props.title}</div>
      <div className="flex space-x-2">
        {props.options.map((opt) => (<button key={opt.value} onClick={() => {
                setCurrent(opt.value);
                props.onChange?.(opt.value);
            }} className={`px-4 py-2 rounded-md transition-colors
              ${current === opt.value
                ? "bg-brand-primary text-text-primary"
                : "bg-bg-surface text-text-secondary"}`}>
            {opt.label}
          </button>))}
      </div>
    </div>);
};
// A horizontal carousel for potential use cases
const UseCaseCarousel = (props) => {
    const [index, setIndex] = (0, react_1.useState)(0);
    const handlePrev = () => setIndex((prev) => (prev > 0 ? prev - 1 : props.useCases.length - 1));
    const handleNext = () => setIndex((prev) => (prev < props.useCases.length - 1 ? prev + 1 : 0));
    const currentItem = props.useCases[index];
    return (<div className="flex items-center space-x-3">
      <button onClick={handlePrev} className="text-md bg-brand-primary text-text-primary px-2 py-1 rounded">
        ◀
      </button>
      <div className="flex flex-col p-4 bg-bg-surface rounded-md min-w-[12rem]">
        <div className="text-lg font-bold text-text-primary">{currentItem.title}</div>
        <div className="text-sm text-text-secondary mt-1">
          {currentItem.description}
        </div>
      </div>
      <button onClick={handleNext} className="text-md bg-brand-primary text-text-primary px-2 py-1 rounded">
        ▶
      </button>
    </div>);
};
// The main form combining the sponsor toggles + carousel
const SponsorEngagementForm = (props) => {
    const [goal, setGoal] = (0, react_1.useState)(props.sponsorType || "poc");
    return (<div className="space-y-4 p-3 bg-bg-main text-text-primary rounded-md">
      <SponsorGoalToggle title="I want:" options={[
            { label: "Proof of Concepts Developed", value: "poc" },
            { label: "Developers to use my Tool", value: "tool" },
        ]} defaultValue={goal} onChange={(val) => setGoal(val)}/>

      <UseCaseCarousel useCases={props.useCases}/>

      <div className="text-sm mt-2">
        Currently selected goal:{" "}
        <span className="font-semibold">
          {goal === "poc" ? "Proof of Concepts" : "Tool Adoption"}
        </span>
      </div>
    </div>);
};
// Export the component map for LangGraph UI usage
exports.default = {
    sponsorForm: SponsorEngagementForm,
};
