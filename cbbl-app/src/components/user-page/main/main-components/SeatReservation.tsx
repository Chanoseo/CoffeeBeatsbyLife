import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  selectedSeat: string | null;
  setSelectedSeat: (seat: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
}

function SeatReservation({
  selectedSeat,
  setSelectedSeat,
  selectedTime,
  setSelectedTime,
}: Props) {
  const seats = [
    "Window Table 1",
    "Window Table 2",
    "Booth Area",
    "Counter Seat 5",
    "Table for 2 (A)",
    "Meow",
  ];

  const reservedSeats = ["Booth Area", "Table for 2 (A)"];

  const timeOptions = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
    "11:00 PM",
  ];

  const now = new Date();

  return (
    <div className="mt-6 max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Select Your Preferable Seat
      </h1>

      {/* Seat Status */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-white border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500 border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-500 border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Reserved</span>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {seats.map((seat) => {
          const isReserved = reservedSeats.includes(seat);
          const isSelected = selectedSeat === seat;

          return (
            <div
              key={seat}
              className={`flex flex-col items-center p-4 rounded-xl border
                ${
                  isReserved
                    ? "bg-red-100 text-red-600 cursor-not-allowed opacity-70"
                    : ""
                }
                ${isSelected ? "bg-green-500 text-white" : ""}
                ${
                  !isReserved && !isSelected
                    ? "bg-white text-gray-800 hover:bg-green-50 cursor-pointer"
                    : ""
                }
              `}
              onClick={() => !isReserved && setSelectedSeat(seat)}
            >
              <FontAwesomeIcon icon={faUser} size="2x" />
              <p className="mt-2 text-sm text-center">{seat}</p>
            </div>
          );
        })}
      </div>

      {/* Time Selection */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <h1 className="text-lg font-semibold mb-2 sm:mb-0 text-gray-700">
          Select Time:
        </h1>
        <select
          value={selectedTime ?? ""}
          onChange={(e) => {
            const isoStr = e.target.value;
            if (!isoStr) {
              setSelectedTime(null);
              return;
            }
            setSelectedTime(isoStr);
          }}
          className="border border-gray-300 rounded-lg p-2 outline-none bg-white text-gray-800"
        >
          <option value="">-- Select Time --</option>
          {timeOptions.map((time) => {
            const [timePart, modifier] = time.split(" ");
            const [hourStr, minuteStr] = timePart.split(":");
            let hours = Number(hourStr);
            const minutes = Number(minuteStr);

            if (modifier === "PM" && hours < 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            const timeDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              hours,
              minutes
            );

            const isoTime = timeDate.toISOString();
            const isPast = timeDate < now; // ✅ disable if in the past

            return (
              <option key={time} value={isoTime} disabled={isPast}>
                {time} {isPast ? "(Past)" : ""}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

export default SeatReservation;
