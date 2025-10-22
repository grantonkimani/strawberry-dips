'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Trash2, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface TestDataSummary {
  totalOrders: number;
  testOrders: number;
  testOrderItems: number;
  testCustomers: number;
  sampleOrders: Array<{
    id: string;
    customer_email: string;
    customer_first_name: string;
    customer_last_name: string;
    status: string;
    payment_status: string;
    total: number;
    created_at: string;
  }>;
}

export default function DataCleanupPage() {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<TestDataSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup/all-orders');
      const data = await response.json();
      setAllOrders(data.orders || []);
      setShowAllOrders(true);
    } catch (error) {
      console.error('Error loading all orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to delete');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone!`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/cleanup/delete-selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrders })
      });
      
      if (response.ok) {
        setDeleted(true);
        setSelectedOrders([]);
        setAllOrders([]);
        setShowAllOrders(false);
        alert('Selected orders deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete orders: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert('Failed to delete orders');
    } finally {
      setDeleting(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(allOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const analyzeTestData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup/analyze');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error analyzing data:', error);
      alert('Failed to analyze test data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTestData = async () => {
    if (!summary || summary.testOrders === 0) {
      alert('No test data to delete');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${summary.testOrders} test orders and ${summary.testOrderItems} order items? This action cannot be undone!`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/cleanup/delete-test-data', {
        method: 'POST',
      });
      
      if (response.ok) {
        setDeleted(true);
        setSummary(null);
        alert('Test data deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete test data: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting test data:', error);
      alert('Failed to delete test data');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Cleanup</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Use with caution - deletions are permanent</span>
        </div>
      </div>

      {/* Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Test Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Analyze your database to identify test orders, payments, and customers. 
            This will help you safely remove test data without affecting real customer orders.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={analyzeTestData} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Analyzing...' : 'Analyze Test Data'}
            </Button>
            
            <Button 
              onClick={loadAllOrders} 
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading ? 'Loading...' : 'Show All Orders'}
            </Button>
          </div>

          {summary && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.totalOrders}</div>
                  <div className="text-sm text-blue-800">Total Orders</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{summary.testOrders}</div>
                  <div className="text-sm text-orange-800">Test Orders</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summary.testOrderItems}</div>
                  <div className="text-sm text-red-800">Test Order Items</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{summary.testCustomers}</div>
                  <div className="text-sm text-purple-800">Test Customers</div>
                </div>
              </div>

              {summary.testOrders > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Sample Test Orders:</h3>
                  <div className="space-y-2">
                    {summary.sampleOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{order.customer_first_name} {order.customer_last_name}</div>
                            <div className="text-gray-600">{order.customer_email}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">KES {order.total}</div>
                            <div className="text-gray-600">{order.status} / {order.payment_status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {summary.testOrders > 0 && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={deleteTestData}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : `Delete ${summary.testOrders} Test Orders`}
                  </Button>
                </div>
              )}

              {summary.testOrders === 0 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>No test data found! Your database is clean.</span>
                </div>
              )}
            </div>
          )}

          {showAllOrders && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  All Orders ({allOrders.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={selectAllOrders}
                    size="sm"
                    variant="outline"
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={clearSelection}
                    size="sm"
                    variant="outline"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrders.includes(order.id) 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleOrderSelection(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">
                            {order.customer_first_name} {order.customer_last_name}
                          </div>
                          <div className="text-sm text-gray-600">{order.customer_email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">KES {order.total}</div>
                        <div className="text-sm text-gray-600">
                          {order.status} / {order.payment_status}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrders.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectedOrders.length} orders selected
                    </span>
                    <Button 
                      onClick={deleteSelectedOrders}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting ? 'Deleting...' : `Delete ${selectedOrders.length} Orders`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual SQL Option */}
      <Card>
        <CardHeader>
          <CardTitle>Manual SQL Cleanup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            For advanced users, you can run SQL scripts directly in your Supabase SQL editor:
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-sm">Safe Cleanup (Recommended)</div>
              <div className="text-xs text-gray-600">Only deletes obvious test data</div>
              <code className="text-xs text-blue-600">scripts/safe-test-cleanup.sql</code>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-sm">Comprehensive Cleanup</div>
              <div className="text-xs text-gray-600">Deletes ALL orders and customers</div>
              <code className="text-xs text-red-600">scripts/comprehensive-cleanup.sql</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
