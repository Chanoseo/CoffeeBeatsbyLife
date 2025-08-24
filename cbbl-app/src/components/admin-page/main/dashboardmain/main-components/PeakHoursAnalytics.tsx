"use client";

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
  const data = [
    { hour: "7 AM", sales: 500 },
    { hour: "8 AM", sales: 800 },
    { hour: "9 AM", sales: 1200 },
    { hour: "10 AM", sales: 1500 },
    { hour: "11 AM", sales: 1800 },
    { hour: "12 PM", sales: 2200 },
    { hour: "1 PM", sales: 2000 },
    { hour: "2 PM", sales: 1900 },
    { hour: "3 PM", sales: 2100 },
    { hour: "4 PM", sales: 2300 },
    { hour: "5 PM", sales: 2500 },
    { hour: "6 PM", sales: 2700 },
    { hour: "7 PM", sales: 3000 },
    { hour: "8 PM", sales: 3200 },
    { hour: "9 PM", sales: 3100 },
    { hour: "10 PM", sales: 2800 },
    { hour: "11 PM", sales: 2600 },
    { hour: "12 AM", sales: 2400 },
  ];

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          <h2>Peak Hours Analytics</h2>
          <FontAwesomeIcon icon={faClock} />
        </div>
        <p>Today</p>
      </div>
      <div className="w-full h-74 mt-4">
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
    </section>
  );
}
export default PearHoursAnalytics;
