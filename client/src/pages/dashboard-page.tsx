import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job, Resume, Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isAgency = user?.role === "agency";

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: matchingJobs, isLoading: isLoadingMatches } = useQuery<Job[]>({
    queryKey: ["/api/jobs/matching"],
    enabled: !isAgency,
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const autoApplyMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      const res = await apiRequest("POST", "/api/auto-apply", { resumeId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Auto-Apply Success",
        description: "Applied to all matching jobs successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Auto-Apply Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAutoApply = (resumeId: number) => {
    autoApplyMutation.mutateAsync(resumeId);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return format(typeof date === "string" ? parseISO(date) : date, "MMM d, yyyy");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
          <p className="text-muted-foreground">
            {isAgency ? "Manage your job postings and applications" : "Track your job search progress"}
          </p>
        </div>
        <div className="space-x-4">
          {!isAgency && (
            <Button onClick={() => navigate("/resume-builder")}>
              Create Resume
            </Button>
          )}
          {isAgency && (
            <Button onClick={() => navigate("/post-job")}>
              Post New Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{isAgency ? "Active Jobs" : "Resumes"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isAgency ? jobs?.length || 0 : resumes?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {applications?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">
              {user?.subscriptionTier || "Free"}
            </div>
            {(!user?.subscriptionTier || user.subscriptionTier === "free") && (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => navigate("/subscribe")}
              >
                Upgrade Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isAgency ? (
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          ) : (
            <>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="matches">Job Matches</TabsTrigger>
            </>
          )}
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.slice(0, 5).map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {formatDate(application.createdAt)}
                      </TableCell>
                      <TableCell>Application</TableCell>
                      <TableCell>Job #{application.jobId}</TableCell>
                      <TableCell className="capitalize">{application.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isAgency ? (
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Your Job Postings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs?.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>
                          {formatDate(job.createdAt)}
                        </TableCell>
                        <TableCell>
                          {applications?.filter((a) => a.jobId === job.id).length || 0}
                        </TableCell>
                        <TableCell className="capitalize">{job.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ) : (
          <>
            <TabsContent value="resumes">
              <Card>
                <CardHeader>
                  <CardTitle>Your Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumes?.map((resume) => (
                        <TableRow key={resume.id}>
                          <TableCell>{resume.title}</TableCell>
                          <TableCell>
                            {formatDate(resume.createdAt)}
                          </TableCell>
                          <TableCell className="capitalize">{resume.template}</TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/resume-builder/${resume.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAutoApply(resume.id)}
                              disabled={autoApplyMutation.isPending}
                            >
                              {autoApplyMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Auto Apply"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>Matching Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingMatches ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Posted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchingJobs?.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>{job.title}</TableCell>
                            <TableCell>{job.company}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell className="capitalize">{job.type}</TableCell>
                            <TableCell>
                              {formatDate(job.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>
                {isAgency ? "Received Applications" : "Your Applications"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {formatDate(application.createdAt)}
                      </TableCell>
                      <TableCell>
                        {jobs?.find((j) => j.id === application.jobId)?.title || `Job #${application.jobId}`}
                      </TableCell>
                      <TableCell>
                        {resumes?.find((r) => r.id === application.resumeId)?.title || `Resume #${application.resumeId}`}
                      </TableCell>
                      <TableCell className="capitalize">{application.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}