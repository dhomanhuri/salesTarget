import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { User } from "@shared/schema";
import { formatRupiah } from "@/lib/currency";

interface ReportData {
  amName: string;
  target: number;
  actual: number;
  achievementRate: number;
  totalCustomers: number;
}

export default function Reports() {
  const [periodFilter, setPeriodFilter] = useState(new Date().toISOString().slice(0, 7));

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: reportData = [], isLoading } = useQuery<ReportData[]>({
    queryKey: ["/api/reports", periodFilter],
  });

  const totalTarget = reportData.reduce((sum, item) => sum + item.target, 0);
  const totalActual = reportData.reduce((sum, item) => sum + item.actual, 0);
  const overallAchievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-reports-title">
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Sales performance reports and analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Target vs Progress Report</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="period" className="text-sm">Period:</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const period = date.toISOString().slice(0, 7);
                    return (
                      <SelectItem key={period} value={period}>
                        {new Date(period).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Target</div>
                <div className="text-2xl font-bold text-primary mt-2">
                  {formatRupiah(totalTarget)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Actual</div>
                <div className="text-2xl font-bold text-accent mt-2">
                  {formatRupiah(totalActual)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Achievement Rate</div>
                <div className="text-2xl font-bold mt-2">
                  {overallAchievement.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Manager</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Actual Progress</TableHead>
                <TableHead className="text-right">Achievement</TableHead>
                <TableHead className="text-right">Customers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading report...
                  </TableCell>
                </TableRow>
              ) : reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No data available for this period
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((item, index) => (
                  <TableRow key={index} data-testid={`row-report-${index}`}>
                    <TableCell className="font-medium">{item.amName}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(item.target)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(item.actual)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          item.achievementRate >= 100
                            ? "text-accent font-semibold"
                            : item.achievementRate >= 75
                            ? "text-yellow-600 font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {item.achievementRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.totalCustomers}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
