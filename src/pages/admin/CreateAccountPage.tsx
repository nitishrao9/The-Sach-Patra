import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { createSingleDemoAccount, createAllDemoAccounts, demoAccounts } from '@/utils/createDemoAccounts';

const CreateAccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState([
    {
      email: 'admin@news.com',
      password: 'admin123',
      displayName: 'Admin User',
      role: 'admin' as const,
      created: false
    },
    {
      email: 'editor@news.com',
      password: 'editor123',
      displayName: 'Editor User',
      role: 'editor' as const,
      created: false
    },
    {
      email: 'user@news.com',
      password: 'user123',
      displayName: 'Regular User',
      role: 'user' as const,
      created: false
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const { register } = useAuth();
  const navigate = useNavigate();

  const createAccount = async (accountIndex: number) => {
    const account = accounts[accountIndex];
    setLoading(true);
    setStatus({ type: 'info', message: `Creating account for ${account.email}...` });

    try {
      await register(account.email, account.password, account.displayName, account.role);
      
      // Update the account status
      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex].created = true;
      setAccounts(updatedAccounts);
      
      setStatus({ 
        type: 'success', 
        message: `Account created successfully for ${account.email}! You can now login with these credentials.` 
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Update the account status as created if it already exists
        const updatedAccounts = [...accounts];
        updatedAccounts[accountIndex].created = true;
        setAccounts(updatedAccounts);
        
        setStatus({ 
          type: 'success', 
          message: `Account already exists for ${account.email}. You can login with these credentials.` 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: `Error creating account: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createAllAccounts = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Creating all demo accounts...' });

    for (let i = 0; i < accounts.length; i++) {
      if (!accounts[i].created) {
        await createAccount(i);
        // Small delay between account creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setStatus({ 
      type: 'success', 
      message: 'All demo accounts have been created! You can now login with any of these accounts.' 
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Demo Accounts
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create the demo accounts to test the application
          </p>
        </div>

        {status.type && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Demo Accounts
            </CardTitle>
            <CardDescription>
              Create these accounts to test different role levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={createAllAccounts}
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'Creating Accounts...' : 'Create All Demo Accounts'}
            </Button>

            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div key={account.email} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{account.displayName}</h4>
                        {account.created && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{account.email}</p>
                      <p className="text-sm text-gray-500">Password: {account.password}</p>
                      <p className="text-xs text-gray-400 capitalize">Role: {account.role}</p>
                    </div>
                    <Button
                      onClick={() => createAccount(index)}
                      disabled={loading || account.created}
                      variant={account.created ? 'secondary' : 'outline'}
                      size="sm"
                    >
                      {account.created ? 'Created' : 'Create'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Create the demo accounts above</li>
                <li>2. Go to the <a href="/admin/login" className="underline">login page</a></li>
                <li>3. Use any of the demo account credentials to login</li>
                <li>4. Test different role permissions</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/login')}
            className="mr-2"
          >
            Go to Login
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
