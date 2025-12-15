import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  LuActivity,
  LuChartBar,
  LuListChecks,
  LuRefreshCw,
  LuSave,
  LuSparkles,
  LuUsers,
} from "react-icons/lu";
import { FaChartLine } from "react-icons/fa";

import { toast } from "react-toastify";
import { fetchBlogs } from "../features/blogs/blogSlice";
import { fetchServices } from "../features/services/serviceSlice";
import api from "../api/axios";

const Dashboard = () => {
  const dispatch = useDispatch();
  const blogCount = useSelector((state) => state.blogs.items.length);
  const serviceCount = useSelector((state) => state.services.items.length);
  const userDetails = useSelector((state) => state.auth.user);
  const [counts, setCounts] = useState({ members: 0, cities: 0 });
  const [countForm, setCountForm] = useState({ members: "", cities: "" });
  const [isSavingCounts, setIsSavingCounts] = useState(false);
  const [analytics, setAnalytics] = useState({
    totals: { pageViews: 0, uniqueVisitors: 0 },
    today: { pageViews: 0, uniqueVisitors: 0, date: "" },
    lastUpdated: null,
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isPingingVisit, setIsPingingVisit] = useState(false);
  const isAdmin = useMemo(
    () =>
      userDetails?.role
        ? ["superadmin","admin"].includes(
            userDetails.role.toLowerCase()
          )
        : false,
    [userDetails]
  );

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await api.get("/cities");
        setCounts({
          members: response.data?.members || 0,
          cities: response.data?.cities || 0,
        });
        setCountForm({
          members: String(response.data?.members ?? ""),
          cities: String(response.data?.cities ?? ""),
        });
      } catch (_err) {
        // silent fail; counts remain zero
      }
    };
    loadCounts();
  }, []);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const { data } = await api.get("/analytics/daily");
      const days = data?.days || [];
      const lastDay = days[days.length - 1] || {};
      setAnalytics({
        totals: data?.totals || { pageViews: 0, uniqueVisitors: 0 },
        today: {
          date: lastDay.date || "",
          pageViews: lastDay.pageViews || 0,
          uniqueVisitors: lastDay.uniqueVisitors || 0,
        },
        lastUpdated: lastDay.updatedAt || null,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    setCountForm({
      members: String(counts.members ?? ""),
      cities: String(counts.cities ?? ""),
    });
  }, [counts]);

  const cards = [
    { label: "Active Blogs", value: blogCount, icon: <LuListChecks /> },
    {
      label: "Total Services Available",
      value: serviceCount,
      icon: <LuSparkles />,
    },
    { label: "Members Reached", value: counts.members, icon: <LuUsers /> },
    { label: "Cities Covered", value: counts.cities, icon: <LuSparkles /> },
    { label: "Engagement", value: "68%", icon: <LuChartBar /> },
  ];

  const handleCountSave = async () => {
    const payload = {};
    if (countForm.members !== "") {
      payload.members = Number(countForm.members);
    }
    if (countForm.cities !== "") {
      payload.cities = Number(countForm.cities);
    }

    if (Object.keys(payload).length === 0) {
      toast.error("Enter a value to update");
      return;
    }

    if (Number.isNaN(payload.members) || Number.isNaN(payload.cities)) {
      toast.error("Counts must be numbers");
      return;
    }

    setIsSavingCounts(true);
    try {
      const response = await api.patch("/cities", payload);
      setCounts({
        members: response.data?.members || 0,
        cities: response.data?.cities || 0,
      });
      toast.success("Counts updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update counts");
    } finally {
      setIsSavingCounts(false);
    }
  };

  const handlePingVisit = async () => {
    setIsPingingVisit(true);
    try {
      await api.post("/analytics/track");
      toast.success("Visit recorded");
      await loadAnalytics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record visit");
    } finally {
      setIsPingingVisit(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Admin Dashboard</h2>
          <p className="muted">
            Track platform health, content output, and service performance.
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="card-actions" style={{ marginBottom: "1.5rem" }}>
          <Link className="primary-button" to="/users/new">
            <LuUsers size={16} />
            Create user
          </Link>
          <Link className="ghost-button ghost-button--solid" to="/users">
            Manage users
          </Link>
        </div>
      )}
      {isAdmin && (
        <div className="stacked-form" style={{ marginBottom: "1rem" }}>
          <div className="page-header" style={{ padding: 0 }}>
            <div>
              <p className="eyebrow">Public stats</p>
              <h3 style={{ margin: "4px 0" }}>Update counters for Countdown</h3>
              <p className="muted" style={{color:"red"}}>*Make sure values will only increase. Lower numbers are ignored by the API.</p>
            </div>
          </div>
          <div className="grid two-col">
            <label className="form-field">
              <span>Members reached</span>
              <input
                type="number"
                min={counts.members}
                value={countForm.members}
                onChange={(e) => setCountForm((prev) => ({ ...prev, members: e.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>Cities covered</span>
              <input
                type="number"
                min={counts.cities}
                value={countForm.cities}
                onChange={(e) => setCountForm((prev) => ({ ...prev, cities: e.target.value }))}
              />
            </label>
          </div>
          <div className="form-actions" style={{ justifyContent: "flex-end" }}>
            <button className="primary-button" type="button" onClick={handleCountSave} disabled={isSavingCounts}>
              {isSavingCounts ? <span className="spinner" /> : <LuSave size={16} />}
              {isSavingCounts ? "Saving..." : "Save counts"}
            </button>
          </div>
        </div>
      )}
      <div className="grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <p className="muted">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine  /></div>
          <p className="muted">Page views (30d)</p>
          <p className="stat-value">
            {isLoadingAnalytics ? <span className="spinner" /> : analytics.totals.pageViews}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><LuActivity /></div>
          <p className="muted">Unique visitors (30d)</p>
          <p className="stat-value">
            {isLoadingAnalytics ? <span className="spinner" /> : analytics.totals.uniqueVisitors}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><LuChartBar /></div>
          <p className="muted">Today&apos;s views</p>
          <p className="stat-value">
            {isLoadingAnalytics ? <span className="spinner" /> : analytics.today.pageViews}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><LuUsers /></div>
          <p className="muted">Today&apos;s uniques</p>
          <p className="stat-value">
            {isLoadingAnalytics ? <span className="spinner" /> : analytics.today.uniqueVisitors}
          </p>
        </div>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">Visitor analytics</p>
            <h3 style={{ margin: "4px 0" }}>Record and refresh</h3>
            {/* <p className="muted">
              Mirrors the backend endpoints: POST /api/analytics/track and GET /api/analytics/daily.
            </p> */}
          </div>
          <div className="card-actions" style={{ gap: "0.5rem" }}>
            <button
              className="ghost-button ghost-button--solid"
              type="button"
              onClick={loadAnalytics}
              disabled={isLoadingAnalytics}
            >
              {isLoadingAnalytics ? <span className="spinner" /> : <LuRefreshCw size={16} />}
              Refresh stats
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={handlePingVisit}
              disabled={isPingingVisit}
            >
              {isPingingVisit ? <span className="spinner" /> : <LuActivity size={16} />}
              {isPingingVisit ? "Recording..." : "Record page view"}
            </button>
          </div>
        </div>
        <div className="grid two-col" style={{ marginTop: "1rem" }}>
          <div>
            <p className="muted">Last day tracked</p>
            <p className="stat-value" style={{ fontSize: "1.4rem" }}>
              {analytics.today.date || "—"}
            </p>
          </div>
          <div>
            <p className="muted">Last updated</p>
            <p className="stat-value" style={{ fontSize: "1.4rem" }}>
              {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
