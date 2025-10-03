"use client";

import {
  faCalendarCheck,
  faClipboardList,
  faDollarSign,
  faStar,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface Metrics {
  totalOrders: number;
  avgRating: number;
  reviewsCount: number;
  totalRevenue: number;
  reservationCount: number;
  growth: {
    orders: number;
    revenue: number;
    reservations: number;
  };
}

function GrowthText({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 font-medium ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      <FontAwesomeIcon
        icon={isPositive ? faArrowUp : faArrowDown}
        className="text-sm"
      />
      {`${Math.abs(value).toFixed(1)}%`}
      <span className="text-gray-500 text-sm font-normal">last month</span>
    </span>
  );
}

function KeyMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/keymetrics");
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error loading metrics:", err);
        setMetrics({
          totalOrders: 0,
          avgRating: 0,
          reviewsCount: 0,
          totalRevenue: 0,
          reservationCount: 0,
          growth: { orders: 0, revenue: 0, reservations: 0 },
        });
      }
    }
    fetchMetrics();
  }, []);

  if (!metrics) return <p>Loading metrics...</p>;

  return (
    <section className="mt-6">
      <div className="md:flex-row flex flex-col gap-4">
        {/* Orders */}
        <div className="keymetrics-card">
          <div className="keymetrics-card-header">
            <h1>Orders</h1>
            <FontAwesomeIcon
              icon={faClipboardList}
              className="md:text-2xl text-lg"
            />
          </div>
          <p className="keymetrics-card-content">{metrics.totalOrders ?? 0}</p>
          <p className="keymetrics-card-footer">
            <GrowthText value={metrics.growth.orders} />
          </p>
        </div>

        {/* Average Rating */}
        <div className="keymetrics-card">
          <div className="keymetrics-card-header">
            <h1>Average Rating</h1>
            <FontAwesomeIcon icon={faStar} className="md:text-2xl text-lg" />
          </div>
          <p className="keymetrics-card-content">
            {metrics.avgRating?.toFixed(1) ?? "0.0"}
          </p>
          <p className="keymetrics-card-footer">
            from {metrics.reviewsCount ?? 0} customer reviews
          </p>
        </div>

        {/* Revenue */}
        <div className="keymetrics-card">
          <div className="keymetrics-card-header">
            <h1>Revenue</h1>
            <FontAwesomeIcon
              icon={faDollarSign}
              className="md:text-2xl text-lg"
            />
          </div>
          <p className="keymetrics-card-content">
            ₱{(metrics.totalRevenue ?? 0).toLocaleString()}
          </p>
          <p className="keymetrics-card-footer">
            <GrowthText value={metrics.growth.revenue} />
          </p>
        </div>

        {/* Reservation */}
        <div className="keymetrics-card">
          <div className="keymetrics-card-header">
            <h1>Reservation</h1>
            <FontAwesomeIcon
              icon={faCalendarCheck}
              className="md:text-2xl text-lg"
            />
          </div>
          <p className="keymetrics-card-content">
            {metrics.reservationCount ?? 0}
          </p>
          <p className="keymetrics-card-footer">
            <GrowthText value={metrics.growth.reservations} />
          </p>
        </div>
      </div>
    </section>
  );
}

export default KeyMetrics;
