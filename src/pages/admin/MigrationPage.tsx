import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { migrateArticlesToAddCreatedBy, assignArticleOwnership } from '@/utils/migrateArticles';

const MigrationPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Only allow admins to access this page
  if (!isAdmin()) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access migration tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      // First, run the basic migration to add createdBy field
      const migrationResult = await migrateArticlesToAddCreatedBy();
      
      if (migrationResult.success) {
        // Then assign ownership based on current user for articles without createdBy
        // For now, we'll assign all articles without createdBy to the current admin
        const ownershipResult = await assignArticleOwnership({
          // You can expand this mapping based on your needs
          // For now, we'll leave it empty and handle manually
        });
        
        setResult({
          migration: migrationResult,
          ownership: ownershipResult
        });
      } else {
        setResult({ migration: migrationResult });
      }
    } catch (error) {
      setResult({
        migration: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Database Migration</h1>
        <p className="text-gray-600 mt-2">
          Tools for migrating and updating the database structure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Article Ownership Migration</span>
          </CardTitle>
          <CardDescription>
            This migration adds the `createdBy` field to existing articles to enable role-based permissions.
            Editors will only be able to edit and delete their own articles after this migration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This migration should only be run once. It will update all existing articles
              to include ownership information. Make sure to backup your database before running this migration.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What this migration does:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Adds a `createdBy` field to all existing articles</li>
                <li>Enables role-based permissions for article editing and deletion</li>
                <li>Ensures editors can only modify their own articles</li>
                <li>Admins retain full access to all articles</li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={runMigration}
                disabled={isRunning}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running Migration...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Run Migration</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Migration Results:</h3>
              
              {result.migration && (
                <Alert className={result.migration.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {result.migration.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {result.migration.success ? (
                      <div>
                        <p className="font-medium text-green-800">Migration completed successfully!</p>
                        <p className="text-green-700 mt-1">
                          Updated {result.migration.updatedCount} articles, 
                          skipped {result.migration.skippedCount} articles that already had ownership data.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-red-800">Migration failed!</p>
                        <p className="text-red-700 mt-1">{result.migration.error}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationPage;
