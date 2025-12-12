"use client";

import { Order, User } from "@prisma/client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatPrice } from "@/utils/format-price";
import Heading from "@/app/components/heading";
import Status from "@/app/components/status";
import {
  Clock,
  Trash2,
  Truck,
  Check,
  Eye,
  CreditCard,
  List,
  XCircle,
} from "lucide-react";
import ActionButton from "@/app/components/action-button";
import { useCallback, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment";
import AlertDialog from "@/app/components/alert-dialog";
import Button from "@/app/components/button";

type ExtendedOrder = Order & {
  user: User | null;
};

interface ManageOrdersClientProps {
  orders: ExtendedOrder[];
}

const ManageOrdersClient: React.FC<ManageOrdersClientProps> = ({ orders }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nameToDelete, setNameToDelete] = useState("");
  const [orderToDelete, setOrderToDelete] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  // Listen to SSE for order updates
  useEffect(() => {
    const connectSSE = () => {
      const eventSource = new EventSource("/api/admin/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "notification") {
            // Refresh orders when payment status changes
            router.refresh();
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current === eventSource) {
            connectSSE();
          }
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [router]);

  let rows: any = [];

  if (orders) {
    rows = orders.map((order) => {
      return {
        id: order.id,
        customer: order.user?.name || order.guestName || "Guest",
        amount: formatPrice(order.amount),
        paymentStatus: order.paymentClaimed ? "complete" : "pending",
        paymentConfirmed: order.paymentConfirmed,
        date: moment(order.createDate).fromNow(),
        deliveryStatus: order.deliveryStatus,
        cancelled: order.cancelled,
        userConfirmedDelivery: (order as any).userConfirmedDelivery || false,
      };
    });
  }

  const handleDispatch = useCallback((id: string) => {
    setLoadingActions((prev) => ({ ...prev, [`dispatch-${id}`]: true }));
    axios
      .put("/api/order", {
        id,
        deliveryStatus: "dispatched",
      })
      .then((res) => {
        toast.success("Order Dispatched.");
        router.refresh();
      })
      .catch((error) => {
        toast.error("Oops! Something went wrong.");
        console.log(error);
      })
      .finally(() => {
        setLoadingActions((prev) => ({ ...prev, [`dispatch-${id}`]: false }));
      });
  }, [router]);

  const handleDeliver = useCallback((id: string) => {
    setLoadingActions((prev) => ({ ...prev, [`deliver-${id}`]: true }));
    axios
      .put("/api/order", {
        id,
        deliveryStatus: "delivered",
      })
      .then((res) => {
        toast.success("Order Delivered.");
        router.refresh();
      })
      .catch((error) => {
        toast.error("Oops! Something went wrong.");
        console.log(error);
      })
      .finally(() => {
        setLoadingActions((prev) => ({ ...prev, [`deliver-${id}`]: false }));
      });
  }, [router]);

  const handleConfirmPayment = useCallback((id: string) => {
    setLoadingActions((prev) => ({ ...prev, [`payment-${id}`]: true }));
    axios
      .put(`/api/admin/order/${id}/confirm-payment`, {})
      .then((res) => {
        // Don't show toast here - SSE notification will handle it
        router.refresh();
      })
      .catch((error) => {
        toast.error("Failed to confirm payment.");
        console.log(error);
      })
      .finally(() => {
        setLoadingActions((prev) => ({ ...prev, [`payment-${id}`]: false }));
      });
  }, [router]);

  const handleBatchDispatch = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one order.");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedRows.map((id) =>
          axios.put("/api/order", {
            id,
            deliveryStatus: "dispatched",
          })
        )
      );
      toast.success(`${selectedRows.length} order(s) dispatched!`);
      setSelectedRows([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to dispatch some orders.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRows, router]);

  const handleBatchDeliver = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one order.");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedRows.map((id) =>
          axios.put("/api/order", {
            id,
            deliveryStatus: "delivered",
          })
        )
      );
      toast.success(`${selectedRows.length} order(s) marked as delivered!`);
      setSelectedRows([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update some orders.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRows, router]);

  const handleGenerateOrderList = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    
    const orderIds = selectedRows.join(",");
    router.push(`/admin/order-list?orders=${orderIds}`);
  };

  const handleDeleteOrder = useCallback((row: string) => {
    axios
      .put("/api/delete-order", {
        row,
      })
      .then((res) => {
        localStorage.removeItem("paymentIntent");
        toast.success("Order Deleted.");
        router.refresh();
      })
      .catch((error) => {
        toast.error("Oops! Something went wrong.");
        console.log(error);
      });
  }, [router]);

  const handleCancelOrder = useCallback((id: string) => {
    setLoadingActions((prev) => ({ ...prev, [`cancel-${id}`]: true }));
    axios
      .put("/api/order/cancel", {
        orderId: id,
      })
      .then((res) => {
        if (res.data.refundAmount > 0) {
          toast.success(`Order cancelled. Refund: ${formatPrice(res.data.refundAmount)}`);
        } else {
          toast.success("Order cancelled successfully.");
        }
        router.refresh();
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Failed to cancel order.");
        console.log(error);
      })
      .finally(() => {
        setLoadingActions((prev) => ({ ...prev, [`cancel-${id}`]: false }));
      });
  }, [router]);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      renderCell: (params) => {
        const id = params.row.id as string | undefined;
        const shortened = id ? id.slice(-5) : "N/A";
        return <div className="font-mono text-sm text-slate-800">{shortened}</div>;
      },
    },
    { field: "customer", headerName: "Customer Name", width: 130 },
    {
      field: "amount",
      headerName: "Amount(NGN)",
      width: 130,
      renderCell: (params) => {
        return (
          <div className="font-bold text-slate-800">{params.row.amount}</div>
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 130,
      renderCell: (params) => {
        return (
          <div>
            {params.row.paymentStatus === "pending" ? (
              <Status
                text="pending"
                icon={Clock}
                bg="bg-slate-200"
                color="text-slate-700"
              />
            ) : (
              params.row.paymentStatus === "complete" && (
                <Status
                  text="completed" 
                  icon={Check}
                  bg="bg-green-200"
                  color="text-green-700"
                />
              )
            )}
          </div>
        );
      },
    },
    {
      field: "deliveryStatus",
      headerName: "Delivery Status",
      width: 130,
      renderCell: (params) => {
        return (
          <div>
            {params.row.cancelled ? (
              <Status
                text="cancelled"
                icon={XCircle}
                bg="bg-red-200"
                color="text-red-700"
              />
            ) : params.row.deliveryStatus === "pending" ? (
              <Status
                text="pending"
                icon={Clock}
                bg="bg-slate-200"
                color="text-slate-700"
              />
            ) : params.row.deliveryStatus === "dispatched" ? (
              <Status
                text="dispatched"
                icon={Truck}
                bg="bg-purple-200"
                color="text-purple-700"
              />
            ) : (
              params.row.deliveryStatus === "delivered" && (
                <Status
                  text="delivered"
                  icon={Check}
                  bg="bg-green-200"
                  color="text-green-700"
                />
              )
            )}
          </div>
        );
      },
    },
    {
      field: "userConfirmedDelivery",
      headerName: "User Confirmed",
      width: 140,
      renderCell: (params) => {
        return (
          <div>
            {params.row.deliveryStatus === "dispatched" && (
              params.row.userConfirmedDelivery ? (
                <Status
                  text="confirmed"
                  icon={Check}
                  bg="bg-green-200"
                  color="text-green-700"
                />
              ) : (
                <Status
                  text="awaiting"
                  icon={Clock}
                  bg="bg-amber-200"
                  color="text-amber-700"
                />
              )
            )}
          </div>
        );
      },
    },
    {
      field: "paymentConfirmed",
      headerName: "Payment Confirmed",
      width: 140,
      renderCell: (params) => {
        return (
          <div>
            {params.row.paymentConfirmed ? (
              <Status
                text="confirmed"
                icon={Check}
                bg="bg-green-200"
                color="text-green-700"
              />
            ) : (
              <Status
                text="awaiting"
                icon={Clock}
                bg="bg-yellow-200"
                color="text-yellow-700"
              />
            )}
          </div>
        );
      },
    },
    { field: "date", headerName: "Date", width: 130 },
    {
      field: "action",
      headerName: "Actions",
      width: 210,
      renderCell: (params) => {
        return (
          <div className="flex gap-2 flex-wrap">
            {params.row.paymentStatus === "complete" && !params.row.paymentConfirmed && (
              <ActionButton
                icon={CreditCard}
                onClick={() => {
                  handleConfirmPayment(params.row.id);
                }}
                isLoading={loadingActions[`payment-${params.row.id}`]}
                label="Confirm"
              />
            )}
            {!params.row.cancelled && params.row.deliveryStatus !== "delivered" && (
              <>
                <ActionButton
                  icon={Truck}
                  onClick={() => {
                    handleDispatch(params.row.id);
                  }}
                  isLoading={loadingActions[`dispatch-${params.row.id}`]}
                  label="Dispatch"
                />
                {/* Only show Deliver button if user has confirmed delivery */}
                {params.row.userConfirmedDelivery && (
                  <ActionButton
                    icon={Check}
                    onClick={() => {
                      handleDeliver(params.row.id);
                    }}
                    isLoading={loadingActions[`deliver-${params.row.id}`]}
                    label="Deliver"
                  />
                )}
                <ActionButton
                  icon={XCircle}
                  onClick={() => {
                    handleCancelOrder(params.row.id);
                  }}
                  isLoading={loadingActions[`cancel-${params.row.id}`]}
                  label="Cancel"
                />
              </>
            )}
            <ActionButton
              icon={Eye}
              onClick={() => {
                router.push(`/order/${params.row.id}`);
              }}
              label="View"
            />
            {params.row.paymentStatus === "pending" && !params.row.cancelled && (
              <ActionButton
                icon={Trash2}
                onClick={() => {
                  setNameToDelete(params.row.customer);
                  setOrderToDelete(params.row);
                  setOpen(true);
                }}
                label="Delete"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-[1150px] m-auto text-xl">
      <div className="mb-4 mt-8">
        <Heading title="Manage Orders" center />
      </div>
      
      {/* Batch Actions */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-4">
          <span className="text-sm text-blue-700 font-semibold whitespace-nowrap">
            {selectedRows.length} order(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateOrderList}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <List size={16} />
              Generate List
            </button>
            <button
              onClick={handleBatchDispatch}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : "Dispatch All"}
            </button>
            <button
              onClick={handleBatchDeliver}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : "Mark Delivered"}
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="px-3 py-1 text-sm bg-gray-400 text-gray-700 rounded hover:bg-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 9 },
            },
          }}
          pageSizeOptions={[9, 20]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection as string[]);
          }}
          rowSelectionModel={selectedRows}
        />
      </div>
      <AlertDialog
        open={open}
        setOpen={setOpen}
        action={"delete an order from "}
        name={nameToDelete}
        handleOK={() => handleDeleteOrder(orderToDelete)}
      />
    </div>
  );
};

export default ManageOrdersClient;
