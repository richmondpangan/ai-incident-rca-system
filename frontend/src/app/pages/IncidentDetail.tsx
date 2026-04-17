import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ResolveIncidentModal } from "../components/ResolveIncidentModal";
//import { mockIncidents, IncidentStatus, IncidentSeverity } from "../data/mockIncidents";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Server, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2,
  FileText,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { incidentService } from "../services/api";
import jsPDF from "jspdf";

type ResolveIncidentData = {
  finalRootCause: string;
  resolutionStep: string;
};

type IncidentStatus = 'OPEN' | 'RESOLVED';
type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface IncidentDetail {
  id: number;
  serviceName: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  errorMessage: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
  logs?: string[];

  // temporary placeholder
  aiAnalysis?: string;
  rca?: string;
  finalRootCause?: string;
  resolutionSteps?: string;
  reportedBy?: string;
  description: string;
}

interface AIAnalysisResponse {
  summary: string;
  probableRootCause: string;
  suggestedRemediation: string;
  confidenceScore: number;
  createdAt?: string;
}

interface RCAResponse {
  incidentId: number;
  problemStatement: string;
  businessImpact: string;
  rootCause: string;
  resolution: string;
  preventiveActions: string;
  createdAt?: string;
}

export default function IncidentDetail() {
  const { id } = useParams();
  //const incident = mockIncidents.find((i) => i.id === id);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  //const [aiAnalysis, setAiAnalysis] = useState(incident?.aiAnalysis || "");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isGeneratingRCA, setIsGeneratingRCA] = useState(false);
  //const [rca, setRca] = useState(incident?.rca || "");
  const [rca, setRca] = useState<RCAResponse | null>(null);
  const [status, setStatus] = useState(incident?.status || 'OPEN');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [finalRootCause, setFinalRootCause] = useState(incident?.finalRootCause || "");
  const [resolutionStep, setResolutionStep] = useState(incident?.resolutionSteps || "");

  const [isEditingRCA, setIsEditingRCA] = useState(false);
  const [editedRCA, setEditedRCA] = useState<RCAResponse | null>(null);

  useEffect(() => {
    // fetch Incident details
    const fetchIncident = async () => {
      try {
        const data = await incidentService.getIncidentById(Number(id));
        setIncident(data);
        
        // fetch Resolution
        try {
        const resolution = await incidentService.getIncidentResolution(Number(id));

        // If resolution exists → hydrate UI state
        setFinalRootCause(resolution.finalRootCause);
        setResolutionStep(resolution.resolutionSteps);
        setStatus("RESOLVED");

        // optional but recommended
        //incident.resolvedAt = resolution.resolvedAt;
        //setIncident({ ...incident });

        } catch (err: any) {
          // If 404 → ignore (not resolved yet)
          console.log("No resolution found for incident");
        }
        
        // fetch AI Analysis
        try {
          const analysis = await incidentService.getIncidentAnalysis(Number(id));

          setAiAnalysis(analysis);

        } catch (err) {
          console.log("No AI analysis found");
        }

        // fetch RCA Document
        try {
          const rcaData = await incidentService.getIncidentRCA(Number(id));

          setRca(rcaData);

          setEditedRCA(rcaData);

        } catch (err) {
          console.log("No RCA found");
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load incident");
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);
  
  // Not found
  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Incident Not Found</h2>
        <p className="text-gray-600 mb-6">The incident you're looking for doesn't exist.</p>
        <Link to="/incidents">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>
        </Link>
      </div>
    );
  }

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

  const handleAnalyzeWithAI = async () => {
    if (!incident) return;

    try {
      setIsAnalyzing(true);

      // trigger AI analysis
      await incidentService.analyzeIncident(incident.id);

      // fetch latest saved analysis
      const latest = await incidentService.getIncidentAnalysis(incident.id);

      // update UI
      setAiAnalysis(latest);

      toast.success("AI analysis completed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze incident");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveIncident = async (data: ResolveIncidentData) => {
    if (!incident) return;

    try {
      // Trigger Resolve Incident API
      const response = await incidentService.resolveIncident(incident.id, {
        finalRootCause: data.finalRootCause,
        resolutionSteps: data.resolutionStep,
        resolvedBy: "SRE_user1" // replace later with auth user
      });

      // Update UI state from response
      setFinalRootCause(response.finalRootCause);
      setResolutionStep(response.resolutionSteps);
      setStatus('RESOLVED');

      // Optional: update resolvedAt in UI
      setIncident(prev => prev ? {
        ...prev,
        resolvedAt: response.resolvedAt
      } : prev);

      // Refresh Incident
      const updated = await incidentService.getIncidentById(incident.id);
      setIncident(updated);

      setResolveModalOpen(false);

      toast.success("Incident marked as resolved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve incident");
    }
  };

  const handleGenerateRCA = async () => {
    if (!incident) return;

    if (status !== 'RESOLVED') {
      toast.error("Incident must be resolved before generating RCA");
      return;
    }

    try {
      setIsGeneratingRCA(true);

      // Trigger Generate RCA API
      const response = await incidentService.generateRCA(incident.id);

      // fetch latest RCA from backend
      const latest = await incidentService.getIncidentRCA(incident.id);

      // update UI
      setRca(response);

      toast.success("RCA generated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate RCA");
    } finally {
      setIsGeneratingRCA(false);
    }
  };

  const handleEditRCA = () => {
    setIsEditingRCA(true);
  };

  const handleCancelEditRCA = () => {
    setEditedRCA(rca);
    setIsEditingRCA(false);
  };

  const handleSaveRCA = async () => {
    if (!editedRCA) return;

    try {
      const updated = await incidentService.updateRCA(editedRCA.incidentId, {
        problemStatement: editedRCA.problemStatement,
        businessImpact: editedRCA.businessImpact,
        rootCause: editedRCA.rootCause,
        resolution: editedRCA.resolution,
        preventiveActions: editedRCA.preventiveActions,
      });

      const latest = await incidentService.getIncidentRCA(incident.id);
      // update UI
      setRca(latest);
      setEditedRCA(latest);
      setIsEditingRCA(false);

      toast.success("RCA updated successfully");

    } catch (err) {
      console.error(err);
      toast.error("Failed to update RCA");
    }
  };

  // Disable save button if nothing is changed to RCA
  const isDirty = JSON.stringify(rca) !== JSON.stringify(editedRCA);

  const handleDownloadRCA = () => {
    if (!rca) {
      toast.error("No RCA available to download");
      return;
    }

    const doc = new jsPDF();

    let y = 10;

    const addSection = (title: string, content: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(title, 10, y);
      y += 6;

      doc.setFont("helvetica", "normal");

      const splitText = doc.splitTextToSize(content || "-", 180);
      doc.text(splitText, 10, y);
      y += splitText.length * 6 + 4;
    };

    // Title
    doc.setFontSize(16);
    doc.text("Root Cause Analysis Report", 10, y);
    y += 10;

    doc.setFontSize(10);

    doc.text(`Generated At: ${rca.createdAt ? new Date(rca.createdAt).toLocaleString() : ""}`, 10, y);
    y += 6;
    doc.text(`Service: ${incident.serviceName}`, 10, y);
    y += 6;
    doc.text(`Severity: ${incident.severity}`, 10, y);
    y += 10;

    // Sections
    addSection("Problem Statement", rca.problemStatement);
    addSection("Business Impact", rca.businessImpact);
    addSection("Root Cause", rca.rootCause);
    addSection("Resolution", rca.resolution);
    addSection("Preventive Actions", rca.preventiveActions);

    // Save
    doc.save(`RCA-${rca.incidentId}.pdf`);

    toast.success("RCA PDF downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/incidents">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">{incident.errorMessage}</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-gray-600">{incident.id}</span>
              <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
              <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {status !== 'RESOLVED' && (
              <Button onClick={() => setResolveModalOpen(true)} variant="outline">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Resolved
              </Button>
            )}
            {status === 'RESOLVED' && !rca && (
              <Button onClick={handleGenerateRCA} disabled={isGeneratingRCA}>
                {isGeneratingRCA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate RCA
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Reported By</p>
              <p className="font-medium truncate">{incident.reportedBy || 'user@email.com'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-50 p-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium text-sm truncate">{new Date(incident.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-50 p-2">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-medium truncate">{incident.serviceName}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-50 p-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Resolved At</p>
              <p className="font-medium text-sm truncate">
                {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Not resolved'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          {rca && <TabsTrigger value="rca">RCA</TabsTrigger>}
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Incident Description</h3>
            {/* <p className="text-gray-700 leading-relaxed">{incident.description}</p> */}
            <p className="text-gray-700 leading-relaxed">{incident.errorMessage}</p>
            
            {/* <Separator className="my-6" />
            
            <h3 className="mb-4 text-lg font-semibold">Error Message</h3>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-800 font-mono text-sm">{incident.errorMessage}</p>
            </div> */}

            {status === 'RESOLVED' && finalRootCause && resolutionStep && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Resolved
                    </h4>
                    <p className="text-sm text-gray-600">
                      {/* This incident was resolved on {new Date().toLocaleString()} */}
                      This incident was resolved on {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Not resolved'}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Final Root Cause</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{finalRootCause}</p>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Resolution Step</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{resolutionStep}</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
              <div className="flex gap-2">
                {aiAnalysis && (
                  <Button onClick={handleAnalyzeWithAI} disabled={isAnalyzing || status === 'RESOLVED'} variant="outline" size="sm">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Analysis
                      </>
                    )}
                  </Button>
                )}
                {!aiAnalysis && (
                  <Button onClick={handleAnalyzeWithAI} disabled={isAnalyzing || status === 'RESOLVED'}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* {status === 'RESOLVED' && (
              <p className="text-xs text-gray-500 mb-4">
                AI analysis is disabled after resolution
              </p>
            )} */}

            {aiAnalysis ? (
              // EXISTING ANALYSIS VIEW
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6">
                <div className="space-y-4 text-sm text-gray-800">
                  <div>
                    <p className="font-semibold">Summary</p>
                    <p>{aiAnalysis.summary}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Probable Root Cause</p>
                    <p>{aiAnalysis.probableRootCause}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Suggested Remediation</p>
                    <pre className="whitespace-pre-wrap">{aiAnalysis.suggestedRemediation}</pre>
                  </div>

                  <div>
                    <p className="font-semibold">Confidence</p>
                    <p>{aiAnalysis.confidenceScore}%</p>
                  </div>
                </div>
              </div>
            ) : status === "RESOLVED" ? (
              // RESOLVED STATE
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">
                  AI analysis is disabled after resolution.
                </p>
              </div>
            ) : (
              // NORMAL EMPTY STATE
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  No AI analysis has been performed yet.
                </p>
                <p className="text-sm text-gray-500">
                  Click "Analyze with AI" to generate insights and recommendations.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">System Logs</h3>
            {incident.logs && incident.logs.length > 0 ? (
              <div className="space-y-2 rounded-lg bg-gray-900 p-4 font-mono text-sm overflow-x-auto">
                {incident.logs.map((log, index) => (
                  <div key={index} className="text-gray-100">
                    {/* <span className="text-gray-500">{new Date().toISOString()}</span>{" "} */}
                    <span className={
                      log.includes('[ERROR]') ? 'text-red-400' :
                      log.includes('[WARN]') ? 'text-yellow-400' :
                      // 'text-green-400'
                      'text-gray-500'
                    }>{log}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No logs available for this incident.</p>
            )}
          </Card>
        </TabsContent>

        {rca && (
          <TabsContent value="rca">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Root Cause Analysis</h3>

                <div className="flex gap-2">
                  {!isEditingRCA && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleEditRCA}>
                        Edit
                      </Button>

                      <Button variant="outline" size="sm" onClick={handleDownloadRCA}>
                        Download
                      </Button>
                    </>
                  )}

                  {isEditingRCA && (
                    <>
                      <Button size="sm" onClick={handleSaveRCA} disabled={!isDirty}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEditRCA}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-lg">
                {/* Problem */}
                <div>
                  <h4 className="font-semibold">Problem Statement</h4>
                  {isEditingRCA ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedRCA?.problemStatement || ""}
                      onChange={(e) =>
                        setEditedRCA(prev => prev ? { ...prev, problemStatement: e.target.value } : prev)
                      }
                    />
                  ) : (
                    <p>{rca.problemStatement}</p>
                  )}
                </div>

                {/* Business Impact */}
                <div>
                  <h4 className="font-semibold">Business Impact</h4>
                  {isEditingRCA ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedRCA?.businessImpact || ""}
                      onChange={(e) =>
                        setEditedRCA(prev => prev ? { ...prev, businessImpact: e.target.value } : prev)
                      }
                    />
                  ) : (
                    <p>{rca.businessImpact}</p>
                  )}
                </div>

                {/* Root Cause */}
                <div>
                  <h4 className="font-semibold">Root Cause</h4>
                  {isEditingRCA ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedRCA?.rootCause || ""}
                      onChange={(e) =>
                        setEditedRCA(prev => prev ? { ...prev, rootCause: e.target.value } : prev)
                      }
                    />
                  ) : (
                    <p>{rca.rootCause}</p>
                  )}
                </div>

                {/* Resolution */}
                <div>
                  <h4 className="font-semibold">Resolution</h4>
                  {isEditingRCA ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedRCA?.resolution || ""}
                      onChange={(e) =>
                        setEditedRCA(prev => prev ? { ...prev, resolution: e.target.value } : prev)
                      }
                    />
                  ) : (
                    <p>{rca.resolution}</p>
                  )}
                </div>

                {/* Preventive */}
                <div>
                  <h4 className="font-semibold">Preventive Actions</h4>
                  {isEditingRCA ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedRCA?.preventiveActions || ""}
                      onChange={(e) =>
                        setEditedRCA(prev => prev ? { ...prev, preventiveActions: e.target.value } : prev)
                      }
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap">{rca.preventiveActions}</pre>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        )}

        {/* {rca && (
          <TabsContent value="rca">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Root Cause Analysis</h3>
                <Button variant="outline" size="sm" onClick={handleDownloadRCA}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Problem Statement</h4>
                    <p>{rca.problemStatement}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Business Impact</h4>
                    <p>{rca.businessImpact}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Root Cause</h4>
                    <p>{rca.rootCause}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Resolution</h4>
                    <p>{rca.resolution}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Preventive Actions</h4>
                    <pre className="whitespace-pre-wrap">{rca.preventiveActions}</pre>
                  </div>

                  <p className="text-xs text-gray-500">
                    Generated at: {rca.createdAt ? new Date(rca.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        )} */}
      </Tabs>

      {/* Resolve Modal */}
      <ResolveIncidentModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        onResolve={handleResolveIncident}
      />
    </div>
  );
}
