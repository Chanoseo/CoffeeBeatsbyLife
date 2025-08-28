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

const data = [
  { name: "Jan", sales: 10000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 2000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
  { name: "Aug", sales: 3200 },
  { name: "Sep", sales: 3100 },
  { name: "Oct", sales: 2800 },
  { name: "Nov", sales: 7500 },
  { name: "Dec", sales: 3500 },
];

function SalesDynamics() {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          <h2 className="md:block hidden">Sales Dynamics</h2>
          <FontAwesomeIcon icon={faBarChart} />
        </div>
        <button className="flex items-center gap-1 cursor-pointer">
          <p>2025</p>
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>

      {/* Chart Container */}
      <div className="w-full h-80 mt-4 overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
