import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Database,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Eye,
  Edit,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  subscription_status?: string;
  plan_type?: string;
  stripe_customer_id?: string;
}

interface UserStats {
  total: number;
  byRole: Record<string, number>;
  recentSignups: number;
  activeToday: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTranscriptions: number;
  storageUsed: string;
  apiCalls: number;
}

export const AdminSettings: React.FC = () => {
  // Helper functions
  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: 'text-red-800',
      professional: 'text-blue-800',
      student: 'text-green-800',
      copywriter: 'text-purple-800',
      video_editor: 'text-orange-800',
      subscriber: 'text-indigo-800'
    };
    return colors[role] || 'text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const iconProps = { className: 'h-5 w-5' };
    const icons: Record<string, React.ReactElement> = {
      admin: <Shield {...iconProps} className="h-5 w-5 text-red-600" />,
      professional: <Users {...iconProps} className="h-5 w-5 text-blue-600" />,
      student: <Users {...iconProps} className="h-5 w-5 text-green-600" />,
      copywriter: <Edit {...iconProps} className="h-5 w-5 text-purple-600" />,
      video_editor: <Activity {...iconProps} className="h-5 w-5 text-orange-600" />,
      subscriber: <Crown {...iconProps} className="h-5 w-5 text-indigo-600" />
    };
    return icons[role] || <Users {...iconProps} className="h-5 w-5 text-gray-600" />;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'users' | 'analytics' | 'system' | 'products'>('users');
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    active: true,
    metadata: {} as Record<string, string>
  });

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'subscriber', label: 'Subscriber' },
    { value: 'professional', label: 'Professional' },
    { value: 'student', label: 'Student' },
    { value: 'copywriter', label: 'Copywriter' },
    { value: 'video_editor', label: 'Video Editor' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
    fetchSystemStats();
    if (activeSection === 'products') {
      fetchStripeProducts();
    }
  }, [selectedRole, searchQuery, activeSection]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error('Failed to fetch user stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system-stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      } else {
        // Mock data if endpoint doesn't exist yet
        setSystemStats({
          totalUsers: userStats?.total || 0,
          activeUsers: userStats?.activeToday || 0,
          totalProjects: 0,
          totalTranscriptions: 0,
          storageUsed: '0 GB',
          apiCalls: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      // Mock data on error
      setSystemStats({
        totalUsers: userStats?.total || 0,
        activeUsers: userStats?.activeToday || 0,
        totalProjects: 0,
        totalTranscriptions: 0,
        storageUsed: '0 GB',
        apiCalls: 0
      });
    }
  };

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products');
      if (response.ok) {
        const data = await response.json();
        setStripeProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch Stripe products:', error);
    }
  };

  const syncStripeProducts = async () => {
    try {
      setSyncingProducts(true);
      const response = await fetch('/api/stripe/sync-products', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchStripeProducts();
        alert('Products synced successfully!');
      } else {
        alert('Failed to sync products');
      }
    } catch (error) {
      console.error('Failed to sync products:', error);
      alert('Failed to sync products');
    } finally {
      setSyncingProducts(false);
    }
  };

  const syncSingleProduct = async (productId: string) => {
    try {
      setSyncingProductId(productId);
      const response = await fetch(`/api/stripe/sync-product/${productId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchStripeProducts();
        alert('Product synced successfully!');
      } else {
        alert('Failed to sync product');
      }
    } catch (error) {
      console.error('Failed to sync product:', error);
      alert('Failed to sync product');
    } finally {
      setSyncingProductId(null);
    }
  };

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        active: product.active !== false,
        metadata: product.metadata || {}
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        active: true,
        metadata: {}
      });
    }
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      active: true,
      metadata: {}
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `/api/stripe/products/${editingProduct.id}`
        : '/api/stripe/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        fetchStripeProducts();
        closeProductModal();
        alert(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Failed to ${editingProduct ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchUserStats(),
        fetchSystemStats()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchUsers();
        fetchUserStats();
        fetchSystemStats();
      } else {
        console.error(`Failed to ${action} user:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Settings</h1>
            <p className="text-gray-600">Manage users, system settings, and monitor activity</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAllData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      {userStats && systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{userStats.total.toLocaleString()}</p>
                <p className="text-blue-200 text-xs mt-1">
                  +{userStats.recentSignups} this week
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <Users className="h-8 w-8 text-blue-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Today</p>
                <p className="text-3xl font-bold">{userStats.activeToday.toLocaleString()}</p>
                <p className="text-green-200 text-xs mt-1">
                  {Math.round((userStats.activeToday / userStats.total) * 100)}% of total
                </p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                <Activity className="h-8 w-8 text-green-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Transcriptions</p>
                <p className="text-3xl font-bold">{systemStats.totalTranscriptions.toLocaleString()}</p>
                <p className="text-purple-200 text-xs mt-1">
                  Total processed
                </p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Storage Used</p>
                <p className="text-3xl font-bold">{systemStats.storageUsed}</p>
                <p className="text-orange-200 text-xs mt-1">
                  Across all users
                </p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                <Database className="h-8 w-8 text-orange-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeSection === 'users'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeSection === 'analytics'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveSection('system')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeSection === 'system'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              System Settings
            </button>
            <button
              onClick={() => setActiveSection('products')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeSection === 'products'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Stripe Products
            </button>
          </div>
        </div>
      </div>

      {/* User Management */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <Button variant="primary" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.email_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Mail className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('View user:', user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Stripe Products Management */}
      {activeSection === 'products' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Stripe Products</h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openProductModal()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={syncStripeProducts}
                  disabled={syncingProducts}
                >
                  <Database className="w-4 h-4 mr-2" />
                  {syncingProducts ? 'Syncing...' : 'Sync All'}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {stripeProducts.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sync with Stripe to manage your subscription products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stripeProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Product ID:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs">{product.id}</span>
                      </div>
                      {product.metadata && Object.keys(product.metadata).length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Metadata:</span>
                          <div className="ml-2 mt-1">
                            {Object.entries(product.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProductModal(product)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncSingleProduct(product.id)}
                          disabled={syncingProductId === product.id}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${syncingProductId === product.id ? 'animate-spin' : ''}`} />
                          {syncingProductId === product.id ? 'Syncing...' : 'Sync'}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.prices?.length || 0} price{product.prices?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          {/* User Role Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(userStats.byRole).map(([role, count]) => (
                  <div key={role} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getRoleColor(role).replace('text-', 'bg-').replace('800', '100')}`}>
                          {getRoleIcon(role)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 capitalize">{role}</p>
                          <p className="text-xs text-gray-500">
                            {Math.round((count / userStats.total) * 100)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User Activity Trends</h2>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Analytics charts will be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Integration with analytics service coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Section */}
      {activeSection === 'system' && (
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Database</p>
                    <p className="text-xs text-green-700">Operational</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">API Services</p>
                    <p className="text-xs text-green-700">Healthy</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-900">Storage</p>
                    <p className="text-xs text-yellow-700">Monitor Usage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">User Registration</p>
                  <p className="text-xs text-gray-500">Allow new users to register</p>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="ml-2 text-sm text-green-600">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Verification</p>
                  <p className="text-xs text-gray-500">Require email verification for new accounts</p>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="ml-2 text-sm text-green-600">Required</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Temporarily disable the application</p>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h3>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <Input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={productForm.active}
                  onChange={(e) => setProductForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active Product
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeProductModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
