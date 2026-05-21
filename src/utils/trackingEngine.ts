export interface TrackingMilestone {
  status: string;
  location: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
}

export interface TrackingData {
  carrier: string;
  trackingId: string;
  currentStatus: string; // 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'HELD' | 'FAILED'
  statusLabel: string;
  statusColor: string;
  estimatedDelivery: string;
  milestones: TrackingMilestone[];
  carrierSupportPhone: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
}

// Simple deterministic string hashing helper for seed-based randomized elements
function getSeededValue(str: string, index: number, min: number = 0, max: number = 100): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const factor = Math.abs(Math.sin(hash + index));
  return Math.floor(min + factor * (max - min));
}

export function detectCarrier(trackingId: string, defaultCourier?: string): string {
  const tid = trackingId.toUpperCase().trim();
  if (tid.startsWith('FMP') || tid.startsWith('EK')) return 'Ekart Logistics';
  if (tid.startsWith('BD') || tid.startsWith('BLU') || /^\d{9}$/.test(tid)) return 'BlueDart';
  if (tid.startsWith('DX') || tid.startsWith('DEL') || /^\d{12}$/.test(tid)) return 'Delhivery';
  if (tid.endsWith('IN') && /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(tid)) return 'IndiaPost';
  if (tid.startsWith('FX') || tid.startsWith('FDX') || /^\d{10}$/.test(tid)) return 'FedEx';
  if (tid.startsWith('DT') || tid.startsWith('DTD') || tid.startsWith('99')) return 'DTDC Express';
  
  return defaultCourier || 'Shiprocket';
}

export function parseTrackingStatus(trackingId: string, orderStatus: string): { status: string; label: string; color: string } {
  const tid = trackingId.toUpperCase();
  const os = orderStatus.toUpperCase();

  // 1. Explicit override keywords in trackingId
  if (tid.includes('DELI') || tid.includes('DLV') || tid.includes('DONE')) {
    return { status: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' };
  }
  if (tid.includes('OOD') || tid.includes('OUT') || tid.includes('OF_DEL')) {
    return { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  }
  if (tid.includes('TRA') || tid.includes('TRAN') || tid.includes('TRANSIT')) {
    return { status: 'IN_TRANSIT', label: 'In Transit', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  if (tid.includes('HLD') || tid.includes('HOLD') || tid.includes('DELAY')) {
    return { status: 'HELD', label: 'On Hold', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  }
  if (tid.includes('RTO') || tid.includes('FAIL') || tid.includes('LOST')) {
    return { status: 'FAILED', label: 'Failed Delivery / RTO', color: 'bg-red-100 text-red-700 border-red-200' };
  }

  // 2. Fallback to order status mapping
  if (os === 'DELIVERED') {
    return { status: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' };
  }
  
  // 3. If Order state is SHIPPED, let's look at trackingId digits for dynamic status simulation
  if (os === 'SHIPPED') {
    // If the tracking code ends with an even digit, we simulate In Transit.
    // If it ends with an odd digit (except 9), we simulate Out for Delivery.
    // If it ends with 9, we simulate Delivered.
    const lastChar = tid.slice(-1);
    const lastDigit = parseInt(lastChar);
    
    if (!isNaN(lastDigit)) {
      if (lastDigit === 9) {
        return { status: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' };
      } else if (lastDigit === 1 || lastDigit === 3 || lastDigit === 5 || lastDigit === 7) {
        return { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse' };
      } else {
        return { status: 'IN_TRANSIT', label: 'In Transit', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      }
    }

    // Default simulation based on tracker length
    const stateVal = (tid.length % 3);
    if (stateVal === 0) return { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (stateVal === 1) return { status: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' };
    return { status: 'IN_TRANSIT', label: 'In Transit', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }

  // Under other order statuses, we match status label
  if (os === 'PACKED') return { status: 'PACKED', label: 'Packed & Dispatched', color: 'bg-purple-100 text-purple-700 border-purple-200' };
  if (os === 'CONFIRMED') return { status: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (os === 'CANCELLED') return { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' };
  
  return { status: 'PENDING', label: 'Pending', color: 'bg-yellow-105 text-yellow-700 border-yellow-250' };
}

export function generateTrackingTimeline(trackingId: string, orderStatus: string, defaultCourier?: string, orderCreatedDate?: string): TrackingData {
  const carrier = detectCarrier(trackingId, defaultCourier);
  const parsed = parseTrackingStatus(trackingId, orderStatus);
  
  const seed = trackingId || 'SEEDED_DEFAULT';
  const startDay = new Date(orderCreatedDate || '2026-05-20T00:00:00Z');
  
  // Dynamic Locations list based on seed
  const states = ['Delhi NCR Hub', 'Mumbai Logistics Terminal', 'Bengaluru South Sort Hub', 'Chennai Central Facility', 'Kolkata Airport Processing Site', 'Pune Local Hub', 'Hyderabad City Hub'];
  const locations = [
    states[getSeededValue(seed, 1, 0, states.length - 1)],
    'Nearest Delivery Distribution Center',
    'Local Delivery Hub',
    'On Route To Destination'
  ];

  const agentNames = ['Rahul Sharma', 'Ankit Mishra', 'Sundeep Yadav', 'Vikram Singh', 'Dinesh Kumar', 'Rajesh Patel'];
  const agentName = agentNames[getSeededValue(seed, 2, 0, agentNames.length - 1)];
  const agentPhone = `+91 98765 ${getSeededValue(seed, 3, 10000, 99999)}`;

  const supportNumbers: Record<string, string> = {
    'Ekart Logistics': '1800 208 9898',
    'BlueDart': '1860 233 1234',
    'Delhivery': '0124 671 9500',
    'IndiaPost': '1800 266 6868',
    'FedEx': '1800 209 6161',
    'DTDC Express': '0731 430 0000',
    'Shiprocket': '011 4118 7637'
  };

  const getLogDate = (daysToAdd: number, hourOffset: number): string => {
    const d = new Date(startDay);
    d.setDate(d.getDate() + daysToAdd);
    d.setHours(hourOffset, getSeededValue(seed, daysToAdd + 10, 0, 59), 0);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate Estimated Delivery Date
  const est = new Date(startDay);
  est.setDate(est.getDate() + 4);
  const estString = est.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const milestones: TrackingMilestone[] = [];

  // Always Step 1: Placed
  milestones.push({
    status: 'ORDER_PLACED',
    location: 'Geekhoot Platform Gateway',
    description: 'Order placed successfully. Electronic invoice, custom graphic print proof and packaging slip generated.',
    timestamp: getLogDate(0, 10),
    isCompleted: true
  });

  const level = parsed.status;

  // Step 2: Confirmed & Custom Graphic Processing (if status is confirmed or higher)
  const isConfirmed = ['CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(level);
  milestones.push({
    status: 'CONFIRMED',
    location: 'Geekhoot Production Facility',
    description: 'Graphic assets approved and sent for premium digital printing and inspection.',
    timestamp: getLogDate(0, 15),
    isCompleted: isConfirmed
  });

  // Step 3: Printed, Packed & Dispatched
  const isPacked = ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(level);
  milestones.push({
    status: 'PACKED',
    location: 'Geekhoot Packaging Hub',
    description: 'Printed merchandise packed in custom secure sleeves and handed over to logistics partner.',
    timestamp: getLogDate(1, 9),
    isCompleted: isPacked
  });

  // Step 4: Shipped & In Transit (Main hub to Local hub)
  const isShipped = ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(level);
  milestones.push({
    status: 'SHIPPED',
    location: locations[0],
    description: `Package scanned at ${locations[0]} and departed on courier linehaul container.`,
    timestamp: getLogDate(2, 11),
    isCompleted: isShipped
  });

  // Step 5: In Transit Scan
  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(level);
  milestones.push({
    status: 'IN_TRANSIT',
    location: locations[1],
    description: 'Arrived at the regional destination sorting terminal. Sorted and bagged for local route delivery.',
    timestamp: getLogDate(2, 23),
    isCompleted: isInTransit
  });

  // Step 6: Out For Delivery (Local Hub to Doorstep scan)
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(level);
  milestones.push({
    status: 'OUT_FOR_DELIVERY',
    location: locations[2],
    description: `Package out for delivery with executive ${agentName}. Phone: ${agentPhone}. Keep OTP handy/ready for delivery.`,
    timestamp: getLogDate(3, 8),
    isCompleted: isOutForDelivery
  });

  // Step 7: Completed (Delivered)
  const isDelivered = level === 'DELIVERED';
  milestones.push({
    status: 'DELIVERED',
    location: 'Customer Address Doorstep',
    description: 'Shipment delivered securely. Signature captured and uploaded. Thank you for choosing Geekhoot!',
    timestamp: getLogDate(3, 14),
    isCompleted: isDelivered
  });

  // Reverse list to show newest on top
  const activeMilestones = milestones
    .filter(m => m.isCompleted)
    .reverse();

  return {
    carrier,
    trackingId,
    currentStatus: level,
    statusLabel: parsed.label,
    statusColor: parsed.color,
    estimatedDelivery: level === 'DELIVERED' ? 'Completed' : estString,
    milestones: activeMilestones,
    carrierSupportPhone: supportNumbers[carrier] || '1800-CONTACT',
    deliveryAgentName: isOutForDelivery ? agentName : undefined,
    deliveryAgentPhone: isOutForDelivery ? agentPhone : undefined
  };
}
