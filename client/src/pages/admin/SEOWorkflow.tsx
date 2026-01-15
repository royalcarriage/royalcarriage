import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Sparkles,
  Eye,
  Send
} from "lucide-react";

interface ContentProposal {
  id: string;
  keyword: string;
  pageType: string;
  title: string;
  description: string;
  targetUrl: string;
  profitScore: number;
  estimatedROAS: number;
  status: string;
  createdAt: string;
}

export default function SEOWorkflow() {
  const [proposals, setProposals] = useState<ContentProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ContentProposal | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/proposals');
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProposals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/generate-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 10 })
      });
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Failed to generate proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProposal = async (proposalId: string) => {
    try {
      await fetch('/api/seo/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, approvedBy: 'admin' })
      });
      await loadProposals();
    } catch (error) {
      console.error('Failed to approve proposal:', error);
    }
  };

  const generateContent = async (proposalId: string) => {
    try {
      await fetch('/api/seo/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId })
      });
      await loadProposals();
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; icon: any; label: string }> = {
      proposed: { variant: 'secondary', icon: Clock, label: 'Proposed' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      generating: { variant: 'default', icon: Sparkles, label: 'Generating' },
      review: { variant: 'outline', icon: Eye, label: 'Review' },
      published: { variant: 'default', icon: Send, label: 'Published' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' }
    };

    const config = configs[status] || configs.proposed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout 
      title="SEO Automation Workflow"
      subtitle="AI-powered content generation with approval workflow"
    >
      <div className="space-y-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Content Pipeline</CardTitle>
            <CardDescription>
              Generate profit-driven content proposals based on keyword opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={generateProposals} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Proposals
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={loadProposals}
                disabled={loading}
              >
                <FileText className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {proposals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{proposals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {proposals.filter(p => p.status === 'proposed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  In Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {proposals.filter(p => p.status === 'review').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {proposals.filter(p => p.status === 'published').length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{proposal.title}</h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {proposal.description}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Keyword: <strong>{proposal.keyword}</strong></span>
                      <span>URL: <strong>{proposal.targetUrl}</strong></span>
                      <span>Type: <strong>{proposal.pageType}</strong></span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      {proposal.estimatedROAS.toFixed(1)}x
                    </div>
                    <div className="text-xs text-gray-500">Est. ROAS</div>
                    <div className="text-sm font-semibold mt-1">
                      Score: {proposal.profitScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {proposal.status === 'proposed' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => approveProposal(proposal.id)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {proposal.status === 'approved' && (
                    <Button 
                      size="sm" 
                      onClick={() => generateContent(proposal.id)}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate Content
                    </Button>
                  )}
                  
                  {proposal.status === 'review' && (
                    <>
                      <Button size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        Review Content
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="mr-1 h-3 w-3" />
                        Publish
                      </Button>
                    </>
                  )}
                  
                  {proposal.status === 'published' && (
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View Live
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {proposals.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-4">
                Click "Generate Proposals" to create profit-driven content ideas based on your top keyword opportunities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
