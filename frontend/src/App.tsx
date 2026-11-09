
import "./App.css";

import {
  Activity,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

// Dashboard statistics type
type AlertStats = {
  total_alerts: number;
  critical: number;
  warning: number;
  info: number;
  new: number;
  acknowledged: number;
  resolved: number;
};

// Individual alert type
type Alert = {
  id: number;
  source: string;
  message: string;
  severity: "critical" | "warning" | "info";
  status: "new" | "acknowledged" | "resolved";
  created_at: string;
};

function App() {
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAlertId, setUpdatingAlertId] = useState<number | null>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch statistics and alerts from backend
  const fetchDashboardData = async () => {
    try {
      setError(null);

      const [statsResponse, alertsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/alerts/stats"),
        fetch("http://127.0.0.1:8000/alerts/"),
      ]);

      if (!statsResponse.ok || !alertsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData: AlertStats = await statsResponse.json();
      const alertsData = await alertsResponse.json();

      setStats(statsData);
      setAlerts(alertsData.alerts);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to load dashboard data. Please check the backend.");
    }
  };

  // Load dashboard data when component mounts
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };

    loadDashboard();
  }, []);

  // Acknowledge or resolve an alert
  const updateAlertStatus = async (
    alertId: number,
    action: "acknowledge" | "resolve"
  ) => {
    try {
      setUpdatingAlertId(alertId);

      const response = await fetch(
        `http://127.0.0.1:8000/alerts/${alertId}/${action}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update alert status");
      }

      // Reload statistics and alerts after successful update
      await fetchDashboardData();
    } catch (err) {
      console.error("Status update error:", err);
      setError("Unable to update alert status. Please try again.");
    } finally {
      setUpdatingAlertId(null);
    }
  };

  // Apply search, severity and status filters
  const filteredAlerts = alerts.filter((alert) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      alert.source.toLowerCase().includes(search) ||
      alert.message.toLowerCase().includes(search);

    const matchesSeverity =
      severityFilter === "all" || alert.severity === severityFilter;

    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={28} />
          <span>OpsMonitor</span>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          <a className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a className="nav-item">
            <Bell size={19} />
            Alerts
          </a>

          <a className="nav-item">
            <Activity size={19} />
            Monitoring
          </a>

          <a className="nav-item">
            <Settings size={19} />
            Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="online-dot"></span>
            All systems operational
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Monitor and manage your IT infrastructure.</p>
          </div>

          <div className="topbar-right">
            <button className="icon-button">
              <Bell size={20} />
            </button>

            <div className="profile">
              <div className="avatar">ZA</div>
              <div>
                <strong>Admin</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <section className="dashboard-body">

          <div className="page-heading">
            <div>
              <h2>Overview</h2>
              <p>Here's what's happening with your systems today.</p>
            </div>
          </div>

          {/* Statistics cards */}
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon blue">
                <Activity size={21} />
              </div>
              <p>Total Alerts</p>
              <h3>{stats?.total_alerts ?? "--"}</h3>
              <small>All recorded alerts</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                <CircleAlert size={21} />
              </div>
              <p>Critical Alerts</p>
              <h3>{stats?.critical ?? "--"}</h3>
              <small>Require attention</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Clock3 size={21} />
              </div>
              <p>New Alerts</p>
              <h3>{stats?.new ?? "--"}</h3>
              <small>Awaiting action</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle2 size={21} />
              </div>
              <p>Resolved</p>
              <h3>{stats?.resolved ?? "--"}</h3>
              <small>Successfully resolved</small>
            </div>

          </div>

          {/* Alerts table */}
          <section className="alerts-section">

            <div className="section-header">
              <div>
                <h2>Recent Alerts</h2>
                <p>Review and manage incoming system alerts.</p>
              </div>
            </div>

            {/* Search and filters */}
            <div className="alert-filters">

              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by source or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                className="clear-filters-button"
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>

            </div>

            <p className="results-count">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ALERT</th>
                    <th>SEVERITY</th>
                    <th>STATUS</th>
                    <th>TIME</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading alerts...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5}>{error}</td>
                    </tr>
                  ) : filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        No matching alerts found. Try changing your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <strong>{alert.source}</strong>
                          <small>{alert.message}</small>
                        </td>

                        <td>
                          <span className={`badge ${alert.severity}`}>
                            {alert.severity}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${alert.status}`}>
                            {alert.status}
                          </span>
                        </td>

                        <td>
                          {new Date(alert.created_at).toLocaleString()}
                        </td>

                        <td>
                          {alert.status === "new" && (
                            <button
                              className="action-button"
                              disabled={updatingAlertId === alert.id}
                              onClick={() =>
                                updateAlertStatus(alert.id, "acknowledge")
                              }
                            >
                              {updatingAlertId === alert.id
                                ? "Updating..."
                                : "Acknowledge"}
                            </button>
                          )}

                          {alert.status !== "resolved" && (
                            <button
                              className="action-button resolve-button"
                              disabled={updatingAlertId === alert.id}
                              onClick={() =>
                                updateAlertStatus(alert.id, "resolve")
                              }
                            >
                              {updatingAlertId === alert.id
                                ? "Updating..."
                                : "Resolve"}
                            </button>
                          )}

                          {alert.status === "resolved" && (
                            <span>Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </section>

        </section>
      </main>
    </div>
  );
}

export default App;
