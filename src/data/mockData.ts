import { useState, useEffect } from "react";

export interface Refund {
  id: string;
  claimId: string;
  vatPeriod: string;
  amount: number;
  submittedDate: string;
  status: "approved" | "pending" | "rejected" | "processing";
  description?: string;
  documents?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

export interface UserStats {
  totalClaims: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  totalApprovedAmount: number;
}

// Initial mock refunds
const initialRefunds: Refund[] = [
  {
    id: "1",
    claimId: "RC-2024-001",
    vatPeriod: "Q1 2024",
    amount: 125000,
    submittedDate: "2024-03-15",
    status: "approved",
    description: "Quarterly VAT refund claim for manufacturing exports",
  },
  {
    id: "2",
    claimId: "RC-2024-002",
    vatPeriod: "Q2 2024",
    amount: 89500,
    submittedDate: "2024-06-20",
    status: "processing",
    description: "VAT refund for agricultural equipment purchases",
  },
  {
    id: "3",
    claimId: "RC-2024-003",
    vatPeriod: "March 2024",
    amount: 45000,
    submittedDate: "2024-04-05",
    status: "pending",
    description: "Monthly VAT refund claim",
  },
  {
    id: "4",
    claimId: "RC-2024-004",
    vatPeriod: "April 2024",
    amount: 32000,
    submittedDate: "2024-05-10",
    status: "rejected",
    description: "Documentation incomplete - resubmission required",
  },
  {
    id: "5",
    claimId: "RC-2024-005",
    vatPeriod: "May 2024",
    amount: 78000,
    submittedDate: "2024-06-08",
    status: "approved",
    description: "VAT refund for export services",
  },
  {
    id: "6",
    claimId: "RC-2024-006",
    vatPeriod: "June 2024",
    amount: 156000,
    submittedDate: "2024-07-12",
    status: "pending",
    description: "Q2 supplementary VAT claim",
  },
  {
    id: "7",
    claimId: "RC-2024-007",
    vatPeriod: "July 2024",
    amount: 67500,
    submittedDate: "2024-08-15",
    status: "processing",
    description: "Import duty refund request",
  },
];

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Claim Approved",
    message: "Your claim RC-2024-005 has been approved. Refund will be processed within 5 business days.",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Document Required",
    message: "Additional documentation needed for claim RC-2024-003. Please upload invoice copies.",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Processing Update",
    message: "Claim RC-2024-002 is now under review by the assessment team.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "4",
    title: "Claim Rejected",
    message: "Claim RC-2024-004 was rejected due to incomplete documentation. Please resubmit.",
    type: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

// Simulated real-time data store
let refundsStore = [...initialRefunds];
let notificationsStore = [...initialNotifications];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeToData = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const getRefunds = () => [...refundsStore];
export const getNotifications = () => [...notificationsStore];

export const addRefund = (refund: Omit<Refund, "id" | "claimId">) => {
  const newRefund: Refund = {
    ...refund,
    id: String(refundsStore.length + 1),
    claimId: `RC-2024-${String(refundsStore.length + 1).padStart(3, "0")}`,
  };
  refundsStore = [newRefund, ...refundsStore];
  
  // Add notification for new claim
  const newNotification: Notification = {
    id: String(notificationsStore.length + 1),
    title: "Claim Submitted",
    message: `Your claim ${newRefund.claimId} for ETB ${newRefund.amount.toLocaleString()} has been submitted.`,
    type: "info",
    timestamp: new Date().toISOString(),
    read: false,
  };
  notificationsStore = [newNotification, ...notificationsStore];
  
  notifyListeners();
  return newRefund;
};

export const markNotificationRead = (id: string) => {
  notificationsStore = notificationsStore.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  notifyListeners();
};

export const markAllNotificationsRead = () => {
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
  notifyListeners();
};

export const calculateStats = (): UserStats => {
  const refunds = getRefunds();
  return {
    totalClaims: refunds.length,
    pendingReview: refunds.filter((r) => r.status === "pending" || r.status === "processing").length,
    approved: refunds.filter((r) => r.status === "approved").length,
    rejected: refunds.filter((r) => r.status === "rejected").length,
    totalApprovedAmount: refunds
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0),
  };
};

// Custom hook for real-time data
export const useRefunds = () => {
  const [refunds, setRefunds] = useState(getRefunds());

  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setRefunds(getRefunds());
    });
    return unsubscribe;
  }, []);

  return refunds;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState(getNotifications());

  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  return notifications;
};

export const useStats = () => {
  const [stats, setStats] = useState(calculateStats());

  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setStats(calculateStats());
    });
    return unsubscribe;
  }, []);

  return stats;
};

// Simulate real-time status updates
export const startRealtimeSimulation = () => {
  const interval = setInterval(() => {
    const pendingRefunds = refundsStore.filter(
      (r) => r.status === "pending" || r.status === "processing"
    );
    
    if (pendingRefunds.length > 0 && Math.random() > 0.7) {
      const randomRefund = pendingRefunds[Math.floor(Math.random() * pendingRefunds.length)];
      const newStatus = randomRefund.status === "pending" ? "processing" : 
        Math.random() > 0.3 ? "approved" : "rejected";
      
      refundsStore = refundsStore.map((r) =>
        r.id === randomRefund.id ? { ...r, status: newStatus } : r
      );
      
      const notificationType = newStatus === "approved" ? "success" : 
        newStatus === "rejected" ? "error" : "info";
      
      const newNotification: Notification = {
        id: String(Date.now()),
        title: `Claim ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Claim ${randomRefund.claimId} status updated to ${newStatus}.`,
        type: notificationType,
        timestamp: new Date().toISOString(),
        read: false,
      };
      notificationsStore = [newNotification, ...notificationsStore];
      
      notifyListeners();
    }
  }, 15000); // Every 15 seconds

  return () => clearInterval(interval);
};
