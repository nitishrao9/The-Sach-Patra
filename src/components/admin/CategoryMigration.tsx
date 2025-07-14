import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { migrateCategoriesData, getMigrationStatus } from '@/utils/migrateCategoriesData';

interface MigrationStatus {
  total: number;
  hindiCategories: number;
  englishCategories: number;
  categoryCounts: Record<string, number>;
  migrationNeeded: boolean;
}

export function CategoryMigration() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; updatedCount?: number; error?: string } | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await getMigrationStatus();
      setStatus(result);
    } catch (error) {
      console.error('Error checking migration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setMigrationResult(null);
    
    try {
      const result = await migrateCategoriesData();
      setMigrationResult(result);
      
      if (result.success) {
        // Refresh status after successful migration
        await checkStatus();
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Category Migration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking migration status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Category Migration
        </CardTitle>
        <CardDescription>
          Migrate category data from Hindi to English for better internationalization support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.total}</div>
              <div className="text-sm text-blue-800">Total Articles</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{status.hindiCategories}</div>
              <div className="text-sm text-orange-800">Hindi Categories</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.englishCategories}</div>
              <div className="text-sm text-green-800">English Categories</div>
            </div>
          </div>
        )}

        {status && Object.keys(status.categoryCounts).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Current Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(status.categoryCounts).map(([category, count]) => (
                <Badge key={category} variant="outline">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {status?.migrationNeeded ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Migration is needed. {status.hindiCategories} articles have Hindi categories that should be converted to English.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All categories are already in English format. No migration needed.
            </AlertDescription>
          </Alert>
        )}

        {migrationResult && (
          <Alert variant={migrationResult.success ? "default" : "destructive"}>
            {migrationResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription>
              {migrationResult.success 
                ? `Migration completed successfully! Updated ${migrationResult.updatedCount} documents.`
                : `Migration failed: ${migrationResult.error}`
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={checkStatus} variant="outline" disabled={loading || migrating}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Status
          </Button>
          
          {status?.migrationNeeded && (
            <Button onClick={runMigration} disabled={migrating}>
              {migrating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Run Migration
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
