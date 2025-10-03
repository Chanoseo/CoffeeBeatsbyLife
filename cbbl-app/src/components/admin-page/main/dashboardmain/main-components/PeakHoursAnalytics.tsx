"use client";

import { useEffect, useState } from "react";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PearHoursAnalytics() {
  const [data, setData] = useState<{ hour: string; customers: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/peakhours?date=${selectedDate}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    fetchData();
  }, [selectedDate]);

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          <h2 className="md:block hidden">Peak Hours Analytics</h2>
          <FontAwesomeIcon icon={faClock} />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="w-full h-80 mt-4 overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                tick={{ fill: "#333", fontSize: 12 }}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#333", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, Math.max(...data.map((d) => d.customers), 1)]} // ensures proper scaling
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
                        <p>{label}</p>
                        <p>customers: {Math.round(payload[0].value)}</p>{" "}
                        {/* ✅ rounded in tooltip */}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(60, 96, 76, 0.1)" }}
              />
              <Bar
                dataKey="customers"
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

export default PearHoursAnalytics;
