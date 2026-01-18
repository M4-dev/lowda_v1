import prisma from "@/libs/prismadb";

export default async function getOrderLocations() {
  // Group by address, count orders
  const locations = await prisma.order.groupBy({
    by: ["address"],
    _count: {
      _all: true,
    },
  });

  // Group by address, count cancels
  const cancels = await prisma.order.groupBy({
    by: ["address"],
    where: { cancelled: true },
    _count: {
      _all: true,
    },
  });

  const cancelMap: Record<string, number> = {};
  cancels.forEach((c) => {
    cancelMap[c.address || "Unknown"] = c._count._all;
  });

  // Helper to extract a neat location from address string/object
  function extractLocation(address: any): string {
    if (!address) return "Unknown";
    if (typeof address === "string") {
      try {
        // Try to parse as JSON if possible
        const parsed = JSON.parse(address);
        if (typeof parsed === "string") return parsed;
        if (parsed && typeof parsed === "object") {
          if (parsed.city) return parsed.city;
          if (parsed.location) return parsed.location;
          if (parsed.address) return parsed.address;
          if (parsed.line1) return parsed.line1;
          
          const values = Object.values(parsed).filter((v) => typeof v === "string" && v.trim().length > 0);
          if (values.length > 0) return values.join(", ");
        }
      } catch {
        // Not JSON, just return the string (or first part if comma-separated)
        return address.split(",")[0].trim();
      }
    }
    return String(address);
  }

  const aggregatedData: Record<string, { label: string; orderCount: number; cancelCount: number }> = {};

  locations.forEach((loc) => {
    let neatLocation = extractLocation(loc.address).trim();
    if (!neatLocation) neatLocation = "Unknown";
    
    const normalizedKey = neatLocation.toLowerCase();
    const rawAddress = loc.address || "Unknown";

    if (!aggregatedData[normalizedKey]) {
      aggregatedData[normalizedKey] = { 
        label: neatLocation, 
        orderCount: 0, 
        cancelCount: 0 
      };
    }
    aggregatedData[normalizedKey].orderCount += loc._count._all;
    aggregatedData[normalizedKey].cancelCount += (cancelMap[rawAddress] || 0);
  });

  return Object.values(aggregatedData).map((data) => ({
    address: data.label,
    orderCount: data.orderCount,
    cancelCount: data.cancelCount,
  }));
}
