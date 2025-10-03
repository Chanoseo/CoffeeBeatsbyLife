"use client";

import { useEffect, useState } from "react";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ReservationTrends() {
  const [data, setData] = useState<
    { month: string; current: number; previous: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reservation-trends");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching reservation trends:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          <h2 className="md:block hidden">Reservation Trends</h2>
          <FontAwesomeIcon icon={faCalendarCheck} />
        </div>
      </div>
      <div className="w-full h-80 mt-4 overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#333", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#333", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm text-sm">
                        <p className="font-semibold">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(60, 96, 76, 0.1)" }}
              />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={10} />
              <Line
                type="monotone"
                dataKey="current"
                name="Current Year"
                stroke="#3C604C"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name="Previous Year"
                stroke="#FF8C42"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default ReservationTrends;
