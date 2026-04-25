import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { AlertCircle, Activity, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { incidentService } from "../services/api";

type IncidentStatus = 'OPEN' | 'RESOLVED';
type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Incident {
  id: number;
  serviceName: string;
  severity: IncidentSeverity;
  errorMessage: string;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt?: string;
  description: string;
}

export function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentService.getAllIncidents();
        setIncidents(data);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Stats computation
  const openIncidents = incidents.filter(i => i.status === 'OPEN').length;

  const resolvedToday = incidents.filter(i => {
    if (i.status === 'RESOLVED' && i.resolvedAt) {
      const resolvedDate = new Date(i.resolvedAt);
      const today = new Date();
      return resolvedDate.toDateString() === today.toDateString();
    }
    return false;
  }).length;

  const totalIncidents = incidents.length;

  const criticalIncidents = incidents.filter(
    i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED'
  ).length;

  // Stats
  const stats = [
    { 
      label: "Open Incidents", 
      value: openIncidents, 
      icon: AlertCircle, 
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    { 
      label: "Resolved Today", 
      value: resolvedToday, 
      icon: CheckCircle2, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Total Incidents", 
      value: totalIncidents, 
      icon: Activity, 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Critical", 
      value: criticalIncidents, 
      icon: Clock, 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Charts
  const severityData = [
    { name: "Critical", value: incidents.filter(i => i.severity === 'CRITICAL').length, color: "#dc2626" },
    { name: "High", value: incidents.filter(i => i.severity === 'HIGH').length, color: "#ea580c" },
    { name: "Medium", value: incidents.filter(i => i.severity === 'MEDIUM').length, color: "#ca8a04" },
    { name: "Low", value: incidents.filter(i => i.severity === 'LOW').length, color: "#65a30d" },
  ];

  const statusData = [
    { name: "Open", count: openIncidents },
    { name: "Resolved", count: incidents.filter(i => i.status === 'RESOLVED').length },
  ];

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Monitor and analyze incidents across your infrastructure</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="p-4 sm:p-6">
          <h3 className="mb-4 text-base sm:text-lg font-semibold">Incident Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Severity Distribution */}
        <Card className="p-4 sm:p-6">
          <h3 className="mb-4 text-base sm:text-lg font-semibold">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold">Recent Incidents</h3>
          <Link to="/incidents">
            <Button variant="ghost" size="sm">
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {recentIncidents.map((incident) => (
            <Link key={incident.id} to={`/incidents/${incident.id}`}>
              <div className="rounded-lg border p-3 sm:p-4 transition-colors hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${getSeverityColor(incident.severity)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm text-gray-600">{incident.id}</span>
                        <Badge className={`${getStatusColor(incident.status)} text-xs`}>
                          {incident.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-1">
                        {incident.errorMessage}
                      </h4>
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-1">
                        {incident.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 sm:gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="truncate">{incident.serviceName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline truncate">
                          {new Date(incident.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}