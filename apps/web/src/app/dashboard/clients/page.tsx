'use client';

import { useClients, useCreateClient } from '@/lib/api-hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function ClientsPage() {
    const { data: clients, isLoading } = useClients();
    const createClientMutation = useCreateClient();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients?.filter(client =>
        `${client.firstName} ${client.lastName} ${client.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
                                ← Back
                            </Link>
                            <span className="text-xl font-bold text-white">Clients</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-medium hover:from-emerald-500 hover:to-cyan-500 transition"
                        >
                            + Add Client
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-6">
                    <input
                        type="search"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                </div>

                {/* Clients Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients?.map(client => (
                            <Link
                                key={client.id}
                                href={`/dashboard/clients/${client.id}`}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl font-semibold">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition">
                                            {client.firstName} {client.lastName}
                                        </h3>
                                        <p className="text-slate-400 text-sm">{client.email}</p>
                                        {client.phone && (
                                            <p className="text-slate-500 text-sm mt-1">{client.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {client.allergies?.length > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                                {client.allergies.length} allergies
                                            </span>
                                        )}
                                        {client.conditions?.length > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                                                {client.conditions.length} conditions
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {filteredClients?.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No clients found</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-emerald-400 hover:text-emerald-300"
                        >
                            Add your first client
                        </button>
                    </div>
                )}
            </main>

            {/* Add Client Modal */}
            {showModal && (
                <AddClientModal
                    onClose={() => setShowModal(false)}
                    onSubmit={async (data) => {
                        await createClientMutation.mutateAsync(data);
                        setShowModal(false);
                    }}
                    isLoading={createClientMutation.isPending}
                />
            )}
        </div>
    );
}

function AddClientModal({ onClose, onSubmit, isLoading }: {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Add New Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))}
                            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))}
                            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            placeholder="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))}
                            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData(f => ({ ...f, gender: e.target.value }))}
                            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Adding...' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
