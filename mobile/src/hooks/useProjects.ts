import { useState, useEffect } from 'react';

interface Project {
  id: string;
  customerName: string;
  address: string;
  service: string;
  amount: string;
  date: string;
  status: string;
  progress: string;
  description: string;
  size: string;
  contactNumber: string;
  email: string;
  comment: string;
  attachment: any;
  assignedEmployees: any[];
  totalTasks: number;
  completedTasks: number;
  projectStatus: string;
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

  const mapServerToMobileStatus = (serverStatus: string) => {
    const statusMap: Record<string, string> = {
      'new': 'New',
      'in-progress': 'InProgress',
      'completed': 'Complete',
      'done': 'Done',
      'cancelled': 'Cancelled'
    };
    return statusMap[serverStatus] || 'New';
  };

  const transformProjectData = (apiProject: any): Project => ({
    id: apiProject._id || apiProject.id || Math.random().toString(),
    customerName: apiProject.customerName || 'Unknown Customer',
    address: typeof apiProject.address === 'object'
      ? `${apiProject.address.addressLine || ''}, ${apiProject.address.city || ''}, ${apiProject.address.district || ''}, ${apiProject.address.state || ''}, ${apiProject.address.country || ''} - ${apiProject.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim()
      : apiProject.address || 'No address provided',
    service: apiProject.services || 'Unknown',
    amount: `₹${apiProject.projectAmount?.toLocaleString('en-IN') || '0'}`,
    date: apiProject.projectDate 
      ? new Date(apiProject.projectDate).toLocaleDateString('en-IN') 
      : (apiProject.createdAt ? new Date(apiProject.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')),
    status: mapServerToMobileStatus(apiProject.projectStatus || 'new'),
    progress: `${apiProject.completedTasks || 0}/${apiProject.totalTasks || 0}`,
    description: apiProject.projectDescription || '',
    size: apiProject.size || '',
    contactNumber: apiProject.contactNumber || '',
    email: apiProject.email || '',
    comment: apiProject.comment || '',
    attachment: apiProject.attachment || null,
    assignedEmployees: apiProject.assignedEmployees || [],
    totalTasks: apiProject.totalTasks || 0,
    completedTasks: apiProject.completedTasks || 0,
    projectStatus: apiProject.projectStatus || 'new',
    createdAt: apiProject.createdAt || new Date().toISOString(),
    updatedAt: apiProject.updatedAt || new Date().toISOString(),
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/api/projects`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY || '',
          } as HeadersInit,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.success) {
          const projectsArray = data.projects || data.data || [];
          setProjects(
            Array.isArray(projectsArray)
              ? projectsArray.map(transformProjectData)
              : []
          );
        } else {
          setError(data.message || 'Failed to fetch projects');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error };
} 