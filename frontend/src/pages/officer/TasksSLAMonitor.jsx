import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Users, Clock, AlertTriangle, CheckCircle,
    Filter, Search, Bell, ArrowUp, Phone, MessageSquare, UserX,
    Calendar, MapPin, Eye, ExternalLink, Download, RefreshCw
} from 'lucide-react';

const TasksSLAMonitor = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [officerData, setOfficerData] = useState(null);
    
    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('dept') || 'all');
    const [selectedWard, setSelectedWard] = useState(searchParams.get('ward') || 'all');
    const [showOnlySLABreached, setShowOnlySLABreached] = useState(searchParams.get('sla') === 'breached');
    const [selectedWorker, setSelectedWorker] = useState(searchParams.get('workerId') || '');
    const [dateRange, setDateRange] = useState(searchParams.get('range') || 'all');
    
    // Modal states
    const [showEscalationModal, setShowEscalationModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [escalationNote, setEscalationNote] = useState('');
    const [escalateTo, setEscalateTo] = useState('');
    const [newWorkerId, setNewWorkerId] = useState('');

    useEffect(() => {
        // Check officer session
        const session = localStorage.getItem('officerSession');
        if (!session) {
            navigate('/officer/login');
            return;
        }
        setOfficerData(JSON.parse(session));
    }, [navigate]);

    // Mock data - replace with API calls
    const departments = [
        { id: 'electrical', name: 'Electrical Maintenance', activeWorkers: 12, activeTasks: 45 },
        { id: 'civil', name: 'Civil & Roads', activeWorkers: 18, activeTasks: 67 },
        { id: 'water', name: 'Water Supply', activeWorkers: 8, activeTasks: 23 },
        { id: 'drainage', name: 'Drainage & Sewage', activeWorkers: 10, activeTasks: 34 },
        { id: 'waste', name: 'Waste Management', activeWorkers: 15, activeTasks: 52 }
    ];

    const wards = [
        { id: '12', name: 'Ward 12 - Gandhi Nagar' },
        { id: '13', name: 'Ward 13 - Lajpat Nagar' },
        { id: '14', name: 'Ward 14 - Karol Bagh' },
        { id: '15', name: 'Ward 15 - Connaught Place' }
    ];

    const workers = [
        {
            id: 'ravi123',
            name: 'Ravi Kumar',
            role: 'Lineman',
            department: 'electrical',
            ward: '12',
            phone: '+91-98765-12345',
            tasksToday: { pending: 1, inProgress: 3, completed: 1 },
            slaPerformance: 92,
            rating: 4.8,
            zone: 'Zone C'
        },
        {
            id: 'priya456',
            name: 'Priya Sharma',
            role: 'Senior Technician',
            department: 'electrical',
            ward: '13',
            phone: '+91-98765-12346',
            tasksToday: { pending: 2, inProgress: 2, completed: 3 },
            slaPerformance: 96,
            rating: 4.9,
            zone: 'Zone A'
        },
        {
            id: 'amit789',
            name: 'Amit Singh',
            role: 'Field Engineer',
            department: 'civil',
            ward: '12',
            phone: '+91-98765-12347',
            tasksToday: { pending: 0, inProgress: 4, completed: 2 },
            slaPerformance: 88,
            rating: 4.7,
            zone: 'Zone C'
        }
    ];

    const tasks = [
        {
            id: 'GG-00045',
            category: 'Streetlight',
            subcategory: 'LED Malfunction',
            location: 'MG Road, Ward 12',
            workerId: 'ravi123',
            workerName: 'Ravi Kumar',
            assignedTime: '2025-01-12T09:00:00Z',
            dueBy: '2025-01-14T09:00:00Z',
            status: 'In Progress',
            priority: 'High',
            slaHours: 48,
            isOverdue: false,
            remainingHours: 18,
            citizenName: 'Rajesh Kumar',
            citizenPhone: '+91-98765-43210'
        },
        {
            id: 'GG-00067',
            category: 'Streetlight',
            subcategory: 'Pole Damage',
            location: 'Park Street, Ward 13',
            workerId: 'priya456',
            workerName: 'Priya Sharma',
            assignedTime: '2025-01-10T14:00:00Z',
            dueBy: '2025-01-12T14:00:00Z',
            status: 'Pending',
            priority: 'Medium',
            slaHours: 48,
            isOverdue: true,
            overdueHours: 8,
            citizenName: 'Sunita Devi',
            citizenPhone: '+91-98765-43211'
        },
        {
            id: 'GG-00089',
            category: 'Roads',
            subcategory: 'Pothole',
            location: 'Main Market, Ward 12',
            workerId: 'amit789',
            workerName: 'Amit Singh',
            assignedTime: '2025-01-11T11:00:00Z',
            dueBy: '2025-01-18T11:00:00Z',
            status: 'In Progress',
            priority: 'High',
            slaHours: 168,
            isOverdue: false,
            remainingHours: 142,
            citizenName: 'Mohan Lal',
            citizenPhone: '+91-98765-43212'
        }
    ];

    const slaRules = [
        { category: 'Streetlight', hours: 48, description: 'Street lighting issues' },
        { category: 'Critical Power', hours: 24, description: 'Power outages affecting multiple areas' },
        { category: 'Roads', hours: 168, description: 'Road repairs and maintenance' },
        { category: 'Water Supply', hours: 72, description: 'Water supply disruptions' },
        { category: 'Drainage', hours: 96, description: 'Drainage and sewage issues' }
    ];

    // Filter functions
    const getFilteredWorkers = () => {
        return workers.filter(worker => {
            if (selectedDepartment !== 'all' && worker.department !== selectedDepartment) return false;
            if (selectedWard !== 'all' && worker.ward !== selectedWard) return false;
            if (selectedWorker && worker.id !== selectedWorker) return false;
            return true;
        });
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            if (selectedDepartment !== 'all') {
                const worker = workers.find(w => w.id === task.workerId);
                if (!worker || worker.department !== selectedDepartment) return false;
            }
            if (selectedWard !== 'all') {
                const worker = workers.find(w => w.id === task.workerId);
                if (!worker || worker.ward !== selectedWard) return false;
            }
            if (selectedWorker && task.workerId !== selectedWorker) return false;
            if (showOnlySLABreached && !task.isOverdue) return false;
            if (dateRange === 'today') {
                const today = new Date().toDateString();
                const assignedDate = new Date(task.assignedTime).toDateString();
                if (assignedDate !== today) return false;
            }
            return true;
        });
    };

    // Update URL params when filters change
    const updateFilters = (newFilters) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== false) {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    // Action handlers
    const handleSendReminder = (task) => {
        // Send reminder logic
        console.log('Sending reminder for task:', task.id);
        // In real app, this would make API call
    };

    const handleEscalate = (task) => {
        setSelectedTask(task);
        setShowEscalationModal(true);
    };

    const handleReassign = (task) => {
        setSelectedTask(task);
        setShowReassignModal(true);
    };

    const formatTimeRemaining = (task) => {
        if (task.isOverdue) {
            return (
                <span style={{ color: '#DC2626', fontWeight: '600' }}>
                    Overdue by {task.overdueHours}h
                </span>
            );
        } else {
            const hours = task.remainingHours;
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            
            if (hours <= 24) {
                return (
                    <span style={{ color: hours <= 6 ? '#F59E0B' : '#10B981', fontWeight: '600' }}>
                        {hours <= 6 ? '⚠️ ' : ''}Due in {hours}h
                    </span>
                );
            } else {
                return (
                    <span style={{ color: '#10B981', fontWeight: '600' }}>
                        Due in {days}d {remainingHours}h
                    </span>
                );
            }
        }
    };

    if (!officerData) {
        return <div>Loading...</div>;
    }

    const filteredWorkers = getFilteredWorkers();
    const filteredTasks = getFilteredTasks();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
            {/* Header Bar */}
            <div style={{
                backgroundColor: '#1F4E78',
                color: 'white',
                padding: '1rem 0',
                borderBottom: '3px solid #F77F00'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Left: Title and Breadcrumb */}
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                            Workers & SLA Monitor
                        </h1>
                        <div style={{ 
                            fontSize: '0.875rem', 
                            opacity: 0.9,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.25rem'
                        }}>
                            <button
                                onClick={() => navigate('/officer/dashboard')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    textDecoration: 'underline'
                                }}
                            >
                                Dashboard
                            </button>
                            <span>></span>
                            <span>Workers & SLA</span>
                        </div>
                    </div>

                    {/* Right: Officer Info */}
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        {officerData.name} • {officerData.designation}
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E3EEF7',
                padding: '1rem 0'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                            Filters:
                        </span>
                    </div>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => {
                            setSelectedDepartment(e.target.value);
                            updateFilters({ 
                                dept: e.target.value, 
                                ward: selectedWard, 
                                sla: showOnlySLABreached ? 'breached' : null,
                                workerId: selectedWorker,
                                range: dateRange
                            });
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '2px solid #E3EEF7',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedWard}
                        onChange={(e) => {
                            setSelectedWard(e.target.value);
                            updateFilters({ 
                                dept: selectedDepartment, 
                                ward: e.target.value, 
                                sla: showOnlySLABreached ? 'breached' : null,
                                workerId: selectedWorker,
                                range: dateRange
                            });
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '2px solid #E3EEF7',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="all">All Wards</option>
                        {wards.map(ward => (
                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                        ))}
                    </select>

                    <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={showOnlySLABreached}
                            onChange={(e) => {
                                setShowOnlySLABreached(e.target.checked);
                                updateFilters({ 
                                    dept: selectedDepartment, 
                                    ward: selectedWard, 
                                    sla: e.target.checked ? 'breached' : null,
                                    workerId: selectedWorker,
                                    range: dateRange
                                });
                            }}
                            style={{ accentColor: '#DC2626' }}
                        />
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Show only SLA breached
                    </label>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
                
                {/* Worker Summary Cards */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#1B3A4B', 
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Users className="w-5 h-5" />
                        Worker Summary ({filteredWorkers.length} workers)
                    </h2>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '1rem' 
                    }}>
                        {filteredWorkers.map(worker => (
                            <div
                                key={worker.id}
                                onClick={() => {
                                    setSelectedWorker(worker.id);
                                    updateFilters({ 
                                        dept: selectedDepartment, 
                                        ward: selectedWard, 
                                        sla: showOnlySLABreached ? 'breached' : null,
                                        workerId: worker.id,
                                        range: dateRange
                                    });
                                }}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                                    border: selectedWorker === worker.id ? '2px solid #1F4E78' : '1px solid #E3EEF7',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedWorker !== worker.id) {
                                        e.target.style.borderColor = '#F77F00';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (selectedWorker !== worker.id) {
                                        e.target.style.borderColor = '#E3EEF7';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1B3A4B', margin: 0 }}>
                                            {worker.name}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0' }}>
                                            {worker.role} • {worker.zone}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                                            {worker.phone}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: worker.slaPerformance >= 95 ? '#ECFDF5' : 
                                                        worker.slaPerformance >= 90 ? '#FFFBEB' : '#FEF2F2',
                                        color: worker.slaPerformance >= 95 ? '#059669' : 
                                               worker.slaPerformance >= 90 ? '#D97706' : '#DC2626',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        SLA: {worker.slaPerformance}%
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F59E0B' }}>
                                            {worker.tasksToday.pending}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Pending</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3B82F6' }}>
                                            {worker.tasksToday.inProgress}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>In Progress</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10B981' }}>
                                            {worker.tasksToday.completed}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Completed</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`tel:${worker.phone}`);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: '#10B981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <Phone className="w-3 h-3" />
                                        Call
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Navigate to worker profile (future phase)
                                            console.log('View profile for:', worker.id);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: 'white',
                                            color: '#1F4E78',
                                            border: '1px solid #1F4E78',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <Eye className="w-3 h-3" />
                                        Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Worker Activity Panel */}
                {selectedWorker && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '2rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7'
                    }}>
                        {(() => {
                            const worker = workers.find(w => w.id === selectedWorker);
                            return worker ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1B3A4B', margin: 0 }}>
                                                {worker.name} – {worker.role} ({worker.zone})
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                                                Today: {worker.tasksToday.completed} completed, {worker.tasksToday.pending} pending, SLA {worker.slaPerformance}%
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                setDateRange('today');
                                                updateFilters({ 
                                                    dept: selectedDepartment, 
                                                    ward: selectedWard, 
                                                    sla: showOnlySLABreached ? 'breached' : null,
                                                    workerId: selectedWorker,
                                                    range: 'today'
                                                });
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: dateRange === 'today' ? '#1F4E78' : 'white',
                                                color: dateRange === 'today' ? 'white' : '#1F4E78',
                                                border: '1px solid #1F4E78',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Show only today's tasks
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedWorker('');
                                                updateFilters({ 
                                                    dept: selectedDepartment, 
                                                    ward: selectedWard, 
                                                    sla: showOnlySLABreached ? 'breached' : null,
                                                    workerId: '',
                                                    range: dateRange
                                                });
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: 'white',
                                                color: '#6B7280',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>
                )}

                {/* Task List */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    
                    {/* Main Task Table */}
                    <div>
                        <h2 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B', 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Clock className="w-5 h-5" />
                            Active Tasks ({filteredTasks.length})
                        </h2>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            overflow: 'hidden'
                        }}>
                            {/* Table Header */}
                            <div style={{
                                backgroundColor: '#1F4E78',
                                color: 'white',
                                padding: '1rem',
                                display: 'grid',
                                gridTemplateColumns: '120px 1fr 1fr 120px 120px 120px 100px',
                                gap: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                <div>Complaint ID</div>
                                <div>Category & Location</div>
                                <div>Worker</div>
                                <div>Assigned</div>
                                <div>Due By</div>
                                <div>Time Remaining</div>
                                <div>Actions</div>
                            </div>

                            {/* Table Rows */}
                            <div>
                                {filteredTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            padding: '1rem',
                                            display: 'grid',
                                            gridTemplateColumns: '120px 1fr 1fr 120px 120px 120px 100px',
                                            gap: '1rem',
                                            borderBottom: index < filteredTasks.length - 1 ? '1px solid #E3EEF7' : 'none',
                                            backgroundColor: task.isOverdue ? '#FEF2F2' : 'white',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {/* Complaint ID */}
                                        <div>
                                            <button
                                                onClick={() => navigate(`/officer/complaints/${task.id}`)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#1F4E78',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                {task.id}
                                            </button>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: task.priority === 'High' ? '#DC2626' : 
                                                       task.priority === 'Medium' ? '#F59E0B' : '#10B981',
                                                fontWeight: '600',
                                                marginTop: '0.25rem'
                                            }}>
                                                {task.priority}
                                            </div>
                                        </div>

                                        {/* Category & Location */}
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1B3A4B' }}>
                                                {task.category}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                {task.subcategory}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                <MapPin className="w-3 h-3" />
                                                {task.location}
                                            </div>
                                        </div>

                                        {/* Worker */}
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setSelectedWorker(task.workerId);
                                                    updateFilters({ 
                                                        dept: selectedDepartment, 
                                                        ward: selectedWard, 
                                                        sla: showOnlySLABreached ? 'breached' : null,
                                                        workerId: task.workerId,
                                                        range: dateRange
                                                    });
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#1F4E78',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                {task.workerName}
                                            </button>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                {(() => {
                                                    const worker = workers.find(w => w.id === task.workerId);
                                                    return worker ? worker.role : 'Unknown';
                                                })()}
                                            </div>
                                        </div>

                                        {/* Assigned Time */}
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                            {new Date(task.assignedTime).toLocaleDateString('en-IN')}
                                            <br />
                                            {new Date(task.assignedTime).toLocaleTimeString('en-IN', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>

                                        {/* Due By */}
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                            {new Date(task.dueBy).toLocaleDateString('en-IN')}
                                            <br />
                                            {new Date(task.dueBy).toLocaleTimeString('en-IN', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>

                                        {/* Time Remaining */}
                                        <div>
                                            {formatTimeRemaining(task)}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {task.isOverdue && (
                                                <>
                                                    <button
                                                        onClick={() => handleSendReminder(task)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#F59E0B',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Bell className="w-3 h-3" />
                                                        Remind
                                                    </button>
                                                    <button
                                                        onClick={() => handleEscalate(task)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#DC2626',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                        Escalate
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleReassign(task)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: 'white',
                                                    color: '#1F4E78',
                                                    border: '1px solid #1F4E78',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <UserX className="w-3 h-3" />
                                                Reassign
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredTasks.length === 0 && (
                                <div style={{
                                    padding: '3rem',
                                    textAlign: 'center',
                                    color: '#6B7280'
                                }}>
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        No tasks found
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        Try adjusting your filters to see more results.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SLA Configuration Panel */}
                    <div>
                        <h2 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B', 
                            marginBottom: '1rem'
                        }}>
                            SLA Rules (Reference)
                        </h2>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                backgroundColor: '#F77F00',
                                color: 'white',
                                padding: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                Current SLA Standards
                            </div>

                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {slaRules.map((rule, index) => (
                                        <div key={index} style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#F9FAFB',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '0.375rem'
                                        }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B', marginBottom: '0.25rem' }}>
                                                {rule.category}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                {rule.description}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F77F00' }}>
                                                {rule.hours} hours
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                                    <button
                                        onClick={() => window.open('/downloads/sla-policy.pdf', '_blank')}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#1F4E78',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                        View Full SLA Policy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Escalation Modal */}
            {showEscalationModal && selectedTask && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#DC2626', margin: 0 }}>
                                Escalate Task {selectedTask.id}
                            </h3>
                            <button
                                onClick={() => setShowEscalationModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                Task overdue by {selectedTask.overdueHours} hours
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                {selectedTask.category} - {selectedTask.location}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Escalate to
                            </label>
                            <select
                                value={escalateTo}
                                onChange={(e) => setEscalateTo(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">Select escalation level...</option>
                                <option value="senior_engineer">Senior Engineer</option>
                                <option value="zonal_officer">Zonal Officer</option>
                                <option value="commissioner">Commissioner</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Escalation Note
                            </label>
                            <textarea
                                value={escalationNote}
                                onChange={(e) => setEscalationNote(e.target.value)}
                                placeholder="Explain why this task needs escalation..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowEscalationModal(false);
                                    setEscalationNote('');
                                    setEscalateTo('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    color: '#6B7280',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Escalation logic here
                                    console.log('Escalating task:', selectedTask.id, 'to:', escalateTo);
                                    setShowEscalationModal(false);
                                    setEscalationNote('');
                                    setEscalateTo('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#DC2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <ArrowUp className="w-4 h-4" />
                                Confirm Escalation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {showReassignModal && selectedTask && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Reassign Task {selectedTask.id}
                            </h3>
                            <button
                                onClick={() => setShowReassignModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Available Workers (Same Department)
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {workers.filter(w => w.id !== selectedTask.workerId).map((worker) => (
                                    <label key={worker.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        border: `2px solid ${newWorkerId === worker.id ? '#1F4E78' : '#E5E7EB'}`,
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        backgroundColor: newWorkerId === worker.id ? '#F0F9FF' : 'white'
                                    }}>
                                        <input
                                            type="radio"
                                            name="newWorker"
                                            value={worker.id}
                                            checked={newWorkerId === worker.id}
                                            onChange={(e) => setNewWorkerId(e.target.value)}
                                            style={{ accentColor: '#1F4E78' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                {worker.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                {worker.role} • Current load: {worker.tasksToday.pending + worker.tasksToday.inProgress} tasks • SLA: {worker.slaPerformance}%
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: worker.tasksToday.pending + worker.tasksToday.inProgress <= 3 ? '#ECFDF5' : '#FEF3C7',
                                            color: worker.tasksToday.pending + worker.tasksToday.inProgress <= 3 ? '#059669' : '#D97706',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {worker.tasksToday.pending + worker.tasksToday.inProgress <= 3 ? 'Available' : 'Busy'}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowReassignModal(false);
                                    setNewWorkerId('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    color: '#6B7280',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Reassign logic here
                                    console.log('Reassigning task:', selectedTask.id, 'to:', newWorkerId);
                                    setShowReassignModal(false);
                                    setNewWorkerId('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <UserX className="w-4 h-4" />
                                Reassign Worker
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksSLAMonitor;