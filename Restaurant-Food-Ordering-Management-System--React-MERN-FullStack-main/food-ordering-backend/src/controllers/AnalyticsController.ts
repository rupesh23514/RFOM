import { Request, Response } from "express";
import Order from "../models/order";
import Restaurant from "../models/restaurant";

const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    // Get time range from query params (default to 30 days)
    const timeRange = req.query.timeRange || "30d";
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "90d"
        ? 90
        : timeRange === "1y"
        ? 365
        : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // BUILD QUERY FILTER: admin sees ALL orders, restaurant_owner sees only their restaurant's orders
    const baseFilter: Record<string, unknown> = { createdAt: { $gte: startDate } };

    if (req.userRole === "restaurant_owner") {
      const restaurant = await Restaurant.findOne({ user: req.userId });
      if (!restaurant) {
        return res.json({
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalCustomers: 0,
          orderGrowth: 0,
          revenueGrowth: 0,
          topCities: [],
          topCuisines: [],
          recentOrders: [],
          monthlyData: [],
        });
      }
      baseFilter.restaurant = restaurant._id;
    }

    // Get all orders within the time range (scoped to restaurant if not admin)
    const orders = await Order.find(baseFilter)
      .populate("restaurant")
      .populate("user");

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(
      orders
        .filter((order: any) => order.user)
        .map((order: any) => order.user.toString())
    ).size;

    // Get top cities by orders
    const cityStats = orders
      .filter(
        (order: any) => order.deliveryDetails && order.deliveryDetails.city
      )
      .reduce((acc, order: any) => {
        const city = order.deliveryDetails.city;
        if (!acc[city]) {
          acc[city] = { orders: 0, revenue: 0 };
        }
        acc[city].orders += 1;
        acc[city].revenue += order.totalAmount || 0;
        return acc;
      }, {} as Record<string, { orders: number; revenue: number }>);

    const topCities = Object.entries(cityStats)
      .map(([city, stats]) => ({
        city,
        orders: stats.orders,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    // Get top cuisines from restaurants
    const cuisineStats: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.restaurant && order.restaurant.cuisines) {
        order.restaurant.cuisines.forEach((cuisine: string) => {
          cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;
        });
      }
    });

    const topCuisines = Object.entries(cuisineStats)
      .map(([cuisine, count]) => ({
        cuisine,
        orders: count,
        percentage:
          Math.round((count / Math.max(totalOrders, 1)) * 100 * 100) / 100,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 15);

    // Get recent orders
    const recentOrders = orders
      .filter((order: any) => order.deliveryDetails)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 20)
      .map((order: any) => ({
        id: order._id.toString(),
        customer: order.deliveryDetails.name,
        amount: order.totalAmount || 0,
        status: order.status,
        date: order.createdAt.toISOString().split("T")[0],
      }));

    // Calculate monthly data
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (11 - i));
      monthStart.setDate(1);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const monthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const monthRevenue = monthOrders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      monthlyData.push({
        month: months[monthStart.getMonth()],
        orders: monthOrders.length,
        revenue: monthRevenue,
      });
    }

    // Calculate growth (scoped same as main query)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousFilter: Record<string, unknown> = {
      createdAt: { $gte: previousStartDate, $lt: startDate },
    };
    if (baseFilter.restaurant) {
      previousFilter.restaurant = baseFilter.restaurant;
    }

    const previousOrders = await Order.find(previousFilter);

    const previousTotalOrders = previousOrders.length;
    const previousTotalRevenue = previousOrders.reduce(
      (sum: number, order: any) => sum + (order.totalAmount || 0),
      0
    );

    let orderGrowth = 0;
    let revenueGrowth = 0;

    if (previousTotalOrders === 0 && totalOrders > 0) {
      orderGrowth = 100;
      revenueGrowth = 100;
    } else if (previousTotalOrders > 0) {
      orderGrowth = Math.round(
        ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100
      );
      revenueGrowth =
        previousTotalRevenue > 0
          ? Math.round(
              ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) *
                100
            )
          : 0;
    }

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalCustomers: uniqueCustomers,
      orderGrowth,
      revenueGrowth,
      topCities,
      topCuisines,
      recentOrders,
      monthlyData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

export default {
  getAnalyticsData,
};
