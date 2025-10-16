import React from "react";
// import VehicleTable from "../components/dashboard/VehicleTable";
import SkuTable from "./SkuTable";

// import SkuTable from "../components/dashboard/SkuTable";
// import OrdersTable from "../components/dashboard/OrdersTable";
import OrdersTable from "./OrdersTable";
import VehicleTable from "./VehicleTable";

export default function DashboardHome() {
  return (
    <div>
      <SkuTable />
      <VehicleTable />
      <OrdersTable />
    </div>
  );
}
