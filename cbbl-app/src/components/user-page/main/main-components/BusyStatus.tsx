import { useState } from "react";
import { faCircleExclamation, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function BusyStatus() {
  const [visible, setVisible] = useState(true); // control visibility

  if (!visible) return null; // hide component when not visible

  return (
    <div className="w-full p-6 z-50 bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-yellow-500 text-xl"
          />
          <h2 className="text-xl font-semibold text-gray-800">
            Cafe Status Update
          </h2>
        </div>
        {/* Close button */}
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setVisible(false)} // hide notification
        >
          <FontAwesomeIcon icon={faX} />
        </button>
      </div>

      {/* Message */}
      <p className="text-gray-700 text-base leading-relaxed">
        The cafe is currently experiencing high volume. Please expect longer
        wait times for your orders. We appreciate your patience!
      </p>
    </div>
  );
}

export default BusyStatus;
