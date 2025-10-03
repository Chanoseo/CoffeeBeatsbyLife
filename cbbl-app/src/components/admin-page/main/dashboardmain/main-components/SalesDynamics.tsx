"use client";

import { faAngleDown, faBarChart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCallback, useEffect, useState } from "react";

function SalesDynamics() {
  const [data, setData] = useState<{ name: string; sales: number }[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchData = useCallback(async (selectedYear: number) => {
    const res = await fetch(`/api/salesdynamics?year=${selectedYear}`);
    const chartData = await res.json();
    setData(chartData);
  }, []);

  const fetchYears = useCallback(async () => {
    const res = await fetch("/api/salesdynamics/years");
    const years = await res.json();

    const currentYear = new Date().getFullYear();
    const filtered = years.filter((y: number) => y <= currentYear);

    setAvailableYears(filtered);
    if (!filtered.includes(year)) {
      setYear(currentYear);
    }
  }, [year]);

  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  return (
    <section className="dashboard-card relative">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          <h2 className="md:block hidden">Sales Dynamics</h2>
          <FontAwesomeIcon icon={faBarChart} />
        </div>

        {/* ✅ Year Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 cursor-pointer"
          >
            <p>{year}</p>
            <FontAwesomeIcon icon={faAngleDown} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded shadow-sm z-10 overflow-hidden">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1 text-left hover:bg-gray-100 ${
                    year === y ? "font-bold text-green-700" : ""
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-80 mt-4 overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#333", fontSize: 14 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#333", fontSize: 14 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
                        <p>{label}</p>
                        <p>Sales: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(60, 96, 76, 0.1)" }}
              />
              <Bar
                dataKey="sales"
                fill="#3C604C"
                barSize={10}
                radius={[15, 15, 15, 15]}
                background={{ fill: "rgba(60, 96, 76, 0.1)", radius: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default SalesDynamics;
