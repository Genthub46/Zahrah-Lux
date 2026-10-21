import React, { useState, useEffect } from 'react';
import { Shield, Trash2, UserPlus, Mail, Calendar } from 'lucide-react';
import { StaffMember, getAllStaffMembers, addStaffMember, removeStaffMember } from '../../services/staffService';
import { AdminRole } from '../../services/adminPermissions';
import { useToast } from '../../contexts/ToastContext';
import { sendAutomatedEmail } from '../../services/emailUtils';

const StaffTab: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Form State
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<AdminRole>('viewer');

    const loadStaff = async () => {
        setIsLoading(true);
        const data = await getAllStaffMembers();
        setStaff(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newEmail.includes('@')) {
            showToast('Please enter a valid email', { type: 'error' });
            return;
        }
        
        try {
            const emailAddress = newEmail.toLowerCase().trim();
            const displayName = newName.trim();
            
            await addStaffMember({
                email: emailAddress,
                name: displayName,
                role: newRole,
                addedAt: new Date().toISOString()
            });

            // Send automated invitation email
            try {
                const inviteHtml = `
                    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#fff;padding:40px;text-align:center;border:1px solid #e7e5e4;">
                        <h1 style="font-size:20px;color:#1c1917;letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;">Executive Access Granted</h1>
                        <p style="color:#78716c;font-size:14px;margin-bottom:28px;">Dear ${displayName || 'Colleague'},</p>
                        <p style="color:#292524;font-size:14px;line-height:1.8;margin-bottom:32px;">You have been invited to join the executive administration panel of <strong>Zarhrah Luxury Collections</strong>.</p>
                        
                        <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:4px;padding:24px;margin:32px 0;">
                            <p style="font-size:11px;color:#a8a29e;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Authorized Identity</p>
                            <p style="font-size:16px;color:#1c1917;font-weight:bold;">${emailAddress}</p>
                            <p style="font-size:11px;color:#a8a29e;letter-spacing:2px;text-transform:uppercase;margin-top:16px;margin-bottom:8px;">Assigned Role</p>
                            <p style="font-size:13px;color:#C5A059;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${newRole.replace('_', ' ')}</p>
                        </div>

                        <a href="${window.location.origin}/admin" style="display:inline-block;background:#1c1917;color:#fff;padding:14px 32px;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;margin:16px 0;">Enter The Panel</a>
                        
                        <p style="color:#78716c;font-size:12px;margin-top:40px;line-height:1.6;">If you believe this invitation was sent in error, please disregard this email.</p>
                        <p style="color:#a8a29e;font-size:11px;margin-top:24px;letter-spacing:1px;">— Zarhrah Luxury Collections</p>
                    </div>
                `;
                
                await sendAutomatedEmail(emailAddress, 'Executive Access Invitation | Zarhrah Luxury', inviteHtml);
                showToast('Staff member invited & email sent successfully!', { type: 'success' });
            } catch (emailErr) {
                console.error("Staff added, but email failed:", emailErr);
                showToast('Staff added, but failed to send the email.', { type: 'error' });
            }

            setNewEmail('');
            setNewName('');
            setNewRole('viewer');
            loadStaff();
        } catch (err) {
            showToast('Failed to invite staff member', { type: 'error' });
        }
    };

    const handleRemove = async (email: string) => {
        if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) return;
        
        try {
            await removeStaffMember(email);
            showToast('Access revoked successfully', { type: 'success' });
            loadStaff();
        } catch (err: any) {
            showToast(err.message || 'Failed to revoke access', { type: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                        <Shield className="text-[#C5A059]" />
                        Staff Management
                    </h2>
                    <p className="text-stone-500 mt-1">Manage executive panel access and roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
                        <UserPlus size={18} className="text-[#C5A059]" />
                        Invite Staff
                    </h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                            >
                                <option value="manager">Manager (Products & Orders)</option>
                                <option value="support">Support (Orders & Waitlist)</option>
                                <option value="viewer">Viewer (Read Only)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-stone-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors"
                        >
                            Send Invite
                        </button>
                    </form>
                </div>

                {/* Staff List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4">Active Staff</h3>
                    
                    {isLoading ? (
                        <div className="text-center py-8 text-stone-500">Loading staff...</div>
                    ) : staff.length === 0 ? (
                        <div className="text-center py-8 text-stone-500">No additional staff members found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-stone-100">
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-stone-500">User</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-stone-500">Role</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-stone-500">Added</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Primary Owner is implicit, so let's show them manually if desired, but here we just list the DB */}
                                    {staff.map((s) => (
                                        <tr key={s.email} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                        <Mail size={16} className="text-stone-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-stone-900">{s.name || 'Unknown'}</p>
                                                        <p className="text-xs text-stone-500">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${s.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                      s.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                      s.role === 'support' ? 'bg-green-100 text-green-800' :
                                                      'bg-stone-100 text-stone-800'}`}>
                                                    {s.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                                    <Calendar size={12} />
                                                    {new Date(s.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => handleRemove(s.email)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffTab;
