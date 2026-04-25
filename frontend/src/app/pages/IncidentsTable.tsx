import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
//import { mockIncidents, IncidentStatus, IncidentSeverity } from "../data/mockIncidents";
import { Search } from "lucide-react";
import { incidentService } from "../services/api";

type IncidentStatus = 'OPEN' | 'RESOLVED';
type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type Incident = {
  id: string;
  serviceName: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  errorMessage: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt: string;
};

export function IncidentsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await incidentService.getAllIncidents(filters);
      //console.log("API RESPONSE:", data);
      setIncidents(data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  // const filteredIncidents = mockIncidents.filter((incident) => {
  //   const matchesSearch = 
  //     incident.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     incident.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
  //   const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;

  //   return matchesSearch && matchesStatus && matchesSeverity;
  // });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Incidents</h2>
        <p className="mt-2 text-gray-600">View and manage all reported incidents</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search incidents by ID, service, or severity..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);

                fetchIncidents({
                  serviceName: searchTerm || undefined,
                  severity: severityFilter !== "all" ? severityFilter : undefined,
                  status: statusFilter !== "all" ? statusFilter : undefined,
                });
              }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/*<Select value={statusFilter} onValueChange={setStatusFilter}> */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  fetchIncidents({
                    severity: severityFilter !== "all" ? severityFilter : undefined,
                    status: value !== "all" ? value : undefined,
                  });
                }}
              >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* <Select value={severityFilter} onValueChange={setSeverityFilter}> */}
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value);
                  fetchIncidents({
                    severity: value !== "all" ? value : undefined,
                    status: statusFilter !== "all" ? statusFilter : undefined,
                  });
                }}
              >            
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="min-w-[150px]">Service Name</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[180px]">Created At</TableHead>
                <TableHead className="min-w-[180px]">Resolved At</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No incidents found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Link to={`/incidents/${incident.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                        {incident.id}
                      </Link>
                    </TableCell>
                    <TableCell>{incident.serviceName}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/incidents/${incident.id}`} className="hover:underline line-clamp-2">
                        {incident.errorMessage}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(incident.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody> */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Link to={`/incidents/${incident.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                        {incident.id}
                      </Link>
                    </TableCell>
                    <TableCell>{incident.serviceName}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/incidents/${incident.id}`} className="hover:underline line-clamp-2">
                        {incident.errorMessage}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(incident.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {incident.resolvedAt
                        ? new Date(incident.resolvedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="border-t px-4 py-3 text-sm text-gray-600">
          {/* Showing {filteredIncidents.length} of {mockIncidents.length} incidents */}
        </div>
      </Card>
    </div>
  );
}
