import { Check, Circle } from "lucide-react";

export default function ProgressChecklist() {
  const steps = [
    { label: "Complete business profile", done: true },
    { label: "Add your first product", done: true },
    { label: "Upload photos", done: false },
    { label: "Set up delivery options", done: false },
    { label: "Create your first tour", done: false },
    { label: "Get verified", done: false },
  ];

  const completed = steps.filter((s) => s.done).length;
  const progress = (completed / steps.length) * 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Getting Started</h3>
        <span className="text-sm text-gray-600">
          {completed}/{steps.length} complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {step.done ? (
              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            ) : (
              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                step.done ? "text-gray-500 line-through" : "text-gray-900"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {progress < 100 && (
        <button className="w-full mt-6 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-sm font-medium">
          Continue Setup
        </button>
      )}
    </div>
  );
}
