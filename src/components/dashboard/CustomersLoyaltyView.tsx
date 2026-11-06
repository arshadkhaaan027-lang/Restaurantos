import React, { useState } from 'react';
import {
  Users,
  Award,
  Search,
  Plus,
  Star,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Gift,
} from 'lucide-react';
import { awardManualStamps } from '../../services/restaurantService';

interface CustomersLoyaltyViewProps {
  cafeId: string;
}

export const CustomersLoyaltyView: React.FC<CustomersLoyaltyViewProps> = ({
  cafeId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [awardingUid, setAwardingUid] = useState<string | null>(null);

  // Mock initial members with real Firestore sync capabilities
  const [members, setMembers] = useState([
    {
      uid: 'customer_demo_aarav',
      membershipId: 'ROS-M-849201',
      fullName: 'Aarav Sharma',
      phone: '+91 98201 98765',
      email: 'aarav.sharma@example.com',
      stamps: 8,
      tier: 'Gold VIP',
      joinedAt: '2026-09-14',
      totalSpent: 14850,
      ordersCount: 16,
    },
    {
      uid: 'customer_demo_priya',
      membershipId: 'ROS-M-592817',
      fullName: 'Priya Patel',
      phone: '+91 98765 12345',
      email: 'priya.patel@example.com',
      stamps: 4,
      tier: 'Silver',
      joinedAt: '2026-10-02',
      totalSpent: 6200,
      ordersCount: 7,
    },
    {
      uid: 'customer_demo_rohit',
      membershipId: 'ROS-M-334102',
      fullName: 'Rohit Verma',
      phone: '+91 98112 87654',
      email: 'rohit.v@example.com',
      stamps: 2,
      tier: 'Bronze',
      joinedAt: '2026-10-24',
      totalSpent: 3100,
      ordersCount: 3,
    },
    {
      uid: 'customer_demo_ananya',
      membershipId: 'ROS-M-991204',
      fullName: 'Ananya Roy',
      phone: '+91 98300 45678',
      email: 'ananya.roy@example.com',
      stamps: 9,
      tier: 'Gold VIP',
      joinedAt: '2026-08-19',
      totalSpent: 18400,
      ordersCount: 21,
    },
  ]);

  const filtered = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.membershipId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAwardBonusStamp = async (member: any) => {
    setAwardingUid(member.uid);
    try {
      await awardManualStamps(cafeId, member.uid, 1, 'Owner VIP Courtesy Stamp');
      setMembers((prev) =>
        prev.map((m) =>
          m.uid === member.uid ? { ...m, stamps: m.stamps + 1 } : m
        )
      );
    } catch (err) {
      console.error('Failed to award stamp:', err);
    } finally {
      setAwardingUid(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#e11d48]" />
            <span>Customers & Loyalty Membership</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {members.length} Enrolled Diners
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage diner loyalty cards, atomic stamp balances, and customer tiers
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, member ID..."
            className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Customer Profile</th>
                <th className="px-4 py-3">Member ID</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Loyalty Stamps</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3 text-right">Loyalty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((member) => (
                <tr key={member.uid} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-stone-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-[#e11d48] font-bold flex items-center justify-center text-xs">
                        {member.fullName[0]}
                      </div>
                      <div>
                        <span className="block font-bold text-stone-900">
                          {member.fullName}
                        </span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          Joined {member.joinedAt}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-stone-700">
                    {member.membershipId}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{member.phone}</div>
                    <div className="text-[10px] text-stone-400">{member.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-stone-900 text-sm">
                        {member.stamps} / 10
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        member.tier === 'Gold VIP'
                          ? 'bg-amber-100 text-amber-800'
                          : member.tier === 'Silver'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {member.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 font-medium">
                    {member.ordersCount} visits (₹{member.totalSpent.toLocaleString()})
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleAwardBonusStamp(member)}
                      disabled={awardingUid === member.uid}
                      className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-[#e11d48] hover:text-white text-[#e11d48] border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{awardingUid === member.uid ? 'Adding...' : '+1 Stamp'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
