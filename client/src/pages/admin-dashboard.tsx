import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { User, Job, Application } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/admin/applications"],
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {jobs?.filter((j) => j.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applications?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="capitalize">
                        {user.subscriptionTier || "free"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>All Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell className="capitalize">{job.type}</TableCell>
                      <TableCell>{job.applicationsCount || 0}</TableCell>
                      <TableCell className="capitalize">{job.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {format(new Date(application.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {jobs?.find((j) => j.id === application.jobId)?.title ||
                          `Job #${application.jobId}`}
                      </TableCell>
                      <TableCell>
                        {users?.find((u) => u.id === application.userId)
                          ?.username || `User #${application.userId}`}
                      </TableCell>
                      <TableCell className="capitalize">
                        {application.status}
                      </TableCell>
                      <TableCell>{application.emailSent ? "Yes" : "No"}</TableCell>
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
